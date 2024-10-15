import React, { useState, useEffect } from 'react';
import { message, Spin, Card, List, Typography, Row, Col, Pagination } from 'antd';
import { config } from "../config";
import axios from 'axios';
import '../assets/css/accountingList.css';

const API_URL = config.API_URL;

const AccountingList = ({ totalPages, isVisible }) => {
    const [current, setCurrent] = useState(1);
    const [loading, setLoading] = useState(false);
    const [accountingList, setAccountingList] = useState([]);
    const [isSmallScreen, setIsSmallScreen] = useState(false); // 新增 state 來判斷螢幕大小

    const onChange = (page) => {
        setCurrent(page);
    };

    // 監聽螢幕大小變化
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768); // 根據解析度設定，這裡設置768px為小螢幕的臨界點
        };

        // 初次加載時檢查螢幕大小
        handleResize();

        // 添加監聽器
        window.addEventListener('resize', handleResize);

        // 清除監聽器
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
            });
            setAccountingList(response.data.data);
        } catch (error) {
            message.error(error.message);
        }
        setLoading(false);
    };

    const formatTransactionDate = (date) => {
        return isSmallScreen
            ? date.substring(5, 10) // MM-DD 格式
            : date.substring(0, 10); // YYYY-MM-DD 格式
    };

    return (
        <Card  className={`history-card ${!isVisible ? 'visible' : 'hidden'}`}>
            <Spin spinning={loading}>
                <List
                    itemLayout="horizontal"
                    dataSource={accountingList}
                    renderItem={(item) => {
                        const formattedAmount = item.assetType === '0' ? `+${item.amount}` : `-${item.amount}`;
                        const amountClass = item.assetType === '0' ? 'amount-blue' : 'amount-red';
                        const displayContent = item.content && item.content.length > 8
                            ? item.content.substring(0, 8) + '...'
                            : item.content || ' ';
                        return (
                            <List.Item className="accounting-list-item">
                                <Row className="accounting-row">
                                    <Col span={4} className="transaction-date">
                                        {formatTransactionDate(item.transactionDate)}
                                    </Col>
                                    <Col span={12} className="accounting-info">
                                        <div className="accounting-title">
                                            <span className="consume-type-icon">{item.consumeTypeIcon}</span>
                                            <Typography.Text className="accounting-name">
                                                {item.accountingName}
                                            </Typography.Text>
                                        </div>
                                        <Typography.Text className="content-display">
                                            {displayContent}
                                        </Typography.Text>
                                    </Col>
                                    <Col span={8} className="accounting-amount">
                                        <span className="account-type-icon">{item.accountTypeIcon}</span>
                                        <Typography.Text className={amountClass} strong>
                                            {formattedAmount}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                            </List.Item>
                        );
                    }}
                />
            </Spin>
            <div className="pagination-container">
                <Pagination current={current} onChange={onChange} total={totalPages} />
            </div>
        </Card>
    );
};

export default AccountingList;
