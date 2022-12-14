import { Button, Col, Input, message, Modal, Rate, Row,  Table, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
const { Text} = Typography;
function Done(props) {
    const user = useSelector(state=>state.user)
    const token = useSelector(state=>state.user.token)
    const [data,setData] = useState([])
    const [tbData,setTbData] = useState([]);
    const [reviewItems,setReviewItems] = useState([]);
    const [reviewItemsKey,setReviewItemsKey] = useState('');
    const [reviews,setReviews] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
     
    const showModal = (index) => {
      setIsModalVisible(true);
      var items = tbData[index].items;
      setReviewItems(items)
      setReviewItemsKey(index)
      var reviews =[];
      console.log(items)
      items.map((value,key)=>{
        var item = {
          "rate": 5,
          "text": "",
          "name": value.name,
          "img": value.img,
          "classifyname": value.classifyname,
        }
        reviews[key] = item
      })
      setReviews(reviews)

    };
    console.log(reviews)
    const rateChange =(e,item,key)=>{
      var clone = [...reviews];

      clone[key].rate = e;
      setReviews(clone)
    }
    const rateTextChange =(e,item,key)=>{
      var clone = [...reviews];
      clone[key].text = e.target.value;
      setReviews(clone)
    }
          

    const handleCancel = () => {
      setIsModalVisible(false);
      setReviews([]);
      setReviewItems([]);
      setReviewItemsKey('');
    };

    const mapModal = reviewItems.map((item,key)=>{
                  
      const imgsrc  = process.env.REACT_APP_SERVER_URL + "/file/" + item.img
      return (
          <Row style={{marginBottom: 10}} key={key} gutter={[8,8]} >
              <Col >
                  <img style={{height: "80px"}} src={imgsrc} alt={item.name} />
              </Col>
              <Col>
                  <p style={{width: "100%"}}>{item.name}</p>
                  <div style={{width: "100%"}}><small>PL: {item.classifyname}</small></div>
              </Col>
              <Col span={24}>
                <Rate onChange={(e)=>rateChange(e,item,key)} defaultValue={5} allowClear allowHalf />
              </Col>
              <Col span={24}>
                <Input onChange={(e)=>rateTextChange(e,item,key)} placeholder="N???i dung ????nh gi??..." />
              </Col>
          </Row>)
      })
    const sendReview = ()=>{
      const confirmReview = ()=>{
        axios.post(process.env.REACT_APP_SERVER_URL + "/order/confirmreview",{"orderId":tbData[reviewItemsKey]._id },{headers: {
          "x-access-token": token
        }}).then(res =>{
          if(res.status === 200){
            let cloneTbData = [...tbData];
            cloneTbData[reviewItemsKey].review = true;
            setTbData(cloneTbData);
            setIsModalVisible(false);
            setReviews([]);
            setReviewItems([]);
            setReviewItemsKey('');
            message.info("C???m ??n b???n ???? ????nh gi?? !")
          }
        })
      }
      reviews.forEach(item => {
        const value = {
          "username": user.name,
          "id": user.id,
          "avatar": user.avatar,
          "reviewText": item.text,
          "rateStar": item.rate,
          "name": item.name,
          "cardimg": item.img,
          "classifyname": item.classifyname
        }
        axios.post(process.env.REACT_APP_SERVER_URL + "/product/customerreview",{
          value
        },{headers:{ "x-access-token": token}})
        .then(res=>{
          if(res.status === 200){
            confirmReview();
          }else{
            message.info("???? c?? l???i x???y ra")
          }
        })
      
      });


    }

    useEffect(()=>{
      if(user.id && token){
        axios.get(process.env.REACT_APP_SERVER_URL+ "/order/done/"+user.id,{headers:{"x-access-token": token}})
        .then(res=>{
          if(res.status=== 200){
            
            setData(res.data)
          }
        })
      }
    },[user.id,token])
    useEffect(()=>{
        let newTb =  [];
        data.map((value,key)=>{
                var newItem = {
                    "key": key,
                    "_id": value._id,
                    "userId": value.userId,
                    "items": value.items,
                    "total": value.total,
                    "payMethod": value.payMethod,
                    "receiveAdd": value.receiveAdd,
                    "status": value.status,
                    "review": value.review,
                    "statusNote": value.statusNote,
                    "shipingInfo": value.shipingInfo,
                }
                return newTb.push(newItem)
            })
            setTbData(newTb)   
    },[data])

    const columns = [
        {
          title: '????n h??ng',
          dataIndex: 'items',
          render: (items,record,index) =>{
            const review = record.review;
            const checkReview  = ()=>{
              if(!review){
                return(
                  <Button  onClick={()=>showModal(index)} type="primary">????nh gi?? ????n h??ng</Button>
                )
              }else{
                return (
                  <Button disabled>???? ????nh gi??</Button>
                )
              }
            }


 

            return (
              <div>
                 <Modal title="????nh gi?? s???n ph???m" visible={isModalVisible}  onCancel={handleCancel} footer={null} >
                  {mapModal}
                  <Button type='primary' block onClick={()=>sendReview()}>????nh gi??</Button>
                  </Modal>
                {items.map((value,key)=>{
                  
                const imgsrc  = process.env.REACT_APP_SERVER_URL + "/file/" + value.img
                return (
                    <Row key={key} gutter={[8,8]} >
                        <Col >
                            <img style={{height: "80px"}} src={imgsrc} alt={value.name} />
                        </Col>
                        <Col>
                            <p style={{width: "100%"}}>{value.name}</p>
                            <div style={{width: "100%"}}><small>PL: {value.classifyname}</small></div>
                            <div style={{width: "100%"}}><small>SL: {value.quantity}</small></div>
                        </Col>
                    </Row>)
              })}
              <Row>
                <span style={{color: "red"}}>T???ng ti???n : {record.total.toLocaleString()} ??</span>
              </Row>
              <Row>
                <p> Ng?????i nh???n : {record.receiveAdd.receiver}</p>
              </Row>
              <Row>
                <p> S??? ??i???n tho???i : {record.receiveAdd.phone}</p>
              </Row>
              <Row>
                <span>?????a ch??? :</span>
                <br/>
                <p style={{borderRadius: 5,background: "lightgray",padding: 2}}>{record.receiveAdd.add}</p>
              </Row>
              <Row >
                <span>Ph????ng th???c thanh to??n  : </span>
                <br/>
                <small style={{borderRadius: 5,background: "lightgray",padding: 2}}>{record.payMethod}</small>
              </Row>

              {checkReview()}


            </div>)
          }
        }
      ];
    return (
        <div >
             <Table locale={{emptyText: "Ch??a c?? ????n h??ng n??o"}}  columns={columns} dataSource={tbData} />
        </div>
    );
}

export default Done;