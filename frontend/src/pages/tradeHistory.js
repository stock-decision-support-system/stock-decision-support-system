import React, { useState, useEffect } from 'react';
import { Button, message, Spin, Card, Radio, List, Typography, Row, Col } from 'antd';
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
                    <List
                        itemLayout="horizontal"
                        dataSource={accountingList}
                        renderItem={(item) => {
                            const formattedAmount =
                                item.assetType === '0'
                                    ? `+${item.amount}`
                                    : `-${item.amount}`;
                            const amountStyle =
                                item.assetType === '0' ? { color: 'blue', fontSize: '16px' } : { color: 'red', fontSize: '16px' };
                            const displayContent =
                                item.content && item.content.length > 8
                                    ? item.content.substring(0, 8) + '...'
                                    : item.content || ' ';
                            return (
                                <List.Item style={{ padding: '10px 0' }}>
                                    <Row style={{ width: '100%', alignItems: 'center' }}>
                                        <Col span={4} style={{ fontSize: '16px' }}>
                                            {item.transactionDate.substring(0, 10)}
                                        </Col>
                                        <Col span={12} style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '20px' }}>{item.consumeTypeIcon}</span>
                                                <Typography.Text style={{ marginLeft: '8px', fontSize: '16px' }}>
                                                    {item.accountingName}
                                                </Typography.Text>
                                            </div>
                                            <Typography.Text style={{ color: 'gray', fontSize: '14px' }}>
                                                {displayContent}
                                            </Typography.Text>
                                        </Col>
                                        <Col span={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '20px' }}>{item.accountTypeIcon}</span>
                                            <Typography.Text style={amountStyle} strong>
                                                {formattedAmount}
                                            </Typography.Text>
                                        </Col>
                                    </Row>
                                </List.Item>
                            );
                        }}
                    />
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
