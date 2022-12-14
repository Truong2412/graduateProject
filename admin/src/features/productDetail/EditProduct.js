import { Button, Select, Form, Input, InputNumber, Row, Space,TreeSelect, message } from 'antd';
import React, { useEffect,useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { MinusCircleOutlined, PlusOutlined  } from '@ant-design/icons';
import ImagesUpload from './ImagesUpload';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from 'axios';
const {Option} = Select;
function AddNew(props) {
    const [form] = Form.useForm();
    const {id} = useParams();

    const navigate = useNavigate();
    const isLogIn= useSelector(state=>state.user.isLogIn)
    const token= useSelector(state=>state.user.token)
    const [value,setValue]= useState('')
    const [ckData,setCkData]= useState('')
    const [imgurl,setImgurl]= useState([]);
    const [imgdata,setImgData]= useState([]);
    const [data,setData]= useState('');

    const [initImg,setInitImg]= useState([]);
    const [cate,setCate]= useState([])
    const category=["mobile","laptop","tablet"];
    const mobilebrand=["apple","samsung","xiaomi","oppo","vivo","nokia","asus","realme"];
    const laptopbrand=["apple","asus","hp","acer","msi","lenovo","dell","gigabyte"];
    const tabletbrand=["apple","samsung","xiaomi","lenovp"];
    useEffect(()=>{
        if(value=== 'mobile'){
            setCate(mobilebrand)
        }else if(value === 'laptop'){
            setCate(laptopbrand)
        }else if(value === 'tablet'){
            setCate(tabletbrand)
        }
    },[value])

    useEffect(()=>{
        const getData = async ()=>{
            const res = await axios.get(process.env.REACT_APP_SERVER_URL+"/product/detail/"+id)
            if(res){
                setData(res.data)
                setCkData(res.data.productinfo)
                setImgData(res.data.imgurl)
                }
            }
        getData();
    },[id])
    useEffect(()=>{
        const config = data.config;
        if(config){
            form.setFieldsValue({
                category: data.category,
                productname: data.name,
                brand: data.brand,
                status: data.status,
                classify: data.classify,
                cpu: config.cpu,
                monitorSize: config.monitorSize,
                ram: config.ram,
                gpu: config.gpu,
                rom: config.rom
               
            })
        }
        
    },[data,form])
    useEffect(()=>{
        var newList= [];
        imgdata.map((value,key)=>{
            const newItem = {
                uid: key,
                name: "image.jpeg",
                status: 'done',
                url: process.env.REACT_APP_SERVER_URL + "/file/" + value,
                response: value
            }
            return newList.push(newItem)
        })
        setInitImg(newList)
    },[imgdata])

    useEffect(()=>{
        if(!isLogIn){
            navigate("/admin/account/login")
          }
    },[isLogIn,navigate])




    const getImgData =(data)=>{
        setImgurl(data)
       
    }

    const edit =async (value)=> {
        try{
            if(imgurl.length === 0){
                message.warning("Ch??a c?? ???nh s???n ph???m !")
            }else{
                const res = await axios.post(process.env.REACT_APP_SERVER_URL+"/product/edit/"+data._id,
                {category: value.category,
                    status: value.status,
                    name: value.productname,
                    classify: value.classify,
                    imgurl: imgurl,
                    config: {
                        "cpu": value.cpu,
                        "ram": value.ram,
                        "monitorSize": value.monitorSize,
                        "gpu": value.gpu,
                        "rom": value.rom
                    },
                    productinfo: ckData},
                {headers:
                    {"x-access-token": token}
                })
                if(res.status === 200){
                    message.success("???? l??u");
                    navigate("/chinh-sua-san-pham")
                }else{
                    message.error("???? c?? l???i x???y ra")
                }
            }
            
        }catch (err){
            if(err.response.status === 403) {
                message.warning("L???i x??c th???c  !!");
            }
        }
    }
    return (
        <Row style={{backgroundColor: "#d6d6d6",borderRadius: "25px",padding: "30px"}}>
            <Form
                form={form}
                name="addnewproduct"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                onFinish={edit}
                autoComplete="false"

            >
                <Form.Item
                    label="Danh m???c s???n ph???m"
                    name="category"
                    rules={[{ required: true, message: 'Ch???n danh m???c s???n ph???m !' }]}
                >
                    <Select value={value} onChange={e=>setValue(e)}>
                        {category.map((value,key)=>{
                            return(
                                <Option value={value} key={key}>{value}</Option>
                            )
                        })}
                       
                    </Select>

                </Form.Item>
                <Form.Item
                    label="Th????ng hi???u"
                    name="brand"
                    rules={[{ required: true, message: 'Ch???n Th????ng hi???u !' }]}
                >
                    
                    <Select>
                        {cate.map((value,key)=>{
                            return(
                                <Option value={value} key={key}>{value}</Option>
                            )
                        })}
                       
                    </Select>

                </Form.Item>
                <Form.Item
                    label="T??n s???n ph???m"
                    name="productname"
                    rules={[{ required: true, message: 'H??y nh???p T??n s???n ph???m !' }]}
                >
                        <Input />
                </Form.Item>
                    
                    <Form.Item
                        label="T??nh tr???ng (S???n h??ng, s???p v???, H???t h??ng)"
                        name="status"
                        rules={[{ required: true, message: 'H??y ch???n tr???ng th??i s???n ph???m !'}]}
                    >
                        <Select
                            placeholder="Ch???n"
                            optionFilterProp="children"
                        >
                            <Option value="C??n h??ng">C??n h??ng</Option>
                            <Option value="S???p v???">S???p v???</Option>
                            <Option value="Ng???ng kinh doanh">Ng???ng kinh doanh</Option>
                            <Option value="Tr??? g??p 0%">Tr??? g??p 0%</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="CPU - vi x??? l??"
                        name="cpu"
                        rules={[{ required: true, message: 'H??y nh???p t??n CPU !'}]}
                    >
                         <Input />
                    </Form.Item>
                    <Form.Item
                        label="RAM"
                        name="ram"
                        rules={[{ required: true, message: 'H??y nh???p th??ng s??? ram !'}]}
                    >
                         <Input />
                    </Form.Item>
                    <Form.Item
                        label="K??ch th?????c m??n h??nh"
                        name="monitorSize"
                        rules={[{ required: true, message: 'H??y nh???p k??ch th?????c m??n h??nh !'}]}
                    >
                         <Input />
                    </Form.Item>
                    <Form.Item
                        label="GPU"
                        name="gpu"
                        rules={[{ required: true, message: 'H??y nh???p t??n GPU !'}]}
                    >
                         <Input />
                    </Form.Item>
                    <Form.Item
                        label="ROM"
                        name="rom"
                        rules={[{ required: true, message: 'H??y nh???p ROM !'}]}
                    >
                         <Input />
                    </Form.Item>
                    <label>Ph??n lo???i h??ng</label>
                    <Form.List name="classify">
                        {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                {...restField}
                                label="Ph??n lo???i"
                                name={[name, 'classifyname']}
                                rules={[{ required: true, message: 'Ch??a nh???p t??n ph??n lo???i' }]}
                                >
                                <Input placeholder="H??y nh???p ph??n lo???i s???n ph???m " />
                                </Form.Item>
                                <Form.Item
                                {...restField}
                                name={[name, 'classifyprice']}
                                label="Gi?? ph??n lo???i"
                                rules={[{ required: true, message: 'Ch??a nh???p gi?? ph??n lo???i' }]}
                                >
                                     <InputNumber style={{width: "100%"}}
                                     formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                     parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                     placeholder='Gi?? ph??n lo???i' />
                                </Form.Item>
                                <Form.Item
                                {...restField}
                                name={[name, 'classifyquantity']}
                                label="S??? l?????ng kho"
                                rules={[{ required: true, message: 'Ch??a nh???p S??? l?????ng' }]}
                                >
                                     <InputNumber style={{width: "100%"}}
                                     placeholder='S??? l?????ng' />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                            ))}
                            <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Th??m ph??n lo???i
                            </Button>
                            </Form.Item>
                        </>
                        )}
                    </Form.List>            

                    <label>???nh s???n ph???m</label>
                    <ImagesUpload initImg={initImg} getImgData={(data)=>getImgData(data)} />
     
                    <label>Th??ng tin v?? ????nh gi?? s???n ph???m</label>
                    <CKEditor
                                editor={ ClassicEditor }
                                data={ckData}
                                onReady={ editor => {
                                    // You can store the "editor" and use when it is needed.
                                   
                                } }
                                onChange={ ( event, editor ) => {
                                    const data = editor.getData();
                                   setCkData(data)
                                } }
                                onBlur={ ( event, editor ) => {
                                    //
                                } }
                                onFocus={ ( event, editor ) => {
                                    //
                                } }
                        /> 
                

        
                    <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <Button block type="primary" htmlType="submit">
                        X??c nh???n s???a
                        </Button>
                    </Form.Item>
                    </Form>
        </Row>
    );
}

export default AddNew;