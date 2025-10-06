import { useEffect, useState } from 'react'
import { Tabs, Result, Row } from 'antd'
import PageContainer from '../../components/layout/PageContainer'
import GeneralSettings from '../../components/intents/GeneralSettings'
import { useHistory, useParams } from 'react-router-dom'
import Parse from 'parse'
import { showNotification } from '../../helpers/notification'
import { useLocation } from 'react-router-dom';
import { IntentClass, Intents } from '../../types/IntentClass'
import { SERVER_URL_parsefunctions } from '../../config/parse'
import { toBase64 } from '../../helpers/toBase64'
const { TabPane } = Tabs

const EditJobs = () => {
  let history = useHistory()
  const { id } = useParams<{ id: string }>()
  const [intent, setIntents] = useState<IntentClass | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [parseRef, setParseRef] = useState<Parse.Object>()
  const [pending, setPending] = useState<boolean>(false)
  const location = useLocation()
  var currentUser = Parse.User.current()
  
  
  useEffect(() => {
    const query = new Parse.Query(Intents)
    query
      .get(id)
      .then(async (res) => {
        setIntents(res.attributes as IntentClass)
        setParseRef(res)
      })
      .catch(() => {
        setError(true)
      })
  }, [id])

  const [base64, setBase64] = useState<any>()
  const [fileName, setFileName] = useState<string>("")
  const [url, setUrl] = useState<string>("")
  

 
  // return form HTML 

  const submitKnowledgeBase = async (base64,filename) => {
    if (base64 != undefined) {
      let fileObjName = "textUploadIntent"
      let className = "TEXT"
      let propertyName = "text"
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
        
       
          let formData = { url: url, fileName:filename , user: currentUser?.id, indexFile: "", type: "text",transcript:"" }


         fetch(
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
         

          let formData2 = { user: currentUser?.id }
          showNotification({
            title: 'Training initiiert',
            message: 'Der Chatbot wird auf Basis der Wissensdatenbank trainiert',
            type: 'info',
          })
      
          const response2 = fetch(
            SERVER_URL_parsefunctions + "/startEmbeddings",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": "what2study",
                "X-Parse-Master-Key": "what2studyMaster",
              },
              body: JSON.stringify(formData2),
            }
          );
        })
          
      }
  }

  
  const onSave = async () => {
      if (intent && parseRef) {
        setPending(true)
        try {
          var temp =  parseRef.save(intent).then(async (obj)=>{
            var string ="Title of topic/intext: "+obj.attributes.name+". Following text contains question answer pairs. If user asks a question that relates to or matches following questions then provide the asnwer given in this text exactly and keep the context of title/tag/keyword "+obj.attributes.name +"in mind.\n\n"
            if(obj.attributes.scenario.length > 0){
            obj.attributes["scenario"].forEach(element => {

              string = string + element.anfrag + "\n" + element.antwort + "\n\n"
            });
            var blob = new Blob([string], { type: 'text/plain' });
            var file = new File([blob], "foo.txt", {type: "text/plain"});
            var filename = obj.id+"_intent.txt"
            const base64 = await toBase64(file).then((base64)=>{
              submitKnowledgeBase(base64,filename)
            })
            
            }
          
          })
          var curUserobject = await Parse.User.current()
          
          showNotification({
            title: 'Erfolgreich gespeichert',
            message: `${intent.name} wurde erfolgreich gespeichert`,
            type: 'success',
          })
          return history.push('/what2study/intents')
        } catch (error) {
          showNotification({
            title: 'Fehler beim Speichern',
            message: `Es ist ein Fehler aufgetreten. Bitte stelle sicher, dass Du eine aktive Internetverbindung hast und versuche es erneut.`,
            type: 'error',
          })
        }
      }
    return
  }

  if (error)
    return (
      <PageContainer pageId='5' title='Fehler beim Laden der Chatbots'>
        <Result
          status={500}
          title='Fehler beim Laden der Chatbots'
          subTitle='Bitte versuche es später erneut'
        />
      </PageContainer>
    )

  if (!intent)
    return (
      <PageContainer pageId='5' title='Absichten werden geladen...'>
        <h1>Lädt...</h1>
      </PageContainer>
    )

  return (
    <PageContainer
      button
      buttonText='Speichern'
      buttonCallback={onSave}
      pageId='5'
      //title={`"${job.title}" bearbeiten`}
      title={intent?.name ? '"' + intent?.name + '" bearbeiten' : ""}
      buttonLoading={pending}
    >

      <GeneralSettings
        intent={intent}
        onIntentChange={(updateIntent: IntentClass) => setIntents(updateIntent)}
        parseRef={parseRef}
      />
     
    </PageContainer>
  )
}

export default EditJobs
