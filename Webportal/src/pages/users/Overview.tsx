import { Table, Row, Col, Button, Space, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Parse from 'parse'
import { UserType } from '../../types/user'
import { Loading } from '../../components/common/Loading'
import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <b>{name}</b>,
  },
  {
    title: 'Email',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Adresse',
    dataIndex: 'address',
    key: 'street',
    render: (street: string, object: UserType) => (
      <>
        <p>{street}</p>
        <p>
          {/* {object.zip} {object.city} */}
        </p>
      </>
    ),
  },
  {
    title: 'Beschreibung',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Aktionen',
    dataIndex: 'id',
    key: 'aktion',
    render: (id: string) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Space>
          <Link to={'/companies/' + id}>
            <Button type='primary'>Bearbeiten</Button>
          </Link>
          <Popconfirm
            placement='rightTop'
            title='Willst Du das Unternehmen wirklich löschen? Alle Einstellungen gehen unwiderruflich verloren.'
            okText='Ja, Löschen'
            cancelText='Abbrechen'
          >
            <Button icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>
    ),
  },
]

const Overview = () => {
  const [allCompanies, setAllCompanies] = useState<UserType[] | null>(null)

  useEffect(() => {
    const getAllCompanies = async () => {
      const query = new Parse.Query(Parse.User)
      query.equalTo('role', 'company')
      const allCompanies = await query.findAll()
      const parsedResults = allCompanies.map((el) => {
        const attributes = el.attributes as UserType
        return { ...attributes, id: el.id }
      })
      setAllCompanies(parsedResults)
    }
    getAllCompanies()
  }, [])

  if (!allCompanies) return <Loading />

  return (
    <Row gutter={24}>
      <Col span={24}>
        <Table columns={columns} dataSource={allCompanies} />
      </Col>
    </Row>
  )
}

export default Overview
