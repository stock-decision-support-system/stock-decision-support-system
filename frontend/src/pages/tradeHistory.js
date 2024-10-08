import React, { useState, useEffect } from 'react';
import { Button, message, Spin, Card, Radio } from 'antd';
import AccountingSidebar from '../components/accountingSidebar';
import { AccountingRequest } from '../api/request/accountingRequest';

const TradeHistory = () => {
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0)
    const [accountingList, setAccountingList] = useState([])

    useEffect(() => {
        fetchTotalAmount();
        fetchAccountingList()
    }, []);

    const fetchTotalAmount = async () => {
        AccountingRequest.getFinancialSummary()
            .then(response => {
                setTotalAmount(response.data.total_assets);
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

    const fetchAccountingList = async () => {
        AccountingRequest.getAccountingList()
            .then(response => {
                setAccountingList(response.data);
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

    return (
        <div className="accounting-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} selectedKey={'4'} />
            <Card style={{ marginLeft: '2rem', width: '50%' }}>
                <Spin spinning={loading}>

                </Spin>
            </Card>
            <Card style={{ marginLeft: '2rem', width: '30%' }}>
                <Spin spinning={loading}>

                </Spin>
            </Card>
        </div>
    );
};

export default TradeHistory;
