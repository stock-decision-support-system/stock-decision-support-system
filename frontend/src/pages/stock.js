import React from 'react';
import { useParams } from 'react-router-dom';
import SearchContainer from '../components/searchContainer';
import StockInfo from '../components/stockInfo';
import '../assets/css/stock.css';
import { Card } from 'antd';

const Stock = () => {
    const { code } = useParams();

    return (
        <div className="position-absolute top-50 start-50 translate-middle w-75 h-75"
            style={{ overflowY: 'scroll' }} >
            <div className="d-flex justify-content-center align-items-center mb-5">
                <Card>
                    <SearchContainer />
                </Card>
            </div>
            <StockInfo id={code} />
        </div>
    );
};

export default Stock;
