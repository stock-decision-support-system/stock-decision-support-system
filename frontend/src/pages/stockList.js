import React, { useState, useEffect } from 'react';
import StockTable from '../components/stockTable';
import SearchContainer from '../components/searchContainer';
import { Button, Card } from 'antd';
import axios from 'axios';

const StockList = () => {
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [test, setTest] = useState([]);

    const handleCheckboxChange = (e, code) => {
        if (e.target.checked) {
            setSelectedStocks([...selectedStocks, code]);
        } else {
            setSelectedStocks(selectedStocks.filter(stockCode => stockCode !== code));
        }
    };

    const downloadFile = async () => {
        try {
            axios.get('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL')
                .then((response) => JSON.parse(response.json()))
                .then((json) => console.log(json));
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };

    useEffect(() => {
        downloadFile();
    }, []);

    const data = [
        {
            key: '1',
            name: '台積電',
            code: '2330',
            price: 600,
            change: 10,
            changePercent: 1.69,
            open: 590,
            previousClose: 590,
            high: 605,
            low: 585,
            volume: 25000,
            time: '2024-08-08 14:30'
        },
        {
            key: '2',
            name: '鴻海',
            code: '2317',
            price: 100,
            change: -2,
            changePercent: -1.96,
            open: 102,
            previousClose: 102,
            high: 103,
            low: 99,
            volume: 30000,
            time: '2024-08-08 14:30'
        }
    ];

    return (
        <>
            <div>
                {test && <pre>{JSON.stringify(test, null, 2)}</pre>}
            </div>
            <div className="position-absolute top-50 start-50 translate-middle w-75 h-75">
                <div className="d-flex justify-content-center align-items-center">
                    <Card><SearchContainer />
                    </Card>
                </div>
                <div className="d-flex py-3">
                    <Button type="primary" className="ms-auto button2">
                        新增至投資組合
                    </Button>
                </div>
                <StockTable data={data} onCheckboxChange={handleCheckboxChange} />
            </div></>
    );
};

export default StockList;