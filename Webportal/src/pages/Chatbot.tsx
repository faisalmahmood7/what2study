import { useEffect, useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import 'react-phone-number-input/style.css'
import { Form, Input, Row, Col, Image, Skeleton, Checkbox, Select } from 'antd'
import CanvasJSReact from '@canvasjs/react-charts';
import ChatClient from "what2study-chatclient";

import Parse from 'parse'
import { getActiveChatbotID, getScriptTag } from '../types/JobOffers';

const Chatbot = () => {

    var currentUser = Parse.User.current()

    const [data, setData] = useState<any>()
    const [token, setToken] = useState<any>()
    const setScriptTagAsync = async (selectedBot) => {
        const chatbots = Parse.Object.extend('chatbots')
        const curUser = Parse.User.current()
        const query = new Parse.Query(chatbots)
        console.log("selected bot ID ", selectedBot)
        query.equalTo("objectId", selectedBot)

        try {
            const activeID = await query.first()
            var val = activeID?.attributes.scriptTag

            var token = /token=.*'/g.exec(val)
            console.log("token", token)

            if (token) {
                var tokenString= token[0].slice(6, -1)
                var tokenStringARR = tokenString.split("&")
                setToken(tokenStringARR[0])
            }
        } catch (error) {
            console.log(error)
            return error
        }

    }
    const [activeChatbotID, setActiveChatID] = useState<any>("")

    const [selectedBot, setSelectedBot] = useState<any>("")

    var activeIDset = async () => {
        let res = await getActiveChatbotID()
        setActiveChatID(res)
    }
    useEffect(() => {
        if (selectedBot != "" && selectedBot != undefined) {
            setScriptTagAsync(selectedBot)

        }

    }, [selectedBot])
    useEffect(() => {
        activeIDset()
        setTableData(currentUser?.attributes.Joblist)

    }, [])
    interface DataType {
        value: string;
        label: string;

    }

    useEffect(() => {
        console.log(data)

    }, [data])

    const setTableData = async (chatbots) => {
        let KB = chatbots
        if (KB != undefined && KB != null && Array.isArray(KB)) {
            var count = 1
            var rs
            var actions
            let datainternal: DataType[] = [];

            var fn = async function jsonCreator(el) {

                var chatbotOBJ = Parse.Object.extend("chatbots");
                var queryChatbot = new Parse.Query(chatbotOBJ);
                var result = await queryChatbot.get(el)

                if (result) {
                    if (result.attributes.activeChatbot == true) {
                        datainternal.push(
                            {
                                value: el,
                                label: result.attributes.name,
                            },
                        )
                    }
                }


                count = count + 1
                return datainternal
            }
            actions = KB.map(fn);

            rs = await Promise.all(actions)
            setData(rs[0])

        }

    }
    const handleChange = (value) => {
        console.log("value", value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
        setSelectedBot(value)
        setScriptTagAsync(value)

    };

    return (
        <div>
            <PageContainer
                title={'Chatfenster'}
                pageId='7'
                button
            >


                <h2>Bitte wählen Sie einen veröffentlichten Chatbot aus der Liste</h2>
                <Select
                    placeholder="Wählen Sie einen Chatbot aus"

                    style={{
                        width: 220,
                    }}
                    onChange={handleChange}
                    options={
                        data
                    }
                />
                <br></br>

                <br></br>

                <br></br>


                {selectedBot && token != "" && token != undefined ?
                    <div style={{ height: "700px", width: "60%", position: "relative" }}>

                        <div className='speech-bubble'>Klick mich</div>
                        <div style={{
                            position: "absolute", bottom: 0,
                            right: 0
                        }}>
                            <ChatClient
                                objectId={selectedBot}
                                userId={Parse.User.current()?.id}
                                universityId={Parse.User.current()?.id}
                                accessToken={token}
                                chatbotId={selectedBot}
                                testRequest={true}
                            ></ChatClient>
                        </div>
                    </div> : <h3>Um einen Chatbot zu testen, müssen Sie ihn zuerst veröffentlichen.</h3>}

            </PageContainer>
        </div>

    )
}

export default Chatbot
