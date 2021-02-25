import requests, json, urllib.request, re, time, os
from scholarly import scholarly
from urllib.parse import quote




# num medio di citazioni per tipologia

class Scholarly(object):
	def __init__(self):
		self.topics = ["cs", "econ", "eess", "math", "physics", "astro-ph", "cond-mat", "gr-qc", "hep-ex", "hep-lat", "hep-ph", "hep-th", "math-ph", "nlin", "nucl-ex", "nucl-th", "quant-ph", "q-bio", "q-fin", "stat"]
		self.num_rows = 20
		self.num_cols = 32

		self.years_array = [i for i in range(1988, 2021)]



		self.base_filename = "prova_de_notte_piccolo_8.json"
		self.file_name = "data/"+ self.base_filename
		print(self.file_name)
		self.barchart_filename = "data/barcharts/"+ self.base_filename


		self.published_map_bar = self.initialize_fra_map()
		self.new_prep_map_bar = self.initialize_fra_map()
		self.old_prep_map_bar = self.initialize_fra_map()


	def initialize_fra_map(self):
		my_map = {}
		for i in range(self.num_rows):
		    array = []
		    dictionary = {}
		    for j in range(self.num_cols + 1):
		        dictionary[self.years_array[j]] = 0
		        array.append(dictionary)
		        my_map[self.topics[i]] = dictionary
		return my_map

	def clean_author(self, author_list):
		return author_list[1] + " "+ author_list[0]
	

	def main(self):
		x = 0
		file = open(self.file_name, "r")
		#file = open("prova_de_notte.json", "r")
		content = json.loads(file.read())
		file.close()
		for tupla in content:
			x = x+1
			title = tupla["title"]
			topic_id = self.clean_topic_id(tupla["categories"])
			created_year = int(tupla["versions"][-1]["created"].split(' ')[3])
			journal_ref = tupla["journal-ref"]
			author = self.clean_author(tupla["authors_parsed"][0])
			doi = tupla["doi"]
			id_ = tupla["id"]
			
			if x %100 == 0: print(x, "/", len(content))
			if topic_id in self.topics:
				num_citations = self.get_num_citations(doi, id_)
				#print(num_citations, " - ", x, "/", len(content))
				if journal_ref != None:
					self.published_map_bar[topic_id][created_year] += num_citations 
				else:
				 	year_to_increment = created_year + 1
				 	if year_to_increment <= 2020:
				 		self.new_prep_map_bar[topic_id][year_to_increment] += num_citations

				 	for i in range(created_year + 2, 2021):
				 		self.old_prep_map_bar[topic_id][i] += num_citations

		return self.published_map_bar, self.new_prep_map_bar, self.old_prep_map_bar

	def get_num_citations(self, doi, id_):
		try:
			import random
			#user_agents = self.get_ua()

			headers = {"Accept": "*/*",
				"Accept-Encoding": "gzip, deflate, br",
				"Accept-Language": "it-it",
				"Connection": "keep-alive",
				"Host": "inspirehep.net","Referer": 
				"https://inspirehep.net/",
				"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",}

			
			url1 = "https://inspirehep.net/api/doi/"+ doi if doi != None else "https://inspirehep.net/api/doi/"
			url2 = "https://inspirehep.net/api/arxiv/" + id_ if id_ != None else "https://inspirehep.net/api/arxiv/"
			content = requests.get(url = url1, headers= headers).json()
			if 'status' in content and content["status"] == 404:	
				content = requests.get(url = url2, headers=headers).json()
				if 'status' in content and content["status"] == 404:
					return 0
				else:
					if 'metadata' in content:
						num_citations = content["metadata"]["citation_count"]
						num_citations_int = isinstance(num_citations, int)
						if num_citations_int:	return int(num_citations)
					return 0
			else:
				if 'metadata' in content:
					num_citations = content["metadata"]["citation_count"]
					num_citations_int = isinstance(num_citations, int)
					if num_citations_int:	return int(num_citations)
				return 0
			return 0
		except Exception as e:
			print("Eccezione", str(e), "sleep 5")
			import time
			time.sleep(5)
			return 0
		return 0


	def get_ua(self):
		ua_list = []
		file = open("chrome.txt")
		content = file.readlines()
		file.close()
		for line in content:
			if not 'More' in line:
				ua_list.append(line)
		return ua_list
			


	

	def clean_topic_id(self, topic_id):
		if " " in topic_id:
			topic_id = topic_id.split(" ")[0]
		if "." in topic_id:
			topic_id = topic_id.split(".")[0]
		return topic_id

	def maps_to_json(self):
		root = []
		root.append(self.published_map_bar)
		root.append(self.new_prep_map_bar)
		root.append(self.old_prep_map_bar)

		self.write_json(self.barchart_filename, root)


	def write_json(self, file_name, content):
		file = open(file_name, "w")
		file.write(json.dumps(content, indent = 4))
		file.close()



if __name__ == '__main__':
	start_time = time.time()

	Scholarly_Obj = Scholarly()
	
	print(Scholarly_Obj.main())

	# print(Scholarly_Obj.get_num_citations("Chaotic Advection near 3-Vortex Collapse"))
	
	# print(Scholarly_Obj.published_map_bar)


	
	print("scrittura file")
	print(Scholarly_Obj.maps_to_json())
	print("--- %s seconds ---" % (time.time() - start_time))




# --- 583.1024281978607 seconds ---
