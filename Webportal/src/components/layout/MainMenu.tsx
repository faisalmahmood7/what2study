import { Button, Menu, Progress } from 'antd'
import {
  BarChartOutlined,
  ShopOutlined,
  TeamOutlined,
  QuestionOutlined,
  PushpinOutlined,
  FlagOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  ApiFilled,
  DashboardOutlined,
  TagOutlined,
  ApiOutlined,
  WarningOutlined,
  WarningTwoTone,
  WechatOutlined
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import Parse from 'parse'
import { useEffect, useState } from 'react'
import { UserType, getCurrentUser } from '../../types/user'

type MainMenuProps = {
  activeTab: string
}
const MainMenu = ({ activeTab }: MainMenuProps) => {
  const location = useLocation<Object>()

  const company = getCurrentUser()
  const [attributes, setAttributes] = useState({
    ...(company?.attributes as UserType),
  })
  const [statusBar, setStatusBar] = useState<boolean>(false)

  const [statusBarUpload, setStatusBarUpload] = useState<boolean>(false)
  var embeddingStatus = Parse.Object.extend("embeddingStatus");
  var q2 = new Parse.Query(embeddingStatus);
  q2.subscribe().then(async function (sub) {
      sub.on('update', function (message) {
       
         if(message.attributes.user ==Parse.User.current()?.id )
         {
          if(message.attributes.status == 0){
            setStatusBar(false)
            console.log("subscription")
          }
          else{
            setStatusBar(true)
          }
        }
      });   
  });
  var knowledgeBase = Parse.Object.extend("knowledgeBase");
  var q3 = new Parse.Query(knowledgeBase);
  q3.subscribe().then(async function (sub) {
    sub.on('update', function (message) {
     
       if(message.attributes.user ==Parse.User.current()?.id )
       {
        if(message.attributes.learnStatus == false){
          setStatusBarUpload(true)
        }
        else{
          setStatusBarUpload(false)
        }
      }
    });   
    sub.on('create', function (message) {
     
      if(message.attributes.user ==Parse.User.current()?.id )
      {
       if(message.attributes.learnStatus == false){
        setStatusBarUpload(true)
       }
       else{
        setStatusBarUpload(false)
       }
     }
   });   
});

  useEffect(()=>{
    var knowledgeBase = Parse.Object.extend("knowledgeBase");
    var q3 = new Parse.Query(knowledgeBase);
    q3.equalTo("user", Parse.User.current()?.id)
    q3.equalTo("learnStatus", false)
    
    q3.first().then((el)=>{
      if(el != undefined)
         { 
          setStatusBarUpload(true)
        }
          else{
            setStatusBarUpload(false)
            
            setStatusBar(false)
          }
      
    }
    
    )

    // var embeddingStatus = Parse.Object.extend("embeddingStatus");
    // var q4 = new Parse.Query(embeddingStatus);
    // q4.equalTo("user", Parse.User.current()?.id)
    // q4.equalTo("status", 1)
    
    // let result = q4.first().then((el)=>{
    //   if(el){
    //     setStatusBarUpload(true)
    //   }
    //   else{
    //     setStatusBarUpload(false)
    //     setStatusBar(false)
      
    
    //   }
      
    // }

    
    // )
  },[])
  const func = async (e) => {
    if (location.state != undefined) {

      if (location.state["changedstate"]) {
        if (location.pathname.startsWith("/what2study/home")) {
          // history.push('/updateState')
          localStorage.setItem("updated", "home");
          localStorage.setItem("updatedObj", JSON.stringify(location.state["unSavedObj"]));
        }
        if (location.pathname.startsWith("/what2study/generalOffersState") && location.state["parseRef"]) {
          // try {
          localStorage.setItem("updated", "generalOffersState");
          localStorage.setItem("updatedObj", JSON.stringify(location.state["unSavedObj"]));
          localStorage.setItem("id", location.state["parseRef"].id);
          localStorage.setItem("className", location.state["parseRef"].className);
        }
        if (location.pathname.startsWith("/what2study/intentsState") && location.state["parseRef"]) {
          // try {
          localStorage.setItem("updated", "intentsState");
          localStorage.setItem("updatedObj", JSON.stringify(location.state["unSavedObj"]));
          localStorage.setItem("id", location.state["parseRef"].id);
          localStorage.setItem("className", location.state["parseRef"].className);
        }
       
       
      }
    }
  }

  const user = Parse.User.current()
  const role: 'admin' | 'company' | undefined = user?.attributes.role
  
  return (
    < >
      <Menu style={{ position:"fixed", width:"200px", height:"inherit" }} onClick={() => { func({ e: Event }) }} defaultSelectedKeys={[activeTab]} mode='inline'>


          <Menu.Item key='4' style={{marginTop:"15px"}} icon={<ShopOutlined />}>
            <Link to={{ pathname: ROUTES.COMPANY_URL, state: { prevPath: location.pathname } }}> Allgemein</Link>
          </Menu.Item>
      
        <Menu.Item key='15' icon={<TeamOutlined />}>
          <Link to={{ pathname: ROUTES.General, state: { prevPath: location.pathname } }}>Chat-Client</Link>
        </Menu.Item>
        <Menu.Item key='1' icon={<ApiOutlined />}>
          <Link to={{ pathname: "/what2study/database", state: { prevPath: location.pathname } }} >Datenbank</Link>
        </Menu.Item>
        <Menu.Item key='5' icon={<TagOutlined />}>
          <Link to={{ pathname: ROUTES.Intents, state: { prevPath: location.pathname } }} >Szenarien</Link>
        </Menu.Item>
        <Menu.Item key='6' icon={<DashboardOutlined />}>
          <Link to={{ pathname: "/what2study/monitoring", state: { prevPath: location.pathname } }} >Monitoring</Link>
        </Menu.Item>
        <Menu.Item key='7' icon={<WechatOutlined/>}>
          <Link to={{ pathname: "/what2study/chatwindow", state: { prevPath: location.pathname } }} >Chatbot</Link>
        </Menu.Item>
        <div style={{left: "0", position: "absolute",  bottom: "0", marginBottom: "135px", marginLeft: "35px"}}
       >
         {/* {(attributes.localModel == false && attributes.openAIKey=="" )? <p>enter openAI key</p>:<></>} */}

        { statusBarUpload == false ?( statusBar== false ? <Progress
          type="circle"
          percent={100}
         
          trailColor="rgba(0, 0, 0, 0.06)"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}format={() => 'fertig'}
        ></Progress> : <Progress
        type="circle"
        percent={63}
       
        trailColor="rgba(0, 0, 0, 0.06)"
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
        format={() => 'läuft...'}
      ></Progress>) :<Progress
      type="circle"
      percent={0}
      size={130}
      strokeWidth={6}
      trailColor="rgb(238 218 196)"
      strokeColor={{
        '0%': '#108ee9',
        '100%': '#87d068',
      }}
      format={() => <><WarningTwoTone style={{fontSize:"40px"}} twoToneColor={"orange"}/> <br></br><p style={{fontSize:"18px", marginTop:"10px"}}>  Ausstehend</p></>}
    ></Progress>}
          <p style={{marginTop:"20px", marginLeft:"25p"}}>Chatbot-Lernstatus</p>
      
        </div>
       </Menu>
    </>
  )
}

export default MainMenu
