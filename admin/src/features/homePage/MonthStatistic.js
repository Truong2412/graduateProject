import { Button, Card, Col, DatePicker, Divider, Row,Select,Space } from 'antd';
import React,{useEffect,useState} from 'react';
import { useSelector } from 'react-redux';
import axios from "axios";
const {Meta} = Card;
const {Option}= Select;
function MonthStatistic(props) {
    const admin = useSelector(state=>state.user);

    const now = new Date();
    const m = now.getMonth() +1;
    var finalMonth = '';
    if(m < 10){
        finalMonth = "0" + m;
    }else{
        finalMonth = m;
    }
    const [monthSelected,setMonthSelected] = useState(now.getFullYear() + "-" +finalMonth );
    const [data,setData] = useState([]);
  
    const [itemArr,setItemArr] = useState([]);
    const [bestSeller,setBestSeller] = useState([]);
    const [revenue,setRevenue] = useState(0);
    const [total,setTotal] = useState(0);
    const onChange = (date, dateString) => {
        setMonthSelected(dateString);
    };

    useEffect(()=>{
        axios.post(process.env.REACT_APP_SERVER_URL + "/order/statistic/totaldonebymonth",{
            "id": admin.id,
            "mounth": monthSelected
        },{
            headers: {"x-access-token": admin.token}
        }).then(res=>{
            if(res){
                const data = res.data;
                let initRevenue = 0;
                data.forEach(item=>{
                    initRevenue = initRevenue + item.total;
                })
                setRevenue(initRevenue)
                setData(res.data)
                setTotal(res.data.length)
            }
          
        })
    },[monthSelected,admin.id,admin.token]);
    useEffect(()=>{
        var newItemsArr =  [];
        data.forEach(dataItem=>{
            const value = dataItem.items;
            value.forEach(item=>{
                var newItem = {
                    "name": item.name,
                    "img": item.img,
                    "classifyname": item.classifyname,
                    "classifyprice": item.classifyprice,
                    "quantity": item.quantity,
                    "productId": item.productId,
                }
                newItemsArr.push(newItem)
            })
        })
        setItemArr(newItemsArr)
    },[data])

    useEffect(()=>{
        var cloneArr= [...itemArr];
        const productIds = cloneArr.map(o => o.productId);
        const dataUni = cloneArr.filter(({productId}, index) => !productIds.includes(productId, index + 1));
        for (let i = 0; i < dataUni.length; i++) {
        let id = dataUni[i].productId;
        let quantity = 0;
        for (let j = 0; j < cloneArr.length; j++) {
            if (id === cloneArr[j].productId) {
            quantity += cloneArr[j].quantity;
            }
        }
        dataUni[i].quantity = quantity;
        dataUni[i].itemRevenue = quantity * dataUni[i].classifyprice;
        }
        dataUni.sort((a,b)=>b.quantity - a.quantity);
        setBestSeller(dataUni);
       
           
        
      
    },[itemArr])

    const mapBestSeller = bestSeller.map((item,key)=>{
        const cardimg = process.env.REACT_APP_SERVER_URL + "/file/"+ item.img;
        return (
            <Col key={key} xl={{span:6}} lg={{span:6}}>
               
                
                    <Card
                        hoverable
                        style={{ width: "100%",opacity: 0.9 }}
                        cover={
                        <img
                            alt={item.name}
                            src={cardimg}
                        />
                        }
                    >
                        <Meta
                        title={item.name}
                        />
                        <span
                            
                        >
                            Ph??n lo???i: {item.classifyname}
                        </span>
                        <br></br>
                        <span>
                            S??? l?????ng:  {item.quantity}
                        </span>
                        <br></br>
                        <span>
                           Doanh thu:  {item.itemRevenue.toLocaleString()} ??
                        </span>
                       
                    </Card>
            
               
                </Col>
        )
    });
    const onStatisticChange = (value)=>{
        let cloneBestSeller = [...bestSeller];
        if(value === "decreaseSold"){
            cloneBestSeller.sort((a,b)=>b.quantity - a.quantity);
        }else if(value === "increaseSold"){
            cloneBestSeller.sort((a,b)=>a.quantity - b.quantity);
        }
        else if(value === "decreaseRevenue"){
            cloneBestSeller.sort((a,b)=>b.itemRevenue - a.itemRevenue);
        }
        else if(value === "increaseRevenue"){
            cloneBestSeller.sort((a,b)=>a.itemRevenue - b.itemRevenue);
        }
        setBestSeller(cloneBestSeller)
    }
    return (
        <>
        <Row>
            <Space>
                <DatePicker placeholder='Ch???n th??ng' onChange={onChange} picker="month" />
                <Button type='primary'>{monthSelected}</Button>
             </Space>  
        </Row>
        <Row gutter={[4,4]}>
                    <Col lg={24}  >
                        <div  style={{borderRadius: 8,background: "#1890ff",padding: 8,color: "white"}}>
                            <h2 style={{color: "white"}} >{total}  </h2>
                        <span style={{fontWeight: "bold"}}> ????n ho??n th??nh</span>
                        </div>
                    </Col>
                    <Col lg={24}  >
                        <div  style={{borderRadius: 8,background: "#1890ff",padding: 8,color: "white"}}>
                           
                        <span style={{fontWeight: "bold"}}>Doanh thu :</span>
                        <h2 style={{color: "white"}} >{revenue.toLocaleString()} ?? </h2>
                        </div>
                    </Col>
                </Row>
        <Row>
            <Col lg={{span: 24}}>
                <Divider>S???n ph???m b??n ch???y</Divider>
                <h3>Ph??n lo???i theo</h3>
                <Select
                    placeholder="Ch???n ki???u s???p x???p"
                    style={{
                        width: 250,
                    }}
                    onChange={onStatisticChange}
                    >
                    <Option value="decreaseSold">S??? l?????ng ???? b??n gi???m d???n</Option>
                    <Option value="increaseSold">S??? l?????ng ???? b??n t??ng d???n</Option>
                    <Option value="decreaseRevenue">Doanh thu gi???m d???n</Option>
                    <Option value="increaseRevenue">Doanh thu t??ng d???n</Option>
                    </Select>
                <Row style={{marginTop: 10}} gutter={[16,16]}>

                    {mapBestSeller}
                </Row>
            </Col>
            
        </Row>
        </>
    );
}

export default MonthStatistic;