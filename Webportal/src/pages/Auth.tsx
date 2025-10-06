import { useEffect, useState } from 'react'
import { Button, Card, Input, Form, Spin } from 'antd'
import styled from 'styled-components'
import { curUser, login, register } from '../types/user'
import { showNotification } from '../helpers/notification'
import { useHistory } from 'react-router-dom'
import Parse from 'parse'
import { verify } from 'crypto'
import { text } from '@fortawesome/fontawesome-svg-core'
import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`

const Auth = () => {
  const spinJSX = <Spin indicator={antIcon} />
  const errorCss = { borderColor: "red" }
  const errorCssInvert = { borderColor: "green" }
 
  const history = useHistory()
  history.push('/what2study/home')
  const [loginMode, setLoginMode] = useState<boolean>(true)

  const [tokenrecieved, setTokenRec] = useState<boolean>(false)

  const [tokenValidated, setTokenValidated] = useState<boolean>(false)

  const [loadingToken, setTokenLoading] = useState<boolean>(false)

  const [tokenValue, setTokenValue] = useState<string>()

  const [newPassword, setNewPassword] = useState('')
  const [passForgot, setPassForgot] = useState<boolean>(false)

  const [newPassFields, setNewPassFields] = useState<boolean>(false)
  
  const onChangeMode = () => setLoginMode(!loginMode)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState<boolean>(false)

  // this function doesnt work as intended, need modification and proper implementation in order to handle password update functionality
  const onPasswordForgot=()=>{
  setPassForgot(true)
  setLoginMode(false)
  }

  
  const sendNewPassword=()=>{
   // handle new password logic
      }
  const sendResetForm=()=>{
//     Parse.User.requestPasswordReset("faisal07m@gmail.com")
// .then(() => {
//   // Password reset request was sent successfully
// }).catch((error) => {
//   // Show the error message somewhere
//   alert("Error: " + error.code + " " + error.message);
// });
setTokenLoading(true)
    Parse.Cloud.run("sendEmail", { "object":{"ob" :email} }).then(function(result) {
      if(result)
     { setTokenRec(true)
      setTokenValue(result.token)
      setTokenLoading(false)
     }
      // ratings is 4.5
    });
  }
  const initAuthState=()=>{
    setPassForgot(false)
    setLoginMode(true)
  }
  const onRegister = async () => {
    localStorage.removeItem("updated");
    localStorage.removeItem("updatedObj");
    localStorage.removeItem("id");
    localStorage.removeItem("className");
    setLoading(true)
    // this checks if the email is a valid email string with text@text.text
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const validEmail = re.test(String(email).toLowerCase())
    if (email.trim() === '' || !validEmail) {
      setLoading(false)
      history.push('/what2study/home')
      return showNotification({
        title: 'Email unzulässig',
        message: 'Bitte gib eine valide Email Adresse an',
        type: 'error',
      })
    }
    if (password.trim() === '') {
      history.push('/what2study/home')
      setLoading(false)
      return showNotification({
        title: 'Passwort unzulässig',
        message: 'Bitte gib ein valides Passwort an',
        type: 'error',
      })
    }
    if (name.trim() === '') {
      history.push('/what2study/home')
      setLoading(false)
      return showNotification({
        title: 'Name unzulässig',
        message: 'Bitte gib einen validen Namen an',
        type: 'error',
      })
    }
    // continue only if checks passed
    const { error } = await register({ email, password, name, role: 'company' })
    if (error) {
      history.push('/what2study/home')
      showNotification({
        title: 'Fehler bei der Registrierung',
        message:
          'Bei der Registrierung ist etwas schief gegangen. Bitte überprüfe Deine Angaben',
        type: 'error',
      })
      setLoading(false)
    }
    else {
      history.push('/what2study/home')
      window.location.reload()
    }

  }
  

  const onLogin = async () => {
    localStorage.removeItem("updated");
    localStorage.removeItem("updatedObj");
    localStorage.removeItem("id");
    localStorage.removeItem("className");
    localStorage.setItem("identity","platform_")
    setLoading(true)
    const { error } = await login(email, password)
    if (error) {
      console.log("error")
      history.push('/what2study/home')
      showNotification({
        title: 'Fehler beim Login',
        message:
          'Beim Login ist etwas schief gegangen. Bitte überprüfe Deine Angaben',
        type: 'error',
      })
      setLoading(false)
    }
    else {
      history.push('/what2study/home')
      window.location.reload()
      
    }
  }

  return (
    <FormContainer style={{ display:"flex", flexDirection:"row" , backgroundColor: "aliceblue" , backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'}}>
      <p style={{ borderRadius:"70px", marginRight:"80px", backgroundImage: `url("https://cpstech.de/image/backgroundLogoW")`, backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat' , width: '35%',
    height: '35%'}}></p>
      <Card style={{ display:"inline-table", flexDirection:"column",borderRadius:"20px", backgroundSize: 'contain',width:"500px", height:"50%"}} title={loginMode && !passForgot ? 'Login' : !loginMode && !passForgot ? 'Registrieren' : 'Passwort zurücksetzen'}>
        {loginMode && !passForgot ? (
          <>
            <b>Willkommen zurück!</b>
            <p>Bitte melden Sie sich mit Ihren Zugangsdaten an</p>
          </>
        ) : !loginMode && !passForgot ? (
          <>
            <b>Willkommen</b>
            <p>Bitte geben Sie Ihre Account-Details ein</p>
          </>
        ): passForgot &&     <>
            <b>Willkommen</b>
            <p> Bitte senden Sie eine Reset-Anfrage</p>
          </>
      }
        <Form layout='vertical' name='basic'>
          {!loginMode && passForgot  ==false &&(
            <Form.Item label='Name der Organisation' name='name'>
              <Input onChange={(e) => setName(e.target.value)} />
            </Form.Item>
          )}
          {!newPassFields&&
          <Form.Item label='Email' name='email'>
            <Input onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>}

          {passForgot==false && <>
          <Form.Item label='Passwort' name='password' id='password'>
            <Input.Password
              onChange={(e) => setPassword(e.target.value)}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
     
            />
          </Form.Item>
          </>}
          {newPassFields && 
          <>
          <Form.Item label='Neues Passwort' name='newPassField' id='newPass'>
            <Input.Password
            defaultValue={""}
              //  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
               iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
               
               onChange={(e) => {
              setNewPassword(e.target.value)
              
              }} />
          </Form.Item>
           {/* <Form.Item label='New Password again' name='newPasswordAgain'>
           <Input onChange={(e) => verifyPassword(e.target.value)} />
         </Form.Item> */}
    
         </>
         
          }
          {passForgot ==false && <Button onClick={loginMode ? onLogin : onRegister} loading={loading}>
            {loginMode ? 'Login' : 'Registrieren'}</Button>
          }
           {passForgot && tokenrecieved &&  <Form.Item label='Token eingeben' name='token'>
            <Input
             style={tokenValidated==false ? errorCss : errorCssInvert}
                                   disabled={tokenValidated ? true:false}    
            type={'text'}
              onChange={(e) => {
                if(e.target.value.trim() === tokenValue?.trim()){
                  setNewPassFields(true)
                  setTokenValidated(true)
                  //setTokenRec(false)
                }
                else{
                  setNewPassFields(false)
                  setTokenValidated(false)
               
                }
              }
                }
            />
          </Form.Item>}
           {passForgot && tokenValidated==false &&<Button onClick={sendResetForm} loading={loading}>
           Reset-Token anfordern
            </Button>}
            {passForgot && tokenValidated==true && <Button onClick={sendNewPassword} loading={loading}>
            Neues Passwort Speichern
            </Button>}
           {loadingToken==true && spinJSX}
            
          
        </Form>
        <p
         style={{ display: "none",color: 'blue', marginTop: '25px', cursor: 'pointer', width:"fit-content" }}
        onClick={onPasswordForgot}
      >
        {passForgot == false && loginMode==true
          && 'Passwort vergessen?'
        }
      </p>
        <p
         style={{  color: 'blue', marginTop: '25px', cursor: 'pointer', width:"fit-content" }}
        onClick={passForgot == false ?onChangeMode  : initAuthState}
      >
        {loginMode &&'Noch keinen Account? Jetzt registrieren!'}
        {!loginMode && passForgot== false&& 'Bereits registriert? Zum Login'}
        {passForgot== true&& 'Zum Login'}
      </p>
      </Card>
      
    </FormContainer>
  )
}

export default Auth
