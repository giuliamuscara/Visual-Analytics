import numpy as np
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing
import pandas as pd

def clean_topic_id(topic_id):
    if ((" ") in topic_id):
        topic_id = topic_id.split(" ")[0]
    if ((".") in topic_id):
        topic_id = topic_id.split(".")[0]
    return topic_id

topics = ["cs", "econ", "eess", "math", "physics", "astro-ph", "cond-mat", "gr-qc", "hep-ex",
    "hep-lat", "hep-ph", "hep-th", "math-ph", "nlin", "nucl-ex", "nucl-th", "quant-ph", "q-bio", "q-fin", "stat"]

dataset = pd.read_json("./data/sample.json")
new_dataset = open("./data/sample_pca.txt", "w")
X = dataset.to_numpy()

for i in range(X.shape[0]):
    new_line = ""
    tps = ""
    names = ""
    title = X[i][0].replace('\n ', "")
    if X[i][1] != None:
        journal_ref = "1"
    else:
        journal_ref = "0"
    cat = clean_topic_id(X[i][2])
    if cat in topics:
        tps = cat
    for elem in X[i][4]:
        names = names + " " + elem[0]
    new_line = new_line + title + " " + journal_ref + " " + tps + names
    new_dataset.write(new_line)
    new_dataset.write("\n")

new_dataset.close()

