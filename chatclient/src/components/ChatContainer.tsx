import { IframeType } from "constants/types";
import { EPopupItem, ERoute, useData } from "hooks";
import IconButton from "utilities/IconButton";

import { FC, Fragment } from "react";
import { GiGraduateCap } from "react-icons/gi";
import { IoClose, IoSettingsSharp } from "react-icons/io5";
import { LuSettings2 } from "react-icons/lu";

import { IFrame } from "../utilities/IFrame";

import PopupScreen from "./popups/PopupScreen";
import IntroPage from "./screens/IntroPage";
import Main from "./screens/Main";
import TalkToHuman from "./screens/TalkToHuman";
import ChatClient from "./ChatClient";



const ChatContainer: FC = (props) => {
    const getScreenAsPerRoute = (route: ERoute) => {
        switch (route) {
            case ERoute.INTRO:
                return <IntroPage />;
    
            case ERoute.MAIN:
                return <Main {...props}/>;
    
            case ERoute.TALK_TO_HUMAN:
                return <TalkToHuman  {...props}/>;
    
            default:
                return <Fragment />;
        }
    };
    const { isChatOpen, isMobileScreen, setIsChatOpen, setPopupItem, currentRoute, clientConfig } =
        useData();

    const {
        chatbotLook: { chatbotHeader, chatbotBackground },
        chatbotName,
        testRequest
    } = clientConfig;

    return (
        <IFrame
            iframeType={
                isChatOpen ? IframeType.CHAT_CONTAINER_OPEN : IframeType.CHAT_CONTAINER_CLOSED
            }
            testRequest={testRequest}
            windowType= {clientConfig.windowtype}
        >
            <PopupScreen />
            <div
                className="chatContainerWrapper"
                style={{ backgroundColor: chatbotBackground.chatbotBackgroundColor }}
            >
                <div
                    className="header-wrapper"
                    style={{ backgroundColor: chatbotHeader.chatbotHeaderBackgroundColor }}
                >
                    <div className="header">
                        <GiGraduateCap
                            className="header-icon"
                            style={{ color: chatbotHeader.chatbotHeaderIconFontColor }}
                        />
                        <h1
                            className="header-title"
                            style={{ color: chatbotHeader.chatbotHeaderIconFontColor }}
                        >
                            {chatbotName !="" ? chatbotName: "What2Study"}
                        </h1>
                    </div>
                    <div className="settings-wrapper"  style={{fontSize:"auto"}} >
                        <IconButton
                            icon={LuSettings2}
                            onClick={() => setPopupItem(EPopupItem.FILTERS)}
                            aria-label="Filters"
                            title="Filters"
                            iconColor={chatbotHeader.chatbotHeaderIconFontColor}
                        />
                        <IconButton
                            icon={IoSettingsSharp}
                            onClick={() => setPopupItem(EPopupItem.SETTINGS)}
                            aria-label="Settings"
                            title="Settings"
                            iconColor={chatbotHeader.chatbotHeaderIconFontColor}
                        />
                        {isMobileScreen && (
                            <IconButton
                                icon={IoClose}
                                onClick={() => setIsChatOpen(false)}
                                aria-label="Close"
                                title="Close"
                                iconColor={chatbotHeader.chatbotHeaderIconFontColor}
                            />
                        )}
                    </div>
                </div>
                {getScreenAsPerRoute(currentRoute)}
            </div>
        </IFrame>
    );
};

export default ChatContainer;
