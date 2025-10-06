import re
from click import Path
import requests
from utils.helper_functions import *
import argparse
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import JSONDecodeError, dumps
from flask_jsonpify import jsonify
import configparser
import os
import json
import string
import random
import glob
import shutil
from datetime import datetime
# from services.what2study_chat_client_service import *

from services.chatClientService import *
"""
File: main.py
Author: [Faisal Mahmood faisal.mahmood@fernuni-hagen.de]

Description:
    This file defines the main routes for handling requests sent by the
    chat client within the What2Study web portal. It also includes
    integration with the Node.js Parse Server for request parsing
    and backend communication.
"""

app = Flask(__name__)
api_app = Api(app)

# CORS(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


# generate random id
def id_generator(size=9, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))



# route to handle question answering from chat client
@app.route("/chatbot/",methods=['POST'])

@cross_origin()
def initConversation():
   
    jsonData = request.get_json()
    # print(json.loads(jsonData["filter"]))
    # jsonFilter = jsonData["filter"]
    # openAIAPIKey= getKey(jsonData["userId"])
    prompt =""
    if jsonData["promptSelection"] == False:
        prompt= jsonData["defaultPrompt"]
    else:
         prompt= jsonData["customPrompt"]
         
    service = ChatClientService(user_id=jsonData["userId"])  # will fetch API key internally
      
    # Extract params safely
    question = jsonData.get("question", "")
    language = jsonData.get("language", "en")
    filters = jsonData.get("filter", {})
    regen = jsonData.get("regen", False)
    chat_history_data = jsonData.get("chatHistory", "[]")
    random_question = jsonData.get("randomQuestion", "")
    custom_prompt=prompt

    
    reply = service.start_conversation(
    question,
    language,
    filters,
    regen,
    chat_history_data,
    random_question,
    custom_prompt
)
    return {"answer":reply}

# route to save embeddings for new files
@app.route("/embeddings/",methods=['POST'])

@cross_origin()
def saveEmbeddings():
    openAIAPIKey= getKey(request.form.get('user'))
    userID = request.form.get('user')
    service = ChatClientService(user_id=request.form.get('user'))  # will fetch API key internally
  
    
    if openAIAPIKey!="local":
        # initialize the FAISS document store using the preprocessed text and initialized embeddings
        os.environ["OPENAI_API_KEY"] = openAIAPIKey
        #embed_Model_Name= "text-embedding-ada-002"
        embed_Model_Name= "text-embedding-3-large"

        # initialize the embeddings using openAI embedding library
        embeddings = OpenAIEmbeddings(model= embed_Model_Name)
        service.create_embeddings(embeddings, "./knowledgeBasePDF/"+userID+"/embeddings"+userID)
    else:   
        model_name="BAAI/bge-large-en-v1.5"
        # model_name="infgrad/stella_en_1.5B_v5"
        embeddings = HuggingFaceEmbeddings(
                    model_name=model_name,
                    model_kwargs = {'device': 'cpu'}
                )
        service.create_embeddings(embeddings, "./knowledgeBasePDF/"+userID+"/embeddingsHagenHF"+userID)
   
    
    return "200"


# Route for save/upload file request
@app.route("/saveFile/",methods=['POST'])

@cross_origin()
def saveFile():
    service = ChatClientService(user_id=request.form.get('user'))  # will fetch API key internally
  
    # note: create object class for request params for easy handling
    service.download_file(request.form.get('url'), request.form.get('fileName'),request.form.get('indexFile'),request.form.get('transcript'))
    return "True"



# route to handle delete file request
@app.route("/deleteFile/",methods=['POST'])

@cross_origin()
def deleteFile():
    '''
    '''
    service = ChatClientService(user_id=request.form.get('user'))  # will fetch API key internally
  
    # note: create object class for request params for easy handling
    service.del_file(request.form.get('url'), request.form.get('fileName'),request.form.get('nameWOS') )
    indexFileMedia = "knowledgeBasePDF/"+request.form.get('user')+"/indexMedia.txt"
    if os.path.exists(indexFileMedia):
        with open(indexFileMedia, "r+") as myfile:
            content = myfile.read()
            pattern = rf"url / link:{request.form.get('url')}(.*?)(\nTranscript / description:)(.*)(\n\n###)"
            # Using re.findall to extract all matches
            content = re.sub(pattern,"",content)
            myfile.seek(0)
            myfile.write(content)
            myfile.truncate()
            myfile.close()
                
    return "True"


if __name__ == '__main__':
    app.run(debug=False, port="5009", threaded=True)