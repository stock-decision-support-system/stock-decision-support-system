import React, { useState, useEffect } from 'react';
import { message, Card, Select } from 'antd';
import { AccountingRequest } from '../api/request/accountingRequest.js';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件
import { Bar } from '@ant-design/plots';

const { Option } = Select;

const ConsumeReport = () => {
    const [consumeType, setConsumeType] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0)
    const [netAmount, setNetAmount] = useState(0)

    useEffect(() => {
        fetchTotalAmount();
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

    const data = [
        {
            id: 1,
            name: 'A帳戶',
            value: 38,
        },
        {
            id: 2,
            name: 'B帳戶',
            value: 52,
        },
        {
            id: 3,
            name: 'C帳戶',
            value: 61,
        },
        {
            id: 4,
            name: 'D帳戶',
            value: 145,
        },
        {
            id: 5,
            name: 'E帳戶',
            value: 48,
        },
    ];
    const config = {
        data,
        xField: 'value',
        yField: 'name',
        seriesField: 'name',
        legend: {
            position: 'top-left',
        },
    };

    return (
        <div className="generalreport-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'5'} />
            <div className="generalreport-container-all" style={{ flex: 1, marginLeft: '1rem' }}>
                <Card title="消費習慣分析" style={{ marginBottom: '1rem', height: '100%' }}>
                    <div className="generalreport-account-form">
                        <div className="generalreport-dropdown-container" style={{ marginBottom: '1rem' }}>
                            <Select
                                onChange={(value) => setConsumeType(value)}
                                style={{ width: '100%' }} // 確保 Select 佔滿 Col 寬度
                                value={consumeType}
                            >
                                <Option value={0}>全部</Option>
                                {data.map((item) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="generalreport-report-container">
                            <div className="chart-container">
                                <Bar {...config} />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ConsumeReport;
