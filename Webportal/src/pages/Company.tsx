import { useEffect, useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import {
  ConsoleSqlOutlined,
  DeleteTwoTone, InboxOutlined, InfoCircleOutlined, MinusCircleFilled, PlusCircleFilled, QuestionCircleOutlined
} from '@ant-design/icons'
import Parse from 'parse'
import { getCurrentUser, updateUser, UserType } from '../types/user'
import { showNotification } from '../helpers/notification'
import { useHistory, useLocation } from 'react-router-dom'
import { toBase64 } from '../helpers/toBase64'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { Form, Input, Row, Col, Image, Skeleton, Checkbox, Upload, Button, UploadProps, Popover,Tooltip } from 'antd'
import dayjs from "dayjs";
import { TimePicker } from "antd";
const Company = () => {
  const errorCss = { borderColor: "red" }
  const errorCssInvert = { borderColor: "rgb(217 217 217)" }
  const location = useLocation()
  const [logoBase64, setLogoBase64] = useState<any | null>()
  const [logoBase64Kontakt, setLogoBase64Kontakt] = useState<any | null>()
  const requiredField = <p style={{ color: "red", fontSize: "large", marginBottom: "" }}>* <span style={{ fontSize: "small", color: "#ae9c9c" }}>Dieser Wert ist erforderlich</span></p>
  const [companyLatLng, setCompanyLatLng] = useState<{ lat: number, lng: number }>({ lat: 0, lng: 0 })
  const company = getCurrentUser()
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [attributes, setAttributes] = useState({
    ...(company?.attributes as UserType),
  })
  const format = "HH:mm"
  const [changedState, setChangedState] = useState<boolean>(false)
  const [changecount, setchangecount] = useState<number>(0)
  const [errorsVal, setErrorsVal] = useState<{
    name: boolean,
    street: boolean,
    city: boolean,
    latlng: boolean,
    website: boolean,
    description: boolean,
    // changed:number
  }>({
    name: false, street: false,
    city: false,
    latlng: false,
    website: false,
    description: false,
    // changed:0
  })

  useEffect(() => {

    localStorage.setItem("identity", "platform_")
    if (changecount >= 3) {
      setChangedState(true)

      location.state = { changedstate: changedState, unSavedObj: attributes, parseRef: "" }
    }
    setchangecount(changecount + 1)
  }, [attributes])
  const propsProfile: UploadProps = {
    accept: "image/jpeg, image/png, image/jpg",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {
      if (file) {
        handleImageUpload(file, 'logo')
      }

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


  const [disableAusbildungButton, setDisableAusbildungButton] = useState<boolean>(false)
  useEffect(() => {
    if (changedState == true) {

      location.state = { changedstate: changedState, unSavedObj: attributes, parseRef: "" }
    }
  }, [changedState])

  useEffect(() => {
    if (logoBase64) {
      setAttributes({ ...attributes, logo: logoBase64 })
    }
  }, [logoBase64])

  var { name, username, website, Telefonnummer, logo, AllowKontaktEmail, AllowKontaktTele, monday, tuesday, wednesday, thursday, friday } = attributes
  const [tempPhone, setTempPhone] = useState<any>(attributes.Telefonnummer)
  const [anzeigname, setAnzeigname] = useState<string>()
  const [linkTreeUrl, setlinkTreeUrl] = useState<string>()
  const [errorsValChanged, setErrorCounter] = useState<number>(0)
  const [mondayStart, mondayEnd] = monday.split(",")
  const [tuesdayStart, tuesdayEnd] = tuesday.split(",")
  const [wednesdayStart, wednesdayEnd] = wednesday.split(",")
  const [thursdayStart, thursdayEnd] = thursday.split(",")
  const [fridayStart, fridayEnd] = friday.split(",")



  const onSave = async () => {
    const {
      name,
      website,
      AllowKontaktEmail,
      AllowKontaktTele
    } = attributes
    let errors: string[] = []

    // if (description.trim() === '') errors.push('Die job muss eine Beschreibung besitzen')
    if (name.trim() === '') {
      errors.push('You need to enter a name')
      var errorVal = errorsVal
      errorVal.name = true
      setErrorsVal(errorVal)
    }
    // if (!location) errors.push('Die job benötigt einen Standort')
    if (errors.length !== 0) {
      setErrorCounter(errorsValChanged + 1)
      showNotification({
        title: 'Fehler. Bitte überprüfen Sie Ihre Angaben',
        message: `Bitte korrigieren Sie die rot markierten Felder`,
        // n ${errors.map(
        //   (e) => '\n- ' + e
        // )}`,

        type: 'error',
        long: true,
      })
    }

    if (errors.length === 0) {
      setErrorsVal({
        name: false, street: false,
        city: false,
        latlng: false,
        website: false,
        description: false,
      })


      setLoading(true)
      const { error } = await updateUser({ ...attributes })
      setLoading(false)
      if (error)
        return showNotification({
          title: 'Fehler beim Speichern',
          message:
            'Etwas ist schief gelaufen. Bitte überprüfen Sie Ihre Angaben und versuchen es später erneut',
          type: 'error',
        })

      showNotification({
        type: 'success',
        title: 'Erfolgreich gespeichert',
        message: 'Ihre Organisation wurde erfolgreich gespeichert',
      })
      // window.location.reload();
      history.push('/what2study/home')
    }
  }

  const imageBaseToUrl = async (base64) => {
    const parseFile = new Parse.File("bild", { base64: base64 as string });
    const responseFile = await parseFile.save();
    const Gallery = Parse.Object.extend('Gallery');
    const gallery = new Gallery();
    gallery.set('bilds', responseFile);
    let response = await gallery.save();

    //setSource(response.attributes.picture._url)
    return response
  }
  const handleImageUpload = async (e, caller) => {
    const base64 = await toBase64(e).catch((err) =>
      showNotification({
        type: 'error',
        title: 'Fehler beim Hochladen',
        message: 'Beim Hochladen des Bildes ist ein Fehler aufgetreten.',
      })
    )
    var response = await imageBaseToUrl(base64 as string)
    var url = response.attributes.bilds._url
    if (Parse.serverURL.includes("cpstech")) {
      url = url.replace("http:", "https:")

    }
    else if (Parse.serverURL.includes("localhost")) {
      url = url.replace("https:", "http:")
    }

    if (caller == "logo") { setLogoBase64(url) }
    else {
      setLogoBase64Kontakt(url)
    }
  }

  const removeImage = () => {
    if (logo != undefined) {
      setAttributes({ ...attributes, logo: "" })
    }
    setLogoBase64(null)

  };


  if (!company) return null
  // handle input change for linktree anzeig name
  const handleAnzeigename = (e: { target: { name: any; value: any } }, index: number) => {
    setAnzeigname(e.target.value)
  };
  // handle input change for link tree url
  const handleLinkTreeURL = (e: { target: { name: any; value: any } }, index: number) => {
    var val: string = e.target.value
    if (!val.includes("https://")) {
      val = "https://" + val
    }
    // if(!isValidUrl(val)){
    //   showNotification({
    //     type: 'warning',
    //     title: 'Invalid URL',
    //     message: 'Please provide a valid URL for Verlinkungen'
    //   })
    // }
    // else{  
    setlinkTreeUrl(val)
    // }
  };


  const isValidUrl = urlString => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
  }
  return (
    <div>
      <PageContainer
        title={'Allgemein'}
        pageId='4'
        button
        buttonText='Speichern'
        buttonCallback={onSave}
        buttonLoading={loading}
      >
        <Form layout='vertical' name='basic' style={{ marginTop: '-50px' }} >
       
        {/* <Tooltip placement="right" title={"Auf dieser Seite können allgemeine Informationen zur Institution hinterlegt werden, wie Name und Logo, aber auch Kontaktinformationen, um Nutzer:innen mit weiterem Gesprächsbedarf eine Möglichkeit zur direkten Kontaktaufnahme zu bieten."}>
            <InfoCircleOutlined style={{marginLeft:"90px"}}/>
          </Tooltip> */}
          <fieldset className="fieldsetCustom">
          <Tooltip title={"Auf dieser Seite können allgemeine Informationen zur Institution hinterlegt werden, wie Name und Logo, aber auch Kontaktinformationen, um Nutzer:innen mit weiterem Gesprächsbedarf eine Möglichkeit zur direkten Kontaktaufnahme zu bieten."} >
        <InfoCircleOutlined style={{color:"#1477ff",marginLeft:"80px", marginTop:"-80px", position:"absolute"}}/>
    </Tooltip>
            <legend>Allgemeine Informationen:</legend>

            <Row gutter={24} style={{ marginTop: '10px' }}>
              <Col span={8}>
                <Form.Item label={'Name der Organisation'} name='companyName' rules={[


                ]}>
                  <Input
                    style={errorsVal.name ? errorCss : errorCssInvert}

                    defaultValue={name}
                    onChange={(e) => {
                      setAttributes({ ...attributes, name: e.target.value })
                      var errorVal = errorsVal
                      errorVal.name = false
                      setErrorsVal(errorVal)

                    }
                    }
                  />
                  {requiredField}
                </Form.Item>
                <Row gutter={24} >
                  <Col>
                    <label > E-Mail-Adresse</label>
                    <Input
                      style={{ marginTop: "5px" }}
                      disabled={true}
                      // placeholder="+4917 777 77777 89"
                      value={attributes.username}
                    ></Input>
                  </Col>
                </Row>
              </Col>
              <Col span={3}></Col>
              <Col span={4}>
                <Form.Item id="imageContainerProfile" tooltip='Profilbild hochladen' >
                  <label>Logo der Organisation:</label><Tooltip title={"Wählen Sie ein Logo aus, welches angezeigt werden soll, wenn eine direkte Kontaktaufnahme erfolgt. Verwenden Sie ein Bild mit möglichst hoher Auflösung, um die Darstellung zu verbessern."} >
        <InfoCircleOutlined  style={{color:"#1477ff"}}/>
    </Tooltip><br></br><br></br>
                  {logo ? <Image style={{ width: "100%", height: "100%" }} src={logo} /> : logoBase64 ? <Image style={{ width: "300px", height: "300px" }} src={logoBase64} /> :
                    <Upload {...propsProfile} maxCount={1} showUploadList={false}>
                      <Button style={{ height: "78px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '250%', color: "#257dfe" }} />}><br></br><span>Bild hochladen: JPEG/PNG-Datei</span>

                      </Button>

                    </Upload>


                  }

                </Form.Item>
                {logo &&
                  <Button style={{ fontSize: "15px", marginLeft: "30px" }} onClick={() => removeImage()}>Löschen<DeleteTwoTone style={{ marginTop: "2px", fontSize: "24px" }}></DeleteTwoTone></Button>
                }


              </Col>
            </Row>


            {/* <Form.Item label='URL' name='anzeigeURL'  
                   >
                    <Input
                    style={errorsVal.website ? errorCss : errorCssInvert}
                    defaultValue={website.replace("https://","")}
                    addonBefore="https://"
                    placeholder='university.de'
                    onChange={(e) => {
                      var val:string = e.target.value
                      
                      if(e.target.value!="")
                      {if(!val.includes("https://")){
                        val = "https://"+val
                      }}
                      var valid=isValidUrl(val)
                      if(valid)
                      {setAttributes({ ...attributes, website: val })
                      var errorVal = errorsVal
                      errorVal.website = false
                      setErrorsVal(errorVal)}
                      else{
                        setAttributes({ ...attributes, website: val })
                        var errorVal = errorsVal
                        errorVal.website = true
                        setErrorsVal(errorVal)}
                      
                    }
                    }
                  />
                   
                      <p style={errorsVal.website ? {color:'red', border:'solid', borderTopStyle:'outset'} : errorCssInvert}></p>
            
                  {requiredField}
                </Form.Item> */}





          </fieldset>

          <fieldset className="fieldsetCustom">
            <legend>Kontaktinformationen</legend>  <Tooltip title={"Möglichkeit, eine E-Mail-Adresse und/oder Telefonnummer für Nutzer:innen bereitzustellen, die direkten Kontakt wünschen."} >
        <InfoCircleOutlined style={{marginLeft:"160px", marginTop:"-50px", position:"absolute",color:"#1477ff"}}/>
    </Tooltip>
            <Row>
              <Col span={10}>
                <Row  >
                  <label style={{ marginBlock: "5px" }} > E-Mail-Adresse</label>
                  <Input

                    style={{ marginLeft: '10px', width: "200px" }}
                    // placeholder="+4917 777 77777 89"
                    defaultValue={attributes.kontaktEmail}
                    onChange={(e) => {
                      if (e) {
                        setAttributes({ ...attributes, kontaktEmail: e.target.value })
                      }
                    }}
                  ></Input>

                </Row>
                <Row style={{ marginTop: '30px' }}>
                  <label style={{ marginBlock: "5px" }}> Telefonnummer</label>
                  <PhoneInput
                    style={{ marginLeft: '10px' }}
                    defaultCountry="DE"
                    // placeholder="+4917 777 77777 89"
                    value={tempPhone != "" ? tempPhone : "+49 "}
                    onChange={(e) => {
                      if (e) {
                        setTempPhone(e)
                        setAttributes({ ...attributes, Telefonnummer: e })
                      }
                      else {
                        setTempPhone("+49 ")
                        setAttributes({ ...attributes, Telefonnummer: "+49 " })

                      }
                    }
                    } />
                </Row>

                <Row style={{ marginTop: '30px' }}>
                  <label >Kontakfaufnahme erlauben per:</label>

                  <Checkbox style={{ marginLeft: '10px' }} checked={attributes.AllowKontaktEmail} onChange={(e) => {
                    setAttributes({ ...attributes, AllowKontaktEmail: !attributes.AllowKontaktEmail })
                  }}>E-Mail</Checkbox>
                  <Checkbox checked={attributes.AllowKontaktTele} onChange={(e) => {
                    setAttributes({ ...attributes, AllowKontaktTele: !attributes.AllowKontaktTele })
                  }}>Telefon</Checkbox>

                </Row>
              </Col>
              {/* <Col span={10}>
              <h1 style={{ fontSize:"large"}}> Offene Sprechstunde</h1>
                
              <Row >
                <Col span={4}>
                <label  >   Montag
              </label>
              </Col>
                <TimePicker.RangePicker
                defaultValue={[dayjs(mondayStart, format), dayjs(mondayEnd, format)]}
                onChange={(e, s) => {
                    setAttributes({ ...attributes, monday: s[0]+","+s[1] })
                 
                  }}
                format={format}
               />
               </Row>
               <Row  >
               <Col span={4}>
               
                <label  > Dienstag</label>
                </Col>
                <TimePicker.RangePicker 
                defaultValue={[dayjs(tuesdayStart, format), dayjs(tuesdayEnd, format)]}
                onChange={(e, s) => {
                    setAttributes({ ...attributes, tuesday: s[0]+","+s[1] })
               
                  }}
                format={format}
               />
               </Row>
               <Row  >
               <Col span={4}>
               
                <label > Mittwoch</label>
                </Col>
                <TimePicker.RangePicker 
                defaultValue={[dayjs(wednesdayStart, format), dayjs(wednesdayEnd, format)]}
                onChange={(e, s) => {
                    setAttributes({ ...attributes, wednesday: s[0]+","+s[1] })
               
                  }}
                format={format}
               />
               </Row>
               <Row  >
               <Col span={4}>
               
                <label  > Donnerstag</label>
                </Col>
                <TimePicker.RangePicker 
                defaultValue={[dayjs(thursdayStart, format), dayjs(thursdayEnd, format)]}
                onChange={(e, s) => {
                    setAttributes({ ...attributes, thursday: s[0]+","+s[1] })
               
                  }}
                format={format}
               />
               </Row>
               <Row  >
               <Col span={4}>
               
                <label > Freitag</label>
                </Col>
                <TimePicker.RangePicker 
                defaultValue={[dayjs(fridayStart, format), dayjs(fridayEnd, format)]}
                onChange={(e,s) => {
                    setAttributes({ ...attributes, friday: s[0]+","+s[1] })
               
                  }}
                format={format}
               />
               </Row>

              </Col> */}
            </Row>
          </fieldset>



          <Row gutter={24} style={{ marginLeft: "2px" }}
          >
            <Button
              onClick={onSave}
              type='primary'
         
            >
              <span> Speichern</span>
            </Button>
          </Row>

        </Form>

      </PageContainer>
    </div>

  )
}

export default Company
