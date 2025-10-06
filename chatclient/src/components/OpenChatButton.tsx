import { IOpenChatButtonProps, IframeType } from "constants/types";
import { EPopupItem, useData } from "hooks";

import { FC, useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

import { IFrame } from "../utilities/IFrame";

const OpenChatButton: FC<IOpenChatButtonProps> = (props) => {
    const { icon } = props;
    const { isChatOpen, setIsChatOpen, setPopupItem, clientConfig } = useData();
    // const styleR = { width: "40px", animation: "3s linear 0s infinite normal none running rotation" }
    const styleR = {
        width: "40px",
        "-webkit-transition": "transform 1s ease",
        "-moz-transition": "transform 1s ease",
        "-ms-transition":"transform 1s ease",
        "-o-transition": "transform 1s ease",        
        transition: "transform 1s ease",
        transform: "translateX( -1px ) rotateY( 360deg )", /* ALSO EXTRA TRANSFORM PROPERTIES ADDED FOR COMPATIBILITY*/
        "-ms-transform":" translateX( -1px ) rotateY(360deg)", /* IE 9 */
        "-webkit-transform":" translateX( -1px ) rotateY(360deg)", /* Chrome, Safari, Opera */
    }
    const styleRNot = { width: "40px", animation:"unset" }
    const [styleRotate, setStyleRotate] = useState<any>(styleRNot)
   
    
    const Icon = !isChatOpen ? icon : BiChevronDown;
    const {
        chatbotBubbleIcons,
        chatbotLook: { chatbotHeader },
        testRequest
    } = clientConfig;

    const handleOpenChatButtonClick = () => {
        setIsChatOpen(!isChatOpen);
        setPopupItem(EPopupItem.NONE);
    };

    useEffect(()=>{
        
        if(!isChatOpen){
            const interval = setInterval(() => {
                setStyleRotate(styleR)

              }, 5000);
              const interval2 = setInterval(() => {
                setStyleRotate(styleRNot)

              }, 8000);
        }
        else{
        setStyleRotate(styleRNot)
        }
    },[isChatOpen])

    return (
        <IFrame iframeType={IframeType.CHAT_OPEN_BUTTON} testRequest={testRequest}    windowType= {clientConfig.windowtype}
        >
              {/* <div className='speech-bubble'  id="speechWhat2Study">Klick mich</div> */}
           {/* <div style={{
           background: "linear-gradient(red, yellow)",
           animation:"rotate-gradient linear 1s infinite"
        
        }}></div> */}
        
        <div style={{
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        }}>
           { !isChatOpen && <div style={{
            position: "absolute",
                display: "block",
                top: "-50%",
                left: "-50%",
                zIndex: "-9",
                // display: "block",
                height: "200%",
                width: "200%",
                transform: "rotate(-45deg)",
                overflow: "hidden",
                background: "linear-gradient(to right, #fff 20%, #fff 20%, #ECD08C 50%, #ECD08C 55%, #fff 70%, #fff 100%)",
                backgroundSize: "600% auto",
                
                animation: "shine 1.1s linear infinite"
  }}
  ></div>}
 
           <button
                // inline styles for button as loading stylesheets takes time on browser (causes to show button without styles)
                id="chatBtnBubble"
                style={{
                    width: "62px",
                    height: "62px",
                    margin: "4px",
                    boxShadow: "0px 2px 3px 0px #9b9b9b",
                    backgroundColor: `${chatbotHeader.chatbotHeaderBackgroundColor}`,
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    ...(isChatOpen
                        ? {
                              backgroundColor: "#f0f0f0",
                          }
                        : {}),
                }}
                onClick={handleOpenChatButtonClick}
            >
                {!isChatOpen ? (
                    <img  src={chatbotBubbleIcons} alt="What2Study" style={styleRotate} />
                ) : (
                    <Icon
                        style={{
                            fontSize: "22px",
                            color: "#000000",
                        }}
                    />
                )}
            </button>
            </div>
            
        </IFrame>
    );
};

export default OpenChatButton;
