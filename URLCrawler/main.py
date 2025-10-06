import urllib.request
from urllib.error import URLError, HTTPError
from flask_cors import CORS, cross_origin
from flask_restful import Api
from urlextract import URLExtract
import time
import sys

from datetime import datetime
from helper_functions import *
from flask import Flask, request, jsonify,send_file
import json
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import VectorDBQA, RetrievalQA, ConversationalRetrievalChain
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from langchain.vectorstores import FAISS
import requests
from langchain.chains.conversational_retrieval.prompts import QA_PROMPT

import argparse
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
import configparser
import os
import json
import string
import random
import glob

import openai
from langdetect import detect

from website import Website
from config import Config

from langchain.prompts.prompt import PromptTemplate

def startConversation(question, url):
    # setup the openAI API key

    # setup the openAI API key
    url = "http://localhost:1349/what2study/parse/functions/getkey"

    url_ = "https://cpstech.de/what2study/parse/functions/getkey"

    headers =  {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": "what2study",
                "X-Parse-Master-Key": "what2studyMaster",
            }
    
    data = {
        'userId':"sampleID"}
        # "data":textFromAllWebsite
    
    
    response = requests.post(url, headers=headers, json=data)
    # Use the json module to load CKAN's response into a dictionary.
    response_dict = json.loads(response.text)
    os.environ["OPENAI_API_KEY"] = response_dict['result']
    
    # Create a completion
    # setup_openAI()
    # llm = OpenAI() 

    # initialize the embeddings using openAI ada text embedding library
    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    texts = process_all_pdfs("./knowledge/", preprocess_langchain=True)
   
    # initialize the FAISS document store using the preprocessed text and initialized embeddings
    context = FAISS.from_texts(texts, embeddings)
    retriever = context.as_retriever()

    prompt_template = """For the given context below, use the following schema. You should fill the schema based on context:
    
        Schema:

            Title:

            Keywords:

            Page Content:

            Navigation:

            Update Information:

            University Information:

            Additional Tags:

        context: {context}
        
        
        User: {question}
       
          """

    qa_prompt = PromptTemplate(input_variables=["context", "question"], template=prompt_template)
    qa = ConversationalRetrievalChain.from_llm(
        OpenAI(model_name="gpt-4o",temperature=0.5), retriever=retriever, combine_docs_chain_kwargs={'prompt': qa_prompt}
    )

        # define the question
    query = question
    result = qa({"question": query, "chat_history": chat_history})
    print("system: ", result["answer"])

    return "\nURL: "+url+"\nTimestamp / Last Updated At: "+ datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +"\n"+result["answer"]+ "\n\n ### \n\n\n"


urllsit = []
urllistignore = []
domainignore =[]
urllsitdone = []

urlsFromWebsite = []


configRecusiveSearch = True
mainconfig=None


app = Flask(__name__)
api_app = Api(app)

# CORS(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/crawl', methods=['POST'])
@cross_origin()
def crawl():
    global mainconfig
    reurl = request.get_json()
    url = reurl['url']
    username = reurl['username']
    password = reurl['password']
    #new part allowDeepCrawl
    allowDeepCrawl = False
    if  reurl['allowDeepCrawl'] == "1":
        allowDeepCrawl = True
    web = Website(url, mainconfig, username, password)
    textFromAllWebsite=""
    countUrl=0
    if (web):
        textFromAllWebsite = web.newtext
        if allowDeepCrawl:
            for x in web.allLinks:
                if checkUrl(x):
                    countUrl = countUrl+1
                    # max maximum number can be set in url.ini maxurl=100
                    if countUrl > mainconfig.recusive_url_maxurl:
                        break
                    webDeepCrawl= Website(x, mainconfig,  username, password)
                    if(web):
                        textFromAllWebsite = textFromAllWebsite+"\n\n"
                        textFromAllWebsite = textFromAllWebsite + webDeepCrawl.newtext
        with open("./knowledge/output.txt", "w") as text_file:
            text_file.write(textFromAllWebsite)
            text_file.close()
       
        answer = startConversation("Provide the schema",url)
       
        # return send_file("Output.txt",as_attachment=True)

        url = "http://localhost:1349/what2study/parse/functions/crawlJobStatus"

        url_ = "https://cpstech.de/what2study/parse/functions/crawlJobStatus"
    
        headers =  {
                    "Content-Type": "application/json",
                    "X-Parse-Application-Id": "what2study",
                    "X-Parse-Master-Key": "what2studyMaster",
                }
        
        data = {
          'indexFileContent':answer, 'allLinks': "&&&".join(web.allLinks), 'userID':reurl['userId'], 'jobId':reurl['jobId'], "indexConData":textFromAllWebsite}
            # "data":textFromAllWebsite
        
        
        response = requests.post(url, headers=headers, json=data)
        return "200"
  
  
