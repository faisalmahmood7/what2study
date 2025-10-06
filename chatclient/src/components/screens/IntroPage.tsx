import { ERoute, useData } from "hooks";
import IconButton from "utilities/IconButton";

import { FC, Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsFillPlayCircleFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { config } from "process";

const IntroPage: FC = () => {
    const { setCurrentRoute, clientConfig } = useData();
    const [introPage, setIntroPage] = useState(0);
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const {
        chatbotProfileImage,
        chatbotLook: { chatbotHeader },
        dummyRequest,
        language,
        introScreenInfoDE,
        introScreenInfoEN,
        welcomeMsgDE,
        welcomeMsgEN
    } = clientConfig;

    const [t, i18n] = useTranslation("global");

    const [langSelection, setLangSelection] = useState(language.toLocaleLowerCase());

    function paragraphsWelcomeElements() {
        var numberOfLineBreaks = (welcomeMsgDE.match(/\n/g) || []).length;
        var messageType = welcomeMsgEN
        if (language.toLocaleLowerCase().startsWith("de")) {
            messageType = welcomeMsgDE
        }
        let filtered = messageType.split("\n").filter(function (el) { return el != ""; });
        return (<div>
            {filtered.map((store) => (
                <div className="is-infoBlock2">
                    <p className="is-block-text" style={{ width: "320px", wordWrap: "break-word" }}>
                        {/* {t("introPage2.everything")} */}
                        {store}

                    </p>
                </div>
            ))
            } 
             <div className="is-infoBlock2">
                            <p className="is-block-text" style={{ width: "320px", wordWrap: "break-word" }}>
                                {t("introPage2.datenSecutiry")}
                            </p>
                            <span><a href="https://cpstech.de/what2study/datasecurity" target="_blank">{t("introPage2.datenSecurityLink")}</a></span>
                        </div>
            </div>)
    }

    useEffect((
        
        )=>{
        
            if(localStorage.getItem('language')!=null && localStorage.getItem('language')!=undefined)
            {
                var lang = localStorage.getItem('language')
                if(lang !=null)
                setLangSelection(lang)
            
            }
        
        },[localStorage.getItem('language')])

    useEffect(() => {
        if (dummyRequest) {
            setIntroPage(introPage + 1)
            setCurrentRoute(ERoute.MAIN)
        }
    }, [])

    return (
        <Fragment>
            <div className="introScreen-wrapper">
                {isVideoOpen && clientConfig.introVideo!="" && (
                    <div className="video-wrapper">
                        <IconButton icon={MdCancel} onClick={() => setIsVideoOpen(false)} />
                        <iframe
                            width="100%"
                            height="90%"
                            src={clientConfig.introVideo}
                            title="Intro Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
                {introPage == 0 && (
                    <div className="is-contentWrapper" style={{ height: "85%" }}>
                        <img src={chatbotProfileImage} className="is-icon" alt="Bot Icon" />
                        <div className="is-infoBlock">
                            <p className="is-block-text" style={{ maxHeight: "200px", overflowY: "auto",  padding:"15px", scrollbarWidth:"thin",wordWrap: "break-word" }}>
                                {/* {t("introPage1.hello")}{" "} */}
                                {langSelection.startsWith("d") ? introScreenInfoDE : introScreenInfoEN}
                                {/* <span className="is-block-bold">{t("introPage1.iam")}</span>{t("introPage1.built")} */}
                            </p>
                        </div>
                        { clientConfig.introVideo!="" &&
                        <button
                            className="play-tutorial-button"
                            onClick={() => setIsVideoOpen(true)}
                        >
                            <div className="pt-iconWrapper">
                                <BsFillPlayCircleFill className="pt-icon" />
                            </div>
                            <span className="pt-button-name">{t("introPage1.play")}</span>
                        </button> 
                        }
                        <button className="is-tochat-button" onClick={() => setCurrentRoute(ERoute.MAIN)}>{t("introPage1.chat")} </button>
                    </div>
                )}
                {/* {introPage == 1 && (
                    <div className="is-contentWrapper" style={{ height: "85%" }}>
                        <img src={chatbotProfileImage} className="is-icon" alt="Bot Icon" />
                        <div style={{ minHeight: "-webkit-fill-available", overflowY: "auto", padding:"15px" }}>
                            {paragraphsWelcomeElements()}</div>
                       
                    </div>
                )}
                 */}

                {introPage == 1 && (
                    <div className="is-contentWrapper">
                        <img src={chatbotProfileImage} className="is-icon" alt="Bot Icon" />
                        <div style={{ minHeight: "-webkit-fill-available", overflowY: "auto", padding:"15px" }}>
                        <div className="is-infoBlock2">
                        <p className="is-block-text" style={{ width: "320px", wordWrap: "break-word" }}>
                            {t("introPage2.Lets")}
                            </p>
                        </div>
                        <div className="is-infoBlock2">
                            <p className="is-block-text" style={{ width: "320px", wordWrap: "break-word" }}>
                            {t("introPage2.everything1")}
                            </p>
                        </div>
                        <div className="is-infoBlock2">
                            <p className="is-block-text" style={{ width: "320px", wordWrap: "break-word" }}>
                            {t("introPage2.everything2")}
                            </p>
                        </div>
                        <div className="is-infoBlock2">
                            <p className="is-block-text" style={{ width: "320px", wordWrap: "break-word" }}>
                                {t("introPage2.datenSecutiry")}


                            </p>
                            <span><a href="https://cpstech.de/what2study/datasecurity" target="_blank">{t("introPage2.datenSecurityLink")}</a></span>
                        </div>
                        </div>
                        {/* <button className="is-tochat-button">To Chat</button> */}
                    </div>
                )}
                <button
                    className="is-okayNextButton"
                    onClick={() =>
                        introPage < 1 ? setIntroPage(introPage + 1) : setCurrentRoute(ERoute.MAIN)
                    }
                    style={{
                        backgroundColor: chatbotHeader.chatbotHeaderBackgroundColor,
                        color: chatbotHeader.chatbotHeaderIconFontColor,
                    }}
                >
                    {t("introPage1.okay")}
                </button>
            </div>
        </Fragment>
    );
};

export default IntroPage;