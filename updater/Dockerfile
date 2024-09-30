# Usa un'immagine base di Ubuntu
FROM ubuntu:latest

# Installa cron, wget, e Google Chrome
RUN apt-get update
RUN apt-get install -y cron 
RUN apt-get install -y wget 
RUN apt-get install -y git
RUN apt-get install -y python3.12
RUN apt-get install -y python3.12-venv
RUN apt-get install -y python3-pip
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Copia lo script nel container
COPY script.sh /script.sh
RUN chmod +x /script.sh

CMD ["/script.sh"]
