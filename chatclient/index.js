import React from "react";
import ReactDOM from "react-dom/client";

import App from "./src/App";

import "./src/styles/global.scss";
import "./src/styles/_chatcontainer.scss";
import "./src/styles/_popup.scss";

const defaultRoot = "what2studyChatclientWrapper";

const W2SChatClient = (clientConfigurations = {}) => {
    const { rootId = defaultRoot, ...rest } = clientConfigurations;
    const root = ReactDOM.createRoot(document.getElementById(rootId));

    root.render(<App {...rest} />);
};

export default W2SChatClient;
