
import { Link, useHistory } from 'react-router-dom'
import { Tag, InputRef, theme, Input, Space, TableProps, Table, Button, Modal, TableColumnType, Image, Row, Form } from 'antd'

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { CheckCircleFilled, CheckCircleTwoTone, CiCircleFilled, CloseCircleFilled, CloseCircleTwoTone, DeleteOutlined, EditOutlined, EyeOutlined, KeyOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { TweenOneGroup } from 'rc-tween-one';
import { deleteKnowledgeItem, getAllKnowledgeBaseWithType, knowledgeBaseBlock } from '../types/knowledgeBase';
import { showNotification } from '../helpers/notification';

import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import { FilterDropdownProps } from 'antd/es/table/interface';
import ReactPlayer from 'react-player'
import Highlighter from 'react-highlight-words';
import { SERVER_URL, SERVER_URL_parsefunctions } from '../config/parse';
import TextArea from 'antd/es/input/TextArea';
type loc = {
    id: string
}
const FilesListTable: React.FC<loc> = (props: loc) => {

    type DataIndex = keyof DataType;
    interface DataType {
        key: string;
        name: string;
        hochgeladen: string;
        priority: string;
        expiry: string
        tags: string[];
        itemId: string,
        fileName: string,
        user: string,
        url: string,
        nestedLinks:string[],
        nPlus1:boolean,
        jobStatus:boolean,
        type:string,
        learnStatus:boolean
        url_org:string,
        transcript:string
    }


    const [urlViewer, setUrlViewer] = useState<string>("https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js")
    const [modal1Open, setModal1Open] = useState(false);
    const [modal2Open, setModal2Open] = useState(false);

    const [data, setData] = useState<DataType[]>()

    const [transcriptObj, setTranscriptObj] = useState<DataType>()

    const [dataNew, setDataNew] = useState<DataType[]>()

    const [tableElement, setTableElement] = useState<JSX.Element>()

    const [id, setId] = useState<string>(props.id)

    const [fileText, setFileText] = useState<string>("")

    const [mediaUrl, setMediaUrl] = useState<string>("")

    const [transcriptSelected, settranscriptSelected] = useState<string>("")
    

    const [nestedLinks, setNestedLinks] = useState<JSX.Element>()

    const [nestedLinksArr, setNestedLinksArr] = useState<string[]>([])

    const [fileTextJSX, setFileTextJSX] = useState<JSX.Element>(<></>)
    const [knowledgeBase, setKnowledgeBase] = useState<knowledgeBaseBlock[] | any>()

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    {/* <Button
            // onClick={() => clearFilters && handleReset(clearFilters)}
            onClick={()=> handleSearch([""], confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button> */}
                    {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button> */}
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setSearchText('');
                            handleSearch([""], confirm, dataIndex)
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    
    const updateData = async (record) => {
        await deleteKnowledgeItem(record.itemId)
        var index = data?.findIndex(obj => obj.itemId === record.itemId);
        if (index !== -1 && index != undefined) {
            if (data) {
                const objArr = data[index]
                let formData = { url: objArr.url, fileName: objArr.url.split("/").pop(), user: objArr.user, nameWOS: objArr.fileName }
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
            }
            data?.splice(index, 1);
            setDataNew(data)
        }

        showNotification({
            title: 'Erfolgreich gelöschte Datei',
            message: 'Erfolg',
            type: 'success',
        })



    }

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Name der Datei',
            dataIndex: 'name',
            width:"400px",
            key: 'name',
            ...getColumnSearchProps('name'),
            render: (_, record) => <div style={{width:"400px"}}> {id !="4" ? <p>{record.url_org}</p>:  <a href={record.url_org} target='_blank'> {record.url_org}</a> }{ id !="4" && <a href={record.url} download={record.fileName}>{id == "4"?"Datei herunterladen":"Datei herunterladen"}  </a>}</div>,
        },
        // {
        //     title: 'URL',
        //     dataIndex: 'url_org',
        //     key: 'url_org',
        // },
        {
            title: 'Hochgeladen am',
            dataIndex: 'hochgeladen',
            width:"150px",
            key: 'hochgeladen',
        },
        {
            title: 'Priorität',
            dataIndex: 'priority',
            key: 'priority',
        },
        {
            title: 'Ablaufdatum',
            dataIndex: 'expiry',
            key: 'expiry',
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (_, { tags }) => (
                <>
                    {tags.map((tag) => {
                        let color = 'geekblue' ;
                        return (
                            <Tag color={color} key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Lernfortschritt',
            key: 'learnStatus',
            dataIndex: 'learnStatus',
            render: (_, { learnStatus }) => (
                <>
                    { learnStatus ? <p style={{marginLeft:"20px", marginTop:"15px", fontSize:"Large"}}><CheckCircleTwoTone  twoToneColor="#52c41a" /></p>: <p style={{marginLeft:"20px",marginTop:"15px", fontSize:"Large"}}><CloseCircleTwoTone twoToneColor="red" /></p>
                    }
                </>
            ),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                   
                     { record.type=="url" && (record.jobStatus ? <p style={{marginTop:"13px", fontSize:"Large"}}><span style={{fontSize:"medium" }}>Crawl Job</span><CheckCircleTwoTone style={{marginLeft:"10px"}}  twoToneColor="#52c41a" /></p>: <p style={{marginTop:"13px", fontSize:"Large"}}><span style={{fontSize:"medium" }}>Crawl Job</span><CloseCircleTwoTone style={{marginLeft:"10px"}} twoToneColor="red" /></p>
                    )}
                    {
                     id!="4" ? <Button type="primary" icon={<EyeOutlined />} onClick={() => {

                        if (id == "2") {
                            textView(record.url)
                        }
                        if (id == "1") {
                            setUrlViewer(record.url)
                        }
                        if (id == "3") {
                            setMediaUrl(record.url)
                        }
                        if (id == "4") {
                            textView(record.url)
                        }
                        setModal1Open(true)

                    }}>Anzeigen</Button> : <a href={record.url} download={record.fileName}>{id == "4"?"Datei herunterladen":"Datei herunterladen"}  </a>
                }
                    {record.nPlus1 && record.nestedLinks.length>0 && 
                    
                    <Button type="primary" icon={<KeyOutlined />} onClick={() => {
                        // var html = <p> + record.nestedLinks.join("</p><p>") + "</p>;
                        var items=  record.nestedLinks.map((value, i) => {
                            return  <li><a>{value}</a></li>
                            
                          })
                       
                        setNestedLinks(<ul>{items}</ul>)
                        setNestedLinksArr(record.nestedLinks)
                        setModal1Open(true)

                    }}>Links ansehen</Button>
                    }
                    { record.transcript !="" && record.type=="media"&& <Button type='primary' icon={<EyeOutlined />}
                    
                    onClick={() => {
                        // var html = <p> + record.nestedLinks.join("</p><p>") + "</p>;
                        settranscriptSelected(record.transcript)
                        setModal2Open(true)

                    }}
                    
                    > Transcript</Button>}
                    <Button danger icon={<DeleteOutlined />}
                        onClick={(e) => {
                            updateData(record)
                        }}

                    >Löschen</Button>
                     
                   
                </Space>
            ),
        },
    ];



    const setTableData = async (id) => {
        let type = ""
        if (id == "1") {
            type = "pdf"
        }
        else if (id == "2") {
            type = "text"
        }
        else if (id == "3") {
            type = "media"
        }
        else if (id == "4") {
            type = "url"
        }
        let data: DataType[] = [];
           
        if (type != "") {

            let KB = await getAllKnowledgeBaseWithType(type);
            console.log(KB)
            if (KB != undefined && KB != null && Array.isArray(KB)) {
                var count = 1
                KB.forEach(element => {
                    var file_name =  element.attributes.name.replaceAll("/", "_")
                    if(type=="text"){
                        data.push(
                            {
                                key: "0",
                                name: "index.txt",
                                url_org: "index.txt file",
                                hochgeladen: "",
                                priority: "",
                                expiry:"",
                                tags: [],
                                itemId: "index",
                                url:"https://cpstech.de/indexfile" ,
                                fileName: "index.txt",
                                user: "",
                                nestedLinks: [],
                                jobStatus:true,
                                nPlus1:false,
                                type:"text",
                                learnStatus: true,
                                transcript:""
                            })
                    }
                    data.push(
                        {
                            key: count.toString(),
                            name: file_name,
                            url_org: element.attributes.name,
                            hochgeladen: element.createdAt.getDate() + "/" + element.createdAt.getMonth() + "/" + element.createdAt.getFullYear(),
                            priority: element.attributes.priority,
                            expiry: element.attributes.expires,
                            tags: element.attributes.tags,
                            itemId: element.id,
                            url: element.attributes.fileUrl,
                            fileName: element.attributes.name,
                            user: element.attributes.user,
                            nestedLinks: element.attributes.nestedLinks,
                            jobStatus:element.attributes.jobStatus,
                            nPlus1:element.attributes.nPlus1,
                            type:element.attributes.type,
                            learnStatus: element.attributes.learnStatus,
                            transcript:element.attributes.transcript
                        },
                    )
                    count = count + 1
                });
                
                setData(data)
            }
        }
       
    }

    useEffect(() => {
        setTableData(id)
    }, [id]);


    useEffect(() => {
    }, [data]);

    useEffect(() => {
        setData(dataNew)
        setTableData(id)
    }, [dataNew]);


    const textView = (raw) => {
        fetch(raw)
            .then(r => r.text())
            .then(text => {
                console.log('text decoded:', text);
                setFileText(text)
                setFileTextJSX(<> <p style={{ minHeight: "800px" }}> {text}</p></>)
            });
    }
    return (
        <div>
         <Table rowKey="Name" columns={columns} dataSource={data} />
            <Modal
                title="Dateibetrachter"
                style={{ top: 20 }}
                width={1200}
                open={modal1Open}
                onOk={() => setModal1Open(false)}
                onCancel={() => setModal1Open(false)}
            >
                <div style={{
                    width: "95%", height: "90%", backgroundColor: "#e4e4e4", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center"

                }}>

                    {fileText.length > 0 ? fileTextJSX : id == "1" ? <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={urlViewer} />
                    </Worker> : <></>}
                    {mediaUrl != "" && nestedLinksArr.length==0 && (mediaUrl.endsWith("jpg") || mediaUrl.endsWith("png") || mediaUrl.endsWith("jpeg")) ? <>
                        <Image
                            width="80%"
                            height="60%"
                            src={mediaUrl}
                        />


                    </> : nestedLinksArr.length==0 ? <ReactPlayer
                        className='react-player fixed-bottom'
                        url={mediaUrl}
                        width='60%'
                        controls={true}

                    /> : 
           
                nestedLinks}


                </div>
            </Modal>

            <Modal
                title="Transkription/Beschreibung der Mediendatei"
                width={800}
                open={modal2Open}
                footer={[
                    <Button key="back" onClick={() => setModal2Open(false)}>
                      Schließen
                    </Button>,
                   
                  ]}
                onCancel={() => setModal2Open(false)}
            >
                <div style={{
                    paddingBlock:"10px", width: "75%",backgroundColor: "#f3f3f3", overflowY: "auto"

                }}>

                    <p  style={{width:"500px", marginTop:"20px", marginLeft:"10px"}}>{transcriptSelected!="" && transcriptSelected}</p>
                    {/* <Button style={{marginLeft:"10px"}} type='primary' onClick={()=>{
                    
                    
                    
                    }}>aktualisieren</Button> */}

                </div>
            </Modal>
        </div>
    )

}

export default FilesListTable
