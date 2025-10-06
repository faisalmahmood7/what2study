/* eslint-disable */
// @ts-nocheck
import { IIframeProps, IframeType } from "constants/types";
import { useData } from "hooks";

import { EPopupItem, ERoute, useData } from "hooks";
import { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {domain, what2studycss} from "../constants/domainName"

const isFirefox = typeof InstallTrigger !== "undefined";

const getStyles = (
    iframeType: IframeType,
    isChatOpen: boolean,
    isMobileScreen: boolean = false,
    isTestScreen:boolean,
    isFullScreen:string,
) => {
    switch (iframeType) {
        case IframeType.CHAT_CONTAINER_CLOSED:
            return {
                // border: "none",
                boxShadow: "#32325d40 0px 50px 100px -20px, #0000004d 0px 30px 60px -30px",
                width: isMobileScreen ? "100%" : "420px",
                height: isMobileScreen ? "100%" : "620px",
                position: isTestScreen ? "absolute" : "fixed",
                bottom: isMobileScreen ? "0" : "100px",
                right: isMobileScreen ? "0" : "30px",
                borderRadius: isMobileScreen ? "0" : "12px",
                backgroundColor: "#fff",
                display: "none",
                zIndex:"999999999999999999999999"
            
                
            };

        case IframeType.CHAT_CONTAINER_OPEN:
            return {
                border: "none",
                boxShadow: "#32325d40 0px 50px 100px -20px, #0000004d 0px 30px 60px -30px",
                width: isFullScreen=="full" && isMobileScreen ? "800px": isFullScreen=="min" && isMobileScreen ? "100%"  : "420px",
                height: isMobileScreen ? "100%" : "620px",
                
                position: isTestScreen ? "absolute" : "fixed",
                bottom: isMobileScreen ? "0" : "100px",
                right: isMobileScreen ? "0" : "30px",
                borderRadius: isMobileScreen ? "0" : "12px",
                backgroundColor: "#fff",
                zIndex:"999999999999999999999999"
            };

        case IframeType.CHAT_OPEN_BUTTON:
            return {
                display: isChatOpen && isMobileScreen ? "none" : "block",
                border: "none",
                width: "70px",
                height: "70px",
                
                position: isTestScreen ? "absolute" : "fixed",
                bottom: "28px",
                right: "24px",
                borderRadius: "50%",
                zIndex:"999999999999999999999999",
            };

        default:
            return {
                border: "none",
            };
    }
};
// border: "0.35rem solid",
                // "--d": "2500ms",
                // "--angle": "90deg",
                // "--gradX": "100%",
                // "--gradY": "50%",
                // "--c1": "rgba(168, 239, 255, 1)",
                // "--c2": "rgba(168, 239, 255, 0.1)",
    //   borderImage: "conic-gradient(from var(--angle), var(--c2), var(--c1) 0.1turn, var(--c1) 0.15turn, var(--c2) 0.25turn) 30",
    //   animation: "borderRotate var(--d) linear infinite forwards",

const isDevelopment = process.env.NODE_ENV === "development";

export const IFrame: FC<IIframeProps> = (props) => {
    const { children, iframeType,testRequest, windowType, ...rest} = props;
    const [ contentRef, setContentRef ] = useState< HTMLElement | null >(
		null
	);
    const [ contentRefIframe, setContentRefIframe ] = useState< HTMLElement | null >(
		null
	);
    //const [contentRef, setContentRef] = useState(null);
    const handleLoad = ( event: React.SyntheticEvent< HTMLIFrameElement > ) => {
        const iframe = event.target as HTMLIFrameElement;
        if ( iframe?.contentDocument ) {
            setContentRef( iframe.contentDocument.body );
            setContentRefIframe(iframe.contentDocument)
        }
    };
    const { isChatOpen, setIsMobileScreen } = useData();
    const [styles, setStyles] = useState();
    const mountNode = contentRef?.contentWindow?.document?.body;
    const mountNodeDoc = contentRef?.contentWindow?.document;
    const addStyles = () => {
        const link = mountNodeDoc.createElement("link");
        // link.href = "http://localhost:7777/dist/what2StudyClientStyles.css";
        link.href = what2studycss;
        link.rel = "stylesheet";
        link.type = "text/css";
        mountNodeDoc.head.appendChild(link);
    };

    const handleWindowResize = (event) => {
        if(window.innerWidth >300 && window.innerHeight>450){
        const isMobileScreen = window.innerWidth < 680;
        if( windowType =="min")
       
{         setStyles(getStyles(iframeType, isChatOpen, isMobileScreen,testRequest,windowType));
              setIsMobileScreen(isMobileScreen);
            }
            else{
                setStyles(getStyles(iframeType, isChatOpen, true,testRequest,windowType));
                setIsMobileScreen(true);
            }
        }
    };

   
    useEffect(() => {
        // setIsChatOpenTemp(isChatOpen)
        localStorage.setItem("iframeType", iframeType.toString())
        localStorage.setItem("isChatOpen", isChatOpen)
       
        handleWindowResize()
    }, [iframeType, isChatOpen]);

    useEffect(() => {
        // window.addEventListener("resize", handleWindowResize2);
        // return () => {
        //     window.removeEventListener("resize", handleWindowResize2);
        // };
        if( windowType =="min"){
            getStyles(iframeType, isChatOpen, false,testRequest,windowType)
        }
        else{
            getStyles(iframeType, isChatOpen, true,testRequest,windowType)
        
        }
    }, []);

    useEffect(() => {
       if (mountNode && !isFirefox) {
            mountNode.style = "margin: 0";
            // mountNode.style ="background: linear-gradient(red, yellow);"
            addStyles();
        }
    }, [mountNode]);
    useEffect(() => {
        if (contentRef && isFirefox) {
            contentRef.style = "margin: 0";
            const link = document.createElement("link");
            // link.href = "http://localhost:7777/dist/what2StudyClientStyles.css";
            link.href = what2studycss;
            link.rel = "stylesheet";
            link.type = "text/css";
            contentRefIframe.head.appendChild(link);
        }
    }, [contentRef]);
   

    if (isDevelopment) {
        return (
            <div style={styles} className="development-div">
                {children}
            </div>
        );
    }

    return (
        <>
        
        { isFirefox &&  
        <iframe
            style={styles}
            id="what2studyIDFirefox"
            {...rest}
            onLoad={ handleLoad }
        >
           
            {contentRef && isFirefox&& createPortal(children, contentRef)}
            
            
        </iframe> }


        {!isFirefox&&  
        <iframe
        id="what2studyIDChrome"
            style={styles}
            {...rest}
            // onLoad={isFirefox ? (e) => setContentRef(e.target) : undefined}
            // onLoad={ handleLoad }
            ref={ setContentRef }
        >
            {mountNode && !isFirefox && createPortal(children, mountNode)}
            {/* {contentRef && isFirefox&& createPortal(children, contentRef)} */}
            
        </iframe> }
        </>
       

        // <iframe
        //     style={styles}
        //     {...rest}
        //     onLoad={isFirefox ? (e) => setContentRef(e.target) : undefined}
        //     ref={!isFirefox ? setContentRef : undefined}
        // >
        //     {mountNode && createPortal(children, mountNode)}
        //     {contentRef && isFirefox&& createPortal(children, contentRef)}
        // </iframe>
    );
};
