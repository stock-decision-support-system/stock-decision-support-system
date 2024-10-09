import React, { useState, useEffect } from 'react';
import { message, Card, Select } from 'antd';
import { Line } from '@ant-design/charts';
import { AccountingRequest } from '../api/request/accountingRequest';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件

const { Option } = Select;
const GeneralReport = () => {
    const [category, setCategory] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0)
    const [netAmount, setNetAmount] = useState(0)

    useEffect(() => {
        fetchTotalAmount();
    }, []);

    const fetchTotalAmount = async () => {
        AccountingRequest.getFinancialSummary()
            .then(response => {
                setTotalAmount(response.data.total_assets);
                setNetAmount(response.data.net_assets);
            })
            .catch((error) => {
                message.error(error.message);
            });
    };
    
    const dropDownData = [
        { type: 0, value: '全年' },
        { type: 1, value: '前半年' },
        { type: 2, value: '後半年' },
        { type: 3, value: '近三個月' },
    ];

    const data = [
        { month: '2024-01', value: 100 },
        { month: '2024-02', value: 105 },
        { month: '2024-03', value: 110 },
        { month: '2024-04', value: 120 },
        { month: '2024-05', value: 130 },
        { month: '2024-06', value: 140 },
        { month: '2024-07', value: 150 },
        { month: '2024-08', value: 160 },
        { month: '2024-09', value: 170 },
        { month: '2024-10', value: 180 },
        { month: '2024-11', value: 190 },
        { month: '2024-12', value: 200 },
    ];

    const config = {
        data,
        xField: 'month',
        yField: 'value',
        smooth: true,
        label: {
            style: {
                fill: '#aaa',
            },
        },
        point: {
            size: 5,
            shape: 'diamond',
        },
        tooltip: {
            showMarkers: true,
        },
        title: {
            visible: true,
            text: '全年度每月總資產 折線圖',
        },
        xAxis: {
            title: {
                text: '月份',
            },
        },
        yAxis: {
            title: {
                text: '資產價值',
            },
            min: 0,
        },
        autoFit: true, // 禁用自動適應
    };

    return (
        <div className="generalreport-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'4'} />
            <div className="generalreport-container-all" style={{ flex: 1, marginLeft: '1rem' }}>
                <Card title="報告圖表" style={{ marginBottom: '1rem', height: '100%' }}>
                <div className="generalreport-account-form">
                        <div className="generalreport-dropdown-container" style={{ marginBottom: '1rem' }}>
                            <Select
                                onChange={(value) => setCategory(value)}
                                style={{ width: '100%' }} // 確保 Select 佔滿 Col 寬度
                                value={category}
                            >
                                {dropDownData.map((item) => (
                                    <Option key={item.type} value={item.type}>
                                        {item.value}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="generalreport-report-container">
                            <div className="chart-container">
                                <Line {...config} />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default GeneralReport;
