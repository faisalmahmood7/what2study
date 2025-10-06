import { Table, Tag, Button, Space, Result, Empty, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import PageContainer from '../../components/layout/PageContainer'
import { generateJobs, JobOfferBlock, chatbots } from '../../types/JobOffers'
import Parse from 'parse'
import { useState } from 'react'
import { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Loading } from '../../components/common/Loading'
import { showNotification } from '../../helpers/notification'

const Overview = ({ ...data }) => {
  let history = useHistory()

  const [jobs, setJobs] = useState<JobOfferBlock[] | null>(null)
  const [error, setError] = useState<boolean>(false)

  var currentUser = Parse.User.current()

  const newFormButtonUI = ()=>{
    return (
      <Button type="primary" onClick={onNewJob} style={{
        background: "green", border: 'green', position: 'absolute',
        right: '41px',
        top: '100px',
      }}>
        + Neuen Chatbot erstellen
      </Button>
    )
  }

  function clearJobIDfromUser(id){
   var jobList = currentUser?.attributes.Joblist
   jobList = jobList.filter(e => e !== id);
   currentUser?.unset("Joblist")
   currentUser?.addAllUnique("Joblist",jobList)
   currentUser?.save()
  }
 
  function checkProperties(obj) {
    for (var key in obj) {
        if(key != "user" && key !="type"&& key !="createdAt"&& key !="updatedAt" && key !="published"&& key !="Unterrichtsart" && key != "ausbildungAdressecolor")
        {   if (obj[key] && obj[key]!=0 && obj[key].length >0 && obj[key].lat!= 0 && obj[key].lng!= 0 && obj[key] &&obj[key][0].hashtag !="" )
            {   
                return false;
            }
        }
    }
    return true;
}
  useEffect(() => {
    if (!currentUser) return
    const getAllJobs = async () => {
      const query = new Parse.Query(chatbots)
      if (currentUser?.attributes.role !== 'admin') {
        query.equalTo('user', currentUser?.id)
      }
      try {
        var results = await query.findAll()
        var ids:String[]=[]
        results.forEach(async el => {
            if(checkProperties(el.attributes) ){
                ids.push(el.id)
                clearJobIDfromUser(el.id)
               
                await el.destroy()
                }
        });
        ids.forEach(id => {
            results = results.filter(function( obj ) {
                return obj.id !== id;
              });
        });
        // Format results for further use
        const parsedResults = results.map((result) => {
          const attributes = result.attributes as JobOfferBlock
          return { ...attributes, id: result.id }
        })
        setJobs(parsedResults)
      } catch (error) {
        console.log(error)
        setError(true)
      }
    }
    getAllJobs()
  }, [currentUser])

  // User creates a new job
  const onNewJob = async () => {
    if (!currentUser) return
    try {
      const generatedId = await generateJobs({
        name: '',
        user: currentUser.id,
      })
      history.push('/what2study/generalOffersState/' + generatedId)
    } catch (error) {
      // ToDo
    }
  }

  const onDeleteJob = async (id: string) => {
    if (!currentUser) return
    const query = new Parse.Query(chatbots)
    query.equalTo('user', currentUser.id)
    query.equalTo('objectId', id)
    try {
      const jobToDelete = await query.first()
      await jobToDelete?.destroy()
      setJobs(jobs ? jobs.filter((jobs) => jobs.id !== id) : null)
      clearJobIDfromUser(id)
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
      title: 'Name des Chatbots',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: 'Status',
      key: 'activeChatbot',
      dataIndex: 'activeChatbot',
      render: (published: boolean) => (
        <Tag color={published ? 'lime' : 'blue'}>
          {(published ? 'Veröffentlicht' : 'Entwurf').toUpperCase()}
        </Tag>
      ),
    },
    
    {
      title: 'Aktionen',
      key: 'action',
      dataIndex: 'id',
      render: (id: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Space>
            <Link to={'/what2study/generalOffersState/' + id}>
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
      <PageContainer pageId='15' title='Fehler beim Laden der Chatbots'>
        <Result
          status={500}
          title='Fehler beim Laden der Chatbots'
          subTitle='Bitte versuche es später erneut'
        />
      </PageContainer>
    )

  if (!jobs)
    return (
      <PageContainer
        pageId='15'
        title='Übersicht'
      >
        <Button type="primary" onClick={onNewJob} style={{
          background: "green", border: 'green', position: 'absolute',
          right: '100px',
          top: '100px',
        }}>
          + Neuen Chatbot erstellen
        </Button>

        <Loading />
      </PageContainer>
    )

  if (jobs.length === 0)
    return (
      <PageContainer
        pageId='15'
        title='Übersicht'
      >
        <Button type="primary" onClick={onNewJob} style={{
          background: "green", border: 'green', position: 'absolute',
          right: '100px',
          top: '100px',
        }}>
          + Neuen Chatbot erstellen
        </Button>


        <Empty description={<span>Keine Chatbots gefunden</span>} />
      </PageContainer>
    )

  return (
    <PageContainer
      pageId='15'
      title='Übersicht'
    >
      <Button type="primary" onClick={onNewJob} style={{
        background: "green", border: 'green', position: 'absolute',
        right: '41px',
        top: '100px',
      }}>
        + Neuen Chatbot erstellen
      </Button>


      <Table columns={columns} dataSource={jobs} />
    </PageContainer>
  )
}

export default Overview
