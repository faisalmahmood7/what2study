import {
  Form,
  Row,
  Col,
  Input,
  Select,
  Image,
  Tag,
  Space,
  Button,
  Skeleton,
  Checkbox,
  Slider,
  ColorPicker,
  Modal,
  UploadProps,
  Upload,
  Radio,
  Tooltip,
  Switch
} from 'antd'
import {
  GlobalOutlined,
  DeleteTwoTone,
  SoundTwoTone,
  DownOutlined,
  InboxOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { JobOfferBlock } from '../../types/JobOffers'
import { toBase64 } from '../../helpers/toBase64'
import { showNotification } from '../../helpers/notification'
import { useEffect, useState } from 'react'
import Parse from 'parse'
import "../../styles.css"
import { useLocation, useParams } from 'react-router-dom'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import 'react-phone-number-input/style.css'
import { SliderMarks } from 'antd/lib/slider'
import { getCurrentUser, UserType } from '../../types/user'
import TextArea from 'antd/es/input/TextArea'
import ChatClient from "what2study-chatclient";
import { SERVER_URL_parsefunctions } from '../../config/parse'


library.add(faCaretDown);
library.add(faCaretRight);

const { Option } = Select
type GeneralSettingsProps = {
  job: JobOfferBlock,
  onjobChange: (updatedjob: JobOfferBlock) => void,
  parseRef: any
}

const GeneralSettings = ({ job, onjobChange, parseRef }: GeneralSettingsProps) => {
  const { id } = useParams<{ id: string }>()
  const company = getCurrentUser()
  const errorCss = { borderColor: "red", width: "450px" }
  const errorCssInvert = { borderColor: "rgb(217 217 217)", width: "450px" }


  const [errorsValChanged, setErrorCounter] = useState<number>(0)
  //const errorsVal = errorsValProp
  const [errorsVal, setErrorsVal] = useState<{
    title: boolean,
    ausbildungAdressestreet: boolean,
    ausbildungAdressecity: boolean,
    AusbildungsdauerJahre: boolean,
    Startdatum: boolean,
    MitarbeiteranzahlamStandort
  }>({
    title: false,
    ausbildungAdressestreet: false,
    ausbildungAdressecity: false,
    AusbildungsdauerJahre: false,
    Startdatum: false,
    MitarbeiteranzahlamStandort: false
  })
  const requiredField = <p style={{ color: "red", fontSize: "large", marginBottom: "" }}>* <span style={{ fontSize: "small", color: "#ae9c9c" }}>Dieser Wert ist erforderlich</span></p>
  // react useStates 
  const [possiblejobs, setPossiblejobs] = useState<JobOfferBlock[] | null>(
    null
  )
  const [filterArr, setFilterArr] = useState<any>(job.behavior)
  const [videoFile, setVideoFile] = useState(job.introVideo);
  const [promptValue, setPromptValue] = useState(1);
  const [scriptTag, setScriptTag] = useState<any>(job.scriptTag)
  const [token, setToken] = useState<any>()
  const [filterArrChangeCounter, setFilterCounter] = useState<number>(0)
  const [filterJSX, setFilterJSX] = useState<JSX.Element>()
  const [jobObj, setJob] = useState<any[] | null>()
  const [profileImages, setProfileImages] = useState<any[] | null>()
  const [changedState, setChangedState] = useState<boolean>(false)
  const [changecount, setchangecount] = useState<number>(0)
  const location = useLocation()
  const [loading, setLoading] = useState(false);

  const [defaultpromptwithvariables, setDefaultPromptWithVariables] = useState<string>();

  const [open, setOpen] = useState(false);

  const [customPromptT, setcustomPromptT] = useState<string>();


  const area = (customPromptT) => {
    return <>
      <TextArea
        defaultValue={customPromptT}
        key={customPromptT}
        id={customPromptT}
        style={{ width: "800px" }}

        onChange={(e) => {
          onjobChange({ ...job, customPrompt: e.target.value })
        }
        }

        autoSize={{ minRows: 12, maxRows: 15 }}
      />
    </>
  }
  const propsProfile: UploadProps = {
    accept: "image/jpeg, image/png, image/jpg",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {
      if (file) {
        handleImageUpload(file, 'profile', '')
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

  const props: UploadProps = {
    accept: "image/jpeg, image/png, image/jpg",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {
      if (file) {
        handleImageUpload(file, '', '')
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
  useEffect(() => {
    setPromptTextArea(area(customPromptT))
  }, [customPromptT])
  const [promptTextArea, setPromptTextArea] = useState<JSX.Element>(area(customPromptT));


  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 3000);
  };

  const handleCancel = () => {
    setOpen(false);
  };
  useEffect(() => {
    var defaultPrompt= job.defaultPrompt

    if(job.defaultPrompt != 'You are a helpful AI assistant with the name: "chatbotname", responsible for answering questions about the "universityname". Use the provided context to answer the questions. Your role is to act as a study advisor, assisting students and those interested in study programs with their inquiries. Please use gender-sensitive language (e.g., Studierende, Dozierende).\n\nImportant Guidelines:\n\nAccuracy: If the exact study program mentioned by the student (e.g., architecture, HCI) is not offered by the university, do not state that it is. Instead, mention similar or related programs, if available, and offer to provide more information.\n\nClarification: If you are unsure about the question or if the provided context does not have enough information, do not make assumptions. Ask the user for more specific details to better understand their needs.\n\nSensitive Topics: Do not engage in answering questions related to sensitive topics such as racism or discrimination. Instead, respond with something like,  I\'m sorry to hear that you are experiencing this type of problem. Unfortunately, I cannot help you directly with this kind of problem. Please check "Guideline/Page"\n\nStudy-Related Focus: Answer only questions that are related to study programs, universities, education, or opening hours / holidays of the university. Redirect conversations back to study-related topics if necessary.\n\nData Processing: If a user asks how their data or chat history is processed, provide a brief summary of the data protection policy and refer them to the full policy. Respond with something like What2Study verarbeitet deine personenbezogenen Daten, um dir bei Fragen rund um das Studium zu helfen und unsere Dienstleistungen zu verbessern. Details zur Datenverarbeitung findest du in unserer Datenschutzerklärung: [https://www.cpstech.de/what2study/datasecurity/] \nResponse Structure: Clearly state if a program is not available and suggest similar options. Always ask a follow-up question to ensure the user\'s needs are met.')
    {
      defaultPrompt= 'You are a helpful AI assistant with the name: "chatbotname", responsible for answering questions about the "universityname". Use the provided context to answer the questions. Your role is to act as a study advisor, assisting students and those interested in study programs with their inquiries. Please use gender-sensitive language (e.g., Studierende, Dozierende).\n\nImportant Guidelines:\n\nAccuracy: If the exact study program mentioned by the student (e.g., architecture, HCI) is not offered by the university, do not state that it is. Instead, mention similar or related programs, if available, and offer to provide more information.\n\nClarification: If you are unsure about the question or if the provided context does not have enough information, do not make assumptions. Ask the user for more specific details to better understand their needs.\n\nSensitive Topics: Do not engage in answering questions related to sensitive topics such as racism or discrimination. Instead, respond with something like,  I\'m sorry to hear that you are experiencing this type of problem. Unfortunately, I cannot help you directly with this kind of problem. Please check "Guideline/Page"\n\nStudy-Related Focus: Answer only questions that are related to study programs, universities, education, or opening hours / holidays of the university. Redirect conversations back to study-related topics if necessary.\n\nData Processing: If a user asks how their data or chat history is processed, provide a brief summary of the data protection policy and refer them to the full policy. Respond with something like What2Study verarbeitet deine personenbezogenen Daten, um dir bei Fragen rund um das Studium zu helfen und unsere Dienstleistungen zu verbessern. Details zur Datenverarbeitung findest du in unserer Datenschutzerklärung: [https://www.cpstech.de/what2study/datasecurity/] \nResponse Structure: Clearly state if a program is not available and suggest similar options. Always ask a follow-up question to ensure the user\'s needs are met.'
    }
    if(job.name !="") defaultPrompt= defaultPrompt.replace("chatbotname", job?.name)
    defaultPrompt= defaultPrompt.replace("universityname", currentUser?.attributes.name)
    setDefaultPromptWithVariables(defaultPrompt)

    var customPrompt= job.customPrompt
    if(job.name !="")  customPrompt= customPrompt.replace("chatbotname", job?.name)
    customPrompt= customPrompt.replace("universityname", currentUser?.attributes.name)
    
    setcustomPromptT(customPrompt)
    if (changecount > 3) {
      setChangedState(true)

      //location.state = { changedstate: changedState, unSavedObj: job, parseRef: parseRef }
    }
    setchangecount(changecount + 1)
  }, [job])

  useEffect(() => {
    if (changedState == true) {

      location.state = { changedstate: changedState, unSavedObj: job, parseRef: parseRef }
    }
  }, [changedState])

  // Image upload func
  const handleImageUpload = async (image: any, caller: string, imageURL: string) => {

    if (imageURL != "") {
      if (Parse.serverURL.includes("cpstech")) {
        imageURL = imageURL.replace("http:", "https:")

      }
      else if (Parse.serverURL.includes("localhost")) {
        imageURL = imageURL.replace("https:", "http:")
      }
      if (caller == "") {
        job.bubbleIcon?.push(imageURL)
        onjobChange({ ...job, bubbleIcon: job.bubbleIcon })
        imageElement()
      }
      // else {
      //   onjobChange({ ...job, ansprechspartnerProfileBild: imageURL })
      //   setLogoBase64Kontakt(imageURL)
      // }
    }
    else {
      const base64 = await toBase64(image).catch((err) =>
        showNotification({
          type: 'error',
          title: 'Fehler beim Hochladen',
          message: 'Beim Hochladen des Bildes ist ein Fehler aufgetreten.',
        })
      )
      var response = await imageBaseToUrl(base64 as string)
      //var url = response.attributes.bilds._url.replace("http", "https")
      var url = response.attributes.bilds._url
      if (Parse.serverURL.includes("cpstech")) {
        url = url.replace("http:", "https:")

      }
      else if (Parse.serverURL.includes("localhost")) {
        url = url.replace("https:", "http:")
      }
      if (caller == "") {
        job.bubbleIcon?.push(url)
        onjobChange({ ...job, bubbleIcon: job.bubbleIcon })
        imageElement()
      }
      else {
        job.profileImage?.push(url)
        onjobChange({ ...job, profileImage: job.profileImage })
        imageElementProfile()
      }
      // else {
      //   onjobChange({ ...job, ansprechspartnerProfileBild: url })
      //   setLogoBase64Kontakt(url)
      // }
    }

  }



  const [selectedBubble, setSelectedBubble] = useState<string>(job.selectedBubbleIcon)

  const [chatbotName, setChatbotName] = useState<string>(job.name)

  const [language, setlang] = useState<string>(job.language)

  const [base64Video, setBase64] = useState<any>()



  const [selectedProfile, setSelectedProfile] = useState<string>(job.selectedProfileImage)
  // Get current user object
  const currentUser = Parse.User.current()
  useEffect(() => {
    onjobChange({ ...job, selectedBubbleIcon: selectedBubble })

  }, [selectedBubble])

  useEffect(() => {
    onjobChange({ ...job, selectedProfileImage: selectedProfile })

  }, [selectedProfile])

  // Image removal func
  const removeImage = (id: any) => {
    if (job.bubbleIcon != undefined) {
      if (job.selectedBubbleIcon == job.bubbleIcon[id]) {
        setSelectedBubble("")

      }
      onjobChange({ ...job, bubbleIcon: job.bubbleIcon.splice(id, 1) })
      imageElement()

    }
  };
  // Image removal func profile
  const removeImageProfile = (id: any) => {
    if (job.profileImage != undefined) {
      if (job.selectedProfileImage == job.profileImage[id]) {
        setSelectedProfile("")

      }
      onjobChange({ ...job, profileImage: job.profileImage.splice(id, 1) })
      imageElementProfile()

    }
  };




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
  // async function simp(imageBase64) {
  //   if (imageBase64.length > 80) {
  //     return await imageBaseToUrl(imageBase64)
  //     // imageList.indexOf(imageBase64) !== -1 && imageList.splice(imageList.indexOf(imageBase64), 1)
  //   }
  //   else{return false}
  // }
  const imageElement = async () => {
    let obj: JSX.Element[] = []
    if (job.bubbleIcon != undefined) {
      obj = job.bubbleIcon.map((img, index) => {
        return <Col key={index} style={{ marginLeft: "25px", marginTop: "15px" }} span={1}>
          {job.bubbleIcon ? <div style={{ textAlign: 'center' }}><DeleteTwoTone style={{ fontSize: "18px" }} onClick={() => removeImage(index)}></DeleteTwoTone><Image style={{ width: "100%" }} height="100%" src={img} preview={false} onClick={(e) => {
            // onjobChange({ ...job, selectedBubbleIcon: img })
            
            setSelectedBubble(img)
          }} /> </div> : <Skeleton.Image style={{ width: "100%", height: "100%", marginTop: "-20px" }} />}

          {/* <Row style={{ marginLeft: '35%' }}><DeleteTwoTone style={{ fontSize: "15px" }} onClick={() => removeImage(index)}></DeleteTwoTone></Row> */}
        </Col>
      })
    }
    onjobChange({ ...job })
    setJob(obj)
  }

  useEffect(() => {
    onjobChange({ ...job, selectedBubbleIcon: selectedBubble })

  }, [selectedBubble])
  const imageElementProfile = async () => {
    let obj: JSX.Element[] = []
    if (job.profileImage != undefined) {
      obj = job.profileImage.map((img, index) => {
        return <Col key={index} style={{ marginLeft: "25px", marginTop: "15px" }} span={1} >
          {job.profileImage ? <div style={{ textAlign: 'center' }}><DeleteTwoTone style={{ fontSize: "18px" }} onClick={() => removeImageProfile(index)}></DeleteTwoTone><Image style={{ width: "100%" }} height="100%" src={img} preview={false} onClick={(e) => {
            // onjobChange({ ...job, selectedProfileImage: img })
            setSelectedProfile(img)

          }} /> </div> : <Skeleton.Image style={{ width: "100%", height: "100%", marginTop: "-20px" }} />}

          {/* <Row style={{ marginLeft: '35%' }}><DeleteTwoTone style={{ fontSize: "15px" }} onClick={() => removeImageProfile(index)}></DeleteTwoTone></Row> */}
        </Col>
      })
    }
    onjobChange({ ...job })
    setProfileImages(obj)
  }

  useEffect(() => {
    onjobChange({ ...job, selectedProfileImage: selectedProfile })

  }, [selectedProfile])

  // After setting current user object 
  useEffect(() => {
    var defaultPrompt= job.defaultPrompt
    if(job.name !="")  defaultPrompt= defaultPrompt.replace("chatbotname", job?.name)
    defaultPrompt= defaultPrompt.replace("universityname", currentUser?.attributes.name)
    setDefaultPromptWithVariables(defaultPrompt)
    
    var customPrompt= job.customPrompt
    if(job.name !="")  customPrompt= customPrompt.replace("chatbotname", job?.name)
    customPrompt= customPrompt.replace("universityname", currentUser?.attributes.name)
    
    setcustomPromptT(customPrompt)
    if(job.langWeiterMain == undefined || job.langWeiterMain == ""){
      onjobChange({...job, langWeiterMain:"Weiterer Klärungsbedarf"})
      }
      onjobChange({...job, defaultPrompt:'You are a helpful AI assistant with the name: "chatbotname", responsible for answering questions about the "universityname". Use the provided context to answer the questions. Your role is to act as a study advisor, assisting students and those interested in study programs with their inquiries. Please use gender-sensitive language (e.g., Studierende, Dozierende).\n\nImportant Guidelines:\n\nAccuracy: If the exact study program mentioned by the student (e.g., architecture, HCI) is not offered by the university, do not state that it is. Instead, mention similar or related programs, if available, and offer to provide more information.\n\nClarification: If you are unsure about the question or if the provided context does not have enough information, do not make assumptions. Ask the user for more specific details to better understand their needs.\n\nSensitive Topics: Do not engage in answering questions related to sensitive topics such as racism or discrimination. Instead, respond with something like,  I\'m sorry to hear that you are experiencing this type of problem. Unfortunately, I cannot help you directly with this kind of problem. Please check "Guideline/Page"\n\nStudy-Related Focus: Answer only questions that are related to study programs, universities, education, or opening hours / holidays of the university. Redirect conversations back to study-related topics if necessary.\n\nData Processing: If a user asks how their data or chat history is processed, provide a brief summary of the data protection policy and refer them to the full policy. Respond with something like What2Study verarbeitet deine personenbezogenen Daten, um dir bei Fragen rund um das Studium zu helfen und unsere Dienstleistungen zu verbessern. Details zur Datenverarbeitung findest du in unserer Datenschutzerklärung: [https://www.cpstech.de/what2study/datasecurity/] \nResponse Structure: Clearly state if a program is not available and suggest similar options. Always ask a follow-up question to ensure the user\'s needs are met.',
 })
    var token = /token=.*'/g.exec(job.scriptTag)
    if (token) {
      setToken(token[0].slice(6, -1))
    }

    imageElement()
    imageElementProfile()
    if (filterArr != undefined) {
      setFilterCounter(filterArrChangeCounter + 1)
    }

  }, [currentUser])

  const marks: SliderMarks = {
    // 0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    // 6: {
    //   style: {
    //     color: '#f50',
    //   },
    //   label: <strong>100°C</strong>,
    // },
  };
  useEffect(() => {
    onjobChange({ ...job, name: chatbotName })
  }, [chatbotName])
  useEffect(() => {
    onjobChange({ ...job, behavior: filterArr })
  }, [filterArr])


  function addBhavior(filterArray, index, e) {
    filterArray[index].pointOnScale = e
    setFilterArr(filterArray)
    setFilterCounter(filterArrChangeCounter + 1)

  }

  useEffect(() => {
    if (filterArr) {
      var filter_FF = [{ 1: "very informal", 2: "informal", 3: "business casual ", 4: "casual professional", 5: "professional", 6: "very professional/formal" },
      { 1: "You do not have an own opinion. Be neutral and do not judge in anyway", 2: "You do not have an own opinion. Be neutral", 3: "Be neutral", 4: "feel free to have an own opinion, but be neutral", 5: "feel free to have an own opinion and maybe judge (politely)", 6: "feel free to have an own opinion and judge as you want" },

      { 1: "no emojies", 2: "none or sometimes one emoji", 3: "sometimes one or two emojies", 4: "one or two emojies", 5: "some emojies", 6: "a lot of emojies" },
      { 1: "very short", 2: "short", 3: "variable, but if doubt rather short", 4: "variable, but if doubt rather detailed", 5: "detailed", 6: "very detailed" },

      { 1: "very much on the specific subject of the asked question", 2: "on the specific subject of the asked question", 3: "maybe sometimes with an additional related information", 4: "sometimes with a few related information, tips or questions", 5: "with some related additional information, tips or questions", 6: "with a lot of related additional information, tips or questions" },
      { 1: "very funny", 2: "mostly funny", 3: "casually humorous", 4: "neutral", 5: "mildly serious", 6: "very serious" }]

      var obj = filterArr.map((object, index) => {

        return <Row gutter={24} >
          <Col span={2} >

            <label style={{ fontWeight: "bold" }}>{filterArr[index].given}: </label>
          </Col>
          <Col span={15} >
            <Row gutter={24}>
              <Col span={8} style={{ textAlign: "right" }}
              >
                {index == 1 || index == 2 || index == 3 ? filterArr[index].rightValue : filterArr[index].leftValue}
              </Col>
              <Col span={8} >
                <div style={{ marginTop: "-5px" }}>
                  <Slider
                    min={1}
                    max={6}
                    marks={marks}
                    // trackStyle={{ backgroundColor: "rgb(245 245 245)" }}
                    //disabled={!filterArr[index].given}
                    tooltip={
                      {
                        autoAdjustOverflow: true,
                        formatter: () => {
                          if (object.pointOnScale == 0) {
                            return filter_FF[index][1]
                          }
                          else {
                            return filter_FF[index][object.pointOnScale]
                          }

                        }
                      }}
                    onChange={(e) => {
                      var filterArray = filterArr
                      addBhavior(filterArray, index, e)
                    }}
                    defaultValue={object.pointOnScale}
                    // value={object.pointOnScale}
                    key={object.pointOnScale}
                    step={1}
                  /> </div>

              </Col>
              <Col span={8}
              >
                {index == 1 || index == 2 || index == 3 ? filterArr[index].leftValue : filterArr[index].rightValue}
              </Col>

            </Row>
          </Col>

        </Row>


      })
      setFilterJSX(obj)
    }
  }, [filterArrChangeCounter]);
  const onPublish = () => {
    const {
      name,

    } = job
    let errors: string[] = []
    // if (description.trim() === '') errors.push('Die job muss eine Beschreibung besitzen')
    if (name != null) {
      if (name.trim() === '') {
        errors.push('Die job muss einen Title besitzen')
        var errorVal = errorsVal
        errorVal.title = true
        setErrorsVal(errorVal)
      }
    }

    // if (!location) errors.push('Die job benötigt einen Standort')
    if (errors.length !== 0) {
      setErrorCounter(errorsValChanged + 1)
      return showNotification({
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
      onjobChange({ ...job, activeChatbot: true })

    }
    if (job.scriptTag == "" || job.scriptTag == undefined) {
      let formData = { user: Parse.User.current()?.id, chatbotId: job.id }
      fetch(
        SERVER_URL_parsefunctions + "/scriptTag",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "what2study",
            "X-Parse-Master-Key": "what2studyMaster",
          },
          body: JSON.stringify(formData),
        }

      ).then(async (response) => {
        const data = await response.json();
        onjobChange({ ...job, scriptTag: data.result.scriptTag })
      });
    }
    
  }
  const onUnpublish = () => {
    onjobChange({ ...job, activeChatbot: false })
  }

  const optionsUnterrischt = [
    {
      label: 'Blockunterricht',
      value: 'Blockunterricht',
    },
    {
      label: 'Wöchentlich',
      value: 'Wöchentlich',
    }, {
      label: 'Teilzeitunterricht',
      value: 'Teilzeitunterricht',
    },
  ];
  const optionNA = [
    {
      label: 'n.a',
      value: 'n.a',
    },

  ];
  const propsMedia: UploadProps = {
    accept: "video/mp4",
    customRequest: async (componentsData) => {
      return true
    },

    async beforeUpload(file) {
      if (file) {
        handleVideoUpload(file, '', '')
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

  // Image upload func
  const handleVideoUpload = async (image: any, caller: string, imageURL: string) => {

    if (Parse.serverURL.includes("cpstech")) {
      imageURL = imageURL.replace("http:", "https:")

    }
    else if (Parse.serverURL.includes("localhost")) {
      imageURL = imageURL.replace("https:", "http:")
    }

    // else {
    //   onjobChange({ ...job, ansprechspartnerProfileBild: imageURL })
    //   setLogoBase64Kontakt(imageURL)
    // }
    const base64 = await toBase64(image).catch((err) =>
      showNotification({
        type: 'error',
        title: 'Fehler beim Hochladen',
        message: 'Beim Hochladen des Bildes ist ein Fehler aufgetreten.',
      })
    )
    var response = await imageBaseToUrl(base64 as string)
    //var url = response.attributes.bilds._url.replace("http", "https")
    var url = response.attributes.bilds._url
    if (Parse.serverURL.includes("cpstech")) {
      url = url.replace("http:", "https:")

    }
    else if (Parse.serverURL.includes("localhost")) {
      url = url.replace("https:", "http:")
    }

    onjobChange({ ...job, introVideo: url })
    setVideoFile(url)
  }


  // return form HTML 
  return (
    <Form layout='vertical' name='basic'>
      <fieldset className="fieldsetCustom">
        <legend>Einstellungen</legend>
        <Row gutter={24} style={{ display: 'flex', alignItems: 'center' }}>
          <Col span='8'>
            <h3>Status</h3>
            <Space>
            <Switch checkedChildren="Veröffentlichen" unCheckedChildren="Zu Entwurf" defaultChecked={job.activeChatbot ? true : false}  onChange={(e)=>{
            
             if(e){
              onPublish()
            }
            else{
              onUnpublish()
            }
          
          }}
             />
              {/* <Tag color={job.activeChatbot ? 'green' : 'blue'}>
                {job.activeChatbot ? 'Öffentlich' : 'Entwurf'}
              </Tag>
              <Button
                type='primary' shape='round' icon={<GlobalOutlined />}
                onClick={job.activeChatbot ? onUnpublish : onPublish}
              >
                {job.activeChatbot ? 'Zu Entwurf' : 'Veröffentlichen'}
              </Button> */}
            </Space>
          </Col>
        </Row><br></br>
        <Row gutter={24}>
          <Col span={10} >
            <Form.Item tooltip="Wie wird Ihr Chatbot genannt? Geben Sie einen Namen für Ihren Chatbot an" style={{ marginTop: "10px", fontWeight: "bold" }}
              label={<p style={{ fontSize: "22px" }}>Name des Chatbots</p>} name='name' rules={[
                {
                  //  required: true,
                  //  message: "Dieses Feld ist erforderlich"
                }
              ]} >
              <Input
                style={errorsVal.title ? errorCss : errorCssInvert}
                placeholder='Name des Bot'
                defaultValue={chatbotName}
                //value={job.title}
                onChange={(e) => {
                  setChatbotName(e.target.value)
                  var errorVal = errorsVal
                  errorVal.title = false
                  setErrorsVal(errorVal)
                }
                }

              />
              {requiredField}

            </Form.Item>
            <label style={{ fontWeight: "bold", fontSize: "22px" }}> Grundeinstellungen</label> <Tooltip title={"Einstellung der Standardsprache für die Benutzeroberfläche und den Begrüßungstext des Chatbots. Die Nutzer:innen haben zusätzlich die Möglichkeit, die Sprache in ihren Einstellungen zu ändern. Außerdem reagiert der Chatbot automatisch auf die Sprache der Nachrichten und passt seine Antwort entsprechend an."} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>
            <Form.Item label='Sprache des Chatbots' name='chatbotLanguage' style={{ marginTop: "10px" }}>
              <Select
                style={{ width: "200px" }}

                defaultValue={job.language || 'de'}
                onChange={(value) => {

                  onjobChange({ ...job, language: value.toString() })
                  setlang(value.toString())

                }}
              >

                <Option value='en'>English</Option>
                <Option value='de'>Deutsch</Option>

              </Select>

            </Form.Item>

          </Col>

          <Col span={14} >
            <label style={{ fontWeight: "bold", fontSize: "22px" }}>Verhalten des Chatbots</label>
            <br></br>
            <br></br>
            {filterJSX}
          </Col>

        </Row>
        <Row gutter={24} >
          <Col span={10}>
            <label> Sprachausgabe</label><br></br>

            <SoundTwoTone style={{ fontSize: "large" }} /> <Checkbox checked={job.AudioNarration} style={{ marginTop: "3px", marginLeft: "10PX" }} onChange={(e) => {
              onjobChange({ ...job, AudioNarration: !job.AudioNarration })
            }}>Automatisch beim Start aktiviert</Checkbox><br></br>

            <Form.Item label='Stimme' name='Narrator' style={{ marginTop: "10px" }}>
              <Select
                style={{ width: "200px" }}

                defaultValue={job.Narrator || 'Männlich'}
                onChange={(value) => onjobChange({ ...job, Narrator: value.toString().toLowerCase() })}
              >

                <Option value='male'>Männlich</Option>
                <Option value='female'>Weiblich</Option>

              </Select>

            </Form.Item>
          </Col>
          <Col span={12}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>Chatbot Prompt</label>

            <p>Bearbeiten Sie hier die Eingabeaufforderung (Prompt) für Ihren Chatbot. Ihr Chatbot nutzt diese Aufforderung, um passende Antworten zu erstellen</p>

            <Radio.Group onChange={(e) => {
              setPromptValue(e.target.value);
              onjobChange({...job, promptSelection:e.target.value==1 ? false:true})
            }} value={job.promptSelection == false? 1 : 2}>
              <Space direction="vertical" style={{ width: "auto" }}>
                <Radio value={1} > Default Prompt:
                  <TextArea
                    value={defaultpromptwithvariables}
                    disabled

                    key={"defaultPrompt"}
                    id={"defaultPrompt"}
                    style={{ width: "800px" ,backgroundColor:"whitesmoke"}}
                    // onChange={(e) => {
                    //   onjobChange({ ...job, customPrompt: e.target.value })
                    // }
                    // }

                    autoSize={{ minRows: 12, maxRows: 15 }}
                  />
                </Radio>
                <Radio value={2}>Bearbeiteter Prompt:  <TextArea
                  defaultValue={customPromptT}
                  key={customPromptT}
                  id={customPromptT}
                  style={{ width: "800px" }}

                  onChange={(e) => {
                    onjobChange({ ...job, customPrompt: e.target.value })
                  }
                  }

                  autoSize={{ minRows: 12, maxRows: 15 }}
                /></Radio>
              </Space></Radio.Group>
            {/* <Checkbox onClick={(e) => {
              // setToDefaultPrompt(job.defaultPrompt)
              setcustomPromptT(job.defaultPrompt)
              setPromptTextArea( <div
               
              />)

              setPromptTextArea( <TextArea
                defaultValue={job.defaultPrompt}
                key={"defaultPrompt"}
                id={"defaultPrompt"}
                style={{ marginTop: "-20px" }}
                onChange={(e) => {
                  onjobChange({ ...job, customPrompt: e.target.value })
                }
                }
        
                autoSize={{ minRows: 12, maxRows: 15 }}
              />)

              onjobChange({ ...job, customPrompt: job.defaultPrompt })
            }}>
              Auf Standard-Prompt zurücksetzen
            </Checkbox>
            <br></br>
            <br></br>
            <br></br>

            {promptTextArea} */}
          </Col></Row>

        {/* <Row> <Col span={5} >
          <Form.Item label='Empfohlener Bildungsabschluss' name='ErforderlicherBildungsabschluss'>
            <Select
              style={{ width: "200px" }}

              defaultValue={job.ErforderlicherBildungsabschluss || 'Keine Angabe'}
              onChange={(value) => onjobChange({ ...job, ErforderlicherBildungsabschluss: value.toString() })}
            >
              
              <Option value='Keine Angabe'>Keine Angabe</Option>
              <Option value='Abitur'>Abitur</Option>
              <Option value='Fachhochschulreife'>Fachhochschulreife</Option>
              <Option value='Mittlerer Schulabschluss'>Mittlerer Schulabschluss</Option>
              <Option value='Hauptschulabschluss'>Hauptschulabschluss</Option>
              <Option value='Kein Schulabschluss'>Kein Schulabschluss</Option>

            </Select>
          </Form.Item>
        </Col></Row> */}
        <Row >
          {/* <Col span={4} >
            <Form.Item label='Ausbildungsdauer (Jahre)' name='AusbildungsdauerJahre'  >
              <Select

                style={errorsVal.AusbildungsdauerJahre ? errorCssSelect : errorCssInvertSelect}
                bordered={true}
                size="middle"
                defaultValue={job.AusbildungsdauerJahre || '0'}
                onChange={(value) => {
                  onjobChange({ ...job, AusbildungsdauerJahre: value.toString() })
                  var errorVal = errorsVal
                  errorVal.AusbildungsdauerJahre = false
                  setErrorsVal(errorVal)
                }}
              >
                <Option value='1'>1</Option>
                <Option value='1.5'>1.5</Option>
                <Option value='2'>2</Option>
                <Option value='2.5'>2.5</Option>
                <Option value='3'>3</Option>
                <Option value='3.5'>3.5</Option>
                <Option value='4'>4</Option>
                <Option value='4.5'>4.5</Option>
                <Option value='5'>5</Option>
                <Option value='5.5'>5.5</Option>
                <Option value='6'>6</Option>
                <Option value='6.5'>6.5</Option>

              </Select>

              {requiredField}
            </Form.Item>
          </Col> */}


        </Row>
        <label style={{ fontSize: "23px", fontWeight: "bold" }}>Chatbot-Icon</label><Tooltip title={"Wählen Sie ein Icon für den Chatbot aus, das möglichst quadratisch, hochauflösend und mit transparentem Hintergrund ist, um eine optimale Darstellung zu gewährleisten."} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>
        <Row gutter={24} style={{ marginTop: "25px" }}>
          <Col span={2}>
            {selectedBubble ? <Image style={{ height: "60%", width: "60%", borderRadius: "20%", border: "2px solid #00ADDC", padding: "2px" }} src={selectedBubble} /> : <Skeleton.Image style={{ width: "100%", height: "100%", marginTop: "-20px" }} />}
          </Col>
          <Col span={20}>
            <Form.Item id="imageContainerJobs" tooltip='Hochladen des Sprechblasen-Symbols für den Chatbot'>
              <Row id="imageContainerJob">
                <Upload {...props} maxCount={1} showUploadList={false}>

                  <Button style={{ height: "78px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '250%', color: "#257dfe" }} />}><br></br><span>Bild hochladen: JPEG/PNG-Datei</span>

                  </Button>
                </Upload>

              </Row>
              <Row>{jobObj}</Row>

            </Form.Item>
          </Col>

          {/* <Col span={3}>
            <MediaPreview mediaType='Bilder' saveCallback={(url: any, index: any) => {
            
              if (url) { handleImageUpload(null, '', url) }
            }}> </MediaPreview> 
          </Col> */}
        </Row>

      </fieldset>

      {/* <fieldset className="fieldsetCustom">
        <legend>Eigenschaften der Ausbildung bzw. Ausbildungsstätte       <Tooltip placement="topLeft" title="Schülerinnen und Schüler können sich in der App basierend auf ihren Vorlieben bestimmte Ausbildungen einblenden lassen">
          <QuestionCircleOutlined />
        </Tooltip></legend>
        {filterJSX}


      </fieldset> */}




      <fieldset className="fieldsetCustom">
        <legend>Erscheinungsbild</legend>
        <label style={{ fontWeight: "bold", fontSize: "23px" }}>Chatbot: Corporate Identity</label>
        <br></br>
        <br></br>
        <Row gutter={26}>
          <Col span={11}>
            <label>Chatbot Kopfzeile </label>
            <Row gutter={26} style={{ margin: "15px" }}>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Hintergrundfarbe</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.headerColor || "#0c8de9"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, headerColor: s.toString() })
                  }}
                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Icon & Schriftfarbe</label> <br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.headerIconFontColor || "#ffffff"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, headerIconFontColor: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={4}></Col>


            </Row>
            <label>Textfeld (Nutzer) </label>

            <Row gutter={26} style={{ margin: "15px" }}>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Farbe</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.textBoxColorUser || "#e0e0e0"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, textBoxColorUser: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Schriftfarbe</label> <br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.fontColorUser || "#000000"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, fontColorUser: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Schriftart</label><br></br>
                <Select
                  style={{ width: "200px" }}

                  defaultValue={job.fontstyleUser || 'Inter'}
                  onChange={(value) => {
                    onjobChange({ ...job, fontstyleUser: value.toString() })
                  }}
                >

                  <Option value='Inter'>Inter</Option>
                  <Option value='Poppins'>Poppins</Option>
                  <Option value='Roboto'>Roboto</Option>

                  <Option value='Tinos'>Times New Roman</Option>

                  <Option value='Fira Sans Condensed'>Calibri</Option>

                  <Option value='Arimo'>Arial</Option>

                  <Option value='IBM Plex Sans'>Helvetica</Option>

                  <Option value='Open Sans'>Open Sans</Option>

                </Select>

              </Col>

            </Row>
            <label>Textfeld (Chatbot)</label>

            <Row gutter={26} style={{ margin: "15px" }}>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Farbe</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.textBoxColorChatbotReply || "#00ADDC"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, textBoxColorChatbotReply: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Schriftfarbe</label> <br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.fontColorChatbotReply || "#00ADDC"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, fontColorChatbotReply: s.toString() })
                  }}
                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <label>Schriftart</label><br></br>
                <Select
                  style={{ width: "200px" }}

                  defaultValue={job.fontstyleChatbotReply || 'Inter'}
                  onChange={(value) => onjobChange({ ...job, fontstyleChatbotReply: value.toString() })}
                >
                  <Option value='Inter'>Inter</Option>
                  <Option value='Poppins'>Poppins</Option>
                  <Option value='Roboto'>Roboto</Option>

                  <Option value='Tinos'>Times New Roman</Option>

                  <Option value='Fira Sans Condensed'>Calibri</Option>

                  <Option value='Arimo'>Arial</Option>

                  <Option value='IBM Plex Sans'>Helvetica</Option>

                  <Option value='Open Sans'>Open Sans</Option>


                </Select>
              </Col>

            </Row>
          </Col>

          <Col span={13}>
            <label>Weitere UI-Elemente </label>
            <Row gutter={26} style={{ margin: "15px" }}>

              <Col span={7} style={{ textAlign: "center" }}>
                <label>Hintergrundfarbe des Chats</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.chatbotBackgroundColor || "#ffffff"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, chatbotBackgroundColor: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={7} style={{ textAlign: "center" }}>
                <label>Schriftart</label><br></br>
                <Select
                  style={{ width: "180px" }}

                  defaultValue={job.fontstyle || 'Inter'}
                  onChange={(value) => onjobChange({ ...job, fontstyle: value.toString() })}
                >
                  <Option value='Inter'>Inter</Option>
                  <Option value='Poppins'>Poppins</Option>
                  <Option value='Roboto'>Roboto</Option>

                  <Option value='Tinos'>Times New Roman</Option>

                  <Option value='Fira Sans Condensed'>Calibri</Option>

                  <Option value='Arimo'>Arial</Option>

                  <Option value='IBM Plex Sans'>Helvetica</Option>

                  <Option value='Open Sans'>Open Sans</Option>


                </Select>
              </Col>

            </Row>
            <label></label><br></br>

            <Row gutter={26} style={{ margin: "15px" }}>

              <Col span={7} style={{ textAlign: "center" }}>
                <label>Buttons (Hintergrund)</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.uiBackgroundGroupA || "rgb(100, 100, 100)"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, uiBackgroundGroupA: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={7} style={{ textAlign: "center" }}>
                <label>Buttons (Highlight)</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.uiHighLightGroupA || "rgb(200, 200, 200)"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, uiHighLightGroupA: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
            </Row>
            <label></label><br></br>

            <Row gutter={26} style={{ margin: "15px" }}>

              <Col span={7} style={{ textAlign: "center" }}>
                <label>Weitere Schaltflächen (Hintergrund)</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.uiBackgroundGroupB || "rgb(50, 50, 50)"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, uiBackgroundGroupB: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
              <Col span={7} style={{ textAlign: "center" }}>
                <label>Weitere Schaltflächen (Highlight)</label><br></br>
                <ColorPicker
                  size='large'
                  defaultValue={job.uiHighLightGroupB || "rgb(150, 150, 150)"}
                  onChange={(e, s) => {
                    onjobChange({ ...job, uiHighLightGroupB: s.toString() })
                  }}

                  showText={() => (
                    <DownOutlined
                      style={{
                        color: "rgba(0, 0, 0, 0.25)",
                      }}
                    />
                  )}
                />
              </Col>
            </Row>
          </Col>

        </Row>
        <label style={{ fontSize: "23px", fontWeight: "bold" }}>Chatbot-Profilbild</label><Tooltip title={"Wählen Sie ein Profilbild für den Chatbot aus, das möglichst quadratisch, hochauflösend und mit transparentem Hintergrund ist, um eine optimale Darstellung zu gewährleisten."} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>
        <Row gutter={24} style={{ marginTop: "25px" }}>
          <Col span={2}>
            {selectedProfile ? <Image style={{ height: "60%", width: "60%", borderRadius: "20%", border: "2px solid #00ADDC", padding: "2px" }} src={selectedProfile} /> : <Skeleton.Image style={{ width: "100%", height: "100%", marginTop: "-20px" }} />}
          </Col>
          <Col span={20}>
            <Form.Item id="imageContainerProfile" tooltip='Profilbild hochladen' >
              <Row id="imageContainerProfile">

                <Upload {...propsProfile} maxCount={1} showUploadList={false}>

                  <Button style={{  height: "78px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '250%', color: "#257dfe" }} />}><br></br><span>Bild hochladen: JPEG/PNG-Datei</span>

                  </Button>
                </Upload>


              </Row>
              <Row>{profileImages}</Row>

            </Form.Item>
          </Col>

          {/* <Col span={3}>
            <MediaPreview mediaType='Bilder' saveCallback={(url: any, index: any) => {
            
              if (url) { handleImageUpload(null, '', url) }
            }}> </MediaPreview> 
          </Col> */}
        </Row>

      </fieldset>

      <fieldset className="fieldsetCustom">
        <Row gutter={24} style={{ display: 'flex', alignItems: 'center' }}>
          <Col span={12}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>Zufällige Frage</label><Tooltip title={"Möglichkeit, eine Nachricht festzulegen, die der Chatbot nach [X] Minuten Inaktivität proaktiv an den/die Nutzer:in sendet."} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>
            <Checkbox style={{ marginLeft: "10PX", fontSize: "large" }} checked={job.randomQuestionEnabled} onChange={(e) => {
              onjobChange({ ...job, randomQuestionEnabled: !job.randomQuestionEnabled })
            }}></Checkbox>
            <p>Welche Informationen sollen angegeben werden, wenn der Chatbot den Hinweis gibt eine beliebige Frage zu stellen?</p>
            <br></br>
            <TextArea
              defaultValue={job.randomQuestion || "Unsicher, welche Fragen man mir stellen kann? Frag mich doch zu:\n\nWelche Studiengänge bietet die Universität an?\nWie lauten die Zulassungsvoraussetzungen für den Studiengang XYZ?\nWie bewerbe ich mich für ein Studium?"}
              style={{ marginTop: "-20px" }}
              onChange={(e) => {
                onjobChange({ ...job, randomQuestion: e.target.value })
              }
              }

              autoSize={{ minRows: 12, maxRows: 15 }}
            />
          </Col>
          <Col span={12}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>{ job.langWeiterMain=="" || job.langWeiterMain == undefined ? "Weiterer Klärungsbedarf": job.langWeiterMain} </label><Tooltip title={"Möglichkeit, weitere Informationen (bspw. Öffnungszeiten) anzugeben, die angezeigt werden, wenn der Nutzer den Button '[Weiterer Klärungsbedarf]' anwählt."} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>
            <Checkbox style={{ marginLeft: "10PX", fontSize: "large" }} checked={job.talkToaHumanEnabled} onChange={(e) => {
              onjobChange({ ...job, talkToaHumanEnabled: !job.talkToaHumanEnabled })
            }}></Checkbox>
            <p>Welche Informationen sollten bereitgestellt werden bei der Option "{ job.langWeiterMain=="" || job.langWeiterMain == undefined ? "Weiterer Klärungsbedarf": job.langWeiterMain}"?</p>
            <br></br>
            <TextArea
              defaultValue={job.talkToaHuman || "Wir freuen uns, dass Sie direkt mit uns in Kontakt treten möchten, gerne können Sie hierzu die angegebenen Optionen nutzen. \n\nBitte beachten Sie unsere Öffnungszeiten und gewähren Sie uns nach Möglichkeit Einblick in Ihren Chatverlauf, damit wir direkt sehen können, um welches Problem es sich handelt. Sollte gerade niemand verfügbar sein können wir uns auch auf Wunsch bei Ihnen melden."}
              onChange={(e) => {
                onjobChange({ ...job, talkToaHuman: e.target.value })
              }
              }

              autoSize={{ minRows: 12, maxRows: 15 }}
            />


          </Col>

        </Row>

        <Row gutter={24} style={{ display: 'flex', alignItems: 'center' }}>
          <Col span={12}>

          </Col>
          <Col span={12}>
            <br></br>

            <label style={{ fontWeight: "bold", fontSize: "large" }}>Eingabe der Matrikelnummer zulassen </label>
            <Checkbox style={{ marginLeft: "10PX", fontSize: "large" }} checked={job.matriculationNumber} onChange={(e) => {
              onjobChange({ ...job, matriculationNumber: !job.matriculationNumber })
            }}></Checkbox>
            <p> Aktivieren Sie diese Option, damit der Benutzer seine Matrikelnummer über die Funktion '{ job.langWeiterMain=="" || job.langWeiterMain == undefined ? "Weiterer Klärungsbedarf": job.langWeiterMain}' mitteilen kann.</p>
            <br></br>

          </Col>

        </Row>

        <Row gutter={24} style={{ display: 'flex', alignItems: 'center' }}>
          <Col span={12}>

          </Col>
          <Col span={12}>
            <br></br>

            <label style={{ fontWeight: "bold", fontSize: "large" }}> Button “[{ job.langWeiterMain=="" || job.langWeiterMain == undefined ? "Weiterer Klärungsbedarf": job.langWeiterMain}]” umbenennen</label>
            <Input type='text' defaultValue={ job.langWeiterMain=="" || job.langWeiterMain == undefined ? "Weiterer Klärungsbedarf": job.langWeiterMain} key={"weiterKlarungName"} onChange={(e) => {
              onjobChange({ ...job, langWeiterMain: e.target.value })
            }}></Input>
            <br></br>

          </Col>

        </Row>



      </fieldset>

      <fieldset className="fieldsetCustom">
        <legend>Chatbot-Intro</legend>
        <Row>
          <Col span={13} style={{ marginTop: "10px" }}>

            <label style={{ fontWeight: "bold", fontSize: "large" }}>Laden Sie ein Einführungsvideo für den Chatbot hoch.</label>
            {/* <p>Wird im Intro des Chatbots angezeigt</p> */}

            <Upload {...propsMedia} maxCount={1} listType='picture' >
              <Button style={{ width: "450px", height: "150px", backgroundColor: "#fafafa", border: "dashed 0.3px" }} icon={<InboxOutlined style={{ fontSize: '350%', color: "#257dfe" }} />}><br></br><span>Hochladen: Videos (mp4)</span></Button>

            </Upload>

          {job.introVideo!="" && job.introVideo!= undefined && <p>1 Videodatei mit URL vorhanden: <a href={job.introVideo} target='_blank'>Einführungsvideo</a> Laden Sie eine neue Videodatei hoch, um die alte zu ersetzen</p>}
          </Col>

        </Row>
        <Row gutter={24} style={{ display: 'flex', alignItems: 'center' }}>
          <Col span={12} style={{ marginTop: "10px" }}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>Kurzbeschreibung des Chatbots auf Deutsch</label>
            <p>Wird im Intro des Chatbots angezeigt</p>
            <TextArea
              defaultValue={job.introScreenInfoDE}
              key="introDE"

              onChange={(e) => {
                onjobChange({ ...job, introScreenInfoDE: e.target.value })
              }
              }

              autoSize={{ minRows: 2, maxRows: 3 }}
            />


          </Col>
          <Col span={12}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>Kurzbeschreibung des Chatbots auf Englisch</label>
            <p>Wird im Intro des Chatbots angezeigt</p>
            <TextArea
              defaultValue={job.introScreenInfoEN}
              key="introEN"

              onChange={(e) => {
                onjobChange({ ...job, introScreenInfoEN: e.target.value })
              }
              }

              autoSize={{ minRows: 2, maxRows: 3 }}
            />


          </Col>


        </Row>


        <Row gutter={24} style={{ display: 'flex', alignItems: 'center', marginTop: "30px" }}>
          <Col span={12}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>Willkommensnachricht auf Deutsch</label>
            <p>Geben Sie die erste Nachricht ein, die vom Chatbot angezeigt werden soll</p>
            <TextArea
              defaultValue={job.welcomeMsgDE || ""}
              key="welcomeDE"
              onChange={(e) => {
                onjobChange({ ...job, welcomeMsgDE: e.target.value })
              }
              }

              autoSize={{ minRows: 2, maxRows: 4 }}
            />


          </Col>

          <Col span={12}>
            <label style={{ fontWeight: "bold", fontSize: "large" }}>Willkommensnachricht auf Englisch</label>

            <p>Geben Sie die erste Nachricht ein, die vom Chatbot angezeigt werden soll</p>
            <br></br>
            <TextArea
              defaultValue={job.welcomeMsgEN || ""}
              key="welcomeEN"
              style={{ marginTop: "-20px" }}
              onChange={(e) => {
                onjobChange({ ...job, welcomeMsgEN: e.target.value })
              }
              }

              autoSize={{ minRows: 2, maxRows: 4 }}
            />


          </Col>


        </Row>


      </fieldset>


      <Row gutter={24} style={{ display: 'flex', alignItems: 'center' }}>
        <Col span='5'>
          <h3>Status</h3>
          <Space>
            {/* <Tag color={job.activeChatbot ? 'green' : 'blue'}>
              {job.activeChatbot ? 'Öffentlich' : 'Entwurf'}
            </Tag>
            <Button
              type='primary' shape='round' icon={<GlobalOutlined />}
              onClick={job.activeChatbot ? onUnpublish : onPublish}
            >
              {job.activeChatbot ? 'Zu Entwurf' : 'Veröffentlichen'}
            </Button> */}
            <Switch checkedChildren="Veröffentlichen" unCheckedChildren="Zu Entwurf" defaultChecked={job.activeChatbot ? true : false}  onChange={(e)=>{
            
             if(e){
              onPublish()
            }
            else{
              onUnpublish()
            }
          
          }}
             />
    
          </Space>

        </Col>
        <Col>
          <h3>Quellcode für die Integration des Chatbots</h3>
          <Button style={{ backgroundColor: "#598c70", color: "white" }} onClick={showModal}>
            Klick mich!
          </Button><Tooltip title={"Code für den Webmaster, um den Chatbot in die Website der Organisation zu integrieren"} >
        <InfoCircleOutlined style={{marginLeft:"5px",color:"#1477ff"}}/>
    </Tooltip>

        </Col>

      </Row>
      <div style={{
        position: "fixed",
        bottom: 0,
        right: 0
      }}>
        <div className='speech-bubble'>Klick mich</div>
      </div>
      <ChatClient
        objectId={id}
        userId={job.user}
        universityId={job.user}
        chatbotName={job.name}
        dummyRequest={true}
        language={language}
        welcomeMsgDE={job.welcomeMsgDE}
        welcomeMsgEN={job.welcomeMsgEN}
        introVideo={job.introVideo}
        langWeiterMain={(job.langWeiterMain == "" || job.langWeiterMain==undefined) ? "Weiterer Klärungsbedarf" : job.langWeiterMain}
        // accessToken={token}
        // chatbotId={id}
        matriculationNumber={job.matriculationNumber}
        chatbotBubbleIcons={job.selectedBubbleIcon}
        chatbotProfileImage={job.selectedProfileImage}
        chatbotLook={
          {
            chatbotHeader: {
              chatbotHeaderBackgroundColor: job.headerColor,
              chatbotHeaderIconFontColor: job.headerIconFontColor,
            },
            chatbotBackground: {
              chatbotBackgroundColor: job.chatbotBackgroundColor,
            },
            textBoxUser: {
              textBoxUserColor: job.textBoxColorUser,
              textBoxUserFontColor: job.fontColorUser,
              textBoxFontStyle: job.fontstyleUser,
            },
            textBoxChatbotReply: {
              textBoxChatbotReplyColor: job.textBoxColorChatbotReply,
              textBoxChatbotReplyFontColor: job.fontColorChatbotReply,
              textBoxChatboxReplyFontStyle: job.fontstyleChatbotReply,
            },
            UIGroupA: {
              UIGroupAUIBackground: job.uiBackgroundGroupA,
              UIGroupAUIHighlight: job.uiHighLightGroupA,
            },
            UIGroupB: {
              UIGroupBUIBackground: job.uiBackgroundGroupB,
              UIGroupBUIHighlight: job.uiHighLightGroupB,
            },
            chatbotLookName: job.name,
          }}
      ></ChatClient>
      <Modal
        open={open}
        title="Chatbot Integration"
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Schließen
          </Button>,
        ]}
      >
        <h4>Kopieren Sie das folgende Skript und fügen Sie es in Ihre HTML-Seite ein, um den Chat-Client in Ihre Website zu integrieren.</h4>
        <p style={{ backgroundColor: "lightagrey", padding: "60px", fontFamily: "monospace" }}>{scriptTag}</p>
        <br></br>
        <br></br>
        <br></br>
        <p>Bitte fügen Sie den folgenden Parameter nach dem Token im obigen Skript hinzu, um den Chatclient mit normalem oder Vollbildmodus einzubetten.</p>

<p>für normal: &windowtype=min</p>
<p>für Vollbild/Großbild: &windowtype=full</p>

      </Modal>
    </Form>


  )
}

export default GeneralSettings