import re
import argparse
import configparser
import os
import json
import string
import random
import glob
from sentence_transformers import SentenceTransformer
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoModelForCausalLM, AutoTokenizer
from langchain.chains import VectorDBQA, RetrievalQA, ConversationalRetrievalChain
from langchain_community.llms import OpenAI
from langchain.memory import ConversationBufferMemory
import requests
from utils.helper_functions import *
from langchain.chains.conversational_retrieval.prompts import QA_PROMPT
import torch
from langchain_community.llms import Ollama
import warnings
import transformers
import requests
import langchain_community
import requests

# session = requests.Session()
# session.verify = False

# requests.sessions.Session = lambda: session
# langchain_community.llms.ollama.requests.session().verify=False
# import requests

# # Step 1: Set up the requests session
# session = requests.Session()
# session.verify = False  # Disable SSL verification

# disable some warnings
transformers.logging.set_verbosity_error()
transformers.logging.disable_progress_bar()
warnings.filterwarnings('ignore')
# set device
device = 'cpu'  # or cpu
torch.set_default_device(device)
from langchain.prompts.prompt import PromptTemplate
from langchain_community.vectorstores import FAISS


# os.environ['REQUESTS_CA_BUNDLE'] = './certificate/chat-impact.fernuni-hagen.de.cer'

formal_prompt= {1:"very informal", 2:"informal", 3: "business casual ", 4: "casual professional" ,5: "professional" ,6: "very professional/formal"}
length_prompt= {1:"very short", 2:"short", 3: "variable, but if doubt rather short", 4: "variable, but if doubt rather detailed" ,5: "detailed" ,6: "very detailed"}
emoji_prompt= {1:"no emojies", 2:"none or sometimes one emoji", 3: "sometimes one or two emojies", 4: "one or two emojies" ,5: "some emojies" ,6: "a lot of emojies"  }
tone_prompt= {1:"very funny", 2:"mostly funny", 3: "casually humorous", 4: "neutral" ,5: "mildly serious" ,6: "very serious"  }
theme_prompt= {1:"very much on the specific subject of the asked question", 2:"on the specific subject of the asked question", 3: "maybe sometimes with an additional related information", 4: "sometimes with a few related information, tips or questions" ,5: "with some related additional information, tips or questions" ,6: "with a lot of related additional information, tips or questions" }
opinion_prompt= {1:"You do not have an own opinion. Be neutral and do not judge in anyway", 2:"You do not have an own opinion. Be neutral", 3: "Be neutral", 4: "feel free to have an own opinion, but be neutral" ,5: "feel free to have an own opinion and maybe judge (politely)" ,6: "feel free to have an own opinion and judge as you want" }
embed_Model_Name= "text-embedding-3-large"

chat_history = []
def id_generator(size=9, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


#load the LLM
def load_llm():

 model_name="sentence-transformers/multi-qa-MiniLM-L6-cos-v1"


 model_name = "sentence-transformers/all-mpnet-base-v2"
 model_name ="hkunlp/instructor-large"
 model_name="bigscience/sgpt-bloom-7b1-msmarco"
 model_name="sentence-transformers/sentence-t5-xl"
 model_name="hkunlp/instructor-xl"
 model_name="BAAI/bge-large-en-v1.5"
#  model_name="infgrad/stella_en_1.5B_v5"
# model_name="BAAI/Bunny-Llama-3-8B-V"
# model_name="sentence-transformers/multi-qa-distilbert-cos-v1"
 model_kwargs = {'device': 'cpu'}
 encode_kwargs = {'normalize_embeddings': False}
 embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs = {'device': 'cpu'}
        )
 keywords = {'verify': False}
 # here you must provide your own ollama instance base URL 
 llm = Ollama(
     base_url="localhost:14434/ollama", 
     model="mixtral:latest",
     headers={"Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNiYTg4OGFmLTE3ZTUtNDBjNy05ZGFkLTA4NmY0NWU3ZTliYiJ9.Kw9J-kZ1vs5QhL1PfJUr7k1b8jDbS5k5AxNhgDoE6hk"},
     )
 context = FAISS.load_local("./knowledgeBasePDF/ollamatestdirectory/embeddingsHagenHFollamatestdirectory", embeddings,allow_dangerous_deserialization=True)

 v_dict = context.docstore._dict
 data_rows=[]
#  for doc_id, document in temp_store.docstore._dict.items():
    # print(f"Document ID: {doc_id}")
    # print(f"Metadata: {document}")
