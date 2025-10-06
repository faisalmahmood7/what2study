import { LOCALSTORAGE_SESSION_ID_KEY } from "App";
import ChatClient from "components/ChatClient";
import {
    EThemes,
    IClientConfigurations,
    IConfigChatbotBehaviour,
    IConfigChatbotContact,
    IConfigChatbotLook,
    IConfigChatbotReplies,
    IConfigDefaultSettings,
    ISubConfigLookBackground,
    ISubConfigLookBotTextBox,
    ISubConfigLookHeader,
    ISubConfigLookUIGroupA,
    ISubConfigLookUIGroupB,
    ISubConfigLookUserTextBox,
    IUseData,
} from "constants/types";

import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const DataContext = createContext({});

interface DataProviderProps {
    children: ReactNode;
}

export enum EChatDifficultyLevel {
    CREATIVE = "CREATIVE",
    BALANCED = "BALANCED",
    PRECISE = "PRECISE",
}

export enum EPopupItem {
    SETTINGS = "SETTINGS",
    FILTERS = "FILTERS",
    BOT_INFO = "BOT_INFO",
    NONE = "NONE",
}

export enum ERoute {
    INTRO = "INTRO",
    MAIN = "MAIN",
    TALK_TO_HUMAN = "TALK_TO_HUMAN",
}

export interface IChatFilters {
    tone: number;
    sentiment: number;
    length: number;
    emotiveness: number;
}

export enum EChatLanguage {
    EN = "en",
    DE = "de",
}

const AVAILABLE_FONTS = ["inter", "roboto", "poppins", "tinos", "fira sans condensed", "arimo", "ibm plex sans", "open sans"];

const getFont = (font: string): string => {
    if (AVAILABLE_FONTS.includes(font?.toLowerCase())) return font;
    return "inter";
};

const defaultClientConfig = {
    objectId: "U5xHMAMerU",
    userId: "",
    universityId: "U5xHMAMerU",
    chatbotName: "What 2 Study",
    language: "de",
    chatbotId: "",
    orgImage: "",
    randomQuestionEnabled: true,
    randomQuestion: "Unsicher, welche Fragen man mir stellen kann? Frag mich doch zu:\n\nWelche Studiengänge bietet die Universität an?\nWie lauten die Zulassungsvoraussetzungen für den Studiengang XYZ?\nWie bewerbe ich mich für ein Studium?",
    talkToaHumanEnabled: true,
    customPrompt: "",
    defaultPrompt:"",
    promptSelection:false,
    talkToaHuman: "",
    Narrator: "male",
    AudioNarration:false,
    dummyRequest: false,
    testRequest: false,
    introVideo: "",
    phone: "",
    email: "",
    langWeiterMain: "",
    windowtype:"min",
    nameOfOrg: "",
    accessToken: "",
    welcomeMsgDE: 'Hallo, ich bin ein Chatbot der dir bei deinem Studium helfen soll! Bevor wir loslegen, ein paar wichtige Fakten.',
    welcomeMsgEN: "Hello. It's nice to meet you! I am a chatbot built to help you with your studies! Before we get started, here are a few important facts.",
    introScreenInfoDE: 'Geben Sie die erste Nachricht ein, die vom Chatbot angezeigt werden soll',
    introScreenInfoEN: 'Welcome to the Student Advisory Service! How can I help you today?',
    matriculationNumber: true,
    chatbotBubbleIcons: "https://i.ibb.co/w007JNQ/default-bubble-icon.png",
    chatbotProfileImage: "https://i.ibb.co/xSJZqy2/default-profile-icon.png",
    defaultSettings: {
        chatbotLanguage: "English",
        audioNarration: true,
        narrator: "male",
    } as IConfigDefaultSettings,
    chatboxBehaviour: {
        formality: 0,
        opinion: 0,
        emotion: 0,
        length: 0,
        topics: 0,
        tone: 0,
        chatbotBehaviourName: "",
    } as IConfigChatbotBehaviour,
    chatbotReplies: {
        randomQuestions: true,
        showRandomQuestionsMessage: "",
    } as IConfigChatbotReplies,
    chatbotContact: {
        talkToHuman: true,
        showTalkToHumanMessage: "Connecting to a human...",
    } as IConfigChatbotContact,
    chatbotLook: {
        chatbotHeader: {
            chatbotHeaderBackgroundColor: "#0c8de9",
            chatbotHeaderIconFontColor: "#ffffff",
        } as ISubConfigLookHeader,
        chatbotBackground: {
            chatbotBackgroundColor: "#ffffff",
        } as ISubConfigLookBackground,
        textBoxUser: {
            textBoxUserColor: "#0c8de9",
            textBoxUserFontColor: "#ffffff",
            textBoxFontStyle: "inter",
        } as ISubConfigLookUserTextBox,
        textBoxChatbotReply: {
            textBoxChatbotReplyColor: "#e0e0e0",
            textBoxChatbotReplyFontColor: "#000000",
            textBoxChatboxReplyFontStyle: "inter",
        } as ISubConfigLookBotTextBox,
        UIGroupA: {
            UIGroupAUIBackground: "rgb(100, 100, 100)",
            UIGroupAUIHighlight: "rgb(200, 200, 200)",
        } as ISubConfigLookUIGroupA,
        UIGroupB: {
            UIGroupBUIBackground: "rgb(50, 50, 50)",
            UIGroupBUIHighlight: "rgb(150, 150, 150)",
        } as ISubConfigLookUIGroupB,
        chatbotLookName: "",
    } as IConfigChatbotLook,
} as IClientConfigurations;

