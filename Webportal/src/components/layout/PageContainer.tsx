import { Layout, Modal, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import Logo from './Logo'
import styled from 'styled-components'
import MainMenu from './MainMenu'
import HeaderBar from './HeaderBar'
import FooterBar from './FooterBar'
import { Button } from 'antd'
import { useLocation } from 'react-router-dom'
import Parse from 'parse'
import { updateUser, curUser } from '../../types/user'
import { showNotification } from '../../helpers/notification'
const { Header, Sider, Content, Footer } = Layout

const MainContainer = styled(Layout)`
  min-height: 100vh;
`

const ContentContainer = styled(Layout)`
  padding: 10px 20px;
`

const MenuContainer = styled(Sider)`
  background: #fff;
`

const HeaderContainer = styled(Header)`
  background: #fff;
  display: flex;
  padding: 0 16px;
`

const FooterContainer = styled(Footer)`
  
        position: flex;
        bottom: 0;
        padding: 1px;
        Right:0;

`


type PageContainerProps = {
  title: string
  pageId?: string
  button?: boolean
  buttonCallback?: () => void
  buttonText?: string
  children: React.ReactNode
  descriptionText?: string
  buttonLoading?: boolean
  mango?:boolean
}

const PageContainer = ({
  title,
  pageId,
  button,
  buttonCallback,
  buttonText,
  children,
  descriptionText,
  buttonLoading,
}: PageContainerProps) => {
  const location = useLocation<Object>()
  // Modal
  const [visible, setVisible] = useState(false);
  const [updateFrom, setUpdateFrom] = useState<string>();
  const showModal = () => {
    setVisible(true);
  };

  const onSaveUpdates = async () => {
    var parseRef
    if (localStorage.getItem('className') && localStorage.getItem('id')) {
      const object = Parse.Object.extend(localStorage.getItem('className') || "")
      const query = new Parse.Query(object)
      if (localStorage.getItem('id')) {
        parseRef = await query.get(localStorage.getItem('id') || "")
      }
      else {
        parseRef = undefined
      }
    }
    if (updateFrom != "") {
      if (updateFrom == "home") {
        const { error } = await updateUser({ ...JSON.parse(localStorage.getItem('updatedObj') || "") })
        if (!error) {
          successNotificationFunc()
          handleCancel()
        }
      }
      if (updateFrom == "generalOffersState") {
        if (localStorage.getItem('updatedObj') != null) {
          if (parseRef) {
            var temp = await parseRef.save(JSON.parse(localStorage.getItem('updatedObj') || ""))
            successNotificationFunc()
            handleCancel()
          }
        }
      }
      if (updateFrom == "intentsState") {
        if (localStorage.getItem('updatedObj') != null) {
          if (parseRef) {
            var obj = JSON.parse(localStorage.getItem('updatedObj') || "")
            var temp = await parseRef.save(obj)
            successNotificationFunc()
            handleCancel()
          }
        }
      }
    }

    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
    localStorage.removeItem("updated");
    localStorage.removeItem("updatedObj");
    localStorage.removeItem("id");
    localStorage.removeItem("className");
    localStorage.removeItem("parseRef");

  };
  const successNotificationFunc = () => {
    showNotification({
      type: 'success',
      title: 'Erfolgreich gespeichert',
      message: 'Änderungen wurden erfolgreich gespeichert',
    })
  }
  useEffect(() => {
    if (localStorage.getItem('updated')) {
      setUpdateFrom(localStorage.getItem('updated') || "")
      showModal()
    }
  }
    , [localStorage.updated])
  return (
    <MainContainer>
      <HeaderContainer style={{ backgroundColor: "#f9f7f7" ,position:"fixed", width:"100%", left:0, top:0, right: 0, zIndex: 1000 }}>
        <Logo />
      </HeaderContainer>
      <Layout style={{marginTop:"63px"}}>
        <MenuContainer  >
          <MainMenu  activeTab={pageId || '1'} />
        </MenuContainer>
        <ContentContainer>
          <Content>
            <HeaderBar
              buttonLoading={buttonLoading}
              descriptionText={descriptionText}
              title={title}
              button={button}
              buttonText={buttonText}
              buttonCallback={buttonCallback}
            />
            <div style={{ padding: '24px' }}>{children}</div>
          </Content>
        </ContentContainer>


      </Layout>
      <FooterContainer style={{}}>
        <FooterBar />
      </FooterContainer >
      <Modal
        visible={visible}
        title="Warnung: Änderungen festgestellt "
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="Quest" danger type='text' onClick={handleCancel} >
            Änderungen verwerfen
          </Button>,
          <Button key="Quest" type='primary' onClick={onSaveUpdates} style={{
            background: "green", border: 'green', alignItems: 'center',
          }}>
            Daten speichern
          </Button>,
        ]}
      >
        <b> <i> Sie sind gegangen, ohne die Daten zu speichern. Wollen Sie die Änderungen speichern? </i></b>
      </Modal>
    </MainContainer>
  )
}

export default PageContainer
