import numpy as np
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn import preprocessing
import pandas as pd
from sklearn.feature_extraction.text import HashingVectorizer, TfidfVectorizer
from sklearn.preprocessing import Normalizer, StandardScaler
from sklearn.linear_model._sgd_fast import time
from sklearn.pipeline import make_pipeline
from sklearn.cluster import KMeans

dataset = pd.read_csv("sample_shingle_fra.csv", header=None)
res = open("pca_kmeans_result_fra.csv", "w")
topics = dataset.iloc[:, 100] #prendo la colonna dei topics
dataset = dataset.iloc[:, 0:100] #rimuovo i topics alla fine e faccio k-means

X = dataset.to_numpy()

r = 2
t0 = time()
svd = TruncatedSVD(r)
Y = StandardScaler().fit_transform(X)
K = svd.fit_transform(Y)
print("done in %fs" % (time() - t0))
print(svd.explained_variance_ratio_)
print(K.shape)

# kmeans = KMeans(n_clusters=20, init="k-means++", random_state=0)
# kmeans.fit(K)
# y_kmeans = kmeans.predict(K)

# plt.scatter(K[:, 0], K[:, 1], c=y_kmeans, s=50, cmap='viridis')
# centers = kmeans.cluster_centers_
# plt.scatter(centers[:, 0], centers[:, 1], c='black', s=200, alpha=0.5)
# plt.show()

i=0
res.write("x,y,topic"+"\n")
for elem in K:
    i += 1
    if i == K.shape[0]:
        res.write(str(elem[0])+","+str(elem[1])+","+topics[i-1])
    else:
        res.write(str(elem[0])+","+str(elem[1])+","+topics[i-1]+"\n")
res.close()


# s = 30
# plt.scatter(K[0:200, 0], K[0:200, 1],
#             color='red',s=s, lw=0, label='Cluster 1')
# plt.scatter(K[200:400, 0], K[200:400, 1],
#             color='green',s=s, lw=0, label='Cluster 2')
# plt.scatter(K[400:586, 0], K[400:586, 1],
#             color='blue',s=s, lw=0, label='Cluster 3')

# plt.xlabel('PC1')
# plt.ylabel('PC2')
# plt.legend()
# plt.title('Transformed data with SVD')
# plt.show()

# 
# t0 = time()
# pca = PCA(n_components=2)
# Y = StandardScaler().fit_transform(X)
# Z = pca.fit_transform(Y)
# print("done in %fs" % (time() - t0))
# print(pca.explained_variance_ratio_)

# s = 30
# plt.scatter(Z[0:200, 0], Z[0:200, 1],
#             color='red',s=s, lw=0, label='Cluster 1')
# plt.scatter(Z[200:400, 0], Z[200:400, 1],
#             color='green',s=s, lw=0, label='Cluster 2')
# plt.scatter(Z[400:586, 0], Z[400:586, 1],
#             color='blue',s=s, lw=0, label='Cluster 3')

# plt.xlabel('PC1')
# plt.ylabel('PC2')
# plt.legend()
# plt.title('Transformed data with PCA')
# plt.show()

