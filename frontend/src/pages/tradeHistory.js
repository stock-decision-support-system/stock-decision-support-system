import React, { useState, useEffect } from 'react';
import { message, Spin, Card, Radio, List, Typography, Row, Col, Pagination } from 'antd';
import AccountingSidebar from '../components/accountingSidebar';
import AccountingList from '../components/accountingList';
import { AccountingRequest } from '../api/request/accountingRequest';
import { CategoryRequest } from '../api/request/categoryRequest';
import { Pie } from '@ant-design/plots';

const TradeHistory = () => {
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0)
    const [netAmount, setNetAmount] = useState(0)
    const [incomeData, setIncomeData] = useState([])
    const [expenseData, setExpenseData] = useState([])
    const [totalPages, setTotalPages] = useState(null);

    const incomeConfig = {
        appendPadding: 10,
        data: incomeData,
        angleField: 'value',
        colorField: 'name',
        radius: 0.7,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [
            {
                type: 'pie-legend-active',
            },
            {
                type: 'element-active',
            },
        ],
    };

    const expenseConfig = {
        appendPadding: 10,
        data: expenseData,
        angleField: 'value',
        colorField: 'name',
        radius: 0.7,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [
            {
                type: 'pie-legend-active',
            },
            {
                type: 'element-active',
            },
        ],
    };

    useEffect(() => {
        fetchAccountingPage();
        fetchAccountChart();
        fetchTotalAmount();
    }, []);

    const fetchAccountingPage = async () => {
        AccountingRequest.getAccountingTotalPages()
            .then(response => {
                setTotalPages(response.data.totalPages); // 更新 totalPages 狀態
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

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
        CategoryRequest.getConsumeTypeChart()
            .then(response => {
                setIncomeData(response.data.income);
                setExpenseData(response.data.expense);
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

    return (
        <div className="accounting-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'2'} />
            <AccountingList totalPages={totalPages * 8} /> {/*8是size */}
            <Card style={{ marginLeft: '2rem', width: '28%' }}>
                <Spin spinning={loading}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {incomeData.length > 0 ? (
                            <>
                                <Typography.Title level={3} style={{ textAlign: 'center' }}>收入圖表</Typography.Title>
                                <div style={{ height: '200px', width: '100%', marginBottom: '10rem' }}>  {/* 設置圓餅圖的容器高度和底部間距 */}
                                    <Pie {...incomeConfig} />
                                </div>
                            </>
                        ) : (
                            <Typography.Text>暫無收入圖表數據</Typography.Text>
                        )}
                        {expenseData.length > 0 ? (
                            <>
                                <Typography.Title level={3} style={{ textAlign: 'center' }}>支出圖表</Typography.Title>
                                <div style={{ height: '200px', width: '100%' }}>  {/* 設置圓餅圖的容器高度 */}
                                    <Pie {...expenseConfig} />
                                </div>
                            </>
                        ) : (
                            <Typography.Text>暫無支出圖表數據</Typography.Text>
                        )}
                    </div>
                </Spin>
            </Card>
        </div>
    );
};

export default TradeHistory;
