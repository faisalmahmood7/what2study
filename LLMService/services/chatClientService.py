import os
import re
import json
import shutil
import string
import random
import requests
import pandas as pd
from datetime import datetime
from langchain_community.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.llms import OpenAI
from langchain_community.llms import Ollama
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts.prompt import PromptTemplate
from utils.helper_functions import process_all_pdfs, create_embeddings_for_new_files

"""
File: what2study_chat_client_service.py

Description:
    This file contains the business logic functions for handling
    embeddings CRUD operations (Create, Read, Update, Delete).
    It also manages the communication cycle required for
    processing and interacting with embeddings data.
"""

class ChatClientService:
    # 
    # Class level prompt filter dictionaries
    # 
    formal_prompt = {
        1: "very informal", 2: "informal", 3: "business casual ",
        4: "casual professional", 5: "professional", 6: "very professional/formal"
    }
    length_prompt = {
        1: "very short", 2: "short", 3: "variable, but if doubt rather short",
        4: "variable, but if doubt rather detailed", 5: "detailed", 6: "very detailed"
    }
    emoji_prompt = {
        1: "no emojies", 2: "none or sometimes one emoji",
        3: "sometimes one or two emojies", 4: "one or two emojies",
        5: "some emojies", 6: "a lot of emojies"
    }
    tone_prompt = {
        1: "very funny", 2: "mostly funny", 3: "casually humorous", 4: "neutral",
        5: "mildly serious", 6: "very serious"
    }
    theme_prompt = {
        1: "very much on the specific subject of the asked question",
        2: "on the specific subject of the asked question",
        3: "maybe sometimes with an additional related information",
        4: "sometimes with a few related information, tips or questions",
        5: "with some related additional information, tips or questions",
        6: "with a lot of related additional information, tips or questions"
    }
    opinion_prompt = {
        1: "You do not have an own opinion. Be neutral and do not judge in anyway",
        2: "You do not have an own opinion. Be neutral",
        3: "Be neutral",
        4: "feel free to have an own opinion, but be neutral",
        5: "feel free to have an own opinion and maybe judge (politely)",
        6: "feel free to have an own opinion and judge as you want"
    }

    def __init__(self, user_id):
        self.user_id = user_id
        self.api_key = self.get_key(user_id)   # 🔑 fetch API key automatically

        if self.api_key != "local":
            os.environ["OPENAI_API_KEY"] = self.api_key

    @staticmethod
    def get_key(user_id):
        """Fetch API key for a user from backend"""
        url = "http://localhost:1349/what2study/parse/functions/getkey"
        headers = {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "what2study",
            "X-Parse-Master-Key": "what2studyMaster",
        }
        response = requests.post(url, headers=headers, json={'userId': user_id})
        result = json.loads(response.text).get('result', "local")  # default fallback
        return result

    # 
    # Utility methods
    # Generate random id 
    #
    @staticmethod
    def id_generator(size=9, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))


    #
    # Conversation methods
    # start conversation before conversation cycle to detect embedding compatibility problems. Once embeddings are verified send the request to conversationCycle  
    #
    def start_conversation(self, question, language, filters, regen, chat_history_data, random_question, custom_prompt):
        embeddings, context_path = self._get_embeddings()
        context = FAISS.load_local(context_path, embeddings, allow_dangerous_deserialization=True)

        result = self._conversation_cycle(
            context, question, language, filters, regen, chat_history_data, random_question, custom_prompt
        )
        if result is False:
            print("Assertion Error detected: fresh embeddings")
            shutil.rmtree(context_path)
            process_all_pdfs(
                f"./knowledgeBasePDF/{self.user_id}/", embeddings, context_path, self.user_id, preprocess_langchain=True
            )
            result = self._conversation_cycle(
                context, question, language, filters, regen, chat_history_data, random_question, custom_prompt
            )
        return result["answer"]

    # start conversation cycle  for openai OR Local (ollama/huggingface)    
    def _conversation_cycle(self, context, question, language, filters, regen, chat_history_data, random_question, custom_prompt):
        chat_history, unsat_ans = self._parse_chat_history(chat_history_data, random_question, regen, question)
        retriever = context.as_retriever()
        filters = self._normalize_filters(filters)

        prompt_template = self._build_prompt(custom_prompt, filters)
        qa_prompt = PromptTemplate(input_variables=["context", "question", "chat_history"], template=prompt_template)

        if self.api_key != "local":
            qa = ConversationalRetrievalChain.from_llm(
                OpenAI(model_name="gpt-4o", temperature=0.2),
                retriever=retriever,
                combine_docs_chain_kwargs={'prompt': qa_prompt}
            )
            try:
                return qa({"question": question, "chat_history": chat_history})
            except AssertionError:
                return False
        else:
            llm = Ollama(base_url="https://chat-impact.fernuni-hagen.de/", model="mixtral")
            qa = ConversationalRetrievalChain.from_llm(
                llm=llm, retriever=retriever, return_source_documents=True,
                combine_docs_chain_kwargs={'prompt': qa_prompt}
            )
            try:
                return qa.invoke({"question": question, "chat_history": chat_history})
            except AssertionError:
                return False

    def _get_embeddings(self):
        if self.api_key != "local":
            embed_model = "text-embedding-3-large"
            embeddings = OpenAIEmbeddings(model=embed_model)
            context_path = f"./knowledgeBasePDF/{self.user_id}/embeddings{self.user_id}"
        else:
            model_name = "BAAI/bge-large-en-v1.5"
            embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs={'device': 'cpu'})
            context_path = f"./knowledgeBasePDF/{self.user_id}/embeddingsHagenHF{self.user_id}"
        return embeddings, context_path

    def _parse_chat_history(self, chat_history_data, random_question, regen, question):
        chat_history = []
        chat_history_json = json.loads(chat_history_data)
        chat_history_json.pop(0)

        for val in chat_history_json[:]:
            if val == {'source': 'BOT', 'message': random_question, 'type': 'text', 'url': ''}:
                chat_history_json.remove(val)

        unsat_ans = ""
        for i in reversed(chat_history_json):
            if i["source"] == "BOT":
                unsat_ans = i["message"]

        for val in chat_history_json:
            if val["source"] == "BOT":
                chat_history.append(("message", val["message"]))
            elif val["source"] == "USER":
                chat_history.append(("USER", val["message"]))

        if regen:
            chat_history.append((question, unsat_ans))
        if len(chat_history) > 10:
            chat_history = chat_history[-8:]

        return chat_history, unsat_ans

    def _normalize_filters(self, filters):
        for key in ["formality", "opinion", "emotion", "length", "tone", "topics"]:
            if filters.get(key, 0) == 0:
                filters[key] = 1
        return filters

    def _build_prompt(self, custom_prompt, filters):
        formal = self.formal_prompt[filters['formality']]
        opinion = self.opinion_prompt[filters['opinion']]
        emojis = self.emoji_prompt[filters['emotion']]
        length = self.length_prompt[filters['length']]
        tone = self.length_prompt[filters['tone']]
        theme = self.theme_prompt[filters['topics']]

        now = datetime.now()
        event_deadline_times = (
            f"Event and Deadline Recommendations: When suggesting events or deadlines, "
            f"prioritize those that are in the future, based on the current time "
            f"[{now.day} of {now.strftime('%B')}, {now.hour}:{now.minute}:{now.second}]. "
            f"You may mention past events if they are relevant, but ensure to clarify that they have already occurred."
        )

        return f"""{custom_prompt}
        Emojis: {emojis}
        Length of your answer: {length}
        Tone of your answer: {tone} and it should seem {formal}
        Theme of your answer: {theme}
        Your perspective: {opinion}
        Knowledge base: provide links if available in the context.
        Reply in the language of the question.
        Use chat history for context.
        {event_deadline_times}
        Context: {{context}}
        Chat History: {{chat_history}}
        User: {{question}}
        System:
        """

    #
    # embedding management
    # test createembeddings with dummy merge to check compatibility, then detect new files and create embeddings for new files
    # 
    def create_embeddings(self, embeddings, path):
        if os.path.exists(path):
            temp_store = FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
            merge_test = temp_store
            context = FAISS.from_texts("m", embeddings, [{"source": "merge test"}])
            try:
                merge_test.merge_from(context)
            except Exception:
                shutil.rmtree(path)
                return self.create_embeddings(embeddings, path)

            if os.path.exists(f"./knowledgeBasePDF/{self.user_id}/index.txt"):
                self.del_embedding("index.txt", temp_store, path)
            if os.path.exists(f"./knowledgeBasePDF/{self.user_id}/indexMedia.txt"):
                self.del_embedding("indexMedia.txt", temp_store, path)

            v_dict = temp_store.docstore._dict
            data_rows = [{"chunk": k, "source": v_dict[k].metadata['source'].split('/')[-1]} for k in v_dict.keys()]
            vector_df = pd.DataFrame(data_rows)
            file_not_vectorized = []

            for filename in os.listdir(f"./knowledgeBasePDF/{self.user_id}"):
                chunk_list = vector_df.loc[vector_df['source'] == filename]['chunk'].tolist()
                if len(chunk_list) == 0 and "embeddings" not in filename:
                    file_not_vectorized.append(filename)
                if "index.txt" in filename or "indexMedia.txt" in filename:
                    file_not_vectorized.append(filename)

            if file_not_vectorized:
                create_embeddings_for_new_files(
                    f"./knowledgeBasePDF/{self.user_id}/", embeddings, path, self.user_id, file_not_vectorized, preprocess_langchain=True
                )
        else:
            process_all_pdfs(f"./knowledgeBasePDF/{self.user_id}/", embeddings, path, self.user_id, preprocess_langchain=True)

        requests.post(
            "http://localhost:1349/what2study/parse/functions/embeddingStatusUpdate",
            headers={
                "Content-Type": "application/json",
                "X-Parse-Application-Id": "what2study",
                "X-Parse-Master-Key": "what2studyMaster",
            },
            json={"user": self.user_id},
        )
        return "200"

    # delete embeddings for deleted/updated files from the vector store
    def del_embedding(self, item, temp_store, path):
        if os.path.exists(path):
            v_dict = temp_store.docstore._dict
            data_rows = [{"chunk": k, "source": v_dict[k].metadata['source'].split('/')[-1]} for k in v_dict.keys()]
            vector_df = pd.DataFrame(data_rows)
            chunk_list = vector_df.loc[vector_df['source'] == item]['chunk'].tolist()
            chunk_list_2 = vector_df.loc[vector_df['source'] == 'merge test']['chunk'].tolist()

            if chunk_list:
                temp_store.delete(chunk_list)
            if chunk_list_2:
                temp_store.delete(chunk_list_2)
            temp_store.save_local(path)

    # 
    # File management
    # download file from provided link passed via saveFile route
    # 
    def download_file(self, url, file_name, indexC, transcript):
        response = requests.get(url)
        if response.status_code != 200:
            return "error in file fetch"

        directory = "knowledgeBasePDF"
        if not os.path.exists(directory):
            os.mkdir(directory)

        sub_dir = os.path.join(directory, self.user_id)
        if not os.path.exists(sub_dir):
            os.mkdir(sub_dir)

        if "intent" in file_name:
            for item in os.listdir(sub_dir):
                if item.endswith(file_name):
                    os.remove(os.path.join(sub_dir, item))

        save_path = os.path.join(sub_dir, f"{self.id_generator(8)}_{file_name}")
        with open(save_path, 'wb') as f:
            f.write(response.content)

        index_file = os.path.join(sub_dir, "index.txt")
        if os.path.exists(index_file):
            with open(index_file, "a") as f:
                f.write(indexC)
        else:
            with open("./defaultindex.txt", 'r') as f:
                texts = f.read()
            with open(index_file, 'w') as f:
                f.write(texts + "\n\n\n" + indexC)

        if transcript:
            index_file_media = os.path.join(sub_dir, "indexMedia.txt")
            with open(index_file_media, "a" if os.path.exists(index_file_media) else "w") as f:
                if os.path.exists(index_file_media):
                    f.write(f"url / link:{url}\nTranscript / description: {transcript}\n\n###\n\n")
                else:
                    f.write(
                        "This file contains image and video file urls or links and their transcripts.\n\n"
                        f"url / link:{url}\nTranscript / description:{transcript}\n\n###\n\n"
                    )
    
    # delete file from the path and embedding store
    def del_file(self, file_name, file_name_wos):
        embeddings, path = self._get_embeddings()
        temp_store = FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)

        sub_dir = os.path.join("knowledgeBasePDF", self.user_id)
        if not os.path.exists(sub_dir):
            os.mkdir(sub_dir)

        for item in os.listdir(sub_dir):
            if item.endswith(file_name) or item.endswith(file_name_wos):
                self.del_embedding(item, temp_store, path)
                os.remove(os.path.join(sub_dir, item))