

import { Space, Button, Layout } from 'antd'
import { useHistory } from 'react-router-dom'

import { Footer } from 'antd/lib/layout/layout'


const FooterBar = () => {

    const history = useHistory()
    return (

        <Layout >
            
            <Layout>
           
                <Footer style={{ backgroundColor: "#f9f7f7", fontSize: '13px', textAlign: 'right', display: 'flex', justifyContent: 'space-between',zIndex:99999 }}>
                
                    <div style={{ color: 'grey', textAlign: 'left', display: 'inline-block' }} > © Copyright - What2Study</div>
                    <a href="https://www.cpstech.de/what2study/Impressum/" className="onHover" style={{ color: 'grey',marginRight:"50px" }}>Impressum</a>
                </Footer > 
            </Layout >
    </Layout>
    )

    
}

export default FooterBar
