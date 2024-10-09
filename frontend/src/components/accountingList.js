import React, { useState, useEffect } from 'react';
import { message, Spin, Card, Radio, List, Typography, Row, Col, Pagination } from 'antd';
import { config } from "../config";
import axios from 'axios';

const API_URL = config.API_URL;

const AccountingList = ({ totalPages }) => {
    const [current, setCurrent] = useState(1);
    const [loading, setLoading] = useState(false);
    const [accountingList, setAccountingList] = useState([])

    const onChange = (page) => {
        setCurrent(page);
    };

    useEffect(() => {
        fetchAccountingList(current);
    }, [current]);

    const fetchAccountingList = async (page) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/accounting/user/?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setAccountingList(response.data.data);
        } catch (error) {
            message.error(error.message);
        }
        setLoading(false);
    };
    return (
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
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination current={current} onChange={onChange} total={totalPages} />
            </div>
        </Card>
    );
};

export default AccountingList;
