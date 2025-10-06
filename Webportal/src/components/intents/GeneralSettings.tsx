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
  Tooltip
} from 'antd'
import {
  GlobalOutlined,
  DeleteTwoTone,
  SoundTwoTone,
  DownOutlined,
  PlusCircleFilled,
  MinusCircleFilled,
  SendOutlined,
  PlusOutlined,
  CaretRightFilled,
  InfoCircleOutlined
} from '@ant-design/icons'
import { JobOfferBlock } from '../../types/JobOffers'
import "../../styles.css"
import 'react-phone-number-input/style.css'
import { IntentClass } from '../../types/IntentClass'
import { useEffect, useState } from 'react'
import { showNotification } from '../../helpers/notification'
import TextArea from 'antd/es/input/TextArea'
import { useLocation } from 'react-router-dom'



type GeneralSettingsProps = {
  intent: IntentClass,
  onIntentChange: (updateIntent: IntentClass) => void,
  parseRef: any
}

const GeneralSettings = ({ intent, onIntentChange, parseRef }: GeneralSettingsProps) => {


  const [changedState, setChangedState] = useState<boolean>(false)
  const [changecount, setchangecount] = useState<number>(0)
  const location = useLocation()
  const [anzeigname, setAnzeigname] = useState<string>()
  const [linkTreeUrl, setlinkTreeUrl] = useState<string>()

  const [nameIntent, setNameIntent] = useState<string>(intent.name)
  const errorCss = { borderColor: "red", width: "500px", height: "55px" }
  const errorCssInvert = { borderColor: "rgb(217 217 217)", width: "500px", height: "55px" }
  const [name, setName] = useState<string>(intent.name)
  const handleAnzeigename = (e: { target: { name: any; value: any } }, index: number) => {
    setAnzeigname(e.target.value)
  };
  // handle input change for link tree url
  const handleLinkTreeURL = (e: { target: { name: any; value: any } }, index: number) => {
    var val: string = e.target.value

    setlinkTreeUrl(val)
  };
  useEffect(() => {
    if (changedState == true) {

      location.state = { changedstate: changedState, unSavedObj: intent, parseRef: parseRef }
    }
  }, [changedState])

  useEffect(() => {
    if (changecount > 3) {
      setChangedState(true)

      //location.state = { changedstate: changedState, unSavedObj: job, parseRef: parseRef }
    }
    setchangecount(changecount + 1)
  }, [intent])
  const [errorsValChanged, setErrorCounter] = useState<number>(0)
  //const errorsVal = errorsValProp
  const [errorsVal, setErrorsVal] = useState<{
    name: boolean,

  }>({
    name: false,

  })
  useEffect(() => {
    onIntentChange({ ...intent, name: nameIntent })
  }, [nameIntent])
  const requiredField = <p style={{ color: "red", fontSize: "large", marginBottom: "" }}>* <span style={{ fontSize: "small", color: "#ae9c9c" }}>Dieser Wert ist erforderlich</span></p>

  //handle click event of the hashtag add button
  const handleInputAdd = () => {
    if (anzeigname && linkTreeUrl) {
      if (intent.scenario == undefined) {
        onIntentChange({ ...intent, scenario: [{ 'anfrag': anzeigname, 'antwort': linkTreeUrl }] })
      }
      else {
        if (intent.scenario.filter(e => e.anfrag === anzeigname || e.antwort === linkTreeUrl).length > 0) {
          showNotification({
            type: 'error',
            title: 'Doppelte Einträge gefunden',
            message: ''
          })
          return false
        }
        intent.scenario.push({ 'anfrag': anzeigname, 'antwort': linkTreeUrl })
        //job.hashtags.push({'hashtag':hashtag})
        onIntentChange({ ...intent, scenario: intent.scenario })
      }


    }


  }

  // handle hashtag edit func
  const handleInputChangeEditAnzeiganame = (e: { target: { name: any; value: any } }, index: number) => {
    if (e.target.value != "") {
      intent.scenario[index].anfrag = e.target.value
      onIntentChange({ ...intent, scenario: intent.scenario })
    }
    else {
      showNotification({
        type: 'error',
        title: 'Einträge können nicht bearbeitet werden',
        message: 'Bitte versuchen Sie es erneut'
      })
    }
  };

  const handleInputChangeEditURL = (e: { target: { name: any; value: any } }, index: number) => {
    var val: string = e.target.value


    if (e.target.value != "") {
      intent.scenario[index].antwort = val
      onIntentChange({ ...intent, scenario: intent.scenario })
    }
    else {
      showNotification({
        type: 'error',
        title: 'Einträge können nicht bearbeitet werden',
        message: 'Bitte versuchen Sie es erneut'
      })
    }
  };

  //handle click event of the hashtag Remove button
  const handleRemoveClick = (index: number) => {
    if (intent.scenario) {
      let arr = intent.scenario
      arr.splice(index, 1)
      onIntentChange({ ...intent, scenario: arr })
    }
  };

 
  return (
    <div style={{ backgroundColor: "white", height: "2000px", paddingBlock: "10px", padding: "50px" }}>

      <label>Name des Speziallfalls:</label> <Tooltip title={"Falls ein Spezialfall eintritt (z. B. Streik des ÖPNVs) können Sie hier eine vorgefertigte Antwort festlegen, die der Chatbot ausgibt."} >
                              <InfoCircleOutlined style={{marginLeft:"8px",color:"#1477ff"}}/>
                          </Tooltip>
      <Row gutter={26} style={{ marginLeft: "1px", marginTop: "15px" }}>
        <Input
          // style={{width:"320px", marginBlock:"10px", marginLeft:"10px", height:"45px"}}

          style={errorsVal.name ? errorCss : errorCssInvert}
          placeholder='Füge den Namen eines Szenarios hinzu'

          defaultValue={intent.name}
          //value={job.title}
          onChange={(e) => {
            setNameIntent(e.target.value)
            var errorVal = errorsVal
            errorVal.name = false
            setErrorsVal(errorVal)
          }}

        />

      </Row>

      {requiredField}
      <br></br>
      <h4>Frage-Antwort-Paare hinzufügen:</h4>

      <Row gutter={26} style={{ marginBottom: '10px', marginLeft: "1px", marginTop: "20px" }}><h4 style={{ marginTop: '5px' }}> </h4>
        <Form.Item label='Frage' name='Frage'  >
          <TextArea
            style={{ width: '500px' }}
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder='Füge eine Benutzeranfrage hinzu'
            defaultValue=''
            disabled={false}
            onChange={e => {
              handleAnzeigename(e, 0)
            }}
          /></Form.Item>
        <Form.Item style={{ marginLeft: "20px" }} label='Antwort' name='Antwort' >
          <TextArea
            style={{ width: '500px' }}
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder='Füge eine Antwort hinzu'
            defaultValue=''
            disabled={false}
            onBlur={e => {
              handleLinkTreeURL(e, 0)
            }}

          />
        </Form.Item>

        <Col style={{ marginLeft: "2px", marginTop: "3px" }}>
          {/* <button onClick={() => handleInputAdd()}>Hinzufügen<PlusCircleFilled disabled={false} style={{ fontSize: '18px', color: '#08c', marginLeft: "2px", marginTop: "2px" }}  ></PlusCircleFilled> </button> */}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleInputAdd()}>
            Hinzufügen </Button>
        </Col>
      </Row>
      {intent.scenario && intent.scenario.map((x, i) => {
        return (
          <Row style={{ marginBottom: '10px', marginLeft: "1px", marginTop: "20px" }}><h4 style={{ marginRight: '5px', marginTop: '8px' }}> <CaretRightFilled />  </h4>
            <Form.Item label='Frage'   >
              <TextArea
                style={{ width: '500px' }}
                autoSize={{ minRows: 3, maxRows: 5 }}
                placeholder='Füge eine Benutzeranfrage hinzu'
                defaultValue={x.anfrag}
                disabled={false}
                onBlur={e => {
                  handleInputChangeEditAnzeiganame(e, 0)
                }}
              /></Form.Item>
            <Form.Item style={{ marginLeft: "20px" }} label='Antwort' name='Antwort'  >
              <TextArea
                style={{ width: '500px' }}
                autoSize={{ minRows: 3, maxRows: 5 }}
                placeholder='Füge eine Antwort hinzu'
                defaultValue={x.antwort}
                disabled={false}
                onBlur={e => {
                  handleInputChangeEditURL(e, 0)
                }}
              /></Form.Item>
            <Col style={{ marginLeft: "2px", marginTop: "1px" }}>
              {/* <MinusCircleFilled style={{ marginLeft: '5px', fontSize: '25px', color: '#08c' }} onClick={() => handleRemoveClick(i)} className="mr10" /> */}
              <Button danger style={{ marginLeft: '8px' }} icon={<MinusCircleFilled />} onClick={() => handleRemoveClick(i)}>
                Löschen </Button>
            </Col>
          </Row>
        );
      })}



    </div>

  )
}

export default GeneralSettings

