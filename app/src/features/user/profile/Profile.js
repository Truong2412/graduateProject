import { Avatar, Button, Upload,message,Row,Col, Space, Input, Modal, Form } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { UploadOutlined,FacebookOutlined } from '@ant-design/icons';
import userSlice from '../userSlice';
import FacebookLogin from 'react-facebook-login';
function Profile(props) {
    const dispatch = useDispatch();
    const user = useSelector(state=>state.user);
    const token = useSelector(state=>state.user.token);
    const [data,setData] = useState('');
    const [avatar,setAvatar] = useState('');
    const [email,setEmail] = useState('');
    const [phone,setPhone] = useState(null);
    const [btnDisable,setBtnDisable] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
      setIsModalVisible(true);
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
    };
    useEffect(()=>{
       setData(user);
       setAvatar(user.avatar);
       setEmail(user.email)
       setPhone(user.phone)
    },[user])
    useEffect(()=>{
        if(phone  && phone!== data.phone){      
            setBtnDisable(false)
        }else if(email !== data.email){
            setBtnDisable(false)
           
        }else{
            setBtnDisable(true)
        }
    },[email,phone,data])

    const url = process.env.REACT_APP_SERVER_URL + "/file/singleupload";
    const prop = {
        name: "file",
        action: url,
        headers: {
            "x-access-token": token
        },    
        onChange(info) {
            if (info.file.status !== 'uploading') {
               
            }
        
            if (info.file.status === 'done') {
                setData(info.file.response)
                const imgData = process.env.REACT_APP_SERVER_URL + "/file/" + info.file.response;
                console.log(imgData)
                axios.post(process.env.REACT_APP_SERVER_URL + "/user/account/updateavatar",{"id": user.id,"data": imgData},{
                    headers: {"x-access-token": token}
                }).then(res=>{
                    if(res.status === 200){
                        message.success(`${info.file.name} ???? t???i l??n th??nh c??ng`);
                        dispatch(userSlice.actions.updateAvatar(imgData))
                    }
                    else{
                        message.error("Ch??a c???p nh???t ???????c v??o DB")
                    }
                })
               
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} T???i ???nh l??n kh??ng th??nh c??ng`);
            }
            }
    }
    const checkImg = () =>{
        if(avatar){
            return(
                <Space>
                    <Avatar size={"large"} src={avatar} alt={data.name} />
                    <Upload {...prop} >
                        <Button type='primary' icon={<UploadOutlined />}>Thay ?????i ???nh kh??c</Button>
                    </Upload>
                </Space>
               
            )
        }else{
            return(
                <Space>
                <Avatar size={"large"} src={null} alt={data.name} />
                <Upload {...prop} >
                    <Button type='primary' icon={<UploadOutlined />}>C???p nh???t Avatar</Button>
                </Upload>
                </Space>
            )
        }
    }

    const emailChange = (e) =>{
        setEmail(e.target.value)
    }
    const phoneChange = (e) =>{
        setPhone(e.target.value)
    }
    const saveChange = async ()=>{
        const reg = /((09|03|07|08|05)+([0-9]{8})\b)/g;
        if(reg.test(phone) || !phone){
            const res= await axios.post(process.env.REACT_APP_SERVER_URL + "/user/account/updateprofile",{
                "id": user.id,
                "phone": phone,
                "email": email
            },{headers:{
                "x-access-token": token
            }})
            
            if(res.data === 'phoneexist'){
                message.warning("S??? ??i???n tho???i ???? ???????c d??ng")
            }else if(res.data === 'emailexist'){
                message.warning("Email ???? ???????c d??ng")
            }else if(res.status === 201){
                message.success("???? c???p nh???t")
                dispatch(userSlice.actions.updateEmail(email))
                dispatch(userSlice.actions.updatePhone(phone))

            }
            console.log(res)
        }else{
            message.warning("S??? ??i???n tho???i kh??ng h???p l???")
        }

    }

    const responseFacebook = (fbres) => {
        console.log(fbres)
        if(fbres){
            const value= {"facebookId": fbres.id,"id": user.id}
            const connect = async ()=>{
                try{
                    const res = await axios.post(process.env.REACT_APP_SERVER_URL+"/user/account/updatefacebookid",{value},{headers: {"x-access-token":token}})
                    if(res.status  === 200){
                        message.success("Li??n k???t th??nh c??ng facebook: "+ fbres.name);
                        dispatch(userSlice.actions.updateFacebookId(fbres.id))
                        dispatch(userSlice.actions.updatefbToken(fbres.accessToken))
                    }
                }catch (err){
                    message.error("???? c?? l???i x???y ra !")
                    console.log(err)
                }
                
            }
            connect()
        }else{
            message.warning("????ng nh???p kh??ng th??nh c??ng !!!")
        }
    }


    const checkFacebookId = ()=>{
        if(user.facebookId){
            return(
            <span style={{background: "#1890ff",padding: 8,color: "white",borderRadius: 4}}>???? li??n k???t v???i t??i kho???n {user.name}</span>
            )
        }else{
            return (
            
             <FacebookLogin
                appId="666516681113279"
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook}
                icon={<FacebookOutlined />}
                isMobile={true}
                disableMobileRedirect={true}
                textButton="Li??n k???t v???i Facebook"
            />
            
            )
        }
    }

    const onFinish =async (values) => {

        const newValues = {...values,"userId": user.id};
        if(!values.currentPassword){
            newValues.currentPassword = "noway";
        }
        const res = await axios.post(process.env.REACT_APP_SERVER_URL + "/user/account/changepassword",{newValues},
        {headers: {
            "x-access-token": token
        }})
        if(res.data === "ok"){
            message.success("???? thay ?????i m???t kh???u");
            const localUser = JSON.parse(localStorage.getItem("userAcc"));
                localUser.password = values.newPassword;
            const newLocal = JSON.stringify(localUser);
            localStorage.setItem("userAcc", newLocal)
            handleCancel();
        }else if(res.data === 'incorrect'){
            message.warning("M???t kh???u hi???n t???i kh??ng ????ng")
        }
      
      };
    


    return (
        <>
            <Row gutter={[8,8]} style={{background: "white",padding: 8}}>
                <Col span={24} >
                    <h3>Avatar</h3>
                    {checkImg()}
                </Col>
                <Col span={24}>
                    <h3>H??? t??n</h3>
                    <h3 style={{padding: 5,borderRadius: 5, background: "lightgray"}}>
                        {data.name}
                    </h3>
                </Col>
                <Col span={24}>
                    <h3>Email</h3>
                    <Input value={email} placeholder="youremail@gmail.com" onChange={emailChange} />
                </Col>
                <Col span={24}>
                    <h3>S??? ??i???n tho???i</h3>
                    <Input value={phone} placeholder="03xxxxxxxx" onChange={phoneChange} />
                </Col>
                <Button block type="primary" disabled={btnDisable} onClick={saveChange}>L??u thay ?????i</Button> 
                <Col span={24}>
                    <Button type="primary" onClick={showModal}>
                       ?????i m???t kh???u
                    </Button>
                    <Modal title="?????i m???t kh???u" footer={null} visible={isModalVisible}  onCancel={handleCancel}>
                    <Form
                        name="pw"
                        labelCol={{
                            span: 8,
                        }}
                        wrapperCol={{
                            span: 16,
                        }}
                        onFinish={onFinish}
                        autoComplete="off"
                        >
                        <Form.Item
                            label="M???t kh???u hi???n t???i"
                            name="currentPassword"
                            rules={[
                            {
                                required: false,
                               
                            }
                            ]}
                        >
                            <Input.Password placeholder='????? tr???ng n???u l?? l???n ?????u ti??n ?????t m???t kh???u' />
                        </Form.Item>

                        <Form.Item
                            label="M???t kh???u m???i"
                            name="newPassword"
                            rules={[
                            {
                                required: true,
                                message: 'H??y nh???p m???t kh???u m???i',
                            },{
                                min: 8,
                                message: "M???t kh???u t???i thi???u 8 k?? t???"
                            }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                            offset: 8,
                            span: 16,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                ?????i m???t kh???u
                            </Button>
                        </Form.Item>
                        </Form>
                    </Modal>
                </Col>
                <Col span={24}>
                    <h3>FaceBook</h3>
                    {checkFacebookId()}
                </Col>
            </Row>
           
        </>
    );
}

export default Profile;