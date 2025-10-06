import { useEffect, useRef, useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import 'react-phone-number-input/style.css'
import { Form, Input, Row, Col, Image, Skeleton, Checkbox, Table, TableProps, Collapse, Divider, Button, Space, TableColumnType, InputRef, Switch, Spin, Select, Flex, Radio } from 'antd'
import CanvasJSReact from '@canvasjs/react-charts';
import Parse from 'parse'
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FilterDropdownProps } from 'antd/es/table/interface';
import type { SelectProps } from 'antd';
import { Options } from 'react-redux';
import { AnyAction } from 'redux';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const Monitoring = () => {

    const [optionsSelect, setoptionsSelect] = useState<any>()
    var currentUser = Parse.User.current()
    const [chatbots, setChatbots] = useState<string[]>(currentUser?.attributes.Joblist)
    const [collapse, setCollapse] = useState<JSX.Element>()
    const [table1, setTable1] = useState<JSX.Element>()
    const [disliked, setDisliked] = useState<number>(0)

    const [viewType, setViewType] = useState<string>("Gestapelte Ansicht(Session-ID)")

    const [feedbackList, setFeedbackList] = useState<any>()


    const [selectionStatus, setSelectionStatus] = useState<boolean>(false)

    const [spin, setSpin] = useState<boolean>(true)
    const [chathistoryList, setChatHistoryList] = useState<any>()

    const [selectedChatbotID, setChatbotSelectionId] = useState<string>()

    const [dateCountFrequency, setDateCountFreq] = useState<any>()
    const [data, setData] = useState<DataType[]>()
    const [data2, setData2] = useState<DataType2[]>()

    const [data3, setData3] = useState<DataType2[]>()

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [totalUsersSessions, setTotalSessions] = useState(0)

    type DataIndex = keyof DataType;
    interface DataType {
        key: string;
        sessionID: string;
        chatbotId?: string;
        user?: string;
        bot?: string;
        timestamp?: string
    }

    type DataIndex2 = keyof DataType2;
    interface DataType2 {
        key: string;
        label: string;
        children: any

    }
    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => { handleSearch(selectedKeys as string[], confirm, dataIndex) }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        // onClick={() => clearFilters && handleReset(clearFilters)}
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button> */}
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setSearchText('');
                            handleSearch([""], confirm, dataIndex)
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex ? dataIndex : ""]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const columns: any = [
        {
            title: 'Session-ID',
            dataIndex: 'sessionID',
            key: 'sessionID',
            width: "400px"
        },
        {
            title: 'Chatbot',
            dataIndex: 'chatbotId',
            key: 'chatbotId',
            ...getColumnSearchProps('chatbotId'),
            width: "70px"


        },

        {
            title: 'Benutzerfrage',
            dataIndex: 'user',
            key: 'user',
            width: "280px",
            ...getColumnSearchProps('user'),


        },
        {
            title: 'Bot-Antwort',
            dataIndex: 'bot',
            key: 'bot',
            width: "900px",
            ...getColumnSearchProps('bot'),



        },
        {
            title: 'Zeitstempel',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: "220px",
            ...getColumnSearchProps('timestamp'),


        },



    ];

    const setZeros= (number)=>{
        console.log("number changing")
        console.log(number)
    
    if(number<10)
    {
        return "0"+ number+""
    }
    if (number == 0){
    return "00"
    }
    return ""+number+""
    }

    const setTableData = async () => {


        let KB = chathistoryList
        if (KB != undefined && KB != null && Array.isArray(KB)) {
            var count = 1
            var rs
            var actions
            setTotalSessions(KB.length)

            var funcKB = async function (element) {

                var msgsFunc = async function (el) {
                    var datainternal = {}

                    var chatbotOBJ = Parse.Object.extend("chatbots");
                    var queryChatbot = new Parse.Query(chatbotOBJ);
                    var result = await queryChatbot.get(element.chatbotId)

                    if (result) {
                        var timestamp = el.timestamp.split("@")
                        var splittime = timestamp[1].split(":")
                        var time = setZeros( parseInt(splittime[0])) + ":" + setZeros( parseInt(splittime[1]))+ ":" + setZeros( parseInt(splittime[2]))
                        timestamp = timestamp[0] + " @ " + time

                        datainternal =
                        {
                            key: count.toString(),
                            sessionID: element.sessionID,
                            chatbotId: result.attributes.name,
                            user: el.user,
                            bot: el.bot,
                            timestamp: timestamp
                        }

                    }


                    count = count + 1

                    return datainternal
                }
                var actions3 = element["messages"].map(msgsFunc);
                var results = await Promise.all(actions3);
                console.log("was res here ")
                console.log(results)
                return results

            }

            var actions2 = KB.map(funcKB);
            var resultss = Promise.all(actions2);
            resultss.then((data: any) => {
                let dataTable: DataType[] = [];
            if(data)
                data.forEach(element => {
                    element.forEach(element => {
                        dataTable.push(element)
                    });
                   
                });
                setData(dataTable)
            })


        }

    }


    const searchInput = useRef<InputRef>(null);
    const [options2, setOptions2] = useState<any>({
        animationEnabled: true,
        title: {
            text: ""
        },
        axisX: {
            valueFormatString: ""
        },
        axisY: {
            title: "Fragen und Antworten",
        },
        data: [{
            yValueFormatString: "",
            xValueFormatString: "",
            type: "spline",
            dataPoints: []
        }]
    })

    useEffect(() => {

        if (feedbackList) {
            var liked = 0
            var disliked = 0
            for (let i = 0; i < feedbackList.length; i++) {
                if (feedbackList[i].type == false) {
                    disliked = disliked + 1
                }
                else {
                    liked = liked + 1
                }
            }

            setDisliked(disliked)
            setLiked(liked)
        }
    }, [feedbackList])


    const setTableDataParent = async () => {

        let KB = chathistoryList
        let data2: DataType2[] = [];
        var count = 1

        if (KB != undefined && KB != null && Array.isArray(KB)) {

            var funKB = async function (element) {
                let data: DataType[] = [];

                var fn = async function (el) {
                    var data = {}
                    var count = 1
                    var chatbotOBJ = Parse.Object.extend("chatbots");
                    var queryChatbot = new Parse.Query(chatbotOBJ);
                    var result = await queryChatbot.get(element.chatbotId)
                    var timestamp = el.timestamp.split("@")
                    var splittime = timestamp[1].split(":")
                    var time = setZeros( parseInt(splittime[0])) + ":" + setZeros( parseInt(splittime[1]))+ ":" + setZeros( parseInt(splittime[2]))
                    timestamp = timestamp[0] + " @ " + time

                    if (result) {
                        data =
                        {
                            key: count.toString(),
                            sessionID: element.sessionID,
                            user: el.user,
                            bot: el.bot,
                            timestamp: timestamp,
                            chatbotId: result.attributes.name

                        }

                    }
                    else {
                        data =
                        {
                            key: count.toString(),
                            sessionID: element.sessionID,
                            user: el.user,
                            bot: el.bot,
                            timestamp: timestamp,
                            chatbotId: element.chatbotId

                        }

                    }


                    count = count + 1
                    return data
                }
                var actions = element["messages"].map(fn);
                var results = await Promise.all(actions);
                return results
            }

            var actions = KB.map(funKB);
            var results = Promise.all(actions);


            results.then((data: any) => // or just .then(console.log)
            {
                console.log("final arrqqay")
                console.log(data)
                if (data.length > 0) {
                    data.forEach(element => {
                        data2.push(
                            {
                                key: count.toString(),
                                label: count.toString() + ": User SessionID: " + element[0].sessionID,
                                children: <Table rowKey={element[0].sessionID} columns={columns} dataSource={element} />

                            },
                        )
                        count = count + 1
                    }

                    );


                    setData2(data2)
                }

            }
            );


        }

    }



    useEffect(() => {


        if (chathistoryList) {
            var result = chathistoryList.map(obj => {
                return obj.messages.map(objIn => objIn.timestamp.split("@")[0].trim())
            });
            var concatArr: any = []
            if (result)
                for (let index = 0; index < result.length; index++) {
                    concatArr = concatArr.concat(result[index])

                }
            const counts = {};
            concatArr.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
            var options2_Data: any = []
            for (let key in counts) {
                var key_ = key.split("/")
                var dateFormat = key_[2] + "-" + key_[1] + "-" + key_[0]
                options2_Data.push({ x: new Date(dateFormat), y: counts[key] })

            }
            var sortedarr = options2_Data.sort((a, b) => a.x - b.x);
            setOptions2({
                animationEnabled: false,
                title: {
                    text: ""
                },
                axisX: {
                    valueFormatString: ""
                },
                axisY: {
                    title: "Anzahl der Nachrichten",
                },
                data: [{
                    yValueFormatString: "",
                    xValueFormatString: "",
                    type: "spline",
                    dataPoints: sortedarr
                }]
            })
        }
        setTableDataParent()
        setTableData()



    }, [chathistoryList])



    const [liked, setLiked] = useState<number>(0)

    const options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light1", // "light1", "dark1", "dark2"
        title: {
            text: ""
        },
        data: [{
            type: "pie",
            indexLabel: "{label}: {y}",
            startAngle: -90,
            dataPoints: [
                { y: disliked, label: "Disliked", color: "#b23e3e" },
                { y: liked, label: "Liked", color: "#00addc" }
            ]
        }]
    }

    const promissFunc = async (chatbots) => {
        if (chatbots) {
            var feedbacks = Parse.Object.extend("feedback");
            var chathistory = Parse.Object.extend("userChat")
            var list = [] as any
            var chatHistoryList = [] as any
            for (let i = 0; i < chatbots.length; i++) {
                var q = new Parse.Query(feedbacks);
                q.equalTo("chatbotId", chatbots[i])
                q.limit(100000000)
                var response = await q.find()
                if (response) {
                    response.forEach(feedback => {
                        list.push(feedback.attributes)
                    });
                }

            }
            if (list.length > 0)
                setFeedbackList(list)

            for (let i = 0; i < chatbots.length; i++) {
                var q2 = new Parse.Query(chathistory);
                q2.equalTo("chatbotId", chatbots[i])
                q2.limit(1000000000)

                var response = await q2.find()
                if (response) {
                    response.forEach(historyPerSession => {
                        chatHistoryList.push(historyPerSession.attributes)
                    });
                }

            }
            if (chatHistoryList.length > 0)
                console.log("chat his tory list")
            console.log(chatHistoryList)


            setChatHistoryList(chatHistoryList)
        }

        //     if (chatHistoryList.length > 0)
        //     { console.log("chat his tory list")
        //  console.log(chatHistoryList)

        //  var result = chatHistoryList.map(obj => {
        //      return obj.messages.map(objIn => 
        //          {
        //              console.log("hello time")
        //              console.log(objIn.timestamp)
        //              console.log(objIn.timestamp.split("@")[0].trim())
        //           var timestamp= objIn.timestamp.split("@")
        //           var splittime = timestamp[1].split(":")
        //           console.log(splittime)
        //           var time = splittime[0] + ":"+splittime[1]
        //          return time
        //          }
        //          )
        //      })

        //      console.log(result)
        //     }

    }





    const setSelectionOptions = async (chatbots) => {
        let KB = chatbots
        console.log("i am a list")
        console.log(KB)
        if (KB != undefined && KB != null) {
            var count = 1
            var rs
            var actions
            let datainternal: any = [];

            var fn = async function jsonCreator(el) {

                var chatbotOBJ = Parse.Object.extend("chatbots");
                var queryChatbot = new Parse.Query(chatbotOBJ);
                var result = await queryChatbot.get(el)

                if (result) {
                    var name = result.attributes.name
                    if (result.attributes.name == "") {
                        name = el
                    }
                    datainternal.push(
                        {
                            label: name,
                            value: el

                        },
                    )

                }


                count = count + 1
                return datainternal
            }
            actions = KB.map(fn);

            rs = await Promise.all(actions)
            console.log("hello rs")
            console.log(rs)
            setoptionsSelect(rs[0])

        }

    }
    useEffect(() => {
        if (chatbots != undefined && chatbots.length > 0) {
            setSelectionOptions(chatbots)

        }
    }, [chatbots])


    const optionsRadio = [
        { label: "Gestapelte Ansicht(Session-ID)", value: "Gestapelte Ansicht(Session-ID)" },
        // { label: "Gestapelte Ansicht(Chatbots)", value: "Gestapelte Ansicht(Chatbots)" },
        { label: "Listenansicht", value: "Listenansicht" },

    ];


    return (
        <div>
            <PageContainer
                title={'Monitoring'}
                pageId='6'
                button
                buttonText='Speichern'
            >

                <Form layout='vertical' name='basic' style={{ marginTop: '-50px' }}>
                    {optionsSelect != undefined &&
                        <Space style={{ marginTop: "50px", width: '100%' }} direction="vertical">

                            <Select
                                mode="multiple"
                                allowClear
                                showSearch={false}
                                style={{ width: '100%' }}
                                placeholder="Bitte wählen Sie Chatbot/s aus"
                                //   defaultValue={}
                                onChange={async (e) => {
                                    console.log("i was not changed")
                                    console.log(e)
                                    let datacp: DataType[] = [];
                                    let data2cp: DataType2[] = [];
                                    setSpin(true)

                                    //   setData(datacp)
                                    //   setData2(data2cp)
                                    promissFunc(e)
                                    setSpin(false)

                                    setSelectionStatus(true)

                                    //   const interval = setInterval(() => {
                                    //     console.log('This will run every second!');
                                    //     setData(result[1])
                                    //     setData2(result[0])
                                    //     setSpin(false)
                                    //   }, 3000);

                                    //   console.log("second log")

                                    //   clearInterval(interval);


                                }}
                                options={optionsSelect}
                            /></Space>}


                    {selectionStatus == true && <>
                        <fieldset className="fieldsetCustom">
                            <legend>Allgemeine Informationen</legend>
                            <Row gutter={26} >
                                <Col span={9}>

                                    <h3>Gesamtanzahl der Benutzer (unique Session IDs): <span style={{ fontSize: "22px", fontWeight: "bold", color: "#02addc" }}>{totalUsersSessions}</span></h3>

                                </Col>

                            </Row>
                        </fieldset>
                        <Row gutter={24}>

                            <Col span={11} style={{ padding: "50px" }}>
                                <h2>Antwortqualität</h2>
                                {disliked == 0 ? <div style={{ height: "100%", width: "100%", alignContent: "center", border: "ridge", textAlign: "center" }}><h2 style={{ color: "grey", fontFamily: "monospace" }}>Keine Statistiken verfügbar</h2></div> : <CanvasJSChart options={options} />}

                            </Col>

                            <Col span={11} style={{ padding: "50px" }}>
                                <h2>Aktivität</h2>
                                <CanvasJSChart options={options2}
                                /* onRef={ref => this.chart = ref} */
                                />


                            </Col>
                        </Row>

                        <Row gutter={24}>

                            {/* <Table rowKey="Name" columns={columns} dataSource={data} /> */}
                            <Divider orientation="left" style={{ fontSize: "20px", border: "10px" }}>Chatverlauf</Divider>
                            {/* <Switch style={{ margin: 35 }} checkedChildren="Gestapelte Ansicht" unCheckedChildren="Listenansicht" defaultChecked={viewType} onChange={() => { setViewType(!viewType) }} /> */}
                            <br></br>
                            <br></br>
                            {spin && <Row style={{ marginTop: "10px" }}><Spin style={{ marginLeft: "100px" }} tip="..." size="large"></Spin> <h3 style={{ marginLeft: "20px" }}> Chatverlauf vorbereiten</h3></Row>}
                            <br></br>
                            <br></br>




                        </Row>
                        <Row gutter={24}>
                            <Radio.Group
                                options={optionsRadio}
                                style={{ margin: 35 }}
                                defaultValue={viewType}
                                optionType="button"
                                buttonStyle="solid"
                                onChange={(e) => {
                                    setViewType(e.target.value)
                                }}
                            />
                            {viewType == "Gestapelte Ansicht(Session-ID)" && <Collapse key="collapseK" accordion={true} size="large" style={{ width: "100%" }} defaultActiveKey={['1']} items={data2} />}

                            {/* {viewType == "Gestapelte Ansicht(Chatbots)" && <Collapse accordion={true} size="large" style={{ width: "100%" }} defaultActiveKey={['1']} items={data3} />} */}


                            {viewType == "Listenansicht" && <Table key="tableK" style={{ width: "100%" }} rowKey={"extendedlist"} columns={columns} dataSource={data} />}
                        </Row>

                    </>}
                </Form>

            </PageContainer>
        </div>

    )
}

export default Monitoring