#    if (web):
#        with open("Output.txt", "w") as text_file:
#            text_file.write(web.newtext)
#            text_file.close()
#        answer = startConversation("Provide the schema",url)
#        # return send_file("Output.txt",as_attachment=True)
#        return json.dumps({'data': web.newtext, 'indexFileContent':answer})

               
@app.route('/', methods=['POST'])
def getUrl():
    global mainconfig
    reurl = request.form
    url = reurl['url']

    username = reurl['username']
    password = reurl['password']
    allowDeepCrawl = False
    if  reurl['allowDeepCrawl'] == "1":
        allowDeepCrawl = True

    textFromAllWebsite=""
    web = Website(url, mainconfig, username, password)
    textFromAllWebsite = web.newtext
    #allowDeepCrawl
    countUrl=0
    if allowDeepCrawl:
        for x in web.allLinks:
            if checkUrl(x):
                countUrl = countUrl+1
                if countUrl > mainconfig.recusive_url_maxurl:
                    break
                webDeepCrawl= Website(x, mainconfig, username, password)
                if(web):
                    textFromAllWebsite = textFromAllWebsite+"\n\n"
                    textFromAllWebsite = textFromAllWebsite + webDeepCrawl.newtext
    #allowDeepCrawl

    with open("./knowledge/output.txt", "w") as text_file:
            text_file.write(textFromAllWebsite)
            text_file.close()
    # print(""+web.newtext)
    answer = startConversation("Fill the given schema based on context", url)
    answer=""
    return json.dumps({'data': textFromAllWebsite, 'indexFileContent':answer})

@app.route('/', methods=['GET'])
def index():
    global mainconfig

    html = "<form action=\"/\" method=\"post\"> <input type=\"text\" id=\"url\" name=\"url\"><br><input type=\"text\" id=\"allowDeepCrawl\" name=\"allowDeepCrawl\" value=\"1\"><br> <input type=\"submit\" value=\"Submit\"></form>"
    return html


chat_history = []
    


def loadConfig():
    global mainconfig
    f = open(mainconfig.configIgnore, "r")
    line = f.readlines()
    domain = False
    url = False
    for x in line:
        if "=domain=" in x:
            domain = True
        elif "=/domain=" in x:
            domain = False
        elif "=url=" in x:
            url = True
        elif "=/url=" in x:
            url = False
        else:
            if domain:
                domainignore.append(x.strip())
            elif url:
                urllistignore.append(x.strip())
    return

def checkUrl(url):
    #if url in urlsFromWebsite :
    #    return False

    if "http" not in url:
        return False
    
    if url in urllistignore:
        return False

    for x in domainignore:
        if x in url:
            return False

    return True

def main():

    global mainconfig
    mainconfig = Config()
    loadConfig()




if __name__ == '__main__':
    main()#please leave it inside. That should have been generated the prconfig error
    #app.run(debug=False, host="192.168.12.120", port="5000")
    app.run(debug=False, port="5000")




