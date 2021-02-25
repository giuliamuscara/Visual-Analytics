from flask import Flask, render_template, jsonify
from stock_scraper import Scraper
import os

Scraper_Obj = Scraper()

app = Flask(__name__)

@app.route("/data")
def data(): 
    return jsonify(Scraper_Obj.read_json("data/statistic_sample.json"))  # only partition of dataset


@app.route("/topics")
def topics():
    return jsonify(Scraper_Obj.read_json("data/topics.json"))


@app.route("/barchart")
def barchart():
    return jsonify(Scraper_Obj.read_json("data/barchart.json"))



@app.route("/pca_kmeans")
def pca_kmeans():
    return jsonify(Scraper_Obj.read_json("data/PCA/pca_kmeans_result.json"))


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, use_reloader=True, host='127.0.0.1', port=port)
