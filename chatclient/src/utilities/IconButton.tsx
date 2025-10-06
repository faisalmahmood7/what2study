import { IIconButtonProps } from "constants/types";

import { FC } from "react";

const IconButton: FC<IIconButtonProps> = (props) => {
    const { icon: Icon, onClick, title, className, iconColor = "#ffffff", ...rest } = props;

    return (
        <button
            title={title}
            onClick={onClick}
            className={`app-icon-button ${className}`}
            {...rest}
        >
            <div className="app-icon-button-anim"></div>
            <Icon className="app-icon-button-icon" color={iconColor} />
        </button>
    );
};

export default IconButton;
