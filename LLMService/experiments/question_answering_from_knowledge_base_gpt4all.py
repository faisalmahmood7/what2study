from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import VectorDBQA, RetrievalQA, ConversationalRetrievalChain
#from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
#from langchain.vectorstores import FAISS
from utils.helper_functions import *
import argparse

#from langchain.document_loaders import PyPDFLoader
from langchain import PromptTemplate, LLMChain
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import GPT4All
#from gpt4all import GPT4All
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores.faiss import FAISS
from langchain.callbacks.base import BaseCallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.output_parsers import CommaSeparatedListOutputParser 

def main(args):

    # initialize and read the *.pdf object
    texts = process_all_pdfs(args.directory_path, preprocess_langchain=True)
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')


    # initialize the FAISS document store using the preprocessed text and initialized embeddings
    docsearch = FAISS.from_texts(texts, embeddings)
    output_parser = CommaSeparatedListOutputParser()
    while True:
         # define the question
        print("type your question")
        question = input("")
        matched_docs = docsearch.similarity_search(question, 2)
        context = ""
        for doc in matched_docs:
            context = context + doc.page_content + " \n\n "
        print(context)
        template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

        context: {context}

        Question: {question}
        Answer:
        """
        callback_manager = BaseCallbackManager([StreamingStdOutCallbackHandler()])
        llm = GPT4All(model="./models/ggml-gpt4all-j-v1.3-groovy.bin", backend='gptj', n_batch=6, callbacks=callback_manager, verbose=False,repeat_last_n=0)
        # prompt = PromptTemplate(template=template, input_variables=["context","question"])
        # llm_chain = LLMChain(prompt=prompt, llm=llm)
        #llm_chain = LLMChain(
        #llm=llm,
        #prompt=PromptTemplate.from_template(template)
        #)
        # print(question)
        #print(llm_chain.run(question))
        # print(output_parser.parse(llm_chain.run(question)))
        # print(llm_chain.predict(question=question, context=context))
        qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=docsearch.as_retriever())
        print(qa.run(question))

if __name__ == "__main__":
    # app.run(host="localhost", port=8000, debug=True)
    parser = argparse.ArgumentParser(description='Process a directory path.')
    parser.add_argument('--directory_path', type=str, help='A directory path.') 
    args = parser.parse_args()
    main(args)
