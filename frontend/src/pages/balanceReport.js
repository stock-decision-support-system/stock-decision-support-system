import React, { useState, useEffect } from 'react';
import { message, Card, Spin, Typography, Layout } from 'antd';
import { AccountingRequest } from '../api/request/accountingRequest.js';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件
import { Bar } from '@ant-design/plots';
import { AccountTypeRequest } from '../api/request/accountTypeRequest';

const BalanceReport = () => {
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0)
    const [netAmount, setNetAmount] = useState(0)
    const [data, setData] = useState([])
    const [isVisible, setIsVisible] = useState(false);  // 初始狀態為不顯示

    const toggleVisibility = () => {
        setIsVisible(!isVisible);  // 切換顯示狀態
    };

    const config = {
        data,
        xField: 'value',
        yField: 'type',
        yAxis: {
            label: {
                autoRotate: false,
            },
        },
        scrollbar: {
            type: 'vertical',
        },
        meta: {
            type: {
                alias: '消費帳戶',
            },
            value: {
                alias: '金額(新台幣)',
            },
        },
        label: {
            position: 'middle', // 'top', 'bottom', 'middle'
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
    };

    useEffect(() => {
        fetchTotalAmount();
        fetchAccountChart();
    }, []);

    const fetchTotalAmount = async () => {
        setLoading(true);
        AccountingRequest.getFinancialSummary()
            .then(response => {
                setTotalAmount(response.data.total_assets);
                setNetAmount(response.data.net_assets);
            })
            .catch((error) => {
                message.error(error.message);
            });
        setLoading(false);
    };

    const fetchAccountChart = async () => {
        AccountTypeRequest.getAccountTypeChart()
            .then(response => {
                setData(response.data);
            })
            .catch((error) => {
                message.error(error.message);
            });
    };


    return (
        <div className="generalreport-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'4'} isVisible={isVisible} toggle={toggleVisibility} />
            <div className="generalreport-container-all" style={{ flex: 1, marginLeft: '1rem' }}>
                <Card title="帳戶金額變動" style={{ marginBottom: '1rem', height: '100%', width: '95%' }}>
                    <Spin spinning={loading}>
                        {data.length > 0 ? (
                            <Bar {...config} />
                        ) : (
                            <Typography.Text>暫無圖表數據</Typography.Text>
                        )}
                    </Spin>
                </Card>
            </div>
        </div>
    );
};

export default BalanceReport;
