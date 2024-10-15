import React from 'react';
import { useParams } from 'react-router-dom';
import SearchContainer from '../components/searchContainer';
import StockInfo from '../components/stockInfo';
import '../assets/css/stock.css';
import { Button, Card, Flex, Spin } from 'antd';

const Stock = () => {
    const { code } = useParams();

    return (
        <>
            <div className="flex-column vh-100" style={{ width: '90%' }}>
                <div className="d-flex justify-content-center" style={{ marginTop: '6rem', width: '100%' }}>
                    <Card style={{ width: '30%' }}>
                        <SearchContainer />
                    </Card>
                </div>

                <div className="mt-2" style={{ flexGrow: 1, width: '100%' }}>
                    <Flex gap="middle" vertical>
                        <StockInfo id={code} />
                    </Flex>
                </div>
            </div>
        </>
    );
};

export default Stock;
