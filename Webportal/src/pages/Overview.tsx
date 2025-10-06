import PageContainer from '../components/layout/PageContainer'
import Parse from 'parse'
import { useHistory } from 'react-router-dom'
import { Row, Col, Tabs, Upload, Button, UploadProps, Form, Select, DatePicker, Input, Checkbox, Spin, Modal, UploadFile ,Tooltip} from 'antd'

import { ApiTwoTone, CodeOutlined, EyeInvisibleOutlined, EyeTwoTone, HddTwoTone, InboxOutlined, InfoCircleOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import { TweenOneGroup } from 'rc-tween-one';
import { knowledgeBaseBlock, generateKnowledge, getKnowledgeBase, getAllKnowledgeBaseWithType } from '../types/knowledgeBase'
import type { ConfigProviderProps, RadioChangeEvent } from 'antd';
import ChatClient from "what2study-chatclient";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart, Pie, Sector, Cell
} from 'recharts'
import { useEffect, useRef, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons'
import { showNotification } from '../helpers/notification'
import { toBase64 } from '../helpers/toBase64'
import { getCurrentUser } from '../types/user'
import dayjs from 'dayjs'
import TagComponent from './TagComponent';
import FilesListTable from './FilesListTable';
import TextArea from 'antd/es/input/TextArea';
import { getActiveChatbotID, getScriptTag } from '../types/JobOffers';
import { SERVER_URL, SERVER_URL_parsefunctions, ServerCrawl } from '../config/parse';

import React from 'react';
import { random } from 'lodash';

const Overview = () => {

  const { Option } = Select
  const history = useHistory()
  history.push('/what2study/database')
  type SizeType = ConfigProviderProps['componentSize'];
  const [size, setSize] = useState<SizeType>('large');
  const [size2, setSize2] = useState<SizeType>('large');
  const curUser = Parse.User.current()
  const [curUserId, setCurUserId] = useState<string>();
  const [activeChatbotID, setActiveChatID] = useState<any>("")
  const [hinzfugStatus, setHinzufugStatus] = useState<boolean>(false);

  const [traingingStatusButton, setTraingingStatusButton] = useState<boolean>(false);
  const [crawlURLUsername, setCrawlUsername] = useState<any>("")
  const [crawlURLPassword, setCrawlPass] = useState<any>("")
  const disable = { pointerEvent: "none", opacity: 0.7 }
  const [mainDiv, setMainDiv] = useState<boolean>(true)
  const [selectedChatbotID, setChatbotSelectionId] = useState<string>()
  

  const [crawlJobControl, setCrawlJobControl] = useState<boolean>(true)
  const [crawlURLStatus, set401] = useState<boolean>(true)
  const enable = { pointerEvent: "unset", opacity: 1 }
  const [fileList, setFileList] = useState<UploadFile[]>([]) // this will hold the files
  // Enable subscription to chart name change
  var embeddingStatus = Parse.Object.extend("embeddingStatus");
  var q2 = new Parse.Query(embeddingStatus);
  const clearUpload = () => {
    setFileList([]);
  };
  q2.subscribe().then(async function (sub) {
    sub.on('update', function (message) {

      if (message.attributes.user == curUser?.id) {
        if (message.attributes.status == 0) {
          setMainDiv(true)
        }
        else {
          setMainDiv(false)
        }
      }
    });
  });

  // Enable subscription to chart name change
  var knowledgeBase = Parse.Object.extend("knowledgeBase");
  var q3 = new Parse.Query(knowledgeBase);
  q3.subscribe().then(async function (sub) {
    sub.on('update', function (message) {

      if (message.attributes.user == curUser?.id) {
        if (message.attributes.jobStatus == true) {
          setCrawlJobControl(true)
          setLoader(false)
          // console.log(message)
          // if(message.attributes.type =="url"){
          //   console.log("sss")
          // setTableJSX(<></>)
          // setTableJSX(JSXelementTable(localStorage.getItem("tableID")))

          // }
          
        }
        else {
          // setCrawlJobControl(false)
          setLoader(false)

        }
      }
      
    });
    // sub.on('delete', function (message) {
    //   console.log("destroy")
    //   console.log(message)
    //   if (message.attributes.user == curUser?.id) {
    //     if (message.attributes.jobStatus == false) {
    //       //  setMainDiv(true)
    //       setLoader(false)
    //       setTableJSX(<></>)
    //       setTableJSX(JSXelementTable(localStorage.getItem("tableID")))

    //       console.log("subscription success")
    //     }
    //     else {
    //       //  setMainDiv(false)
    //       setLoader(false)

    //     }
    //   }
    // });
  });

  var activeIDset = async () => {
    let res = await getActiveChatbotID()
    setActiveChatID(res)

    getAllKnowledgeBaseWithType("url").then(function(KB){
      if (KB != undefined && KB != null && Array.isArray(KB)) {
        var count = 1
        var foundFalse=false
        KB.forEach(element => {
            var jobstatus = element.attributes.jobStatus
           
            if(jobstatus==false){
              console.log("found false")
              foundFalse=true
            }
            count = count + 1
        });
        
        if(foundFalse == false){
          setCrawlJobControl(true)
        }
        else{
          setCrawlJobControl(false)
          
        }
    }
         
    })


        
  }
  useEffect(() => {
    activeIDset()
    setCurUserId(curUser?.id)
    var embeddingStatus = Parse.Object.extend("embeddingStatus");
    var q2 = new Parse.Query(embeddingStatus);
    q2.equalTo("user", curUser?.id)
    q2.first().then((e) => { if (e && e.attributes.status == 1) { setMainDiv(false) } })
    
  }, [])
  var currentUser = Parse.User.current()
  const [knowledgebases, setknowledgeBases] = useState<knowledgeBaseBlock[] | null>(null)

  const [base64, setBase64] = useState<any>()

  const [priority, setPriority] = useState<string>("")


  const [indexFileContent, setIndex] = useState<string>("")

  const [transcript, setTranscript] = useState<string>("")

  const [urlViewer, setUrlViewer] = useState<string>("https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js")
  const [loader, setLoader] = useState<any>(false)
  const [nPLus1, setNPLus1] = useState<boolean>(false)

  const [urlCrawler, setUrlCrawler] = useState<string>("")
  const [tagsArray, setTagsArray] = useState<string[]>([])

  const [nestedLinks, setNestedLinks] = useState<string[]>([])

  const [fileName, setFileName] = useState<string>("")

  const [url, setUrl] = useState<string>("")

  const [defaultActiveKey, setDefKey] = useState<string>("1")

  const [token, setToken] = useState<any>()
  const [scriptTag, setScriptTag] = useState<any>()
  // dayjs().year() + "/" + "02"
  const [expires, setExpiry] = useState<any>()
  const setScriptTagAsync = async () => {
    getScriptTag().then(function (val) {
      var token = /token=.*'/g.exec(val)
      if (token) {
        setToken(token[0].slice(6, -1))
      }
      return val
    })
  }
  useEffect(() => {
    setScriptTagAsync()
  }, [])

  const JSXelementTable = (id) => {
    return <Tabs
      defaultActiveKey={localStorage.getItem("tableID") || id}
      // activeKey={localStorage.getItem("tableID")||id}
      type="card"
      size={size2}
      
      items={new Array(4).fill(null).map((_, i) => {
        const id = String(i + 1);
        return {
          label: <>{id == "1" ? <>PDF</> : id == "2" ? <>Text</> : id == "3" ? <>Medien</> : id == "4" ? <>URL</> : <></>}</>,
          key: id,
          children: <> <FilesListTable id={id}></FilesListTable></>,
        };
      })}
    />
  }

  const [tableJSX, setTableJSX] = useState<JSX.Element>(JSXelementTable(defaultActiveKey))
  useEffect(() => {
    localStorage.setItem("tableID", defaultActiveKey)
    setTableJSX(JSXelementTable(localStorage.getItem("tableID")))

  }, [defaultActiveKey])

  const monthFormat = 'YYYY/MM';

  const props: UploadProps = {
    accept: "application/pdf",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {

      setFileName(file.name)
      const base64 = await toBase64(file).catch((err) =>
        showNotification({
          type: 'error',
          title: 'Fehler beim Hochladen',
          message: 'Beim Hochladen der PDF ist ein Fehler aufgetreten.',
        })
      )
      setBase64(base64)
      return true
    },
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
      }
      file.status = "done"
      setFileList(fileList)
    },
    defaultFileList: [
      // {
      //   uid: '1',
      //   name: 'xxx.png',
      //   status: 'uploading',
      //   url: 'http://www.baidu.com/xxx.png',
      //   percent: 33,
      // },
    ],
  };

  const propsText: UploadProps = {
    accept: "text/plain",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {

      setFileName(file.name)
      const base64 = await toBase64(file).catch((err) =>
        showNotification({
          type: 'error',
          title: 'Fehler beim Hochladen',
          message: 'Beim Hochladen des Bildes ist ein Fehler aufgetreten.',
        })
      )
      setBase64(base64)
      return true
    },
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
      }
      file.status = "done"
    },
    defaultFileList: [
      // {
      //   uid: '1',
      //   name: 'xxx.png',
      //   status: 'uploading',
      //   url: 'http://www.baidu.com/xxx.png',
      //   percent: 33,
      // },
    ],
  };

  const propsMedia: UploadProps = {
    accept: "image/png, image/jpeg, image/jpg,video/mp4",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {

      setFileName(file.name)
      const base64 = await toBase64(file).catch((err) =>
        showNotification({
          type: 'error',
          title: 'Fehler beim Hochladen',
          message: 'Beim Hochladen des Bildes ist ein Fehler aufgetreten.',
        })
      )
      setBase64(base64)
      return true
    },
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
      }
      file.status = "done"
    },
    defaultFileList: [
      // {
      //   uid: '1',
      //   name: 'xxx.png',
      //   status: 'uploading',
      //   url: 'http://www.baidu.com/xxx.png',
      //   percent: 33,
      // },
    ],
  };

  const submitKnowledgeBase = async (fileType) => {
    setHinzufugStatus(true)
    let fileObjName = ""
    let className = ""
    let propertyName = ""
    if (fileType == "pdf") {
      fileObjName = "pdfUpload"
      className = "PDF"
      propertyName = "pdf"
      setDefKey("1")
    }
    else if (fileType == "text") {
      fileObjName = "textUpload"
      className = "TEXT"
      propertyName = "text"
      setDefKey("2")
    }
    else if (fileType == "media") {
      fileObjName = "mediaUpload"
      className = "Media"
      propertyName = "media"
      setDefKey("3")
    }
    else {
      fileObjName = "url"
      className = "URL"
      propertyName = "url"
      setDefKey("4")
    }
    if (base64 != undefined) {
      const parseFile = new Parse.File(fileObjName, { base64: base64 as string });
      parseFile.save().then(async (responseFile) => {
        const Gallery = Parse.Object.extend(className);
        const gallery = new Gallery();
        gallery.set(propertyName, responseFile);

        let response = await gallery.save();
        var url = response.attributes[propertyName]._url
        if (Parse.serverURL.includes("cpstech")) {
          url = url.replace("http:", "https:")

        }
        else if (Parse.serverURL.includes("localhost")) {
          url = url.replace("https:", "http:")
        }
        setUrl(url)
        setUrlViewer(url)
        setFileName(fileName)
        
        generateKnowledge({
          name: fileName,
          user: currentUser?.id,
          type: fileType,
          priority: priority,
          expires: expires,
          tags: tagsArray,
          transcript: transcript,
          fileUrl: url,
          jobStatus: false,
          nestedLinks: nestedLinks,
          nPlus1: nPLus1,

        }).then(data => {
          setTableJSX(<></>)
          setTableJSX(JSXelementTable(localStorage.getItem("tableID")))
          setLoader(false)
          showNotification({
            title: 'Datei erfolgreich hochgeladen',
            message: 'Erfolg',
            type: 'success',
          })
          let formData = { url: url, fileName: fileName, user: currentUser?.id, indexFile: "", type: fileType, transcript: transcript }


          const response = fetch(
            SERVER_URL_parsefunctions + "/uploadPythonFile",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": "what2study",
                "X-Parse-Master-Key": "what2studyMaster",
              },
              body: JSON.stringify(formData),
            }
          );

          clearUpload()
          setHinzufugStatus(false)
          setPriority("")
          setExpiry(undefined)
    
      setTagsArray([])
   
          return true

        })
          .catch(error => {

            setHinzufugStatus(false)
            console.log('Error fetching profile ' + error)
            setLoader(false)
          })
      }).catch((e) => {
        setLoader(false)

      setHinzufugStatus(false)
        showNotification({
          type: 'error',
          title: 'Bitte überprüfen Sie den Dateinamen. Entfernen Sie Zahlen wie (1)* am Ende des Dateinamens, falls vorhanden.',
          message: '',
        })
      })
    }
    else {
      setLoader(false)
      setHinzufugStatus(false)
      showNotification({
        type: 'error',
        title: 'Bitte überprüfen Sie den Dateinamen. Entfernen Sie Zahlen wie (1)* am Ende des Dateinamens, falls vorhanden.',
        message: '',
      })
    }

  }

