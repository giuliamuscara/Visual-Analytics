import json, requests, os, math, csv

class Scraper(object):
    def __init__(self):
        self.data_dir = "data"
        self.dataset_filename = "%s/dataset.json" %(self.data_dir)
        self.topics_filename = "%s/topics.json" %(self.data_dir)
        self.years_filename = "%s/years.json" %(self.data_dir)
        self.sample_filename = "%s/sample.json" %(self.data_dir)


    def preprocess_dataset(self, original_ds_filename = "/Users/lucasmac/Downloads/arxiv-metadata-oai-snapshot.json"):
        source_filename = original_ds_filename
        dest_filename = self.dataset_filename

        source_file = open(source_filename, "r")
        #dest_file = open(dest_filename, "w")

        a_list = []
        
        i = 0
        for line in source_file:
            element = json.loads(line.strip())
            if "versions" in element:
                if 'abstract' in element:   del element['abstract']
                if 'comments' in element:   del element['comments']
                if 'submitter' in element:  del element['submitter']
                if 'license' in element:    del element['license']
                if 'authors' in element:    del element['authors']
                #if "doi" in element:    del element['doi']
                if "report-no" in element:  del element["report-no"]
                if "update_date" in element:    del element["update_date"]

                # da verificare
                #if "id" in element:    del element["id"]

                a_list.append(element)

                i+= 1
                print(i)
                if i == 100: break

        self.write_json("prova_de_notte.json", a_list)
        source_file.close()

    def reduce_dataset(self):
        # print("Compressing dataset")
        # self.preprocess_dataset()

        max_file_size = 250
        print("Splitting dataset into %dMB chunks" % max_file_size)
        self.partition_json(max_file_size = max_file_size)
    

    def write_json(self, file_name, content):
        file = open(file_name, "w")
        file.write(json.dumps(content, indent = 4))
        file.close()

    def read_json(self, file_name):
        file = open(file_name, "r")
        content = json.loads(file.read())
        file.close()
        return content


    def partition_json_2(self, file_name, chunkSize = 555000):
        with open(file_name,'r') as infile:
            o = json.load(infile)
            for i in range(0, len(o), chunkSize):
                with open(file_name.replace(".json", "") + '_' + str(i//chunkSize) + '.json', 'w') as outfile:
                    json.dump(o[i:i+chunkSize], outfile)


    def partition_json(self, max_file_size):    # max_file_size in MB
        file_size = os.path.getsize(self.dataset_filename)
        f = open(self.dataset_filename)
        data = json.load(f)
        if isinstance(data, list):
            data_len = len(data)
            # Valid JSON file found
        else:
            # Not a valid json
            print("Not a valid json")
            exit()

        # get numeric input
        mb_per_file = abs(float(max_file_size))
        if file_size < mb_per_file * 1000000:
            print("File smaller than split size, exiting")
            exit()  #File smaller than split size, exiting

        # determine number of files necessary
        num_files = math.ceil(file_size/(mb_per_file*1000000))

        # initialize 2D array
        split_data = [[] for i in range(0,num_files)]

        # determine indices of cutoffs in array
        starts = [math.floor(i * data_len/num_files) for i in range(0,num_files)]
        starts.append(data_len)


        for i in range(0,num_files):
            for n in range(starts[i],starts[i+1]):  split_data[i].append(data[n])

            name = "data/" + os.path.basename(self.dataset_filename).split('.')[0] + '_' + str(i+1) + '.json'

            outfile = open(name, "w")
            json.dump(split_data[i], outfile, indent = 4)
            outfile.close()
            print('\tPart',str(i+1),'... completed')
            


    def get_dataset_parts(self):
        parts = []
        curr_dir = os.getcwd()
        os.chdir(self.data_dir)
        for file in os.listdir():
            if '.json' in file and file.split('.json')[0][-1].isdigit():    parts.append(self.data_dir + "/" + file)
        os.chdir(curr_dir)
        return parts
    

    def get_topicsID(self):
        topics = self.read_json(self.topics_filename)
        to_ret = []
        for item in topics:
            if ':' in item['topic_id']:  to_ret.append(item['topic_id'].split(':')[1])
            else:   to_ret.append(item['topic_id'])
        return to_ret

    

    # 21 tuple per anno dove ogni tupla è associata a un topic   <---  sample
    def sample(self):
        topic_ids = self.get_topicsID()
        
        #dataset = self.read_json(self.dataset_filename)
        dataset = self.read_json(self.dataset_filename)

        to_ret = []
        i = 0
        

        lista_anni = range(1988, 2021)
        dict_anni = {}  #{anno:count}
        dict_cat = {}   #{anno: []}
        for item in range(len(lista_anni)): dict_anni[lista_anni[item]] = 0
        for item in range(len(lista_anni)): dict_cat[lista_anni[item]] = []
        

        for topic in topic_ids:
            for cat in dataset: # grossa
                category = cat['categories']    # 'ok ok'
                category = category.split(' ')[0]
                if '.' in category: category = category.split('.')[0]

                #if topic == category:   continue
                year = int(cat['versions'][-1]['created'].split(' ')[3])
                

                if year >= 1988 and dict_anni[year] <= 20 and category not in dict_cat[year]:
                    dict_anni[year] += 1
                    dict_cat[year].append(category)

                    to_ret.append(cat)


        self.write_json("%s/sample.json" %self.dataset_filename, to_ret)


       # print(to_ret, len(to_ret))
        # prendo solo il primo di categories levo quello che segue il punto ---> split('.')[0]



    ##############
    #    API 
    ##############

    def get_data(self):
        file = open(self.dataset_filename)
        content = file.read()
        file.close()
        return {"dataset": self.read_json(self.dataset_filename)}



    def from_csv_to_json(self, file_name):
        import pandas as pd
        with open(file_name, 'r') as f:
            reader = csv.reader(f, delimiter=',')
            data_list = list()
            for row in reader:
                data_list.append(row)
        data = [dict(zip(data_list[0],row)) for row in data_list]
        data.pop(0)
        #s = json.dumps(data)
        return data
        return s


    def from_json_to_csv(self, file_name):
        with open(file_name) as json_file: 
            data = json.load(json_file) 
          
        
          
        # now we will open a file for writing 
        data_file = open('data/data_file.csv', 'w') 
          
        # create the csv writer object 
        csv_writer = csv.writer(data_file) 
          
        # Counter variable used for writing  
        # headers to the CSV file 
        count = 0
          
        for emp in data: 
            if count == 0: 
          
                # Writing headers of CSV file 
                header = emp.keys() 
                csv_writer.writerow(header) 
                count += 1
          
            # Writing data of CSV file 
            csv_writer.writerow(emp.values()) 
          
        data_file.close() 


    def read_json2(self, file_name):
        file_content = self.read_json(file_name)
        for item in file_content:
            if not 'journal-ref' in item:
                print(item)


    def partition_dataset_sampling(self):
        #content = self.read_json(self.dataset_filename)
        content = self.read_json("data/prova_de_notte_grande.json")
        counter = [0]*33
        years_array = [i for i in range(1988, 2021)]
        years_array_dict = {}

        for i in range(33):
            years_array_dict[years_array[i]] = i

        # print(years_array_dict)

        for tupla in content:
            year = int(tupla['versions'][0]['created'].split(' ')[3])
            if year in years_array:
                counter[years_array_dict[year]] += 1

        
        # print(counter)
        new_content = []
        p = 0.1
        import random
        for tupla in content:
            year = int(tupla['versions'][0]['created'].split(' ')[3])
            if year in years_array:
                #if self.counter_array[years_array_dict[year]] <= 15000:
                if year == 1988:
                    new_content.append(tupla)
                else:
                    if p > random.random():
                        new_content.append(tupla)
        
        self.write_json("data/prova_de_notte_piccolo.json", new_content)


    def partition_dataset_kmean(self):
        #content = self.read_json(self.dataset_filename)
        content = self.from_csv_to_json("PCA/pca_kmeans_result_fra.csv")
        print(type(content))
        new_content = []
        p = 0.1
        import random
        for tupla in content:
            if p > random.random():
                new_content.append(tupla)


        
        self.write_json("PCA/pca_kmeans_result_fra_2.json", new_content)


       








if __name__ == '__main__':
    Scraper_Obj = Scraper()

    #Scraper_Obj.preprocess_dataset()

    # Scraper_Obj.sample()
    Scraper_Obj.partition_json_2("data/prova_de_notte_piccolo.json", 10000)
    # Scraper_Obj.read_json2("data/dataset_3.json")

    #Scraper_Obj.partition_dataset_sampling()
    



    #Scraper_Obj.partition_dataset_kmean()





    #Scraper_Obj.write_json("data/dataset_4_1.json", Scraper_Obj.read_json("data/dataset_4.json"))
    #Scraper_Obj.reduce_dataset()
    #Scraper_Obj.from_json_to_csv("data/sample.json")
    #print(Scraper_Obj.get_data())
    #Scraper_Obj.reduce_dataset()
    #print(Scraper_Obj.read_json(Scraper_Obj.dataset_filename))



