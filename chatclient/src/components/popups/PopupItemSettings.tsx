import { EChatLanguage, ERoute, useData } from "hooks";

import { ChangeEvent, FC } from "react";
import { FormSelect } from "react-bootstrap";
import { IoCloseSharp } from "react-icons/io5";

import { PopupContents } from "./PopupScreen";

import { useTranslation } from 'react-i18next';
import ReactCountryFlag from "react-country-flag"


import { EPopupItem } from "hooks";
const getLanguage = (language: EChatLanguage) => {
    switch (language) {
        case EChatLanguage.EN:
            return "🇬🇧";

        case EChatLanguage.DE:
            return <ReactCountryFlag countryCode="DE" />;

        default:
            return <ReactCountryFlag countryCode="DE" />;
    }
};


const PopupItemSettings: FC = () => {
    const { language, setLanguage, setCurrentRoute } = useData();
    const [t, i18n] = useTranslation("global");
    const { setPopupItem } = useData();
    const dummyUserAssumptions = [
        t("settings.userAssumption3")
      ];
    const handleLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as EChatLanguage);
        i18n.changeLanguage(e.target.value.toLowerCase());
        localStorage.setItem("language", e.target.value.toLowerCase())
    };

    return (
        <PopupContents title={t("settings.settings")} className="popup-settings-wrapper">
            <div className="chip-button-wrapper">
                <button className="app-chip-button" 
                  onClick={() => {
                    setCurrentRoute(ERoute.INTRO)
                    setPopupItem(EPopupItem.NONE)
                }}
                >{t("settings.restart")}</button>
            </div>
            <div className="setting-block language-select-wrapper">
                <span className="block-title">{t("settings.language")}</span>
                {/* <button className="app-chip-button" style={{ marginLeft: '10px'}} onClick={() => handleChangeLanguage("en")}> 🇬🇧 EN</button>
                <button className="app-chip-button" onClick={() => handleChangeLanguage("de")}>🇩🇪 DE</button> */}
                <FormSelect
                    value={language}
                    size="sm"
                    className="language-select"
                    onChange={handleLanguage}
                >
                    {Object.values(EChatLanguage).map((lang) => (
                        <option value={lang}>{getLanguage(lang)}</option>
                    ))}
                </FormSelect>
            </div>
            {/* <div className="setting-block user-assumptions">
                <span className="block-title">{t("settings.user")}</span>
                <div className="chips-wrapper">
                    {dummyUserAssumptions.map((assumption) => {
                        return (
                            <span className="app-chip-with-close-btn">
                                {assumption}
                                <button className="close-btn">
                                    <IoCloseSharp className="close-icon" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            </div> */}
        </PopupContents>
    );
};

export default PopupItemSettings;
