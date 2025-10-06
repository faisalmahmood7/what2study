import { FC } from "react";
import { useTranslation } from "react-i18next";


import { PopupContents } from "./PopupScreen";
import { useData } from "hooks";


const PopupItemInfo: FC = () => {
    const [t, i18n] = useTranslation("global");
    const { setCurrentRoute, clientConfig } = useData();
    
    const {
        chatbotProfileImage,
        chatbotLook: { chatbotHeader },
        dummyRequest,
        language,
        nameOfOrg,
        introScreenInfoDE,
        introScreenInfoEN,
        welcomeMsgDE,
        welcomeMsgEN
    } = clientConfig;
    return (
        <PopupContents title={"Informationen zu/m "+clientConfig.chatbotName}className="popup-infobox">
            <ol className="info-text" style={{textAlign:"justify"}}>
                <li> <strong>Automatisierte Interaktion:</strong> {clientConfig.chatbotName} ist ein automatisiertes System und keine reale Person.</li>
                <li> <strong>Entwicklungsprozess:</strong> Viele Personen waren an der Entwicklung beteiligt, und der Chatbot wurde ausgiebig getestet, um die Genauigkeit und Hilfreichkeit der Antworten zu gewährleisten. Dennoch können wir nicht garantieren, dass jede Antwort des Chatbots korrekt ist.</li>
                <li> <strong>Eigene Verantwortung: </strong>Wir empfehlen, insbesondere wichtige Informationen selbst zu überprüfen, bevor Entscheidungen getroffen werden.
</li>
            </ol>
            <br></br>
            <p className="info-text" style={{textAlign:"justify"}}>
            Diese Datenschutzklausel informiert Sie über die Nutzung und Grenzen des Chatbots. Für weitere Informationen zur Datenverarbeitung und Datensicherheit lesen Sie bitte unsere <a href="https://cpstech.de/what2study/datasecurity" target="_blank">{t("introPage2.datenSecurityLink")}</a>.
            </p>
        </PopupContents>
    );
};

export default PopupItemInfo;