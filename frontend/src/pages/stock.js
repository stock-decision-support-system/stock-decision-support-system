import React from 'react';
import SearchContainer from '../components/searchContainer';
import StockInfo from '../components/stockInfo';
import '../assets/css/stock.css'
import { Card } from 'antd';

const Stock = () => {
    return (
        <div className="position-absolute top-50 start-50 translate-middle w-75 h-75">
            <Card
                title={
                    <div className="d-flex justify-content-center align-items-center">
                        <SearchContainer>
                        </SearchContainer>
                    </div>}
                className='h-100'
            >
                <StockInfo>
                </StockInfo>
            </Card>
        </div>
    );
};

export default Stock;
