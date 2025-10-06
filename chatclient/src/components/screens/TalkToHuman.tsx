import { backendFunctions } from "constants/domainName";
import { ERoute, useData } from "hooks";

import { FC, Fragment, useState } from "react";
import { FloatingLabel, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { IoIosCall } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface IDayTime {
    day: string;
    time: string;
}

export const LOCALSTORAGE_SESSION_ID_KEY = "what2studyUserSessionId";

const TalkToHuman:FC = (props) => {

    const [useSavedEmail, setUseSavedEmail] = useState<boolean>(true);

    const [userDescription, setDescription] = useState<string>("");

    const [userEmail, setUserEmail] = useState<string>("");

    const [userMat, setUserMat] = useState<string>("");

    const [userPhone, setUserPhone] = useState<string>("");
    const WHAT2STUDY_X_PARSE_APP_ID = "what2study";
    const WHAT2STUDY_BACKEND_URL = backendFunctions;
    const [preferredDayTime, setPreferredDayTime] = useState<IDayTime>({
        day: "Sat",
        time: "09:00",
    });
    const {
        setPopupItem,
        isBotVolumeOn,
        setIsBotVolumeOn,
        setCurrentRoute,
        clientConfig,
        sessionId,
        language
    } = useData();
    const [t, i18n] = useTranslation("global");
    return (
        <div className="talkToHuman-wrapper">
            <div className="navbar">
                <button className="navBackBtn" onClick={() => setCurrentRoute(ERoute.MAIN)}>
                    <IoChevronBack className="navIcon" />
                    <span className="navText">{t("talk2human.back")}</span>
                </button>
            </div>
            {/* <div className="divider"></div> */}
            <div className="contact-details-wrapper">
                <a className="contact-detail" >
                    <div className="contact-icon-wrapper">
                        <IoIosCall className="contact-icon" />
                    </div>
                    <span className="contact-text">{clientConfig.phone}</span>
                </a>
                <a
                    target="_blank"
                    className="contact-detail contact-email"
                    href="mailto:registration@uni-siegen.de"
                >
                    <div className="contact-icon-wrapper">
                        <MdEmail className="contact-icon" />
                    </div>
                    <span className="contact-text">{clientConfig.email}</span>
                </a>
            </div>
            <div className="divider"></div>
            <div className="tth-data-wrapper">
                <p className="tth-info-text">
                {clientConfig.nameOfOrg} {t("talk2human.write")}
                </p>
               
                    <Form.Control
                        as="textarea"
                        // placeholder={t("talk2human.message")}
                        placeholder={clientConfig.talkToaHumanEnabled ? clientConfig.talkToaHuman :"" }
                        style={{ height: "170px" }}
                        onChange={(e) => setDescription(e.target.value)}
                       

                    />
                <Form.Check
                    name="send-chat-details"
                    aria-label="Send chat details"
                    label={t("talk2human.send")}
                    defaultChecked
                />
                { clientConfig.matriculationNumber ? <div className="contact-email">
                    <p className="tth-info-text">
                    {t("talk2human.matriculation")}
                    </p>
                    <Form.Control
                        type="text"
                        placeholder={t("talk2human.matPlaceholder")}
                        // disabled={useSavedEmail}
                        onChange={(e) => setUserMat(e.target.value)}
                    />
                </div> : <></>}
                <div className="contact-email">
                    <p className="tth-info-text">
                    {t("talk2human.please")}
                    </p>
                    {/* <Form.Check
                        type="radio"
                        name="email-address"
                        checked={useSavedEmail}
                        onClick={() => setUseSavedEmail(true)}
                        label={
                            <Fragment>
                                {t("talk2human.use")}{" "}
                                <span className="email-address-saved">
                                 nicht vorgesehen
                                </span>
                            </Fragment>
                        }
                    />
                    <Form.Check
                        type="radio"
                        name="email-address"
                        checked={!useSavedEmail}
                        onClick={() => setUseSavedEmail(false)}
                        label={t("talk2human.different")}
                    /> */}
                    <Form.Control
                        type="text"
                        placeholder={t("talk2human.email")}
                        // disabled={useSavedEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                    />
                </div>
                <div className="contact-email">
                    <p className="tth-info-text">{t("talk2human.would")}</p>
                    <Form.Control
                        type="tel"
                        onChange={(e) => setUserPhone(e.target.value)}
                        value={userPhone}
                        placeholder={t("talk2human.number")}
                    />
                    {userPhone.trim() !== "" && (
                        <div className="day-time-input-wrapper">
                            <p className="tth-info-text">{t("talk2human.best")}</p>
                            <div className="day-wrapper">
                                {DAYS.map((day) => (
                                    <span
                                        className={`day-select ${
                                            preferredDayTime.day === day ? "day-selected" : ""
                                        }`}
                                        onClick={() =>
                                            setPreferredDayTime({ ...preferredDayTime, day })
                                        }
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>
                            <Form.Control
                                type="time"
                                value={preferredDayTime.time}
                                onChange={(e) =>
                                    setPreferredDayTime({
                                        ...preferredDayTime,
                                        time: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}
                </div>
                <div className="chip-button-wrapper" style={{height:"100px",  alignContent: "center"}}>
                    {clientConfig.orgImage ? <img src={clientConfig.orgImage} style={{ width:"110px"}}></img>: <img src={clientConfig.orgImage} style={{ width:"110px", visibility:"hidden"}}></img>}
                <button style={{ position:"absolute", marginTop:"9%", right:"0"}} className="app-chip-button" 
                 onClick={() =>{
                    const currentdate = new Date();
                    const datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " @ "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                        var res 
                        if (localStorage.getItem("history") != null) { res = JSON.parse(localStorage.getItem("history") || '') }

                        let chatbotID
                        if ("chatbotId" in props) {
                            chatbotID = props.chatbotId
                        }
                    fetch(`${WHAT2STUDY_BACKEND_URL}/sendEmailT`, {
                        method: "POST",
                        headers: {
                            "X-Parse-Application-Id": WHAT2STUDY_X_PARSE_APP_ID,
                        },
                        body: JSON.stringify({
                            chatbotId: chatbotID,
                            chat: JSON.stringify(res),
                            sessionID: localStorage.getItem(LOCALSTORAGE_SESSION_ID_KEY)?.trim(),
                            timestamp: datetime,
                            description: userDescription,
                            userEmail:userEmail,
                            userPhone:userPhone,
                            uniEmail: clientConfig.email,
                            userMat:  userMat
                        }),
                    });
                }
                }
                >{t("talk2human.submit")}</button>
            </div>
            </div>
        </div>
    );
};

export default TalkToHuman;