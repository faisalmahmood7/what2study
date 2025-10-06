import { IPopupContentsProps } from "constants/types";
import { EPopupItem, useData } from "hooks";
import ClickAwayListener from "utilities/ClickAwayListener";

import { FC, Fragment } from "react";
import { RiCloseFill } from "react-icons/ri";

import PopupItemFilters from "./PopupItemFilters";
import PopupItemInfo from "./PopupItemInfo";
import PopupItemSettings from "./PopupItemSettings";

export const PopupContents: FC<IPopupContentsProps> = (props) => {
    const { title, children, className } = props;
    const { setPopupItem } = useData();

    return (
        <div className="popup-content">
            <div className="popup-content-header">
                <h3 className="popup-content-title">{title}</h3>
                <button
                    className="popup-close-button"
                    aria-label="Close"
                    onClick={() => setPopupItem(EPopupItem.NONE)}
                >
                    <RiCloseFill className="popup-close-icon" />
                </button>
            </div>
            <div className={`popup-content-body ${className}`}>{children}</div>
        </div>
    );
};

const getPopupContent = (popupType: EPopupItem) => {
    switch (popupType) {
        case EPopupItem.SETTINGS:
            return <PopupItemSettings />;

        case EPopupItem.FILTERS:
            return <PopupItemFilters />;

        case EPopupItem.BOT_INFO:
            return <PopupItemInfo />;

        default:
            return <Fragment />;
    }
};

const PopupScreen: FC = () => {
    const { popupItem, setPopupItem } = useData();

    if (popupItem === EPopupItem.NONE) return <Fragment />;

    return (
        <ClickAwayListener onClickAway={() => setPopupItem(EPopupItem.NONE)}>
            <div className="popup-screen">{getPopupContent(popupItem)}</div>
        </ClickAwayListener>
    );
};

export default PopupScreen;