#  for k in v_dict.keys():
    # print(v_dict[k])
    # doc_name = v_dict[k].metadata['source'].split('/')[-1]
    # data_rows.append({"chunk":k,"source":doc_name})
 retriever = context.as_retriever(search_kwargs={"k": 4})


 formal =formal_prompt[2]
 opinion = opinion_prompt[3]
 emojis= emoji_prompt[2]
 length=length_prompt[2]
 tone=length_prompt[3]
 theme=theme_prompt[4]
 prompt_template = """ You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If the question is not related to the context, please answer with "I do not have it in my knowledge, please contact the student advisory service". 
You should act as a study advisor. So students and people who are interested in studying will come to you with questions about their study programs. Answer in German or English. You should help them. Nutze geschlechtssensible Sprache und gendere mit Gendersternchen (z. B. Student*innen, Dozent*innen). 
        Very important: Always reply in the language of User question i.e If question is in german than answer in german language and if question is in English then answer in English.
        Context: {context}
        User: {question}
        System: """
 qa_prompt = PromptTemplate(input_variables=["context", "question"], template=prompt_template)
    
 # Create a conversation buffer memory
 memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True, output_key='answer')

 qa = ConversationalRetrievalChain.from_llm(
    llm=llm,
    return_source_documents=True,
    retriever=retriever,
    combine_docs_chain_kwargs={'prompt': qa_prompt}
    
  )
 
 

    # TO SWITH TO OPENAI use following code
#  os.environ["OPENAI_API_KEY"] = "your key"
#     #embed_Model_Name= "text-embedding-ada-002"
#  embed_Model_Name= "text-embedding-3-large"

#     # initialize the embeddings using openAI embedding library
#  embeddings = OpenAIEmbeddings(model= embed_Model_Name)

#  qa = ConversationalRetrievalChain.from_llm(
#                 OpenAI(model_name="gpt-4o",temperature=0.5), retriever=retriever
#                 ,combine_docs_chain_kwargs={'prompt': qa_prompt}
#             )
#     # enter your question in place of query
#  result = qa({"question": query, "chat_history": chat_history}) 


    # define the question
#  query="Angebote der Zentralen Studienberatung?"
#  query = "Wer ist mein Kontakt bei Talentscouting?"
#  query = "Welche Ergänzungsfächer gibt es bei Medienwissenschaft?"
#  query = "Wie lang ist das Praktikum in Maschinenbau?"
#  query = "Muss ich mich für Psychologie bewerben?"
#  query = "An wen wende ich mich bei Fragen zur Sozialen Arbeit?"
#  query = "Was mache ich später mit einem BWL Studium?"
 while True:
    query = input("Enter a Question: ")
    # if ans.lower()=="stop":
    #     break        #This command breaks out of the while loop.
    # ans = float(ans)
    print("========attemping q&a =============")
    result = qa.invoke({"question": query, "chat_history": chat_history})
    print( "Answer: "+result["answer"])
    # print(result["source_documents"])

#  return result["answer"]


def startConversation():
    llm=load_llm()
    # print(llm.invoke("Was könnte studieren"))
    
def createEmbeddings():
    model_name="sentence-transformers/multi-qa-MiniLM-L6-cos-v1"


    model_name = "sentence-transformers/all-mpnet-base-v2"
    model_name ="hkunlp/instructor-large"
    model_name="bigscience/sgpt-bloom-7b1-msmarco"
    model_name="sentence-transformers/sentence-t5-xl"
    model_name="hkunlp/instructor-xl"
    model_name="BAAI/bge-large-en-v1.5"
    # model_name="infgrad/stella_en_1.5B_v5"
    # model_name="BAAI/Bunny-Llama-3-8B-V"
    # model_name="sentence-transformers/multi-qa-distilbert-cos-v1"
    model_kwargs = {'device': 'cpu'}
    encode_kwargs = {'normalize_embeddings': False}
    # embeddings = HuggingFaceEmbeddings(
    #     model_name=model_name,
    #     model_kwargs=model_kwargs,
    #     encode_kwargs=encode_kwargs,
    # )
    # model = AutoModelForCausalLM.from_pretrained(
    #     'BAAI/Bunny-Llama-3-8B-V',
    #     torch_dtype=torch.float32,
    #     device_map='auto',
    #     trust_remote_code=True)
    # tokenizer = AutoTokenizer.from_pretrained(
    #     'BAAI/Bunny-Llama-3-8B-V',
    #     trust_remote_code=True)
    # tokenizer.pad_token = tokenizer.eos_token
    embeddings = HuggingFaceEmbeddings(
                model_name=model_name,
                model_kwargs = {'device': 'cpu'}
            )
    directoryName ="ollamatestdirectory"
    path = "./knowledgeBasePDF/ollamatestdirectory/embeddingsHagenHFollamatestdirectory"

    process_all_pdfs("./knowledgeBasePDF/"+directoryName+"/",embeddings,path,directoryName, preprocess_langchain=True)

if __name__ == '__main__':
#    createEmbeddings()
   startConversation()
    