useEffect(()=>{
  console.log("nplus 1 value ")
  console.log(nPLus1)
  
},[nPLus1])

function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};
  const saveCrawlData = async (url, status) => {
    var tempFileName
    var tempFileNameArr :any=[]

    if (urlCrawler.startsWith("https")) {
       tempFileNameArr = urlCrawler.split("https://")
    }
    else if (urlCrawler.startsWith("http")) {
       tempFileNameArr = urlCrawler.split("https://")
    }
    else {
       tempFileNameArr = urlCrawler.split("/")
    }
    console.log(tempFileNameArr)
    if (tempFileNameArr) {
      tempFileName = tempFileNameArr[1]
    }
    var isValidURLCheck = isValidURL(urlCrawler)
    if(isValidURLCheck)
    {
    setDefKey("4")
    // setFileName(response.attributes[propertyName]._name)
    var res = await generateKnowledge({
      // name: response.attributes[propertyName]._name,
      name: urlCrawler,
      user: currentUser?.id,
      type: "url",
      priority: priority,
      expires: expires,
      tags: tagsArray,
      transcript: transcript,
      fileUrl: url,
      nestedLinks: [],
      nPlus1: status == 0 ? nPLus1: false,
      jobStatus: false,
    })
    setTableJSX(<></>)
    setTableJSX(JSXelementTable(localStorage.getItem("tableID")))
    setLoader(false)
    clearUpload()
    console.log("url clear is here")
    setUrlCrawler("")
    showNotification({
      title: 'Datei erfolgreich hochgeladen',
      message: 'Erfolg',
      type: 'success',
    })
    var nplus1_= false
    if(status != 401){
    nplus1_= nPLus1
    }
    let formData = { url: urlCrawler, allowDeepCrawl: nplus1_ ? "1" : "0" ,  userId: curUser?.id, jobId: res, username: crawlURLUsername, password: crawlURLPassword }


    const response = fetch(
      ServerCrawl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    ).then(response => response.json())
      .then(data => {

      })
      .catch(error => console.error(error));
    }
    else{
      setCrawlJobControl(true)
                                        
      showNotification({
            title: 'URL Crawlling gestoppt',
            message: 'Bitte überprüfen Sie Ihre angegebene URL auf Fehler. Vergessen Sie nicht, den Benutzernamen und das Passwort einzugeben, wenn die URL passwortgeschützt ist.',
            type: 'error',
          })
    }

  }

  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    let formData = { user: currentUser?.id }
    setMainDiv(false)
    showNotification({
      title: 'Training initiiert',
      message: 'Der Chatbot wird auf Basis der Wissensdatenbank trainiert',
      type: 'info',
    })

    const response = fetch(
      SERVER_URL_parsefunctions + "/startEmbeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": "what2study",
          "X-Parse-Master-Key": "what2studyMaster",
        },
        body: JSON.stringify(formData),
      }
    );
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };
  function tagsContainer() {
    return (
      <TagComponent saveCallback={(tagsArr) => {
        setTagsArray(tagsArr) 
      }} 
      />
    )
  }
  return (
    <PageContainer pageId='1'
      title='Wissensdatenbank'>
         <Tooltip title={"Der Chatbot 'weiß' zunächst nichts über Ihre Hochschule. Fügen Sie Dateien und URLs hinzu, damit der Chatbot auf diese Inhalte zugreifen kann. Bereits hinzugefügte Dateien und URLs finden Sie unten in der aktuellen Wissensdatenbank."} >
                              <InfoCircleOutlined style={{marginLeft:"175px", marginTop:"-55px", position:"absolute",color:"#1477ff"}}/>
                          </Tooltip>
      <div style={mainDiv == false ? disable : enable}>
        <Row style={{ justifyContent: "right" }}>
          {mainDiv == true && crawlJobControl==true ?  <Button
            onClick={(e) => {
              showModal()

            }} style={{ boxShadow: "0 0 15px #ff0000ab", height: "70px", lineHeight: "30px" }} icon={<ApiTwoTone style={{ fontSize: '250%', color: "#257dfe" }} />}>Training des Chatbots starten</Button>
          :<div><Button
           disabled
           style={{ boxShadow: "0 0 15px #ff0000ab", height: "70px", lineHeight: "30px" }} icon={<ApiTwoTone style={{ fontSize: '250%', color: "#257dfe" }} />}>Training des Chatbots starten</Button>
           <br></br><br></br><p style={{color:"red"}}>Bitte warten Sie, bis der Ladevorgang abgeschlossen ist</p></div>
          
          }

        </Row>
        {mainDiv ? <div>
          <fieldset style={{ width: "100%" }}>
            <legend>Neues Wissen hinzufügen</legend>
            <Tabs
              defaultActiveKey="1"
              type="card"
              size={size}

              items={new Array(4).fill(null).map((_, i) => {
                const id = String(i + 1);
                return {
                  label: <>{id == "1" ? <>PDF</> : id == "2" ? <>Text</> : id == "3" ? <>Medien</> : <>URL</>}</>,
                  key: id,
                  children: <>
                    {id == "1" ?

                      <div style={{ background: "white", height: "380px", marginTop: "-13px", marginLeft: "2px", padding: "10px" }}>
                        <Row>
                          <Col span={14} style={{ marginTop: "20px" }}>
                            <Upload {...props} maxCount={1} listType='picture' fileList={fileList}>

                              <Button style={{ width: "450px", height: "150px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '350%', color: "#257dfe" }} />}><br></br><span>Hochladen: Nur PDF-Dateien</span></Button>
                            </Upload>
                          </Col>
                          <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                            <Form.Item label='Priorität' name='chatbotLanguage' style={{ marginTop: "10px" }}>
                              <Select
                                style={{ width: "100px" }}
                                placeholder="Auswählen"
                                defaultValue={priority?priority:"Auswählen"}
                                key={priority}
                                onChange={(value) => {
                                  setPriority(value)
                                }}
                              >

                                <Option value='Hoch'>Hoch</Option>
                                <Option value='Mittel'>Mittel</Option>

                                <Option value='Niedrig'>Niedrig</Option>

                              </Select>

                            </Form.Item>
                          </Col>
                          <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                            <Form.Item label='Gültigkeit bis' name='chatbotLanguage' style={{ marginTop: "10px" }}>

                              <DatePicker 
                              disabledDate={(current) => {
                                return dayjs().add(0, 'month')  >= current;
                                }}
                                key={expires+"pdf"} defaultValue={expires!= undefined ? dayjs(expires, monthFormat):undefined} format={monthFormat} picker="month" onChange={(e, s) => {
                                console.log(s)
                                setExpiry(s)
                              }} />

                            </Form.Item>

                          </Col>
                          {/* <Col span={2} >
                            <Form.Item name='' style={{ marginTop: "10px" }}>

                              <Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                setLoader(true)
                                submitKnowledgeBase("pdf")

                              }}>
                                Hinzufügen
                              </Button>
                            </Form.Item>

                          </Col> */}
                        </Row>
                        <Row style={{ marginTop: "70px" }}>
                      {tagsContainer()}
                        </Row>
                        <Row gutter={24} style={{justifyContent:"end", bottom:"0", position:"absolute", right:"0", marginRight:"25px"}}>
                            <Form.Item name='' style={{ marginTop: "10px" }}>

                              <Button disabled={hinzfugStatus } type="primary" icon={<SendOutlined />} onClick={(e) => {
                                setLoader(true)
                                submitKnowledgeBase("pdf")
                              }}>
                                Hinzufügen
                              </Button>
                            </Form.Item>

                          </Row>
                        {loader == true && <Row style={{ justifyContent: "center" }}>

                          <div className="loader">
                            <Spin size="large" /><span> Upload in Bearbeitung</span>
                          </div>

                        </Row>}
                      </div>
                      : id == "2" ?




                        <div style={{ background: "white", height: "380px", marginTop: "-13px", marginLeft: "2px", padding: "10px" }}>
                          <Row>
                            <Col span={14} style={{ marginTop: "20px" }}>
                              <Upload {...propsText} maxCount={1} listType='text' fileList={fileList}>
                                <Button style={{ width: "450px", height: "150px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '350%', color: "#257dfe" }} />}><br></br><span>Hochladen: Nur Textdateien</span></Button>

                              </Upload>
                            </Col>
                            <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                              <Form.Item label='Priorität' name='chatbotLanguage' style={{ marginTop: "10px" }}>
                                <Select
                                  style={{ width: "100px" }}
                                  placeholder="Auswählen"
                                  // defaultValue={priority}
                                  defaultValue={priority?priority:"Auswählen"}
                                  key={priority}
                                
                                  onChange={(value) => {
                                    setPriority(value)
                                  }}
                                >

                                  <Option value='Hoch'>Hoch</Option>
                                  <Option value='Mittel'>Mittel</Option>

                                  <Option value='Niedrig'>Niedrig</Option>

                                </Select>

                              </Form.Item>
                            </Col>
                            <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                              <Form.Item label='Gültigkeit bis' name='chatbotLanguage' style={{ marginTop: "10px" }}>

                                <DatePicker  disabledDate={(current) => {
                                return dayjs().add(0, 'month')  >= current;
                                }} key={expires+"text"}defaultValue={expires!= undefined ? dayjs(expires, monthFormat):undefined} format={monthFormat} picker="month" onChange={(e, s) => {
                                  setExpiry(s)
                                }} />

                              </Form.Item>

                            </Col>
                            {/* <Col span={2} >
                              <Form.Item name='' style={{ marginTop: "10px" }}>

                                <Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                  setLoader(true)

                                  submitKnowledgeBase("text")
                                }}>
                                  Hinzufügen
                                </Button>
                              </Form.Item>

                            </Col> */}
                          </Row>
                          <Row style={{ marginTop: "70px" }}>

                            <TagComponent saveCallback={(tagsArr) => {
                              setTagsArray(tagsArr)
                            }}  />
                          </Row>
                          <Row gutter={24} style={{justifyContent:"end", bottom:"0", position:"absolute", right:"0", marginRight:"25px"}}>
                            <Form.Item name='' style={{ marginTop: "10px" }}>

                              <Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                setLoader(true)
                                submitKnowledgeBase("text")
                          
                              }}>
                                Hinzufügen
                              </Button>
                            </Form.Item>

                          </Row>
                          {loader == true && <Row style={{ justifyContent: "center" }}>

                            <div className="loader">
                              <Spin size="large" /><span> Upload in Bearbeitung</span>
                            </div>

                          </Row>}
                        </div> : id == "3" ?


                          <div style={{ background: "white", height: "550px", marginTop: "-13px", marginLeft: "2px", padding: "10px" }}>
                            <Row>
                              <Col span={14} style={{ marginTop: "20px" }}>
                                <Upload {...propsMedia} maxCount={1} listType='text' >
                                  <Button style={{ width: "450px", height: "150px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '350%', color: "#257dfe" }} />}><br></br><span>Hochladen: Nur Bilder und Videos (jpg, png, mp4)</span></Button>

                                </Upload>
                              </Col>
                              <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                                <Form.Item label='Priorität' name='chatbotLanguage' style={{ marginTop: "10px" }}>
                                  <Select
                                    style={{ width: "100px" }}
                                    placeholder="Auswählen"
                                    defaultValue={priority?priority:"Auswählen"}
                                    key={priority}
                                  // defaultValue={priority}
                                    onChange={(value) => {
                                      setPriority(value)
                                    }}
                                  >

                                    <Option value='Hoch'>Hoch</Option>
                                    <Option value='Mittel'>Mittel</Option>

                                    <Option value='Niedrig'>Niedrig</Option>

                                  </Select>

                                </Form.Item>
                              </Col>
                              <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                                <Form.Item label='Gültigkeit bis' name='chatbotLanguage' style={{ marginTop: "10px" }}>

                                  <DatePicker  disabledDate={(current) => {
                                return dayjs().add(0, 'month')  >= current;
                                }} key={expires+"mdeia"} defaultValue={expires!= undefined ? dayjs(expires, monthFormat):undefined} format={monthFormat} picker="month" onChange={(e, s) => {
                                    setExpiry(s)
                                  }} />

                                </Form.Item>

                              </Col>
                              {/* <Col span={2} >
                                <Form.Item name='' style={{ marginTop: "10px" }}>

                                  <Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                    setLoader(true)

                                    submitKnowledgeBase("media")
                                  }}>
                                    Hinzufügen
                                  </Button>
                                </Form.Item>

                              </Col> */}
                            </Row>
                            <Row style={{ marginTop: "10px" }}>
                              <Form.Item name='Abschrift' label="Transkription/Beschreibung der Mediendatei" style={{ marginTop: "10px" }}>

                                <TextArea
                                  onChange={(e) => setTranscript(e.target.value)}
                                  placeholder=""
                                  autoSize={{ minRows: 7, maxRows: 8 }}
                                  style={{ width: "650px" }}
                                />
                              </Form.Item>

                            </Row>
                            <Row style={{ marginTop: "70px" }}>
                              <TagComponent saveCallback={(tagsArr) => {
                                setTagsArray(tagsArr)
                              }}  />
                            </Row>
                            <Row gutter={24} style={{justifyContent:"end", bottom:"0", position:"absolute", right:"0", marginRight:"25px"}}>
                            <Form.Item name='' style={{ marginTop: "10px" }}>

                              <Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                setLoader(true)
                                console.log("image upload req")
                                submitKnowledgeBase("media")

                              }}>
                                Hinzufügen
                              </Button>
                            </Form.Item>

                          </Row>
                            {loader == true && <Row style={{ justifyContent: "center" }}>

                              <div className="loader">
                                <Spin size="large" /><span> Upload in Bearbeitung</span>
                              </div>

                            </Row>}
                          </div> : <div style={{ background: "white", height: "620px", marginTop: "-13px", marginLeft: "2px", padding: "10px" }}>
                            <Row>
                              <Col span={14} style={{ marginTop: "20px" }}>

                              </Col>
                              <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                                <Form.Item label='Priorität' name='chatbotLanguage' style={{ marginTop: "10px" }}>
                                  <Select
                                    style={{ width: "100px" }}
                                    placeholder="Auswählen"
                                    defaultValue={priority?priority:"Auswählen"}
                                    key={priority}
                                  
                                    // defaultValue={priority}
                                    onChange={(value) => {
                                      setPriority(value)
                                    }}
                                  >

                                    <Option value='Hoch'>Hoch</Option>
                                    <Option value='Mittel'>Mittel</Option>

                                    <Option value='Niedrig'>Niedrig</Option>

                                  </Select>

                                </Form.Item>
                              </Col>
                              <Col span={5} style={{display:"flex", justifyContent:"end"}} >

                                <Form.Item label='Gültigkeit bis' name='chatbotLanguage' style={{ marginTop: "10px" }}>

                                  <DatePicker  disabledDate={(current) => {
                                return dayjs().add(0, 'month')  >= current;
                                }} key={expires+"url"} defaultValue={expires!= undefined ? dayjs(expires, monthFormat):undefined} format={monthFormat} picker="month" onChange={(e, s) => {
                                    setExpiry(s)
                                  }} />

                                </Form.Item>

                              </Col>
                              {/* <Col span={2} >
                                <Form.Item name='' style={{ marginTop: "10px" }}>

                                  <Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                    console.log(urlCrawler)
                                    fetch(urlCrawler, { mode: 'no-cors'})

                                      .then(async (response) => {
                                       
                                        if (!response.ok) {
                                          console.log(response)
                                          if(crawlURLUsername !="" && crawlURLPassword!=""){
                                            saveCrawlData(url, 401)
                                          }
                                          else{
                                          showNotification({
                                            title: 'URL Crawlling gestoppt',
                                            message: 'Bitte überprüfen Sie Ihre angegebene URL auf Fehler. Vergessen Sie nicht, den Benutzernamen und das Passwort einzugeben, wenn die URL passwortgeschützt ist.',
                                            type: 'error',
                                          })}
                                      
                                          // if (response.status == 401) {
                                          //   if(crawlURLUsername !="" && crawlURLPassword!=""){
                                          //     saveCrawlData(url, 401)
                                          //   }
                                          //   else{
                                          //   showNotification({
                                          //     title: 'URL Crawlling gestoppt',
                                          //     message: 'Bitte überprüfen Sie Ihre angegebene URL auf Fehler. Vergessen Sie nicht, den Benutzernamen und das Passwort einzugeben, wenn die URL passwortgeschützt ist.',
                                          //     type: 'error',
                                          //   })
                                          // }
                                          // }
                                          // else{
                                          //   saveCrawlData(url,0)
                                          // }
                                        }
                                       else { 
                                        saveCrawlData(url,0) };
                                      })
                                      .catch((error) => {
                                           
                                        console.log(error);
                                        showNotification({
                                          title: 'URL Crawlling gestoppt',
                                          message: 'Bitte überprüfen Sie Ihre angegebene URL auf Fehler. Vergessen Sie nicht, den Benutzernamen und das Passwort einzugeben, wenn die URL passwortgeschützt ist.',
                                          type: 'error',
                                        })
                                      });
                                  }}>
                                    Hinzufügen
                                  </Button>
                                </Form.Item>

                              </Col> */}
                            </Row>
                            <Row>

                              <Col span={14}  >


                                <Form.Item label='URL einer Webseite eingeben' name='crawlerUrl' tooltip={ "Wenn auf der von Ihnen hinzugefügten URL auf weitere URLs oder PDFs verwiesen wird, kann der Chatbot in seiner Antwort darauf verweisen. Die Inhalte der verlinkten URLs oder PDFs verwendet der Chatbot jedoch nicht in seiner Antwort." }
                                >
                                  <Input
                                    // addonBefore="http://"
                                    placeholder='university.de'
                                    id='crawlURLInput'
                                    // key={urlCrawler}
                                    defaultValue={urlCrawler}
                                    onChange={(e) => {
                                      var val: string = e.target.value

                                      if (e.target.value != "") {
                                        if (!val.includes("https://")) {
                                          val = "https://" + val
                                        }
                                      }
                                      setUrlCrawler(val)

                                    }
                                    }
                                  />  
                                
                                </Form.Item >
                                <br></br>
                                <p>Geben Sie Authentifizierungsdaten für passwortgeschützte URLs ein.</p>
                                <Form.Item label='Benutzername' name='BenutzernameCRAWL' id='BenutzernameCrawl' style={{width:"300px"}}>
                                  <Input id='usernamepasswrodwebcrawl' key="usernameCrawl"
                                    onChange={(e) => setCrawlUsername(e.target.value)} />
                                </Form.Item>

                                <Form.Item label='Passwort' name='passwordCrawl' id='passworCrawl' style={{width:"300px"}}>
                                  <Input.Password
                                    id='passwrodwebcrawl' key="passwordCrawl"
                                    onChange={(e) => setCrawlPass(e.target.value)}
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}

                                  />
                               
                                </Form.Item>
                                <p style={{fontWeight:"50", color:"red", marginTop:"-20px"}}> Wenn die Authentifizierungsdaten nicht angegeben werden, schlägt das Crawlen der URL fehl.</p>
                              
                              </Col>
                            </Row>
                            <Row style={{ marginTop: "10px" }}>
                              <Form.Item name='Abschrift' label="Web-Crawler Konfiguration" style={{ marginTop: "10px" }}>

                                <Checkbox  key={ ""+nPLus1} defaultChecked={nPLus1} onChange={(e) => {
                                  setNPLus1(e.target.checked)

                                }}>Hierarchische Abfrage (n+1)</Checkbox> 
                                <Tooltip title={"Mit der hierarchischen Abfrage werden bis zu 40 verlinkte Unterseiten gleichzeitig in die Datenbank eingetragen."} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>
    </Form.Item> 
                            </Row>
                            <p style={{fontWeight:"50", color:"orange", marginTop:"-20px"}}>Deep Crawl wird für passwortgeschützte URLs automatisch deaktiviert.</p>
                          
                            <Row style={{ marginTop: "70px" }}>
                              <TagComponent saveCallback={(tagsArr) => {
                                setTagsArray(tagsArr)
                              }} />  <Tooltip title={"Mit den Tags können Sie die Dateien und URLs mit Schlagworten versehen. Wenn das Schlagwort im Chat genutzt wird, greift der Chatbot auf die Datei/URL zu, die mit diesem Tag versehen wurde."} >
                              <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
                          </Tooltip>
                            </Row>
                            <Row gutter={24} style={{justifyContent:"end", bottom:"0", position:"absolute", right:"0", marginRight:"25px"}}>
                                <Form.Item name='' style={{ marginTop: "10px" }}>

                                  {crawlJobControl==false ? <Button disabled>Hinzufügen</Button> :<Button type="primary" icon={<SendOutlined />} onClick={(e) => {
                                    console.log(urlCrawler)
                                    setCrawlJobControl(false)
                                    
                                    fetch(urlCrawler,)

                                      .then(async (response) => {
                                        setCrawlJobControl(false)
                                    
                                       console.log("resp check")
                                       console.log(response)
                                        if (!response.ok) {
                                          console.log(response)
                                          if(crawlURLUsername !="" && crawlURLPassword!=""){
                                            saveCrawlData(url, 401)
                                          }
                                          else{
                                          showNotification({
                                            title: 'URL Crawlling gestoppt',
                                            message: 'Bitte überprüfen Sie Ihre angegebene URL auf Fehler. Vergessen Sie nicht, den Benutzernamen und das Passwort einzugeben, wenn die URL passwortgeschützt ist.',
                                            type: 'error',
                                          })}
                                      
                                          // if (response.status == 401) {
                                          //   if(crawlURLUsername !="" && crawlURLPassword!=""){
                                          //     saveCrawlData(url, 401)
                                          //   }
                                          //   else{
                                          //   showNotification({
                                          //     title: 'URL Crawlling gestoppt',
                                          //     message: 'Bitte überprüfen Sie Ihre angegebene URL auf Fehler. Vergessen Sie nicht, den Benutzernamen und das Passwort einzugeben, wenn die URL passwortgeschützt ist.',
                                          //     type: 'error',
                                          //   })
                                          // }
                                          // }
                                          // else{
                                          //   saveCrawlData(url,0)
                                          // }
                                        }
                                       else { 
                                        saveCrawlData(url,0) };
                                      })
                                      .catch((error) => {
                                           
                                            saveCrawlData(url,0)   
                                                                            
                                        console.log(error);
                                      });
                                  }}>
                                    Hinzufügen
                                  </Button>}
                                </Form.Item>

                          </Row>
                            {loader == true && <Row style={{ justifyContent: "center" }}>

                              <div className="loader">
                                <Spin size="large" /><span> Upload in Bearbeitung</span>
                              </div>

                            </Row>}
                          </div>
                    }
                  </>,
                };
              })}
            />


          </fieldset>


          <fieldset style={{  marginTop: "100px", overflowX:"auto" }}>
            <legend> Aktuelle Wissensdatenbank</legend>
            <>{tableJSX}</>


          </fieldset>

          {activeChatbotID &&
            <>
              <div style={{
                position: "fixed",
                bottom: 0,
                right: 0
              }}>
                
                {/* <div className='speech-bubble'>Klick mich</div> */}
              </div>
              {/* <ChatClient
                objectId={activeChatbotID}
                userId={curUserId}
                universityId={curUserId}
                accessToken={token}
                chatbotId={activeChatbotID}
              ></ChatClient> */}
              
              </>
              }
        </div> :
          <div>
            <Row style={{ justifyContent: "center" }}><video width="300" height="250" autoPlay loop >
              <source src="https://cpstech.de/chatanimation" type="video/mp4" />
            </video></Row>
            <Row>

              <h3 style={{ marginBlock: "40px", width: "600px", marginLeft: "30%" }}>Das Training des Chatbots kann je nach Größe und Anzahl der Dateien stark variieren (von einigen Sekunden bis zu einer Stunde). <br></br><br></br>

                Da das Training serverseitig abläuft, können Sie den Tab schließen, zu einem anderen Tab wechseln oder sich von der Plattform abmelden. Das Training wird dadurch nicht unterbrochen.<br></br><br></br>

                Beachten Sie, dass Sie und die Benutzer auch während eines laufenden Trainingsprozesses mit dem Chatbot interagieren können (basierend auf der vorherigen Wissensdatenbank).</h3><br></br>
            </Row>
          </div>
        }
      </div>
      <Modal
        open={open}
        title="Traningsprozess starten "
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Starten"
        cancelText="Abbrechen"
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <h3 style={{ marginBlock: "40px", marginLeft: "50px", marginRight: "50PX" }}>Bevor Sie den Trainingsprozess starten, vergewissern Sie sich, dass Sie alle relevanten Dateien und URLs unter "Aktuelle Wissensdatenbank" über den Button "Hinzufügen" aufgenommen haben. <br></br><br></br>

          Der Trainingsprozess kann nicht gestoppt werden und kann mehrere Minuten dauern.
          
          </h3>
          <h4 style={{marginBlock: "40px", marginLeft: "20px", marginRight: "20PX" ,fontStyle:"italic"}}> Sie sind dafür verantwortlich, dass alle von Ihnen hochgeladenen Inhalte rechtmäßig sind und Sie über die erforderlichen Rechte zur Nutzung und Verarbeitung verfügen. Mit dem Hochladen bestätigen Sie, dass keine Rechte Dritter verletzt werden und die Inhalte den geltenden rechtlichen Vorschriften entsprechen. Bei Bedarf sollte eine Abstimmung mit der jeweils zuständigen Rechtsabteilung stattfinden.
         </h4>
      </Modal>
    </PageContainer >
  )
}

export default Overview
function createBrowserHistory(arg0: { basename: string }): History {
  throw new Error('Function not implemented.')
}

