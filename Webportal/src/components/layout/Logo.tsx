import { Space, Button, Switch, Radio, Modal, Row, Col, Form, Input, Menu, Tabs } from 'antd'
import styledComponents from 'styled-components'
import { curUser, getCurrentUser, logout, updateUser, UserType } from '../../types/user'
import { useHistory } from 'react-router-dom'
import Parse from 'parse'
import { LogoutOutlined, SettingOutlined, AppstoreOutlined, MailOutlined, MailFilled, AccountBookFilled, AppleOutlined, AndroidOutlined, AccountBookOutlined, InfoCircleFilled } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { showNotification } from '../../helpers/notification'

import { SERVER_URL, SERVER_URL_parsefunctions } from '../../config/parse';
const Initial = styledComponents.h1`
  font-weight: 800;
  color: #fd1f1f;
`
const Initial2 = styledComponents.h1`
  font-weight: 700;
  color: green;
  margin-left: -7px
`
const Logo = () => {
  const [currentUserObj, setCurrUser] = useState<UserType | any>(getCurrentUser())
  const history = useHistory()

  const [modal2Open, setModal2Open] = useState(false);


  const company = getCurrentUser()

  const [attributes, setAttributes] = useState({
    ...(company?.attributes as UserType),
  })
  const [openAIKey, setKey] = useState<string>(attributes.openAIKey);

  const [switchOPT1, setSwitchOPT1] = useState<Boolean>(!attributes.localModel);
  const [localModelSelection, setLocalModelSelection] = useState<Boolean>(attributes.localModel);
  useEffect(() => {
    setAttributes({ ...attributes, openAIKey: openAIKey })
  }, [openAIKey])
  const [current, setCurrent] = useState('mail');
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        borderBottom: "solid 1px darkgray"
      }}
    >
      <Space>
        {/* add your image src */}
        <img onClick={() => { window.location.reload() }} style={{ cursor: "pointer", width: "180px", height: "55px" }} src=""></img>
        <h1 style={{ marginTop: "35px", font: "revert", fontSize: "larger" }}>WEB PLATTFORM</h1>
      </Space>
      <Space>

        {(company?.attributes?.username == "api@api.com" || company?.attributes?.username == "admin@admin.de") && <Radio.Group disabled={false} onMouseEnter={(e) => {

        }} onChange={async (e) => {
          history.push("/what2study/home")
          var x
          // if (e.target.value == 'b') { x = await updateUser({ ...attributes, mode: e.target.value, isCompany: true }) }
          // else {
          //   x = await updateUser({ ...attributes, mode: e.target.value })
          // }
          // if (x.error == false) {
          //   window.location.reload()
          // }
        }} defaultValue={"b"}>
          <Radio.Button value="a">Normal Mode</Radio.Button>
          <Radio.Button value="b">API mode</Radio.Button>
        </Radio.Group>
        }
       
        <Button style={{ width: "142px", marginRight: "5px" }} onClick={() => {
          setModal2Open(true)
        }}><span>Einstellungen</span><SettingOutlined style={{ fontSize: "18px" }} /></Button>

        <Button style={{ width: "92px", marginRight: "5px" }} onClick={() => {
          logout()
          history.push("/what2study/home")
        }}><span>Logout</span><LogoutOutlined style={{ fontSize: "18px" }} /></Button>

        <Modal
          title="Einstellungen"
          centered
          width={"80%"}
          open={modal2Open}
          closeIcon={true}
          maskClosable={false}
          onCancel={() => { 

          setModal2Open(false) 
          
          }}
          cancelButtonProps={{ style: { display: 'none' } }}
          onOk={async () => {

            setModal2Open(false)


          }}
          footer={[
            <Button key="submit" type="primary"  
            >
              Speichern
            </Button>,
             ]}
        >
          <fieldset className="fieldsetCustom">
            <legend></legend>
            <Tabs
              defaultActiveKey="1"
              tabPosition="left"
              items={[AppstoreOutlined, AccountBookOutlined].map((Icon, i) => {
                const id = String(i + 1);
                return {
                 
                  key: id,
                  label: <span style={{width:"150px"}}>{id == "1" ? <>Chatbot-Modell</> : id == "2" ? <span style={{ cursor: "not-allowed",
                    backgroundColor: "rgb(229, 229, 229) !important"}}>Account</span> : <></>}</span>,
                  children:

                    <>
                    {id=="1"?
                     <> <label>Modelltyp auswählen:</label><span> 
                      {/* localModelSelection == false ? true: */}
                      <Switch checkedChildren="OpenAI API" unCheckedChildren="Lokales Modell" defaultChecked={ true} onChange={(e) => {
                        setSwitchOPT1(e)
                        // setAttributes({ ...attributes, localModel: !e })
             
                      }} /></span>

                      {switchOPT1 == true ? <Row gutter={24} style={{ marginTop: '40px' }}>
                        <Col span={8}>
                          <Form.Item label={'OpenAI API-Schlüssel'} name='apiKey' rules={[


                          ]}>
                            <Input
                              // defaultValue={openAIKey}
                              defaultValue={"********************************"}
                              disabled
                              style={{ width: "500px" }}
                              // onChange={async (e) => {
                              //   await setKey(e.target.value)
                              //   await setAttributes({ ...attributes, openAIKey: e.target.value })
                              // 
                            // }
                              // }
                            />
                            {/* <Button style={{ marginTop: "10px" }} type='primary' size='middle'> Aktualisieren / Schlüssel speichern</Button> */}
                          </Form.Item>
                        </Col>

                      </Row> : 
                      <Row style={{ marginTop: "40px" }} gutter={24}>
                        <Col span={9}>
                        <h3 ><strong>Chat Model</strong></h3>
                          <ul>
                          <li><p style={{marginTop:"20px"}}><strong> Ausgewählt:</strong> Mixtral</p></li>
                          <li> <p><strong> Modellgröße:</strong> 47b</p></li>
                          <li><p><strong> Typ: </strong> Lokal (<a href={"https://huggingface.co/"}>Hugging Face</a>)</p></li>
                          <li><p><strong> Datensicherheit:</strong> Modell läuft auf einem lokalen Server</p></li>
                          </ul>
                        </Col>
                        <Col span={12}>
                        <h3 ><strong>Embeddings Model</strong></h3>
                        <ul>
                          <li>
                           <p style={{marginTop:"20px"}}><strong> Ausgewählt:</strong> <a href={"https://huggingface.co/BAAI/bge-large-en-v1.5"}> BAAI/bge-large-en-v1.5</a></p></li>
                          <li> <p><strong> Typ: </strong> Lokal (<a href={"https://huggingface.co/"}>Hugging Face</a>)</p></li>
                          <li> <p><strong> Datensicherheit:</strong>  Datensicherheit: Modell läuft auf einem lokalen Server</p>
                         </li>
                          </ul>
                        </Col>
                      </Row>}
                      <p style={{marginTop:"50px"}}><InfoCircleFilled style={{marginRight:"5px"}}></InfoCircleFilled>Eine Änderung der Modellauswahl startet den Lernprozess des Modells, der einige Sekunden bis Minuten dauern kann.</p>
                     

                      <p style={{marginTop:"5px"}}><InfoCircleFilled style={{marginRight:"5px"}}></InfoCircleFilled> Wenn Sie OpenAI-Dienste nutzen und personenbezogene Daten verarbeiten, empfehlen wir, ein Data Processing Addendum (DPA) mit OpenAI abzuschließen, um die Datenschutzanforderungen gemäß DSGVO zu erfüllen. Sie können das DPA direkt über diesen Link abschließen: <a href={"https://ironcladapp.com/public-launch/63ffefa2bed6885f4536d0fe"}>[OpenAI DPA] </a>.</p>
</>
                      :
                      <>
                       {/* <h3>Change Password</h3>
                     
                      <Row style={{marginTop:"40px"}}><Col span={12}>
                          <p ><strong> Username:</strong> lokalAccount</p>
                          <p><strong> Current Password:</strong> *********</p> 
                          <p><strong>New Password:</strong><span><input></input></span></p> 
                      </Col></Row>
                      <Button style={{ marginTop: "10px" }} type='primary' size='middle'> Update/Save Password</Button>
                        */}
                      </>
                      }
                      </>,
                  icon: <Icon />,
                };
              })}
            />




          </fieldset>
        </Modal>


      </Space>
    </div>
  )
}

export default Logo
