#!/bin/bash

# Variabili
REPO_DIR="/app/cantinaroyale.tools"
PRIVATE_DIR="$REPO_DIR/private"
GIT_REPO_URL="https://$GITHUB_TOKEN@github.com/VincenzoImp/cantinaroyale.tools.git"
GIT_BRANCH="main"
VENV_DIR="$PRIVATE_DIR/venv"

task () {

    # Configura Git per usare il token (autenticazione)
    git config --global credential.helper store
    echo "https://$GITHUB_TOKEN@github.com" > ~/.git-credentials

    # Configura l'identità dell'utente Git
    git config --global user.email "$GITHUB_EMAIL"
    git config --global user.name "VincenzoImp"

    # Se la directory della repo non esiste, clonala
    if [ ! -d "$REPO_DIR" ]; then
        git clone -b $GIT_BRANCH $GIT_REPO_URL $REPO_DIR || { echo "Clonazione fallita"; exit 1; }
    else
        # Altrimenti aggiorna la repo esistente
        cd $REPO_DIR
        git pull origin $GIT_BRANCH || { echo "Aggiornamento fallito"; exit 1; }
    fi

    # Verifica se la directory private esiste
    if [ ! -d "$PRIVATE_DIR" ]; then
        echo "La directory 'private' non esiste nella repo!"
        exit 1
    fi

    # Controlla se esiste la cartella venv, altrimenti creala
    if [ ! -d "$VENV_DIR" ]; then
        echo "Creazione di un ambiente virtuale..."
        python3 -m venv $VENV_DIR || { echo "Creazione dell'ambiente virtuale fallita"; exit 1; }
    fi

    # Attiva l'ambiente virtuale
    source $VENV_DIR/bin/activate

    # Installa eventuali dipendenze se il file requirements.txt esiste
    if [ -f "$PRIVATE_DIR/requirements.txt" ]; then
        pip install -r $PRIVATE_DIR/requirements.txt || { echo "Installazione delle dipendenze fallita"; exit 1; }
    fi

    # Esegui lo script Python
    cd $PRIVATE_DIR
    python3 get_data.py || { echo "Esecuzione di get_data.py fallita"; exit 1; }
    cd $REPO_DIR

    # Commit e push delle modifiche (se ci sono cambiamenti)
    git add .

    if git diff-index --quiet HEAD; then
        echo "Nessuna modifica da committare"
    else
        git commit -m "Auto-update: $(date)" || { echo "Commit fallito"; exit 1; }

        # Usa l'URL con il token per il push
        git push $GIT_REPO_URL $GIT_BRANCH || { echo "Push fallito"; exit 1; }
    fi

    # Cleanup
    rm ~/.git-credentials

    # Disattiva l'ambiente virtuale
    deactivate
}

# Ciclo infinito che esegue il task a mezzanotte
while true; do

    current_time=$(date +%s)
    # Ottieni la data di domani a mezzanotte
    midnight=$(date -d 'tomorrow 00:00:00' +%s)
    # Calcola la differenza in secondi tra mezzanotte e l'ora corrente
    seconds_until_midnight=$((midnight - current_time))
    # Esegui sleep per il numero di secondi fino a mezzanotte
    echo "Dormo per $seconds_until_midnight secondi fino a mezzanotte..."
    sleep $seconds_until_midnight

    # Esegui il task
    task

done
