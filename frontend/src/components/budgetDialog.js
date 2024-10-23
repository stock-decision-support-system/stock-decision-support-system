import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, DatePicker, Select, message } from 'antd';
import { BudgetRequest } from '../api/request/budgetRequest.js';
import axios from 'axios';
import { config } from "../config";

const BASE_URL = config.API_URL;
const { Option } = Select;

const BudgetDialog = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [investmentPortfolios, setInvestmentPortfolios] = useState([]); // 儲存投資組合資料
    const [selectedThreshold, setSelectedThreshold] = useState(''); // 儲存選擇的門檻金額
    const [form] = Form.useForm(); // 使用 Ant Design 的 Form hook
    const token = localStorage.getItem('token');

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields(); // 清空表單
        setSelectedThreshold(''); // 重置門檻
    };

    // 從後端 API 獲取所有預設投資組合
    useEffect(() => {
        if (isModalVisible) {
            axios.get(`${BASE_URL}/investment/default-investment-portfolios/`, {
                headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                console.log('獲取到的投資組合資料:', response.data);  // 確認返回的資料
                setInvestmentPortfolios(response.data);  // 將獲取到的投資組合資料儲存
            })
            .catch(error => {
                console.error('無法獲取投資組合資料:', error);
                message.error('無法獲取投資組合資料');
            });
        }
    }, [isModalVisible]);

    const handleFormSubmit = async (values) => {
        // 提交表單前的數據處理
        if (values.start_date) {
            const startDate = new Date(values.start_date);
            values["start_date"] = startDate.toISOString().split('T')[0];  // 格式化為 YYYY-MM-DD
        }

        if (values.end_date) {
            const endDate = new Date(values.end_date);
            values["end_date"] = endDate.toISOString().split('T')[0];  // 格式化為 YYYY-MM-DD
        }

        BudgetRequest.addBudget(values)
            .then(response => {
                message.success(response.message);
                setIsModalVisible(false); // 正確關閉模態框
                form.resetFields(); // 提交後清空表單
                window.location.reload();
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

    // 當選擇投資組合時，自動填充目標金額
    const handlePortfolioChange = (portfolioId) => {
        const selectedPortfolio = investmentPortfolios.find(portfolio => portfolio.id === portfolioId);
        if (selectedPortfolio) {
            setSelectedThreshold(selectedPortfolio.investment_threshold); // 更新目標金額
            form.setFieldsValue({ target: selectedPortfolio.investment_threshold }); // 設定表單中的目標金額
        }
    };

    return (
        <>
            {token && (
                <Button
                    type="primary"
                    shape="circle"
                    className="button1"
                    onClick={showModal}
                    style={{
                        position: 'fixed',
                        right: '1rem',
                        bottom: '6rem',
                        width: '60px',
                        height: '60px',
                        fontSize: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000, // 確保按鈕浮動在上層
                    }}
                >
                    +
                </Button>
            )}
            <Modal
                title="新增目標"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    {/* 目標下拉選單 */}
                    <Form.Item
                        name="name"
                        label="目標"
                        rules={[{ required: true, message: '請選擇一個目標！' }]}
                    >
                        <Select placeholder="選擇一個預設投資組合" onChange={handlePortfolioChange}>
                            {investmentPortfolios.map(portfolio => (
                                <Option key={portfolio.id} value={portfolio.id}>
                                    {portfolio.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="start_date"
                        label="起始日"
                        rules={[{ required: true, message: '請選擇起始日' }]}
                    >
                        <DatePicker format="YYYY-MM-DD" onChange={(date) => form.setFieldsValue({ 'start_date': date })} />
                    </Form.Item>

                    <Form.Item
                        name="end_date"
                        label="結束日"
                        rules={[{ required: true, message: '請選擇結束日' }]}
                    >
                        <DatePicker format="YYYY-MM-DD" onChange={(date) => form.setFieldsValue({ 'end_date': date })} />
                    </Form.Item>

                    {/* 目標金額 */}
                    <Form.Item
                        name="target"
                        label="目標金額"
                        rules={[{ required: true, message: '目標金額必填' }]}
                    >
                        <Input type="number" placeholder="目標金額" value={selectedThreshold} readOnly />
                    </Form.Item>

                    <Form.Item>
                        <Button className='button2 float-end' type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default BudgetDialog;
