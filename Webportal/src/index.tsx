import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import reportWebVitals from './reportWebVitals'
import 'antd/dist/reset.css';
import { APP_ID, SERVER_URL } from './config/parse'

import Parse from 'parse'
Parse.initialize(APP_ID)
Parse.serverURL = SERVER_URL
Parse.masterKey= "what2studyMaster"

ReactDOM.render(
    <App />,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
