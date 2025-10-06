import ChatClient from "components/ChatClient";
import { DataProvider } from "hooks";

import { FC } from "react";

import "./styles/global.scss";
import "bootstrap/dist/css/bootstrap.min.css";

export const LOCALSTORAGE_SESSION_ID_KEY = "what2studyUserSessionId";


import i18next from "i18next";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";

i18next
    .init({
        interpolation: { escapeValue: false },
        lng: "de",
        react: {
            useSuspense: false
        },
        resources: {
            en: {
                global: {
                    "chaterror":"Something went wrong! Please try again.",
                    "introPage1": {
                        "hello": "Hello. It's nice to meet you!",
                        "iam": "I am a chatbot",
                        "built": " built to help you with your studies! Before we get started, here are a few important facts.",
                        "play": "Play Tutorial",
                        "chat": "To Chat",
                        "okay": "Okay"
                    },
                    "introPage2": {
                        "Lets": "Let's start with the basics! Working with me is easy and safe. Here is important information about my functions and procedures:",
                        "everything1": 'Confidentiality: All information discussed here is confidential. The content will not be passed on unless explicit consent has been given for it to be passed on (e.g. when forwarding an inquiry via the “Further clarification required” function).',
                        "everything2": 'Data evaluation for improvement: To improve the answers, anonymized data is evaluated in an initial test phase. This data is used exclusively to optimize the quality of the service.',
                        "okay": "Okay",
                        "datenSecutiry":"For more information, please read our full ",
                        "datenSecurityLink":"privacy policy."
                    },
                    "infoPopup": {
                        "welcome": "Welcome to What2Study!",
                        "what2study": "What2Study is a ",
                        "chatbot": "Chatbot",
                        "that": " that was developed to support in all your question and endeavors concerning",
                        "studies": " studies",
                        "please": "Please note:",
                        "isnot": "What2Study is not a real",
                        "person": " person. ",
                        "many": "Many people have been involved in its development and have extensively tested whether the answers and content are correct and helpful. However, we ",
                        "cant": "cannot guarantee",
                        "every": "that every answer given by this chatbot is correct. We recommend that you verify important information yourself."
                    },
                    "talk2human": {
                        "back": "Back",
                        "write": "Contact",
                        "message": "Briefly describe the question/concern here (if it is not obvious from the chat history or if it is not sent at the same time)",
                        "send": "Send chat history",
                        "please": "Enter your email address for contact purposes:",
                        "use": "Use the saved email address: ",
                        "different": "Use a different email address",
                        "email": "Enter email address",
                        "would": "Is a phone response preferred?",
                        "number": "Enter contact number",
                        "best": "What is the best time to call you?",
                        "submit":"Submit",
                        "matriculation":"Here you can provide your Matriculatoin number",
                        "matPlaceholder":"Matriculation nummer eingeben"
                    
                    },
                    "filters": {
                        "personality": "Chatbot Personality",
                        "reset": "Default",
                        "discard": "Undo Changes",
                        "friendly": "Casual",
                        "professional": "Formal",
                        "opinionated": "Recommending",
                        "neutral": "Neutral",
                        "many": "Many emojis 🤩",
                        "no": "No emojis",
                        "long": "Long answers",
                        "short": "Short answers"
                    },
                    "lang":{
                        "lang":"Talk To Us",
                        "ClearHistory":"Delete Chat"
                
                    },
                    "initialChat":"Welcome to our Student Advisory Service!\nHow can I help you today?",
                    "settings": {
                        "settings": "Settings",
                        "restart": "Restart Intro",
                        "language": "Language",
                        "user": "Assumptions",
                        "userAssumption1": "Studies Design",
                        "userAssumption2": "22 year old",
                        "userAssumption3": "Studying at this University",
                        "filterval":"Selection"
                    },
                    "botmsg":{
                        "1":"Welcome to the Student Advisory Service! How can I help you today?",
                        "2":"This is just a sample conversation to illustrate the impact of design decisions. If you want to test the interaction with the chatbot, go to 'Database'"},
                        "usermsg":{
                        "1":"Why can't I interact with the chatbot here?",
                        "2":"Ah, ok, thanks!",
                        },
                        "intromsg":"Welcome to our Student Advisory Service!\nHow can I help you today?",
                        "panicmessage":"Thank you for your feedback. You can submit a detailed feeback via Talk to human button above."
                }
            },
            de: {
                global: {
                    "chaterror":"Ein Fehler ist aufgetreten! Bitte versuchen Sie es erneut.",
                    "introPage1": {
                        "hello": "Hallo,",
                        "iam": "ich bin ein Chatbot",
                        "built": " der dir bei deinem Studium helfen soll! Bevor wir loslegen, ein paar wichtige Fakten.",
                        "play": "Erklärvideo",
                        "chat": "Direkt zum Chat",
                        "okay": "Weiter"
                    },
                    "introPage2": {
                        "Lets": "Lassen Sie uns mit den Grundlagen beginnen! Der Umgang mit mir ist einfach und sicher. Hier sind wichtige Informationen über meine Funktionen und Vorgehensweisen:",
                        "easy": "einfach und sicher ist.",
                        "thats": " Deshalb möchte ich so gut wie möglich über meine",
                        "functions": " Funktionen und Vorgehensweisen informieren.",
                        "everything1": 'Vertraulichkeit: Alle hier besprochenen Informationen sind vertraulich. Der Inhalt wird nicht weitergegeben, es sei denn, es liegt eine ausdrückliche Zustimmung zur Weitergabe vor (z.B. bei Weiterleitung einer Anfrage über die Funktion "Weiterer Klärungsbedarf").',
                        "everything2":"Datenauswertung zur Verbesserung: Zur Verbesserung der Antworten werden in einer ersten Testphase anonymisierte Daten ausgewertet. Diese Daten dienen ausschließlich dazu, die Qualität der Serviceleistung zu optimieren.",
                        "okay": "Okay",
                        "datenSecutiry":"Für weitere Informationen lesen Sie bitte unsere ",
                        "datenSecurityLink":"vollständige Datenschutzerklärung."
                
                    },
                    "infoPopup": {
                        "welcome": "Willkommen bei What2Study!",
                        "what2study": "What2Study ist ein ",
                        "chatbot": "Chatbot, ",
                        "that": "der entwickelt wurde, um Studierende und Studieninteressierte bei allen Fragen rund um das ",
                        "studies": "Studium zu unterstützen",
                        "please": "Bitte beachten:",
                        "isnot": "What2Study ist keine ",
                        "person": "reale Person",
                        "many": "Viele Menschen waren an der Entwicklung beteiligt und haben ausgiebig getestet, ob die Antworten und Signaturen korrekt und hilfreich sind. Dennoch können wir ",
                        "cant": "nicht garantieren, ",
                        "every": "dass jede Antwort des Chatbots korrekt ist. Wir empfehlen daher, insbesondere wichtige Informationen noch einmal selbst zu überprüfen."
                    },
                    "talk2human": {
                        "back": "Zurück",
                        "write": "kontaktieren:",
                        "message": "Deine Nachricht",
                        "send": "Chatverlauf senden",
                        "please": "E-Mail-Adresse für Kontaktzwecke angeben:",
                        "use": "Gespeichtere E-Mail-Adresse verwenden: ",
                        "different": "Andere E-Mail-Adresse verwenden: ",
                        "email": "E-Mail-Adresse eingeben",
                        "would": "Wünschen Sie eine telefonische Rückmeldung?",
                        "number": "Telefonnummer eingeben",
                        "best": "Wann kann ich Sie am besten anrufen?",
                        "submit":"Einreichen",
                        "matriculation":"Hier können Sie Ihre Matrikelnummer angeben",
                        "matPlaceholder":"Matriculation nummer eingeben"
                    },
                    "filters": {
                        "personality": "Chatbot-Charakter",
                        "reset": "Standard",
                        "discard": "Änderungen zurücksetzen",
                        "friendly": "Locker",
                        "professional": "Formell",
                        "opinionated": "Vorschlagend",
                        "neutral": "Objektiv",
                        "many": "Viele Emojis 🤩",
                        "no": "Keine emojis",
                        "long": "Lange Antworten",
                        "short": "Kurze Antworten"
                    },
                    "lang":{
                        "lang":"Weiterer Klärungsbedarf",
                        "ClearHistory":"Chat löschen"
                    },
                    "initialChat":"Herzlich willkommen bei unserer Studienberatung!\nWie kann ich Ihnen heute behilflich sein?",
                    "settings": {
                        "settings": "Einstellungen",
                        "restart": "Intro starten",
                        "language": "Sprache",
                        "user": "Annahmen",
                        "userAssumption1": "Studiert Design",
                        "userAssumption2": "22 Jahre alt",
                        "userAssumption3": "Studium an dieser Universität",
                        "filterval":"Auswahl"
                 
                    },
                    "botmsg":{
                    "1":"Herzlich willkommen bei der Studienberatung! Wie kann ich heute behilflich sein?",
                    "2":"Dies ist nur eine Beispielkonversation, um die Auswirkungen von Designentscheidungen zu veranschaulichen. Die Interaktion mit dem Chatbot kann unter 'Datenbanken' getestet werden."
                    },
                    "usermsg":{
                    "1":"Warum kann ich hier nicht mit dem Chatbot interagieren?",
                    "2":"Ah, ok, danke! ",
                    },
                    "intromsg":"Herzlich willkommen bei unserer Studienberatung!\nWie kann ich Ihnen heute behilflich sein?",
                    "panicmessage":"Danke für Ihre Rückmeldung. Sie können über die Schaltfläche „Sprich mit uns oben ein detailliertes Feedback abgeben."
             
           
                }
            }
        }
    });


const App: FC = (props) => {

    return (
        <DataProvider>

            <I18nextProvider i18n={i18next}>
                <ChatClient {...props} />

            </I18nextProvider>
        </DataProvider>

    );
};

export default App;
