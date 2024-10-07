import React, { useState, useEffect } from 'react';
import 'flatpickr/dist/flatpickr.min.css';
import { Button, message, Spin, Card, Radio } from 'antd';
import AccountingSidebar from '../components/accountingSidebar';
import { AccountingRequest } from '../api/request/accountingRequest';

const TradeHistory = () => {
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTotalAmount();
    }, []);

    const fetchTotalAmount = async () => {
        setLoading(true);
        AccountingRequest.getFinancialSummary()
            .then(response => {
                setTotalAmount(response.data.total_assets);
            })
            .catch((error) => {
                message.error(error.message);
            });
        setLoading(false);
    };

    return (
        <div className="accounting-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} selectedKey={'4'}/>
            <Card style={{ marginLeft: '2rem', width: '80%' }}>
                <Spin spinning={loading}>

                </Spin>
            </Card>
        </div>
    );
};

export default TradeHistory;
