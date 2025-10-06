from urllib import request
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
import os
import torch
import en_core_web_sm
import pickle
import json
import pandas as pd
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoModelForCausalLM, AutoTokenizer
from langchain_community.vectorstores import FAISS

import warnings
import transformers
import re

"""
File: helper_functions.py

Description:
    This file provides helper functions for file parsing,
    embeddings creation, text preprocessing, and text chunking.
    These utilities support the main business logic by preparing
    and transforming data for further processing.
"""


# disable some warnings
transformers.logging.set_verbosity_error()
transformers.logging.disable_progress_bar()
warnings.filterwarnings('ignore')
# set device
device = 'cpu'  # or cpu
torch.set_default_device(device)

def load_nlp():
    '''
    @param:
    @return: nlp object
    '''
    nlp = en_core_web_sm.load()
    nlp.add_pipe("entityLinker", last=True)
    return nlp

# basic preprocess
def preprocess_texts(raw_text):
    '''
    @param raw_text: the concatinated text to be processed
    @return texts: the splitted and tokenized text
    '''
    raw_text= raw_text.replace("\\n", "\n")
    raw_text= raw_text.replace("\t", " ")
    text_splitter = CharacterTextSplitter(
                        separator = ".\n",
                        chunk_size = 1000,
                        chunk_overlap  = 200,
                        length_function = len,
                    )
     
    texts = text_splitter.split_text(raw_text)
    
    res = [sub.replace('\n', '') for sub in texts]
    res = [sub.replace('\r', '') for sub in res]
    # res = [re.sub(r'\\u(\d*)','',subb) for subb in res]
    
    res = [sub.encode('ascii', 'ignore').decode("utf-8") for sub in res]

    
    
    print("======================")
    return res

def read_pdf_text(path, preprocess_langchain=False):
    '''
    @param path: the pdf object path
    @param preprocess_langchain: preprocessing flag from langchain
    @return texts: all the text from the pdf concatinated
    '''
    reader = PdfReader(path)
    raw_text = ''

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            raw_text += text

    texts= preprocess_texts(raw_text)
    return texts

def process_all_pdfs(directory_path,embeddings,path, userID, preprocess_langchain=False):
    temp_store = 0
    if os.path.exists(path+userID):
        temp_store = FAISS.load_local(path, embeddings,allow_dangerous_deserialization=True)
    # print(temp_store)
   
    '''
    @param directory_path: get the directory of the documentstore
    @param preprocess_langchain: if the preprocess for langchain to optimize token in chunks should be done
    @param returns: all the concatinated texts from pdfs
    '''
    all_texts = []
    indexFile = "knowledgeBasePDF/"+userID+"/index.txt"
    
    if os.path.exists(directory_path):
        print("user exists")
    else:
        subDirectory = "knowledgeBasePDF/"+ userID
        if not os.path.exists(subDirectory):
            os.mkdir(subDirectory)
        with open("./defaultindex.txt", 'r') as f:
            texts = f.read()
            f.close()
        with open(indexFile, 'w') as file:
            file.write(texts+"\n\n\n####")
            file.close()
    metadatas=[]
    for filename in os.listdir(directory_path):
        if filename.endswith('.pdf'):
            filepath = os.path.join(directory_path, filename)
            texts = read_pdf_text(filepath, preprocess_langchain)
            for i in texts:
                metadatas.append(
                {"source": filename}
             )
            all_texts.extend(texts)
        elif(filename.endswith('.txt')):
           
            filepath = os.path.join(directory_path, filename)
            texts = read_text_from_file(filepath)
            for i in texts:
                metadatas.append(
                {"source": filename}
             )
            
            all_texts.extend(texts)
    context = FAISS.from_texts(all_texts, embeddings, metadatas )
    # print(all_texts)
    if temp_store!=0:
        temp_store.merge_from(context)
        temp_store.save_local(path)
    else:
        context.save_local(path)
  
    return all_texts

def create_embeddings_for_new_files(directory_path,embeddings,path, userID, files_list,preprocess_langchain=False):
    temp_store = 0
    if os.path.exists(path):
        temp_store = FAISS.load_local(path, embeddings,allow_dangerous_deserialization=True)
   
    '''
    @param directory_path: get the directory of the documentstore
    @param preprocess_langchain: if the preprocess for langchain to optimize token in chunks should be done
    @param returns: all the concatinated texts from pdfs
    '''
    all_texts = []
    indexFile = "knowledgeBasePDF/"+userID+"/index.txt"
    
    metadatas=[]
    for filename in files_list:
        if filename.endswith('.pdf'):
            filepath = os.path.join(directory_path, filename)
            texts = read_pdf_text(filepath, preprocess_langchain)
            for i in texts:
                metadatas.append(
                {"source": filename}
             )
            all_texts.extend(texts)
        elif(filename.endswith('.txt')):
           
            filepath = os.path.join(directory_path, filename)
            texts = read_text_from_file(filepath)
            for i in texts:
                metadatas.append(
                {"source": filename}
             )
            
            all_texts.extend(texts)
    context = FAISS.from_texts(all_texts, embeddings, metadatas )
    
    if temp_store!=0:
        temp_store.merge_from(context)
        temp_store.save_local(path)
    else:
        context.save_local(path)

    
  
    return all_texts


def read_text_from_file(filepath):
    '''
    @param filepath: the path of the text file to read
    @return: a reader object
    '''
    with open(filepath, 'r') as f:
        
        texts = preprocess_texts(f.read())
        f.close()
        return texts
    
# function to get user key for openai api or local if any
def getKey(userId):
    url = "http://localhost:1349/what2study/parse/functions/getkey"

    url_ = "https://cpstech.de/what2study/parse/functions/getkey"

    headers =  {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": "what2study",
                "X-Parse-Master-Key": "what2studyMaster",
            }
    
    data = {
        'userId':userId}
        # "data":textFromAllWebsite
    
    
    response = request.post(url, headers=headers, json=data)
    # Use the json module to load CKAN's response into a dictionary.
    response_dict = json.loads(response.text)
    
    return response_dict['result']
