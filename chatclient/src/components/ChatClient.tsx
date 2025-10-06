import { useData } from "hooks";

import _ from "lodash";
import { FC, Fragment, useEffect } from "react";
import { BsChatQuoteFill } from "react-icons/bs";

import ChatContainer from "./ChatContainer";
import OpenChatButton from "./OpenChatButton";

import { useTranslation } from 'react-i18next';
import { LOCALSTORAGE_SESSION_ID_KEY } from "App";
import { v4 as uuidv4 } from "uuid";
import {backendFunctions} from "../constants/domainName"
const WHAT2STUDY_BACKEND_URL= backendFunctions
// const WHAT2STUDY_BACKEND_URL = "http://localhost:1349/what2study/parse/functions";
const WHAT2STUDY_X_PARSE_APP_ID = "what2study";
const WHAT2STUDY_X_PARSE_MASTERKEY = "what2studyMaster";


const ChatClient: FC = (props) => {
    const { saveClientConfigurations, isClientConfigFetched ,clientConfig, language} = useData();

    const [t, i18n] = useTranslation("global");
    const getChatClientConfiguration = async () => {
        if ("chatbotId" in props && "accessToken" in props) {
            const resJson = await fetch(`${WHAT2STUDY_BACKEND_URL}/getChatbotSettings`, {
                method: "POST",
                headers: {
                    "X-Parse-Application-Id": WHAT2STUDY_X_PARSE_APP_ID,
                    "X-Parse-Master-Key": WHAT2STUDY_X_PARSE_MASTERKEY,
                },
                body: JSON.stringify({
                    accessToken: props.accessToken,
                    chatbotId: props.chatbotId,
                }),
            });
            var response = await resJson.json();
            i18n.changeLanguage(response.result.language)
            if("testRequest" in props)
            {
                response.result["testRequest"] = props.testRequest
            }
            if("windowtype" in props)
                response.result["windowtype"] =props.windowtype
            
            await saveClientConfigurations(response.result);
            var oldChatID
            if(localStorage.getItem("chatbotID")){
                oldChatID=localStorage.getItem("chatbotID")
                localStorage.removeItem("chatbotID")
            }
            localStorage.setItem("language", response.result.language)
      
           
            localStorage.setItem("chatbotID", response.result.chatbotId)
            if(oldChatID!= response.result.chatbotId){
                const newSessionId = uuidv4();
                if(newSessionId!=null)
                {localStorage.setItem(LOCALSTORAGE_SESSION_ID_KEY, newSessionId);
                localStorage.removeItem("history")
                localStorage.removeItem("historySession")}
            }
            if(localStorage.getItem("chatbotID") != localStorage.getItem("historySession")){
                localStorage.removeItem("history")
                localStorage.removeItem("historySession")
            }
            return;
        }
        if("windowtype" in props)
                response.result["windowtype"] =props.windowtype
            
        await saveClientConfigurations(props);
    };

    const getClientConfigWithThrottle = _.throttle(getChatClientConfiguration, 1000);

    useEffect(() => {
        localStorage.setItem("language", language)
        if(language != undefined)
        {i18n.changeLanguage(language.toLocaleLowerCase());}
        // TO USE CHAT CLIENT WITH BOT ID AND ACCESS TOKEN
        getClientConfigWithThrottle();
    }, [props]);

    if (isClientConfigFetched)
        return (
            <Fragment>
                <ChatContainer {...props} />
                <OpenChatButton icon={BsChatQuoteFill} />
            </Fragment>
        );

    return <Fragment />;
};

export default ChatClient;


