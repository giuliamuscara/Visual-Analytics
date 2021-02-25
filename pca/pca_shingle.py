import numpy as np
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing
import pandas as pd
import time
import hashlib

def clean_topic_id(topic_id):
    if ((" ") in topic_id):
        topic_id = topic_id.split(" ")[0]
    if ((".") in topic_id):
        topic_id = topic_id.split(".")[0]
    return topic_id

def convert_to_csv_line(shingles):
    res = ""
    for elem in shingles:
        res = res + str(elem) + ","
    return res

def shingles_to_bitmap(shingles):
    buckets = [0] * 100
    for s in shingles:
        buckets[s] = 1
    return buckets

topics = ["cs", "econ", "eess", "math", "physics", "astro-ph", "cond-mat", "gr-qc", "hep-ex",
    "hep-lat", "hep-ph", "hep-th", "math-ph", "nlin", "nucl-ex", "nucl-th", "quant-ph", "q-bio", "q-fin", "stat"]

dataset = pd.read_json("../data/sample_fra.json")
new_dataset = open("sample_pca_fra.txt", "w")
X = dataset.to_numpy()

#from json to a text file containing title + topics + authors all as a string -> could be used as input for TF-IDF
for i in range(X.shape[0]):
    tps = clean_topic_id(X[i][2])
    if tps in topics:
        new_line = ""
        names = ""
        title = X[i][0].replace('\n ', "")
        for elem in X[i][4]:
            names = names + " " + elem[0]
        new_line = new_line + title + " " + tps + names + " %$& "+ tps #carattere speciale per dividere la linea dal topic con la split
        #print(new_line.split(" %$& ")[1])
        new_dataset.write(new_line) 
        new_dataset.write("\n")

new_dataset.close()

#Shingling -> Directly into SVD/PCA without vectorizer

dataset = open("sample_pca_fra.txt", "r")
new_dataset = open("sample_shingle_fra.csv", "w")
# new_dataset.write("shingle1,shingle2,shingle3,shingle4,shingle5,shingle6,shingle7,shingle8,shingle9,shingle10,shingle11,shingle12")
# new_dataset.write("\n")

shingle_size = 9

t0 = time.time()
# loop through all the papers represented as lines
for line in dataset:
    if line != "\n":
        line = line.split(" %$& ")
        new_line = ""
        # keep hashed shingles
        shinglesInDocInts = []
        shingle = []
        # For each word in the paper represented as a line
        for index in range(len(line[0]) - shingle_size + 1):
            # Construct the shingle text by combining k words together.
            shingle = line[0][index:index + shingle_size]
            shingle = ''.join(shingle)
            # Hash the shingle to a 32-bit integer.
            hash_code = abs(hash(shingle)) % (10**2)
            if hash_code not in shinglesInDocInts:
                shinglesInDocInts.append(hash_code)
            else:
                del shingle
                index = index - 1
        new_line = shingles_to_bitmap(shinglesInDocInts)
        new_line = convert_to_csv_line(new_line)
        new_line = new_line + line[1]
        #new_line = convert_to_csv_line(shinglesInDocInts[0:12])
        new_dataset.write(new_line)
        #new_dataset.write("\n")
new_dataset.close()