const doesImageExists = async (url: string): Promise<boolean> => {
    if (url.length > 1) {
        return true
    }
    else {
        return false
    }
    // try {
    //     const res = await fetch(url, {
    //         method: "POST",
    //     });
    //     // no image exists if response is 1xx, 4xx, 5xx
    //     if ([1, 4, 5].includes(Math.floor((res.status / 100) % 10))) {
    //         return false;
    //     }
    //     return true;
    // } catch (error) {
    //     return false;
    // }
};

export const DataProvider: FC<DataProviderProps> = (props) => {
    const { children } = props;

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false); // COMMITODO: false
    const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>("");
    const [currentTheme, setCurrentTheme] = useState<EThemes>(EThemes.LIGHT_THEME_1);
    const [popupItem, setPopupItem] = useState<EPopupItem>(EPopupItem.NONE);
    const [isBotVolumeOn, setIsBotVolumeOn] = useState<boolean>(true);
    const [currentRoute, setCurrentRoute] = useState<ERoute>(ERoute.INTRO); // COMMITODO .MAIN (TD INTRO)
    const [chatFilters, setChatFilters] = useState<IChatFilters>({
        tone: 0.1,
        sentiment: 1,
        emotiveness: 0.7,
        length: 0.4,
    });
    const [language, setLanguage] = useState<EChatLanguage>(EChatLanguage.DE);

    const [welcomeMsgDE, setwelcomeMsgDE] = useState<string>("");

    const [welcomeMsgEN, setwelcomeMsgEN] = useState<string>("");
    const [clientConfig, setClientConfig] = useState<IClientConfigurations>(); // config saved by the university in main app
    const [isClientConfigFetched, setIsClientConfigFetched] = useState<boolean>(false);

    const generateNewSession = (showIntroScreen = true) => {
        const newSessionId = uuidv4();
        localStorage.setItem(LOCALSTORAGE_SESSION_ID_KEY, newSessionId);
        setSessionId(newSessionId);
        setCurrentRoute(showIntroScreen ? ERoute.INTRO : ERoute.MAIN);
    };

    const createOrRehydrateSession = async () => {
        const existingSessionId = localStorage.getItem(LOCALSTORAGE_SESSION_ID_KEY)?.trim();
        if (!existingSessionId) {
            generateNewSession(true);
            return;
        }
        // TODO: validate [existingSessionId] and get previous session data from backend
        const isSessionValid = true; // data from api call
        if (isSessionValid) {
            setSessionId(existingSessionId);
            return;
        }
        generateNewSession(false);
    };

    const saveClientConfigurations = async (data: any = {}) => {
        setLanguage(data.language)
        setwelcomeMsgDE(data.welcomeMsgDE)
        setwelcomeMsgEN(data.welcomeMsgEN)
      
        const {
            objectId,
            chatbotId,
            userId,
            universityId,
            accessToken,
            chatbotName,
            windowtype,
            chatbotBubbleIcons,
            chatbotProfileImage,
            defaultSettings,
            chatboxBehaviour,
            chatbotReplies,
            chatbotContact,
            language,
            randomQuestionEnabled,
            randomQuestion,
            customPrompt,
            defaultPrompt,
            promptSelection,
            talkToaHumanEnabled,
            talkToaHuman,
            dummyRequest,
            Narrator,
            testRequest,
            chatbotLook = {},
            email,
            phone,
            nameOfOrg,
            matriculationNumber,
            orgImage,
            welcomeMsgDE,
            welcomeMsgEN,
            introScreenInfoDE,
            introScreenInfoEN,
            introVideo,
            langWeiterMain,
            AudioNarration

        } = data;

        const {
            chatbotLook: {
                chatbotHeader: dChatbotHeader,
                chatbotBackground: dChatbotBackground,
                textBoxUser: dTextBoxUser,
                textBoxChatbotReply: dTextBoxChatbotReply,
                UIGroupA: dUIGroupA,
                UIGroupB: dUIGroupB,
                chatbotLookName: dChatbotLookName,
            },
        } = defaultClientConfig; // destructure default values for easy assignment below

        const {
            chatbotHeader,
            chatbotBackground,
            textBoxUser,
            textBoxChatbotReply,
            UIGroupA,
            UIGroupB,
            chatbotLookName,
        } = chatbotLook;

        const config = {
            objectId: objectId || defaultClientConfig.objectId,
            chatbotId: chatbotId || defaultClientConfig.chatbotId,
            userId: userId || defaultClientConfig.userId,
            accessToken: accessToken || defaultClientConfig.accessToken,
            windowtype: windowtype || defaultClientConfig.windowtype,
            universityId: universityId || defaultClientConfig.universityId,
            chatbotName: chatbotName || defaultClientConfig.chatbotName,
            dummyRequest: dummyRequest || defaultClientConfig.dummyRequest,
            testRequest: testRequest || defaultClientConfig.testRequest,
            language: language || defaultClientConfig.language,
            randomQuestionEnabled: randomQuestionEnabled,
            customPrompt: customPrompt,
            defaultPrompt:defaultPrompt,
            promptSelection:promptSelection || defaultClientConfig.promptSelection,
            introVideo: introVideo,
            langWeiterMain: langWeiterMain,
            AudioNarration:AudioNarration|| defaultClientConfig.AudioNarration,
            welcomeMsgDE: welcomeMsgDE,
            welcomeMsgEN: welcomeMsgEN,
            introScreenInfoDE: introScreenInfoDE,
            introScreenInfoEN: introScreenInfoEN,
            matriculationNumber: matriculationNumber,
            randomQuestion: randomQuestion || defaultClientConfig.randomQuestion,
            talkToaHumanEnabled: talkToaHumanEnabled,
            talkToaHuman: talkToaHuman || defaultClientConfig.talkToaHuman,
            email: email || defaultClientConfig.email,
            orgImage: orgImage,
            phone: phone || defaultClientConfig.phone,
            nameOfOrg: nameOfOrg || defaultClientConfig.nameOfOrg,

            Narrator: Narrator || defaultClientConfig.Narrator,
            chatbotBubbleIcons:
                typeof chatbotBubbleIcons == "string"
                    ? (await doesImageExists(chatbotBubbleIcons))
                        ? chatbotBubbleIcons
                        : defaultClientConfig.chatbotBubbleIcons
                    : defaultClientConfig.chatbotBubbleIcons,
            chatbotProfileImage:
                typeof chatbotProfileImage == "string"
                    ? (await doesImageExists(chatbotProfileImage))
                        ? chatbotProfileImage
                        : defaultClientConfig.chatbotProfileImage
                    : defaultClientConfig.chatbotProfileImage,
            defaultSettings: {
                chatbotLanguage:
                    defaultSettings?.chatbotLanguage ||
                    defaultClientConfig.defaultSettings.chatbotLanguage,
                audioNarration:
                    defaultSettings?.audioNarration ||
                    defaultClientConfig.defaultSettings.audioNarration,
                narrator: defaultSettings?.narrator || defaultClientConfig.defaultSettings.narrator,
            } as IConfigDefaultSettings,
            chatboxBehaviour: {
                formality:
                    chatboxBehaviour?.formality,
                opinion: chatboxBehaviour?.opinion,
                emotion: chatboxBehaviour?.emotion,
                length: chatboxBehaviour?.length,
                topics: chatboxBehaviour?.topics,
                tone: chatboxBehaviour?.tone,
                chatbotBehaviourName:
                    chatboxBehaviour?.chatbotBehaviourName ||
                    defaultClientConfig.chatboxBehaviour.chatbotBehaviourName,
            } as IConfigChatbotBehaviour,
            chatbotReplies: {
                randomQuestions:
                    chatbotReplies?.randomQuestions ||
                    defaultClientConfig.chatbotReplies.randomQuestions,
                showRandomQuestionsMessage:
                    chatbotReplies?.showRandomQuestionsMessage ||
                    defaultClientConfig.chatbotReplies.showRandomQuestionsMessage,
            } as IConfigChatbotReplies,
            chatbotContact: {
                talkToHuman:
                    chatbotContact?.talkToHuman || defaultClientConfig.chatbotContact.talkToHuman,
                showTalkToHumanMessage:
                    chatbotContact?.showTalkToHumanMessage ||
                    defaultClientConfig.chatbotContact.showTalkToHumanMessage,
            } as IConfigChatbotContact,
            chatbotLook: {
                chatbotHeader: {
                    chatbotHeaderBackgroundColor:
                        chatbotHeader?.chatbotHeaderBackgroundColor ||
                        dChatbotHeader.chatbotHeaderBackgroundColor,
                    chatbotHeaderIconFontColor:
                        chatbotHeader?.chatbotHeaderIconFontColor ||
                        dChatbotHeader.chatbotHeaderIconFontColor,
                } as ISubConfigLookHeader,
                chatbotBackground: {
                    chatbotBackgroundColor:
                        chatbotBackground?.chatbotBackgroundColor ||
                        dChatbotBackground?.chatbotBackgroundColor,
                } as ISubConfigLookBackground,
                textBoxUser: {
                    textBoxUserColor:
                        textBoxUser?.textBoxUserColor || dTextBoxUser.textBoxUserColor,
                    textBoxUserFontColor:
                        textBoxUser?.textBoxUserFontColor || dTextBoxUser.textBoxUserFontColor,
                    textBoxFontStyle: getFont(
                        textBoxUser?.textBoxFontStyle || dTextBoxUser.textBoxFontStyle
                    ),
                } as ISubConfigLookUserTextBox,
                textBoxChatbotReply: {
                    textBoxChatbotReplyColor:
                        textBoxChatbotReply?.textBoxChatbotReplyColor ||
                        dTextBoxChatbotReply.textBoxChatbotReplyColor,
                    textBoxChatbotReplyFontColor:
                        textBoxChatbotReply?.textBoxChatbotReplyFontColor ||
                        dTextBoxChatbotReply.textBoxChatbotReplyFontColor,
                    textBoxChatboxReplyFontStyle: getFont(
                        textBoxChatbotReply?.textBoxChatboxReplyFontStyle ||
                        dTextBoxChatbotReply.textBoxChatboxReplyFontStyle
                    ),
                } as ISubConfigLookBotTextBox,
                UIGroupA: {
                    UIGroupAUIBackground:
                        UIGroupA?.UIGroupAUIBackground || dUIGroupA.UIGroupAUIBackground,
                    UIGroupAUIHighlight:
                        UIGroupA?.UIGroupAUIHighlight || dUIGroupA.UIGroupAUIHighlight,
                } as ISubConfigLookUIGroupA,
                UIGroupB: {
                    UIGroupBUIBackground:
                        UIGroupB?.UIGroupBUIBackground || dUIGroupB.UIGroupBUIBackground,
                    UIGroupBUIHighlight:
                        UIGroupB?.UIGroupBUIHighlight || dUIGroupB.UIGroupBUIHighlight,
                } as ISubConfigLookUIGroupB,
                chatbotLookName: chatbotLookName || dChatbotLookName,
            } as IConfigChatbotLook,
        } as IClientConfigurations;

        setClientConfig(config);
        setIsClientConfigFetched(true);
    };

    const providerValue: IUseData = {
        sessionId,
        setSessionId,
        isChatOpen,
        setIsChatOpen,
        isMobileScreen,
        setIsMobileScreen,
        currentTheme,
        setCurrentTheme,
        popupItem,
        setPopupItem,
        isBotVolumeOn,
        setIsBotVolumeOn,
        currentRoute,
        setCurrentRoute,
        chatFilters,
        setChatFilters,
        language,
        setLanguage,
        welcomeMsgDE,
        setwelcomeMsgDE,
        welcomeMsgEN,
        setwelcomeMsgEN,
        clientConfig: clientConfig ?? defaultClientConfig,
        isClientConfigFetched,
        saveClientConfigurations,
    };

    // On chat client init
    useEffect(() => {
        createOrRehydrateSession();
    }, []);

    return <DataContext.Provider value={providerValue}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext) as IUseData;
