import { Table, Tag, Button, Space, Result, Empty, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import PageContainer from '../../components/layout/PageContainer'
import Parse from 'parse'
import { useState } from 'react'
import { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Loading } from '../../components/common/Loading'
import { showNotification } from '../../helpers/notification'
import { IntentClass, Intents, generateIntent } from '../../types/IntentClass'
import { ROUTES } from '../../config/routes'
import { SERVER_URL_parsefunctions } from '../../config/parse'

const Overview = ({ ...data }) => {
  let history = useHistory()

  const [intents, setIntents] = useState<IntentClass[] | null>(null)
  const [error, setError] = useState<boolean>(false)

  var currentUser = Parse.User.current()

  const newFormButtonUI = ()=>{
    return (
      <Button type="primary" onClick={onNewIntent} style={{
        background: "green", border: 'green', position: 'absolute',
        right: '41px',
        top: '100px',
      }}>
        + Neues Spezialfall erstellen
      </Button>
    )
  }
 
 
  useEffect(() => {
    if (!currentUser) return
    const getAllIntents = async () => {
      const query = new Parse.Query(Intents)
      if (currentUser?.attributes.role !== 'admin') {
        query.equalTo('user', currentUser?.id)
      }
      try {
        var results = await query.findAll()
        const parsedResults = results.map((result) => {
          const attributes = result.attributes as IntentClass
          return { ...attributes, id: result.id }
        })
        setIntents(parsedResults)
      } catch (error) {
        console.log(error)
        setError(true)
      }
    }
    getAllIntents()
  }, [currentUser])

  // User creates a new job
  const onNewIntent = async () => {
    if (!currentUser) return
    try {
      const generatedId = await generateIntent({
        name: '',
        user: currentUser.id,
      })
      history.push(ROUTES.IntentsState+"/" + generatedId)
    } catch (error) {
      // ToDo
    }
  }

  const onDeleteJob = async (id: string) => {
    if (!currentUser) return
    const query = new Parse.Query(Intents)
    query.equalTo('user', currentUser.id)
    query.equalTo('objectId', id)
    try {
      const jobToDelete = await query.first()
      await jobToDelete?.destroy()
      setIntents(intents ? intents.filter((intents) => intents.id !== id) : null)
      let formData = { url: "", fileName: id+"_intent", user: currentUser.id, nameWOS:  id+"_intent" }
                const response = fetch(
                    SERVER_URL_parsefunctions+"/deletePythonFile",
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
    } catch (error) {
      showNotification({
        title: 'Fehler beim Löschen',
        message: 'Bitte versuche es später erneut',
        type: 'error',
      })
    }
  }

  const columns = [
    {
      title: 'Name des Spezialfall',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <b>{text}</b>,
    },
    
    {
      title: 'Aktionen',
      key: 'action',
      dataIndex: 'id',
      render: (id: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Space>
            <Link to={ROUTES.IntentsState+"/" + id}>
              <Button type='primary'>Bearbeiten</Button>
            </Link>
            <Popconfirm
              placement='rightTop'
              title='Do you want to delete the chatbot?'
              okText='Yes, Delete'
              cancelText='Cancel'
              onConfirm={() => onDeleteJob(id)}
            >
              <Button icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        </div>
      ),
    },
  ]

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

  if (!intents)
    return (
      <PageContainer
        pageId='5'
        title=' Übersicht'
      >
        <Button type="primary" onClick={onNewIntent} style={{
          background: "green", border: 'green', position: 'absolute',
          right: '100px',
          top: '100px',
        }}>
          + Neues Spezialfall erstellen
        </Button>

        <Loading />
      </PageContainer>
    )

  if (intents.length === 0)
    return (
      <PageContainer
        pageId='5'
        title='Übersicht'
      >
        <Button type="primary" onClick={onNewIntent} style={{
          background: "green", border: 'green', position: 'absolute',
          right: '100px',
          top: '100px',
        }}>
          + Neues Spezialfall erstellen
        </Button>


        <Empty description={<span>Keine Spezialfall gefunden</span>} />
      </PageContainer>
    )

  return (
    <PageContainer
      pageId='5'
      title='Übersicht'
    >
      <Button type="primary" onClick={onNewIntent} style={{
        background: "green", border: 'green', position: 'absolute',
        right: '41px',
        top: '100px',
      }}>
        + Neues Spezialfall erstellen
      </Button>


      <Table style={{width:"500px", marginLeft:"25%", marginTop:"5%"}} columns={columns} dataSource={intents} />
    </PageContainer>
  )
}

export default Overview
