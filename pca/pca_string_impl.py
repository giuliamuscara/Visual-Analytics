import numpy as np
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn import preprocessing
import pandas as pd
from sklearn.feature_extraction.text import HashingVectorizer, TfidfVectorizer
from sklearn.preprocessing import Normalizer, StandardScaler
from sklearn.linear_model._sgd_fast import time
from sklearn.pipeline import make_pipeline

dataset = open("./data/sample_pca.txt", "r")

vectorizer = TfidfVectorizer(norm="l2")
X = vectorizer.fit_transform(dataset)
print(X.shape)

r = 2
t0 = time()
svd = TruncatedSVD(r)
Y = StandardScaler().fit_transform(X.toarray())
K = svd.fit_transform(Y)
print("done in %fs" % (time() - t0))
print(svd.explained_variance_ratio_)
print(K.shape)

plt.plot(K[:,0],K[:,1], 'o', markersize=3, color='blue', alpha=0.5, label='SVD transformed data in the new 2D space')    
plt.xlabel('Eigenvector1')
plt.ylabel('Eigenvector2')
plt.xlim([0,10])
plt.ylim([0,10])
plt.legend()
plt.title('Transformed data')
plt.show()

