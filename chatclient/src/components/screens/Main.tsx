import { LOCALSTORAGE_SESSION_ID_KEY } from "App";
import { EPopupItem, ERoute, useData } from "hooks";
import IconButton from "utilities/IconButton";

import { FC, Fragment, Key, SyntheticEvent, useEffect, useRef, useState } from "react";
import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
import { IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IoSend } from "react-icons/io5";
import 'regenerator-runtime/runtime'
import {
    MdInfoOutline,
    MdOutlineHistory,
    MdOutlineThumbDownOffAlt,
    MdOutlineThumbUpOffAlt,
    MdOutlineWarningAmber,
    MdReplay,
    MdThumbDownAlt,
    MdThumbUpAlt,
} from "react-icons/md";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import { RiUser6Fill } from "react-icons/ri";

import { useTranslation } from 'react-i18next';
import { config } from "process";
import ChatClient from "components/ChatClient";
import { backendFunctions, chatbotLLMService } from "constants/domainName";

enum EMessageSource {
    BOT = "BOT",
    USER = "USER",
}

enum EMessageType {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
}

interface IBotMessage {
    source: EMessageSource;
    message: string;
    feedback?: boolean;
    type?: EMessageType;
    url?: string;
    session?: string;
}



const isYoutubeURL = (url = ""): boolean => {
    const ytRegEx = new RegExp("^(https?://)?(www.youtube.com|youtu.be)/.+$");
    return ytRegEx.test(url);
};

