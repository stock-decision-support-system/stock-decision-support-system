import React, { useState, useEffect } from 'react';
import StockTable from '../components/stockTable';
import SearchContainer from '../components/searchContainer';
import { Button, Card } from 'antd';
import { StockRequest } from '../api/request/stockRequest.js';

const StockList = () => {
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [stockList, setStockList] = useState([]);

    const handleCheckboxChange = (e, code) => {
        if (e.target.checked) {
            setSelectedStocks([...selectedStocks, code]);
        } else {
            setSelectedStocks(selectedStocks.filter(stockCode => stockCode !== code));
        }
    };

    const fetchStockData = async () => {
        StockRequest.getTwFif()
            .then(response => {
                setStockList(response.data);
            })
            .catch((error) => {
                alert(error.message);
            });
    };

    useEffect(() => {
        fetchStockData();
    }, []);

    return (
        <>
            <div className="position-absolute top-50 start-50 translate-middle w-75 h-75"
                style={{ overflowY: 'scroll' }} >
                <div className="d-flex justify-content-center align-items-center">
                    <Card>
                        <SearchContainer />
                    </Card>
                </div>
                <div className="d-flex py-3">
                    <Button type="primary" className="ms-auto button2">
                        新增至投資組合
                    </Button>
                </div>
                <StockTable data={stockList} onCheckboxChange={handleCheckboxChange} />
            </div></>
    );
};

export default StockList;