import time
import urllib.request
import datetime
#from itertools import ifilter
from collections import Counter, defaultdict
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import matplotlib.pylab as plt
import pandas as pd
import numpy as np
import bibtexparser

#PRIMO TRY PER PRENDERE CITAZIONI 
pd.set_option('mode.chained_assignment','warn')

OAI = "{http://www.openarchives.org/OAI/2.0/}"
ARXIV = "{http://arxiv.org/OAI/arXiv/}"

df = pd.read_json("prova_de_notte.json")
def get_cites(arxiv_id):
    cites = []
    base_url = "http://inspirehep.net/search?p=refersto:%s&of=hx&rg=250&jrec=%i"
    offset = 1
    while True:
        print(base_url%(arxiv_id, offset))
        response = urllib.request.urlopen(base_url%(arxiv_id, offset))
        xml = response.read()
        soup = BeautifulSoup(xml, "html.parser")

        refs = "\n".join(cite.get_text() for cite in soup.find("div", "mv2"))

        bib_database = bibtexparser.loads(refs)
        print(refs)
        if bib_database.entries:
        	cites += bib_database.entries
        	offset += 250
        else:
        	break
    return cites



print(df["id"][0:20])
cites = df['id'][0:20].map(get_cites)
print(100, cites)
df.ix[N*step:(N+1)*step -1,'cited_by'] = cites


