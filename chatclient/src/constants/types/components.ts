import { HTMLAttributes, MouseEventHandler, ReactElement, ReactNode } from "react";
import { IconType } from "react-icons";

import { IframeType } from ".";

export interface IOpenChatButtonProps {
    icon: IconType;
}

export interface IIframeProps {
    children: ReactNode;
    iframeType: IframeType;
    testRequest:boolean;
    windowType:string;
     
}

export interface IChatContainerProps {
    isChatOpen: boolean;
}

export interface ISettingsListProps {
    icon: IconType;
    children: ReactNode;
    settingName: string;
}

// ClickAwayListener
export type FocusEvents = "focusin" | "focusout";
export type MouseEvents = "click" | "mousedown" | "mouseup";
export type TouchEvents = "touchstart" | "touchend";
export type Events = FocusEvent | MouseEvent | TouchEvent;
export interface IClickAwayListenerProps extends HTMLAttributes<HTMLElement> {
    onClickAway: (event: Events) => void;
    focusEvent?: FocusEvents;
    mouseEvent?: MouseEvents;
    touchEvent?: TouchEvents;
    children: ReactElement<any>;
}

// Popup
export interface IPopupContentsProps {
    title: string;
    children: ReactNode;
    className?: string;
}

// Utilities
export interface IIconButtonProps extends HTMLAttributes<HTMLButtonElement> {
    icon: IconType;
    iconColor?: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
}
