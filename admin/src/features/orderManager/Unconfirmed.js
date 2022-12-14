import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message, Row,Col,Table,Button, Popconfirm, Space } from 'antd';
import orderSlice from './orderSlice'
function Unconfirmed(props) {
    const dispatch =useDispatch()
    const navigate = useNavigate();
    const isLogIn= useSelector(state=>state.user.isLogIn)
    const adminId= useSelector(state=>state.user.id)
    const token= useSelector(state=>state.user.token)
    const [data,setData] = useState([]);
    const processingData= useSelector(state=>state.order.processing)
    const [tbData,setTbData] = useState([]);
    useEffect(()=>{
        if(isLogIn){
            axios.get(process.env.REACT_APP_SERVER_URL+"/order/admin/unconfirmed/"+adminId,{headers: {"x-access-token": token}})
            .then(res=>{
                setData(res.data)
              
            })

          }
       
    },[isLogIn,adminId,token])
    useEffect(()=>{
        if(!isLogIn){
            navigate("/admin/account/login")
          }
    },[isLogIn,navigate])
    useEffect(()=>{
        var newTbData= [];
        data.map((value,key)=>{
            const newTbItem = {...value,"key": key}
            return newTbData.push(newTbItem)
        })
        setTbData(newTbData)
    },[data])

    const columns = [
        {
          title: 'Đơn hàng',
          dataIndex: 'items',
          render: items =>{
              return (
              <div>
                {items.map((value,key)=>{
                    const imgurl = process.env.REACT_APP_SERVER_URL + "/file/" +value.img;
                    return (
                        <Row  key={key} gutter={[8,8]}>
                            <Col span={8}>
                                <img style={{minWidth: 80,maxWidth: 120}} src={imgurl} alt={value.name} />
                            </Col>
                            <Col pan={14} push={1}>
                            <div style={{width: "100%"}}><small>PL: {value.classifyname}</small></div>
                                <div style={{width: "100%"}}><small>SL: {value.quantity}</small></div>
                            </Col>
                            <Col>
                                <p style={{width: "100%"}}>{value.name}</p>
                               
                            </Col>

                        
                            
                        </Row>)
                })}
            </div>)
          }
        },
        {
          title: 'Thông tin',
          dataIndex: 'receiveAdd',
          render: (text,record)=>{
            return (
               <>
                    <Row>
                    <p> Người nhận : {record.receiveAdd.receiver}</p>
                  </Row>
                  <Row>
                    <p> Số điện thoại : {record.receiveAdd.phone}</p>
                  </Row>
                  <Row>
                    <span>Địa chỉ :</span>
                    <br/>
                    <p style={{borderRadius: 5,background: "lightgray",padding: 2}}>{record.receiveAdd.add}</p>
                  </Row>
                  <Row>
                    <span>Phương thức TT :</span>
                    {record.payMethod}
                    
                  </Row>
                  <Row>
                    <span>Tiền hàng :</span>
                    {record.total.toLocaleString()}
                    
                  </Row>
                </>
            )
          }
        },
        {
          title: '',
          dataIndex: '',
          render: (text,record,index)=>{
            const confirmCancel = ()=>{
                var cloneTbData = [...tbData]
                    cloneTbData.splice(index,1)
                axios.post(process.env.REACT_APP_SERVER_URL+"/order/cancelbyid",{"userId": record.userId,"cancelId": record._id},
                {headers: {
                    "x-access-token": token
                }}).then(res=>{
                    if(res.status === 200){
                        setTbData(cloneTbData);
                        message.success("Đã hủy đơn")
                    }else{
                        message.warning("Đã có lỗi xảy ra")
                    }
                })
            }
            const confirm = ()=>{
                var cloneUnconfirm = [...data]
                    cloneUnconfirm.splice(index,1)
                var cloneTbData = [...tbData]
                    cloneTbData.splice(index,1)
                var cloneProcessing = [...processingData];
                    cloneProcessing.push(data[index])
                axios.post(process.env.REACT_APP_SERVER_URL+"/order/admin/confirm",{"adminId": adminId,"orderId": record._id},
                {headers: {
                    "x-access-token": token
                }}).then(res=>{
                    if(res.status === 200){
                        setTbData(cloneTbData);
                        dispatch(orderSlice.actions.updateUnconfirmed(cloneUnconfirm))
                        dispatch(orderSlice.actions.updateProcessing(cloneProcessing))
                        message.success("Đã xác nhận");
                        
                    }else{
                        message.warning("Đã có lỗi xảy ra")
                    }
                })
            }

            return (<Space direction="vertical" >
                <Popconfirm
                    title="Xác nhận"
                    onConfirm={confirm}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button  style={{background: "green",color: "white"}} >Xác nhận</Button>
                </Popconfirm> 

                 <Popconfirm
                    title="Bạn có chắc muốn hủy đơn này"
                    onConfirm={confirmCancel}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button style={{color: "red"}} type="dashed">Hủy đơn hàng</Button>
                </Popconfirm>
                </Space>)
               
        }},
      ];
    return (
        <div>
            <Table locale={{emptyText: "Chưa có đơn hàng nào"}} pagination={false}  columns={columns} dataSource={tbData} />
        </div>
    );
}

export default Unconfirmed;