const Main: FC = (props) => {
    const initialMessages = () => {
        var res = []
        if (localStorage.getItem("history") != null) {
            res = JSON.parse(localStorage.getItem("history") || '')
        }

        if (res != '') {
            if (res[0].session != sessionId) {
                return []
            }
            else {
                return res
            }
            return res
        }
        else {
            var message
            if (localStorage.getItem("language") == "en") {

                message = [
                    {
                        source: EMessageSource.BOT,
                        message: welcomeMsgEN,
                        session: sessionId,
                    },
                ];
            }
            if (localStorage.getItem("language") == "de") {


                message = [
                    {
                        source: EMessageSource.BOT,
                        message: welcomeMsgDE,
                        session: sessionId,
                    },
                ];
            }
            return message

        }
    }
    const [messages, setMessages] = useState<IBotMessage[]>(initialMessages);
    const [loading, setLoading] = useState<boolean>(false);
    const [toggleSound, setTogSound] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // const WHAT2STUDY_BACKEND_URL = "http://localhost:1349/what2study/parse/functions";
    const WHAT2STUDY_BACKEND_URL= backendFunctions;
    // const chatEndpoint = "http://127.0.0.1:5009/chatbot/";
    const chatEndpoint=  chatbotLLMService;
    const WHAT2STUDY_X_PARSE_APP_ID = "what2study";
    const [value, setValue] = useState('')
    const [dummyValuesSet, setDummyValueCounter] = useState<boolean>(false)

    const [t, i18n] = useTranslation("global");
    const {
        setPopupItem,
        // isBotVolumeOn,
        // setIsBotVolumeOn,
        setCurrentRoute,
        clientConfig,
        sessionId,
        language
    } = useData();
    const {
        chatbotProfileImage,
        chatbotId,
        userId,
        dummyRequest,
        chatbotLook: { textBoxUser, textBoxChatbotReply, UIGroupA, UIGroupB },
        welcomeMsgDE,
        welcomeMsgEN
    } = clientConfig;
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const [isMicPressed, setMic] = useState<boolean>(false);
    const [browserNotSupp, setBrowserSupp] = useState<boolean>(true);
    const [micInputText, setMicInputText] = useState<string>("");
    const [isBotVolumeOn, setIsBotVolumeOn] = useState<boolean>(clientConfig.AudioNarration);
    const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>(window.speechSynthesis.getVoices());
    const [availableEngVoices, setEnVoices] = useState<Array<SpeechSynthesisVoice>>();
    const [availableDeVoices, setDeVoices] = useState<Array<SpeechSynthesisVoice>>();

    useEffect(() => {
        setEnVoices(voices?.filter(({ lang }) => lang === "en-US"))
        setDeVoices(voices?.filter(({ lang }) => lang === "de-DE"))

    }, [voices])

    const glowCSS = {
        backgroundColor: UIGroupB.UIGroupBUIBackground,
        color: UIGroupB.UIGroupBUIHighlight,
    }
    const afterGlowCSS = {
        backgroundColor: UIGroupB.UIGroupBUIBackground,
        color: UIGroupB.UIGroupBUIHighlight,
        boxShadow: "0 0 20px #00"
    }
    const [defaultTalkToHumanCSS, setDefaultTOH] = useState<any>(glowCSS);


    const [regen, setRegen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (dummyRequest == true) {
            setDummyValueCounter(false)
            setMessages(initialMessages)
        }
        else {
            var res = []
            if (localStorage.getItem("history") != null) { res = JSON.parse(localStorage.getItem("history") || '') }

            if (res.length >= 1) {
                if (res[0].session != sessionId) {

                    if (localStorage.getItem("language") == "en") {
                        setMessages([{ source: EMessageSource.BOT, message: welcomeMsgEN, session: sessionId },])
                    }
                    if (localStorage.getItem("language") == "de") {

                        setMessages([{ source: EMessageSource.BOT, message: welcomeMsgDE, session: sessionId },])

                    }

                }
                else {
                    if (localStorage.getItem("language") == "en") {
                        res[0] = { source: EMessageSource.BOT, message: welcomeMsgEN, session: sessionId }
                    }
                    if (localStorage.getItem("language") == "de") {

                        res[0] = { source: EMessageSource.BOT, message: welcomeMsgDE, session: sessionId }

                    }
                    setMessages(res)
                }
            }
            else {

                if (localStorage.getItem("language") == "en") {
                    setMessages([{ source: EMessageSource.BOT, message: welcomeMsgEN, session: sessionId },])
                }
                if (localStorage.getItem("language") == "de") {

                    setMessages([{ source: EMessageSource.BOT, message: welcomeMsgDE, session: sessionId },])

                }

            }

        }

    }, [localStorage.getItem('language')]);

    useEffect(() => {
        if (messages.length > 1) {
            if (messages[messages.length - 1].message.trim() != clientConfig.randomQuestion.trim()) {
                const timeout = setTimeout(() => {
                    if (clientConfig.randomQuestionEnabled) {
                        setMessages((prev) => {
                            return [
                                ...prev,
                                {
                                    source: EMessageSource.BOT,
                                    message: clientConfig.randomQuestion,
                                    type: EMessageType.TEXT,
                                    url: "",
                                },
                            ];
                        });
                    }
                }, 120000)

                return () => clearTimeout(timeout)
            }
        }

    }, [message])

    const handleMessageRegen = async (e: any, message:string) => {
        setLoading(true)

        var res = []
        if (localStorage.getItem("history") != null) { res = JSON.parse(localStorage.getItem("history") || '') }
        var arr = res
        var userQuestion = ""
        // arr=  arr.reverse()
        var index = arr.findIndex((x: { message: string; }) => x.message.toLowerCase().trim() ==message.toLowerCase().trim());
        let i = 0
        if(arr[index -1])
        {
            // userQuestion= arr[index-1].message
            for ( i = index; i >0; i--) {
                
                if(arr[i])
                    if (arr[i].source == "USER") {
                        userQuestion = arr[i].message
                        break
                    }
            }
        }
        else{
            arr.forEach((el: any) => {
            if (el.source == "USER") {
                userQuestion = el.message
            }
        });
       
        }
        // arr.forEach((el: any) => {
        //     if (el.source == "USER") {
        //         userQuestion = el.message
        //     }
        // });
      
        const params = {
            question: userQuestion,
            botId: chatbotId,
            sessionId: sessionId,
            userId: userId,
            language: language,
            filter: clientConfig.chatboxBehaviour,
            chatHistory: localStorage.getItem("history"),
            regen: regen,
            randomQuestion: clientConfig.randomQuestion,
            customPrompt: clientConfig.customPrompt,
            defaultPrompt: clientConfig.defaultPrompt,
            promptSelection:clientConfig.promptSelection
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        };
        try {
            const resJson = await fetch(chatEndpoint, options);
            const response = await resJson.json();
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        source: EMessageSource.BOT,
                        message: response.answer,
                        type:
                            response.type === "image"
                                ? EMessageType.IMAGE
                                : response.type === "video"
                                    ? EMessageType.VIDEO
                                    : EMessageType.TEXT,
                        url: response.url ?? "",
                    },
                ];
            });

            setValue(response.answer)
            setLoading(false);
            setRegen(false)

            let chatbotID
            if ("chatbotId" in props) {
                chatbotID = props.chatbotId
            }
            const currentdate = new Date();
            const datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
            const responseSaveMSG = await fetch(`${WHAT2STUDY_BACKEND_URL}/saveUserMessage`, {
                method: "POST",
                headers: {
                    "X-Parse-Application-Id": WHAT2STUDY_X_PARSE_APP_ID,
                },
                body: JSON.stringify({
                    chatbotId: chatbotID,
                    user: message,
                    bot: response.answer,
                    sessionID: localStorage.getItem(LOCALSTORAGE_SESSION_ID_KEY)?.trim(),
                    timestamp: datetime,
                }),
            });
        } catch (error) {
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        source: EMessageSource.BOT,
                        message: "Something went wrong! Please try again.",
                    },
                ];
            });
            setLoading(false);
        }
    }

    const handleUserMessage = async (e: SyntheticEvent): Promise<void> => {
        setLoading(true);

        if (regen == false) {
            e?.preventDefault();
            setMessage("");
            if (message.trim() === "") return;
        }
        setMessages([...messages, { source: EMessageSource.USER, message }]);
        var filters = clientConfig.chatboxBehaviour
        if (localStorage.getItem("LengthFilter") != undefined) {
            filters.length = Number(localStorage.getItem("LengthFilter"))

        }
        const params = {
            question: message,
            botId: chatbotId,
            sessionId: sessionId,
            userId: userId,
            language: language,
            filter: filters,
            chatHistory: localStorage.getItem("history"),
            regen: regen,
            randomQuestion: clientConfig.randomQuestion,
            customPrompt: clientConfig.customPrompt,
            defaultPrompt: clientConfig.defaultPrompt,
            promptSelection:clientConfig.promptSelection
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        };
        try {
            const resJson = await fetch(chatEndpoint, options);
            const response = await resJson.json();
            var urlsMatch = []
            if (response.answer.indexOf(".mp4") || response.answer.indexOf(".mov") || response.answer.indexOf(".MOV")) {
                var string = response.answer
                var result = string.match(/(http||https)?:\/\/(((?:[a-z0-9\-]+\.)+[a-z]{2,6})||((?:localhost:)+[0-9]{4}))(?:\/[^\/#?]+)+\.(?:jpg|mp4|png|MOV|mov|jpeg)/gi)
                if (result != null) { urlsMatch = result }
            }
            var mediaMessages = [] as IBotMessage[]
            if (urlsMatch.length > 0) {
                urlsMatch.forEach((url: string) => {
                    if (url.endsWith("mp4") || url.endsWith("mov") || url.endsWith("MOV")) {
                        mediaMessages.push({
                            source: EMessageSource.BOT,
                            message: "",
                            type: EMessageType.VIDEO,
                            url: url
                        })
                    }
                    if (url.endsWith("jpg") || url.endsWith("png") || url.endsWith("jpeg")) {
                        mediaMessages.push({
                            source: EMessageSource.BOT,
                            message: "",
                            type: EMessageType.IMAGE,
                            url: url
                        })
                    }
                }

                );
                mediaMessages.push({
                    source: EMessageSource.BOT,
                    message: response.answer,
                    type:
                        response.type === "image"
                            ? EMessageType.IMAGE
                            : response.type === "video"
                                ? EMessageType.VIDEO
                                : EMessageType.TEXT,
                    url: response.url ?? "",
                })
                // var arr = [...messages, ...mediaMessages] as IBotMessage[]
                // console.log(arr)

                // setMessages(arr)
                setMessages((prev) => {
                    return [
                        ...prev,
                        ...mediaMessages
                    ];
                });

            }
            else {
                setMessages((prev) => {
                    return [
                        ...prev,
                        {
                            source: EMessageSource.BOT,
                            message: response.answer,
                            type:
                                response.type === "image"
                                    ? EMessageType.IMAGE
                                    : response.type === "video"
                                        ? EMessageType.VIDEO
                                        : EMessageType.TEXT,
                            url: response.url ?? "",
                        },
                    ];
                });
            }

            setValue(response.answer)
            setLoading(false);
            setRegen(false)
            if (clientConfig.AudioNarration == true && isBotVolumeOn == true) {
                window.speechSynthesis.cancel();
                runAudio(response.answer)
            }

            let chatbotID
            if ("chatbotId" in props) {
                chatbotID = props.chatbotId
            }
            const currentdate = new Date();
            const datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
            const responseSaveMSG = await fetch(`${WHAT2STUDY_BACKEND_URL}/saveUserMessage`, {
                method: "POST",
                headers: {
                    "X-Parse-Application-Id": WHAT2STUDY_X_PARSE_APP_ID,
                },
                body: JSON.stringify({
                    chatbotId: chatbotID,
                    user: message,
                    bot: response.answer,
                    sessionID: localStorage.getItem(LOCALSTORAGE_SESSION_ID_KEY)?.trim(),
                    timestamp: datetime,
                }),
            });
        } catch (error) {
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        source: EMessageSource.BOT,
                        message: t("chaterror"),
                    },
                ];
            });
            setLoading(false);
        }
        
    };

    const handleMessageFeedback = async (msg: string, feedback: boolean) => {
        let i = 0
        const messagesWithFeedback = [...messages];
        const newMessages = messagesWithFeedback.map((msgObj) =>
            msgObj.message == msg
                ? {
                    ...msgObj,
                    feedback,
                }
                : msgObj
        );
        const currentdate = new Date();
        const datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        setMessages(newMessages);
        let chatbotID
        if ("chatbotId" in props) {
            chatbotID = props.chatbotId
        }
        const resJson = await fetch(`${WHAT2STUDY_BACKEND_URL}/saveFeedback`, {
            method: "POST",
            headers: {
                "X-Parse-Application-Id": WHAT2STUDY_X_PARSE_APP_ID,
            },
            body: JSON.stringify({
                chatbotId: chatbotID,
                messages: newMessages,
                sessionID: localStorage.getItem(LOCALSTORAGE_SESSION_ID_KEY)?.trim(),
                timestamp: datetime,
                type: feedback

            }),
        });
        setMessages((prev) => {
            return [
                ...prev,
                {
                    source: EMessageSource.BOT,
                    message: t("panicmessage"),
                    type: EMessageType.TEXT,
                    url: "",
                },
            ];
        });

    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    // if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    //     return null;
    //   }


    const commands = [
        {
            command: "reset",
            callback: () => resetTranscript(),
        },
    ];
    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening,
    } = useSpeechRecognition({ commands });

    useEffect(() => {

        if (browserNotSupp) {
            if (finalTranscript !== "") {

                if (listening) {
                    setMessage(finalTranscript)
                    // setMicInputText(finalTranscript)
                    setMic(false)

                }

            }
            if (interimTranscript != "") {
                // setMicInputText(interimTranscript)
                if (listening) {
                    setMessage(interimTranscript)

                }


            }
        }
    }, [interimTranscript, finalTranscript, listening]);




    useEffect(() => {
        if (browserNotSupp) {
            if (isMicPressed) {
                var lang = "de-DE"
                if (clientConfig.language.toLowerCase().startsWith("e")) {
                    lang = "en-US";
                }

                SpeechRecognition.startListening({
                    continuous: true,
                    language: lang,
                });
            }
            else {
                SpeechRecognition.stopListening()
                resetTranscript()
            }
        }
        if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
            console.log(
                "Your browser does not support speech recognition software! Try Chrome desktop, maybe?",
            );
            setBrowserSupp(false)
        }
        else {
            setBrowserSupp(true)

        }

    }, [isMicPressed])

    function runAudio(answer:string) {

        if (browserNotSupp && messages.length > 0) {
            if(messages[messages.length -1]?.message)
            {
                if(answer=="")
            {
                var value = new SpeechSynthesisUtterance(messages[messages.length -1]?.message);
            }
            else{
                var value = new SpeechSynthesisUtterance(answer);}
            var voices_ = speechSynthesis.getVoices()
            var engVoice: Array<SpeechSynthesisVoice> = []
            var deVoice: Array<SpeechSynthesisVoice> = []
            if (Array.isArray(voices_) && voices_.length > 0) {
                setVoices(voices_)
                engVoice = voices_?.filter(({ lang }) => lang === "en-US")
                deVoice = voices_?.filter(({ lang }) => lang === "de-DE")
                setEnVoices(voices_?.filter(({ lang }) => lang === "en-US"))
                setDeVoices(voices_?.filter(({ lang }) => lang === "de-DE"))
            }
            if (clientConfig.language.toLowerCase().startsWith("e") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("m")) {
                console.log("en male")
                console.log(engVoice[0])

                // value.lang = "en-US";
                value.voice = engVoice[0]

            }
            if (clientConfig.language.toLowerCase().startsWith("e") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("f")) {
                console.log("en female")

                // value.lang = "en-US";
                value.voice = engVoice[30]


            }
            if (clientConfig.language.toLowerCase().startsWith("d") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("m")) {
                console.log("de male")
                // value.lang = "de-DE";
                console.log(deVoice[6])
                value.voice = deVoice[11]


            }
            if (clientConfig.language.toLowerCase().startsWith("d") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("f")) {
                console.log("de female")

                // value.lang = "de-DE";

                console.log(deVoice[11])
                value.voice = deVoice[11]


            }
            // if(clientConfig.defaultSettings.narrator == ""){

            // }

            if (isBotVolumeOn) {
                console.log("volume tried")
                console.log(value)
                window.speechSynthesis.speak(value);
            }
            else {
                console.log("volume stopped")
                window.speechSynthesis.cancel();
                setIsBotVolumeOn(false)
            }
        }
        }
    }

    useEffect(() => {
        
        runAudio("")

    }, [isBotVolumeOn])

    useEffect(() => {
        scrollToBottom();
        localStorage.removeItem("history")
        if (dummyRequest == false) {

            localStorage.setItem("history", JSON.stringify(messages))

            localStorage.setItem("historySession", clientConfig.chatbotId)

        }
        if (dummyRequest && dummyValuesSet == false) {
            var botFirstDummyMessage = ""
            if (localStorage.getItem("language") == "en") {
                botFirstDummyMessage = welcomeMsgEN
            }
            if (localStorage.getItem("language") == "de") {

                botFirstDummyMessage = welcomeMsgDE

            }
            var msgs = [
                {
                    source: EMessageSource.BOT,
                    message: botFirstDummyMessage,
                },
                {
                    source: EMessageSource.USER,
                    message: t("usermsg.1"),
                },
                {
                    source: EMessageSource.BOT,
                    message: t("botmsg.2"),
                },
                {
                    source: EMessageSource.USER,
                    message: t("usermsg.2"),
                },
            ]
            setMessages([])
            setMessages(msgs)
            localStorage.removeItem("history")
            setDummyValueCounter(true)
        }

    }, [messages]);

    const breakMsg = (message: string, source: string) => {

        var msg = message.split('\n').map((str: any) => {
            var result = str.match(/\bhttps:\/\/\S+/gi)
            let theObj
            // str = "<br></br>"+str+""
            if (result != null) {
                var toReplaceURL: any[] = []
                result.forEach((el: any) => {
                    el = el.replace(").", "");
                    el = el.replace("(", "");
                    el = el.replace(")", "");
                    toReplaceURL.push(el)
                });
                if (toReplaceURL.length > 0) {
                    toReplaceURL.forEach(url => {
                        str = str.replace(url, "<a target='_blank' href='" + url + "'/>" + "Link" + "</a>")

                    });
                }
            }
            var result_http = str.match(/\bhttp:\/\/\S+/gi)
            // str = "<br></br>"+str+""
            if (result_http != null) {
                var toReplaceURL: any[] = []

                result_http.forEach((el: any) => {
                    el = el.replace(").", "");
                    el = el.replace("(", "");
                    el = el.replace(")", "");
                    toReplaceURL.push(el)

                });
                if (toReplaceURL.length > 0) {
                    toReplaceURL.forEach(url => {
                        str = str.replace(url, "<a target='_blank' href='" + url + "'/>" + "Link" + "</a>")

                    });
                }
            }
            str = str.replaceAll("*","")

            str = str.replaceAll("[","")

            str = str.replaceAll("]"," ")
            theObj = { __html: str };
            return <div style={
                source === EMessageSource.BOT
                    ? {
                        backgroundColor:
                            textBoxChatbotReply.textBoxChatbotReplyColor,
                        color: textBoxChatbotReply.textBoxChatbotReplyFontColor,
                        fontFamily:
                            textBoxChatbotReply.textBoxChatboxReplyFontStyle,
                    }
                    : {
                        backgroundColor: textBoxUser.textBoxUserColor,
                        color: textBoxUser.textBoxUserFontColor,
                        fontFamily: textBoxUser.textBoxFontStyle,
                    }
            }  dangerouslySetInnerHTML={theObj}/> 
            {/* <Markdown remarkPlugins={[remarkGfm]}>{str}</Markdown></div> */}
            {/* // dangerouslySetInnerHTML={theObj} */}

        }

        );
        return msg

    }

    return (
        <Fragment>
            <div className="info-talktohuman">
                <IconButton
                    className="info-button"
                    style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                    icon={MdInfoOutline}
                    onClick={() => setPopupItem(EPopupItem.BOT_INFO)}
                    aria-label="Info"
                    title="Info"
                    iconColor={UIGroupA.UIGroupAUIHighlight}
                />
                <button
                    className="talk-to-human-btn"
                    style={{
                        backgroundColor: UIGroupB.UIGroupBUIBackground,
                        color: UIGroupB.UIGroupBUIHighlight,
                    }}
                    onClick={() => {
                        localStorage.removeItem("history")
                        if (localStorage.getItem("language") == "en") {
                            setMessages([{ source: EMessageSource.BOT, message: welcomeMsgEN, session: sessionId },])
                        }
                        else {
                            setMessages([{ source: EMessageSource.BOT, message: welcomeMsgDE, session: sessionId },])

                        }
                    }}

                >
                    {t("lang.ClearHistory")}
                </button>

                <button
                    className="talk-to-human-btn"
                    style={{
                        backgroundColor: UIGroupB.UIGroupBUIBackground,
                        color: UIGroupB.UIGroupBUIHighlight,
                    }}
                    onClick={() => setCurrentRoute(ERoute.TALK_TO_HUMAN)}
                >
                    {(clientConfig.langWeiterMain != "" && clientConfig.langWeiterMain!= undefined) ? clientConfig.langWeiterMain : t("lang.lang")}
                </button>
                {browserNotSupp &&

                    <IconButton
                        className="volume-button"
                        icon={isBotVolumeOn ? IoMdVolumeHigh : IoMdVolumeOff}
                        onClick={(e) => {
                            setIsBotVolumeOn(!isBotVolumeOn)

                        }}
                        aria-label="Volume"
                        title={isBotVolumeOn ? "Mute" : "Play"}
                        style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                        iconColor={UIGroupA.UIGroupAUIHighlight}
                    />}
            </div>
            <div className="chatContainer">
                {messages.map(({ message, source, feedback, type, url }: any, index: Key | null | undefined) => (
                    <div
                        key={index}
                        className={`messageWrapper ${source === EMessageSource.BOT
                            ? "botMessageWrapper"
                            : "userMessageWrapper"
                            }`}
                    >
                        {source === EMessageSource.BOT && (
                            <div
                                className="bot-iconWrapper"
                                style={{ borderColor: UIGroupA.UIGroupAUIBackground }}
                            >
                                <img src={chatbotProfileImage} alt="bot" className="bot-iconImg" />
                            </div>
                        )}
                        <div
                            className={`message ${source === EMessageSource.BOT ? "botMessage" : "userMessage"
                                }`}
                            style={
                                source === EMessageSource.BOT
                                    ? {
                                        backgroundColor:
                                            textBoxChatbotReply.textBoxChatbotReplyColor,
                                        color: textBoxChatbotReply.textBoxChatbotReplyFontColor,
                                        fontFamily:
                                            textBoxChatbotReply.textBoxChatboxReplyFontStyle,
                                    }
                                    : {
                                        backgroundColor: textBoxUser.textBoxUserColor,
                                        color: textBoxUser.textBoxUserFontColor,
                                        fontFamily: textBoxUser.textBoxFontStyle,
                                    }
                            }
                        >
                            {type === EMessageType.VIDEO ? (
                                isYoutubeURL(url) ? (
                                    <iframe
                                        src={url}
                                        title="Video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="bot-msg-ytvideo"
                                    />
                                ) : (
                                    <a href={url} target="_blank">
                                        <video
                                            src={url}
                                            className="bot-msg-video"
                                            controls
                                            disablePictureInPicture={false}
                                        />
                                    </a>
                                )
                            ) : type === EMessageType.IMAGE ? (
                                <a href={url} target="_blank">

                                    <img src={url} className="bot-msg-img" alt="img" />
                                </a>
                            ) : (
                                <Fragment />
                            )}
                            {message && breakMsg(message, source)}

                            {message && source === EMessageSource.BOT && message?.toLowerCase().indexOf("rückmeldung") === -1 && message?.toLowerCase().indexOf("welcome") === -1 && message?.toLowerCase().indexOf("willkommen") === -1 && (
                                <div className="bot-msg-actions-wrapper">
                                    {browserNotSupp &&

                                        <IconButton
                                            className="action-button"
                                            icon={IoMdVolumeHigh}
                                            onClick={(e) => {
                                                setTogSound(!toggleSound)
                                                if (browserNotSupp && messages.length > 0) {
                                                    window.speechSynthesis.cancel();
                                                    var value = new SpeechSynthesisUtterance(message);
                                                    var voices_ = speechSynthesis.getVoices()
                                                    var engVoice: Array<SpeechSynthesisVoice> = []
                                                    var deVoice: Array<SpeechSynthesisVoice> = []
                                                    if (Array.isArray(voices_) && voices_.length > 0) {
                                                        setVoices(voices_)
                                                        engVoice = voices_?.filter(({ lang }) => lang === "en-US")
                                                        deVoice = voices_?.filter(({ lang }) => lang === "de-DE")
                                                        setEnVoices(voices_?.filter(({ lang }) => lang === "en-US"))
                                                        setDeVoices(voices_?.filter(({ lang }) => lang === "de-DE"))
                                                    }
                                                    // value.lang = "de-DE";
                                                    // console.log(clientConfig.language)
                                                    // console.log(clientConfig.language.toLowerCase().startsWith("e"))
                                                    // console.log(clientConfig.defaultSettings.narrator.toLowerCase().startsWith("m"))
                                                    // console.log(clientConfig.defaultSettings.narrator)
                                                    console.log(engVoice)
                                                    console.log(deVoice)
                                                    if (clientConfig.language.toLowerCase().startsWith("e") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("m")) {
                                                        console.log("en male")
                                                        console.log(engVoice[0])

                                                        // value.lang = "en-US";
                                                        value.voice = engVoice[0]

                                                    }
                                                    if (clientConfig.language.toLowerCase().startsWith("e") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("f")) {
                                                        console.log("en female")

                                                        // value.lang = "en-US";
                                                        value.voice = engVoice[30]


                                                    }
                                                    if (clientConfig.language.toLowerCase().startsWith("d") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("m")) {
                                                        console.log("de male")
                                                        // value.lang = "de-DE";
                                                        console.log(deVoice[6])
                                                        value.voice = deVoice[11]


                                                    }
                                                    if (clientConfig.language.toLowerCase().startsWith("d") && clientConfig.defaultSettings.narrator.toLowerCase().startsWith("f")) {
                                                        console.log("de female")

                                                        // value.lang = "de-DE";

                                                        console.log(deVoice[11])
                                                        value.voice = deVoice[11]


                                                    }
                                                    // if(clientConfig.defaultSettings.narrator == ""){

                                                    // }
                                                    console.log("my firs toggle")
                                                    console.log(toggleSound)
                                                    if (toggleSound == true) {

                                                        window.speechSynthesis.speak(value);
                                                    }
                                                    else {
                                                        window.speechSynthesis.cancel();
                                                    }

                                                }

                                            }}
                                            aria-label="Volume"
                                            title={isBotVolumeOn ? "Mute" : "Play"}
                                            style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                                            iconColor={UIGroupA.UIGroupAUIHighlight}
                                        />}
                                    {/* <button
                                        title="Report"
                                        className="action-button"
                                        onClick={console.log}
                                        style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                                    >
                                        <MdOutlineWarningAmber
                                            className="action-icon"
                                            color={UIGroupA.UIGroupAUIHighlight}
                                        />
                                    </button> */}
                                    <button
                                        title="Like"
                                        className="action-button"
                                        onClick={() => {
                                            if (feedback === true) return;
                                            handleMessageFeedback(
                                                message,
                                                typeof feedback !== "undefined" ? !feedback : true
                                            );
                                        }}
                                        style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                                    >
                                        {feedback === true ? (
                                            <MdThumbUpAlt
                                                className="action-icon"
                                                color={UIGroupA.UIGroupAUIHighlight}
                                            />
                                        ) : (
                                            <MdOutlineThumbUpOffAlt
                                                className="action-icon"
                                                color={UIGroupA.UIGroupAUIHighlight}
                                            />
                                        )}
                                    </button>
                                    <button
                                        title="Dislike"
                                        className="action-button"
                                        onClick={() => {
                                            if (feedback === false) return;
                                            handleMessageFeedback(
                                                message,
                                                typeof feedback !== "undefined" ? !feedback : false
                                            );
                                        }}
                                        style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                                    >
                                        {feedback === false ? (
                                            <MdThumbDownAlt
                                                className="action-icon"
                                                color={UIGroupA.UIGroupAUIHighlight}
                                            />
                                        ) : (
                                            <MdOutlineThumbDownOffAlt
                                                className="action-icon"
                                                color={UIGroupA.UIGroupAUIHighlight}
                                            />
                                        )}
                                    </button>
                                    <button
                                        title="Regenrate Response"
                                        className="action-button"
                                        onClick={() => {
                                            setRegen(true)
                                            handleMessageRegen("regen", message)
                                        }}
                                        style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                                    >
                                        <MdReplay
                                            className="action-icon"
                                            color={UIGroupA.UIGroupAUIHighlight}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                        {source === EMessageSource.USER && (
                            <div className="user-iconWrapper">
                                <RiUser6Fill className="userIcon" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="messageWrapper botMessageWrapper">
                        <div
                            className="bot-iconWrapper"
                            style={{ borderColor: UIGroupA.UIGroupAUIBackground }}
                        >
                            <img src={chatbotProfileImage} alt="bot" className="bot-iconImg" />
                        </div>
                        <div className="typing-anim-wrapper">
                            <div className="typing-dot-pulse"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="inputFormWrapper" >
                {browserNotSupp &&
                    <IconButton
                        icon={isMicPressed ? BsFillMicFill : BsFillMicMuteFill}
                        onClick={(e) => {
                            setMic(!isMicPressed)
                        }}
                        className="voice-input-button"
                        id="voiceMicButton"
                        key="voiceMicButton"
                        style={{ backgroundColor: UIGroupA.UIGroupAUIBackground }}
                        iconColor={UIGroupA.UIGroupAUIHighlight}
                    />}
                <input
                    className={`inputField ${isInputFocused ? "inputFieldFocused" : ""}`}
                    type="text"
                    value={message}
                    disabled={dummyRequest != true ? false : true}
                    onChange={(e) => {
                        setMessage(e.target.value)
                        setValue("terminate")
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyDown={(e) => {
                        if (e.key == "Enter") {
                            handleUserMessage(e)
                        }
                    }}
                />
                <button
                    // type="submit"
                    className="sendButton"
                    disabled={dummyRequest != true ? false : true}
                    style={{
                        backgroundColor: UIGroupB.UIGroupBUIBackground,
                    }}
                    id="messageSendButton"
                    key="messageSendButton"
                    onClick={handleUserMessage}
                >
                    <IoSend className="buttonIcon" color={UIGroupB.UIGroupBUIHighlight} />
                </button>
            </div>
        </Fragment>
    );
};

export default Main;
