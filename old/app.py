from flask import Flask, render_template, redirect
import pandas as pd
import json

app = Flask(__name__)

with open("data/info.json") as f:
    info = json.load(f)
language = "en"

characters = info["variables"]["characters"]
weapons = info["variables"]["weapons"]
contents = info["contents"][language]
nft_ids = []
collections = {}

for collection_name in characters + weapons:
    df = pd.read_csv(f"data/{collection_name}_nfts.csv")
    df['index'] = df['identifier']
    df = df.set_index('index')
    for column in df.columns:
        df = df.rename(columns={column: column.replace(" ", "_")})
    dict = df.to_dict(orient='index')
    collections[collection_name] = {
        "dataframe": df,
        "json": dict
    }
    nft_ids += list(dict.keys())

for collection_type in ["All-Characters", "All-Weapons"]:
    if collection_type == "All-Characters":
        df = pd.concat([collections[collection_name]["dataframe"] for collection_name in characters])
    elif collection_type == "All-Weapons":
        df = pd.concat([collections[collection_name]["dataframe"] for collection_name in weapons])
    dict = df.to_dict(orient='index')
    collections[collection_type] = {
        "dataframe": df,
        "json": dict
    }

@app.route("/")
def home():
    return render_template("home.html", nft_ids=nft_ids, variables=info["variables"], page=contents["pages"]["home"], components=contents["components"])

@app.route("/home")
@app.route("/home/")
@app.route("/home.html")
@app.route("/index")
@app.route("/index/")
@app.route("/index.html")
def home_redirect():
    return redirect("/")

@app.route("/<identifier>")
def identifier(identifier):
    if identifier in characters + ["All-Characters"]:
        collection_name = "All Characters" if identifier == "All-Characters" else identifier
        return render_template("character_collection.html", nft_ids=nft_ids, variables=info["variables"], page=contents["pages"]["character_collection"], components=contents["components"], collection_name=collection_name, collection=collections[identifier]["json"])
    elif identifier in weapons + ["All-Weapons"]:
        collection_name = "All Weapons" if identifier == "All-Weapons" else identifier
        return render_template("weapon_collection.html", nft_ids=nft_ids, variables=info["variables"], page=contents["pages"]["weapon_collection"], components=contents["components"], collection_name=collection_name, collection=collections[identifier]["json"])
    try:
        collection_name = "-".join(identifier.split("-")[:-1])
        if collection_name in collections and identifier in collections[collection_name]["json"]:
            if collection_name in characters:
                return render_template("character_nft.html", nft_ids=nft_ids, variables=info["variables"], page=contents["pages"]["character_nft"], components=contents["components"], nft=collections[collection_name]["json"][identifier])
            elif collection_name in weapons:
                return render_template("weapon_nft.html", nft_ids=nft_ids, variables=info["variables"], page=contents["pages"]["weapon_nft"], components=contents["components"], nft=collections[collection_name]["json"][identifier])
    except:
        pass
    return render_template("page_not_found.html", page=contents["pages"]["page_not_found"], components=contents["components"]), 404

@app.route("/<identifier>/")
def identifier_redirect(identifier):
    return redirect(f"/{identifier}")

@app.errorhandler(404)
def page_not_found(e):
    return render_template("page_not_found.html", page=contents["pages"]["page_not_found"], components=contents["components"]), 404

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)