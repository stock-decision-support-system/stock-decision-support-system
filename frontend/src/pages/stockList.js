import React, { useState, useEffect } from 'react';
import StockTable from '../components/stockTable';
import SearchContainer from '../components/searchContainer';
import { Button, Card, Flex, Spin } from 'antd';
import { StockRequest } from '../api/request/stockRequest.js';
import { LoadingOutlined } from '@ant-design/icons';

const StockList = () => {
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
            <div className="d-flex flex-column justify-content-between align-items-center vh-100" >
                <div className="sticky-container d-flex justify-content-between align-items-center" style={{ marginTop: '6rem' }}>
                    <Card style={{ flexGrow: 1 }}>
                        <SearchContainer />
                    </Card>
                    <Button type="primary" className="ms-3 button2">
                        新增至投資組合
                    </Button>
                </div>

                <div className="mt-2" style={{ flexGrow: 1, width: '100%' }}>
                    <Flex gap="middle" vertical>
                        <Spin spinning={isLoading} indicator={<LoadingOutlined spin />} size="large">
                            <StockTable data={stockList} onCheckboxChange={handleCheckboxChange} selectedCodes={selectedStocks} />
                        </Spin>
                    </Flex>
                </div>
            </div>
        </>
    );

};

export default StockList;