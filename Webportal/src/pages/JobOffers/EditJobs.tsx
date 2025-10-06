import { useEffect, useState } from 'react'
import { Tabs, Result, Row, Button } from 'antd'
import PageContainer from '../../components/layout/PageContainer'
import { chatbots, JobOfferBlock } from '../../types/JobOffers'
import GeneralSettings from '../../components/jobs/GeneralSettings'
import { useHistory, useParams } from 'react-router-dom'
import Parse from 'parse'
import { showNotification } from '../../helpers/notification'
import { UserType, curUser } from '../../types/user'
import { useLocation } from 'react-router-dom';
const { TabPane } = Tabs

const EditJobs = () => {
  let history = useHistory()
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<JobOfferBlock | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [parseRef, setParseRef] = useState<Parse.Object>()
  const [pending, setPending] = useState<boolean>(false)
  const location = useLocation()

  // useEffect(() => {
  //   // runs on location, i.e. route, change
  //   location.state = { changedstate: "true", unSavedObj: job, parseRef: parseRef }
  // }, [job])

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
  async function simp(imageBase64) {
    if (imageBase64.length > 270) {
      return await imageBaseToUrl(imageBase64)
      // imageList.indexOf(imageBase64) !== -1 && imageList.splice(imageList.indexOf(imageBase64), 1)
    }
    else { return false }
  }
  useEffect(() => {
    const query = new Parse.Query(chatbots)
    query
      .get(id)
      .then(async (response) => {
        let changeOfPrompt = 0
        if(response.attributes.defaultPrompt == undefined){
          response.set("defaultPrompt",  'You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.\nIf the question is not related to the context, please answer with "I do not have it in my knowledge, please contact the student advisory service". \nYou should act as a study advisor. So students and people who are interested in studying will come to you with questions about their study programs. Answer in German or English. You should help them. Nutze geschlechtssensible Sprache und gendere mit Gendersternchen (z. B. Student*innen, Dozent*innen).')
          changeOfPrompt = changeOfPrompt + 1
        }
        if(response.attributes.customPrompt == undefined){
          response.set("customPrompt", 'You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.\nIf the question is not related to the context, please answer with "I do not have it in my knowledge, please contact the student advisory service". \nYou should act as a study advisor. So students and people who are interested in studying will come to you with questions about their study programs. Answer in German or English. You should help them. Nutze geschlechtssensible Sprache und gendere mit Gendersternchen (z. B. Student*innen, Dozent*innen).' )
          changeOfPrompt = changeOfPrompt + 1
     
        }
        response.save().then(async (res)=>{
          var images = [] as any
          var imagesBase64ToRemove = [] as any
          var imageList = [...res.attributes.bubbleIcon]
          for (const imageBase64 of imageList) {
            var response = await simp(imageBase64)
            if (response != false) {
              images.push(response?.attributes?.bilds?._url)
              imagesBase64ToRemove.push(imageBase64)
            }
            else { console.log("false is returned") }
          }
          imagesBase64ToRemove.forEach(img => {
            imageList.indexOf(img) !== -1 && imageList.splice(imageList.indexOf(img), 1)
          });
  
          imagesBase64ToRemove.forEach(img => {
            res.attributes.bubbleIcon.indexOf(img) !== -1 && res.attributes.bubbleIcon.splice(res.attributes.bubbleIcon.indexOf(img), 1)
          });
          images.forEach(img => {
            res.attributes.bubbleIcon.push(img)
          });
          setJob(res.attributes as JobOfferBlock)
          setParseRef(res)
        })
        
      })
      .catch(() => {
        setError(true)
      })
  }, [id])
  useEffect(() => {
    if (job?.activeChatbot == true) {
      onSave()
    }
  }, [job?.activeChatbot])

  const onSave = async () => {
    var save = true
    if (job?.activeChatbot == true) {
      if (job?.name) {
        save = true
      }
      else {
        save = false
      }

    }
    if (save) {
      if (job && parseRef) {
        setPending(true)
        try {
          var temp = await parseRef.save(job)
          // making all publish
          // if (job?.activeChatbot == true) {
          //   const query = new Parse.Query(chatbots)
          //   query.notEqualTo("objectId", temp.id)
          //   query.equalTo("user", temp.attributes.user)
          //   query.limit(1000000000)
 
          //   query.find().then((res) => {
          //     if (res.length > 0) {
          //       res.forEach(element => {
          //         element.set("activeChatbot", false)
          //         element.save()
          //       });
          //     }

          //   })
          // }
          var curUserobject = await Parse.User.current()
          if (curUserobject) {
            var queryDocument = new Parse.Query(curUser);
            var curUserParseObject = await queryDocument.get(curUserobject.id)
            curUserParseObject.addAllUnique('Joblist', temp.id)
            curUserParseObject.save()
          }
          showNotification({
            title: 'Erfolgreich gespeichert',
            message: `${job.name} wurde erfolgreich gespeichert`,
            type: 'success',
          })
          return history.push('/what2study/general')
        } catch (error) {
          showNotification({
            title: 'Fehler beim Speichern',
            message: `Es ist ein Fehler aufgetreten. Bitte stelle sicher, dass Du eine aktive Internetverbindung hast und versuche es erneut.`,
            type: 'error',
          })
        }
      }
    }
    else {
      showNotification({
        title: 'Fehler beim Speichern',
        message: `Es ist ein Fehler aufgetreten. Bitte stelle sicher, dass Du eine aktive Internetverbindung hast und versuche es erneut.`,
        type: 'error',
      })
    }
    return
  }

  if (error)
    return (
      <PageContainer pageId='15' title='Fehler beim Laden der Chatbots'>
        <Result
          status={500}
          title='Fehler beim Laden der Chatbots'
          subTitle='Bitte versuche es später erneut'
        />
      </PageContainer>
    )

  if (!job)
    return (
      <PageContainer pageId='15' title='Chatbots wird geladen...'>
        <h1>Lädt...</h1>
      </PageContainer>
    )

  return (
    <PageContainer
      button
      buttonText='Speichern'
      buttonCallback={onSave}
      pageId='15'
      //title={`"${job.title}" bearbeiten`}
      title={job?.name ? '"' + job?.name + '" bearbeiten' : ""}
      buttonLoading={pending}
    >

      <GeneralSettings
        job={job}
        onjobChange={(updatedJob: JobOfferBlock) => setJob(updatedJob)}
        parseRef={parseRef}
      />
      <Row gutter={24} style={{ marginTop: "10px", marginLeft: "1px" }}
      >
        <Button
          type="primary"
          style={{ float: "right" , marginTop:"40px"}}
          onClick={onSave}
        >
          <span> Speichern</span>
        </Button>
      </Row>

    </PageContainer>
  )
}

export default EditJobs
