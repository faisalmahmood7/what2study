import { useData } from "hooks";

import { ChangeEvent, FC, useEffect, useState } from "react";
import FormRange from "react-bootstrap/esm/FormRange";
import { useTranslation } from "react-i18next";

import { PopupContents } from "./PopupScreen";
import { Row, Slider } from "antd";
import { SliderMarks } from "antd/es/slider";


const PopupItemFilters: FC = () => {
    const { clientConfig } = useData();
    const handleFilterValue = (e: { target: { value: string; }; }) => {
        localStorage.setItem("LengthFilter", e.target.value)
        setLF(Number(e.target.value))
        // setChatFilters({
        //     ...chatFilters,
        //     [e.target.name]: e.target.value,
        // });
    };
    const [lf, setLF] = useState<number>()

    const [lfValue, setLFValue] = useState<string>("")
    useEffect(() => {
        if (localStorage.getItem("LengthFilter")) {
            setLF(Number(localStorage.getItem("LengthFilter")))
        }
        else {
            setLF(clientConfig.chatboxBehaviour.length)
        }
    }, [])
    useEffect(() => {
        if (lf) { 
            setLFValue(getValue(lf)) }
            
    }, [lf])
    const [t, i18n] = useTranslation("global");
    const marks: SliderMarks = {
        // 0: '0',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        // 6: {
        //   style: {
        //     color: '#f50',
        //   },
        //   label: <strong>100°C</strong>,
        // },
    };
    const getValue = (lf: number) => {
        {
            const filter_FF: any = [{ 1: "very informal", 2: "informal", 3: "business casual ", 4: "casual professional", 5: "professional", 6: "very professional/formal" },
            { 1: "You do not have an own opinion. Be neutral and do not judge in anyway", 2: "You do not have an own opinion. Be neutral", 3: "Be neutral", 4: "feel free to have an own opinion, but be neutral", 5: "feel free to have an own opinion and maybe judge (politely)", 6: "feel free to have an own opinion and judge as you want" },

            { 1: "no emojies", 2: "none or sometimes one emoji", 3: "sometimes one or two emojies", 4: "one or two emojies", 5: "some emojies", 6: "a lot of emojies" },
            { 1: "very short", 2: "short", 3: "variable, but if doubt rather short", 4: "variable, but if doubt rather detailed", 5: "detailed", 6: "very detailed" },
            { 1: "sehr kurz", 2: "kurz", 3: "eher kurz", 4: "eher lang/detailliert", 5: "lang/detailliert", 6: "sehr lang/detailliert" },
            { 1: "very much on the specific subject of the asked question", 2: "on the specific subject of the asked question", 3: "maybe sometimes with an additional related information", 4: "sometimes with a few related information, tips or questions", 5: "with some related additional information, tips or questions", 6: "with a lot of related additional information, tips or questions" },
            { 1: "very funny", 2: "mostly funny", 3: "casually humorous", 4: "neutral", 5: "mildly serious", 6: "very serious" }]

            var Applicationlang = localStorage.getItem("language")
           
            if (lf == 0) {
                if (Applicationlang?.trim().startsWith("de")) {
           

                    return filter_FF[4][1]
                }
                else {
           

                    return filter_FF[3][1]

                }
            }
            else {
                if (Applicationlang?.trim().startsWith("de")) {
                  
                    return filter_FF[4][lf]
                }
                else {
                  
                    return filter_FF[3][lf]

                }
            }

        }
    }

    return (
        <PopupContents title={t("filters.personality")} className="popup-contents-filters">
            <div className="filters-wrapper">
                {/* <div className="filter">
                    <div className="slider-filter-datalist">
                        <span className="slider-option">{t("filters.friendly")}</span>
                        <span className="slider-option">{t("filters.professional")}</span>
                    </div>
                    <FormRange
                        name="tone"
                        value={chatFilters.tone}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={handleFilterValue}
                        className="form-range"
                    ></FormRange>
                </div> */}
                {/* <div className="filter">
                    <div className="slider-filter-datalist">
                        <span className="slider-option">{t("filters.opinionated")}</span>
                        <span className="slider-option">{t("filters.neutral")}</span>
                    </div>
                    <FormRange
                        name="sentiment"
                        value={chatFilters.sentiment}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={handleFilterValue}
                        className="form-range"
                    ></FormRange>
                </div> */}
                {/* <div className="filter">
                    <div className="slider-filter-datalist">
                        <span className="slider-option">{t("filters.many")}</span>
                        <span className="slider-option">{t("filters.no")}</span>
                    </div>
                    <FormRange
                        name="emotiveness"
                        value={chatFilters.emotiveness}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={handleFilterValue}
                        className="form-range"
                    ></FormRange>
                </div> */}
                <div className="filter">
                    <div className="slider-filter-datalist">
                        <span className="slider-option">{t("filters.short")}</span>
                        <span className="slider-option">{t("filters.long")}</span>
                    </div>
                    {/* <div>
                    <Slider
                    min={1}
                    max={6}
                    marks={marks}
                    // trackStyle={{ backgroundColor: "rgb(245 245 245)" }}
                    //disabled={!filterArr[index].given}
                    tooltip={
                      {  autoAdjustOverflow:true,
                     formatter:()=> {
                        const filter_FF : any= [{1:"very informal", 2:"informal", 3: "business casual ", 4: "casual professional" ,5: "professional" ,6: "very professional/formal"},
                        {1:"You do not have an own opinion. Be neutral and do not judge in anyway", 2:"You do not have an own opinion. Be neutral", 3: "Be neutral", 4: "feel free to have an own opinion, but be neutral" ,5: "feel free to have an own opinion and maybe judge (politely)" ,6: "feel free to have an own opinion and judge as you want" },
                  
                       {1:"no emojies", 2:"none or sometimes one emoji", 3: "sometimes one or two emojies", 4: "one or two emojies" ,5: "some emojies" ,6: "a lot of emojies"  },
                        {1:"very short", 2:"short", 3: "variable, but if doubt rather short", 4: "variable, but if doubt rather detailed" ,5: "detailed" ,6: "very detailed"},
                      
                       {1:"very much on the specific subject of the asked question", 2:"on the specific subject of the asked question", 3: "maybe sometimes with an additional related information", 4: "sometimes with a few related information, tips or questions" ,5: "with some related additional information, tips or questions" ,6: "with a lot of related additional information, tips or questions" },
                        {1:"very funny", 2:"mostly funny", 3: "casually humorous", 4: "neutral" ,5: "mildly serious" ,6: "very serious"  }]
                     
                      if ( clientConfig.chatboxBehaviour.length == 0){
                        return filter_FF[3][1]
                      } 
                      else{
                        return  filter_FF[3][clientConfig.chatboxBehaviour.length]
                      }
                     
                    }
                     }} 
                    onChange={(e) => {
                        handleFilterValue(e)
                    }}
                    defaultValue={lf}
                        // value={object.pointOnScale}
                    key={clientConfig.chatboxBehaviour.length}
                    step={1}
                  /> </div> */}
                    <FormRange
                        name="length"
                        defaultValue={lf}
                        key={lf}
                        min={1}
                        max={6}
                        step={1}
                        onChange={handleFilterValue}
                        className="form-range"
                    ></FormRange>
                    <br></br>
                    <p> {t("settings.filterval")}: {lfValue}</p>
                </div>
            </div>
        </PopupContents>
    );
};

export default PopupItemFilters;