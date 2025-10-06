# what2study
Fernuniversität in Hagen Research Project
**What2Study** is a complete platform for creating AI-powered chatbots. It provides an end-to-end system where users can:

* Create and manage their own chatbots.
* Upload documents and crawl websites for data ingestion.
* Use basic **RAG (Retrieval-Augmented Generation)** pipelines powered by OpenAI or local LLMs via Ollama.
* Integrate a customizable chat client into their websites for enduser interaction.

The project is composed of multiple services working together:

1. **API Gateway (Node.js backend)** – user and data management, API services.
2. **Web Portal (React.js frontend app)** – interface for creating and managing chatbots.
3. **Chat Client (React.js iframe chatbubble)** – embeddable chatbot window for websites.
4. **LLM Service (python service)** – RAG-based Q&A engine with OpenAI and Ollama (local modals).
5. **URL Crawler (Python service)** – crawl websites, extract and summarize content for chatbot knowledge base.

---

## ⚙️ System Architecture

![Alt text](https://github.com/faisalmahmood7/what2study/blob/main/arch)

---

## 📦 Components

### 1. API Gateway (Node.js)

Backend service for user/data management and communication with other services.

* Runs on **port 1349**
* Database: `mongodb://localhost:27017/what2study`
* Public URL: `http://localhost:1339/what2study/parse`
* Application ID: `what2study`

**Setup:**

```bash
npm install
npm start
```

```
edit config.js for localhost and domain name
```

**React.js Connection Example:**

```js
import Parse from 'parse'
Parse.initialize("what2study")
Parse.serverURL = "http://localhost:1339/what2study/parse"
Parse.masterKey = "what2studyMaster"
```

---

### 2. Web Portal (React.js)

Main dashboard for creating, publishing, and managing chatbots.

* Runs on **[http://localhost:3000/what2study/home](http://localhost:3000/what2study/home)**

**Setup:**

```bash
npm install --legacy-peer-deps
npm start
```


```
edit src/config/parse.ts for localhost and domain name and parsebackend endpoint
```

**Usage:**

1. Register for an account.
2. Create a chatbot via the sidebar → **Chat-client**.
3. Upload documents or link websites.
4. Publish the chatbot to make it available for interaction.

Note: Switching between Open AI API and Ollama is switched off. You need to run your ollama instance and connect the logic inorder to be able to swtich between modals.

---

### 3. Chat Client (React.js iframe)

Embeddable chat interface for websites.

**Setup:**

```bash
npm install --legacy-peer-deps
npm start
```

```
edit src/constants/domainName.ts for localhost and domain name changes
```

**To test locally:**

* Open `./chat/demo.html` in browser.

**To embed in a website:**

* Copy contents of `./chat/what2StudyLoader.js` into the browser console of the target site.

**Publish as NPM package:**

Setup your own npm package account and rename package name in chatclient and also in chatclient installation/integration into webportal.

```bash
npm run build
npm publish
```

---

### 4. LLM Python Service

Handles embeddings, vector store management, and RAG-based Q&A using **OpenAI** or **Ollama (local LLMs)**.

* Runs on **port 5009**

**Setup:**

Firstly activate environment llmservice 

```bash
source llmservice/bin/activate
pip3 install -r requirements.txt
python3 main.py
```

**Notes:**

* Requires `langchain==0.2.2` and `langchain-community==0.0.38`.
* Ollama support must be enabled via React frontend + server configuration.

---

### 5. URL Crawler (Python)

Crawls given websites and generates summaries for ingestion into the LLM service.

**Setup:**

```bash
python3 crawler.py
```

* Outputs text/summary files for storage and embedding.
* Integrated with Web Portal for automated crawling.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Web Portal + Chat Client)
* **Backend:** Node.js Parse Server
* **Database:** MongoDB
* **LLM Services:** Python (LangChain, OpenAI, Ollama)
* **Crawler:** Python (requests, BeautifulSoup)

---

## 🔗 Workflow

1. User logs into **Web Portal** and creates a chatbot.
2. User uploads documents or provides URLs to crawl.
3. **URL Crawler** fetches and summarizes content.
4. Data is stored in **Parse Server** and embedded via **LLM Service**.
5. Published chatbot becomes available via **Chat Client** integration.

---

Here’s an updated **Limitations** section including your OpenAI key note:

---

## ⚠️ Limitations

* **Local Ollama Models Disabled:**
  The logic for using local Ollama models is currently commented out in both the **Web Portal** and **LLM Service**. Ollama was in testing phase towards the end of project.

* **Manual Setup Required for Ollama:**
  To enable local models, you must:

  1. Run your own instance of Ollama.
  2. Select the models you want to use.
  3. Adjust the commented code to match your Ollama endpoint, model names, and settings.

* **OpenAI API Key Required:**
  You must provide your own OpenAI access key by either:

  1. Editing the `getKey` function in `apigateway/cloud/main.js`, **or**
  2. Allowing users to store their API key via the **Web Portal → Settings** tab.



