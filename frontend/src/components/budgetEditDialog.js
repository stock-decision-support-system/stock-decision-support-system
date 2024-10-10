import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, DatePicker, message } from 'antd';
import { BudgetRequest } from '../api/request/budgetRequest.js';
import dayjs from 'dayjs'; // 確保你有導入 dayjs

const BudgetEditDialog = ({ id, name, start_date, end_date, target, onEdit }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm(); // 使用 Ant Design 的 Form hook
    const [startTest, setStartTest] = useState(dayjs());

    useEffect(() => {
        showModal();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields(); // 清空表單
        onEdit();
    };

    useEffect(() => {
        const fetchBudgetData = () => {
            const startDate = dayjs(start_date); // 使用 dayjs
            const endDate = dayjs(end_date); // 使用 dayjs

            setStartTest(startDate);
            // 將獲取到的數據填入表單
            form.setFieldsValue({
                name: name, // 確保 name 有預設值
                start_date: startDate, // 確保是 dayjs 對象
                end_date: endDate, // 確保是 dayjs 對象
                target: target, // 確保 target 有預設值
            });
        };

        fetchBudgetData();
    }, [id, form, start_date, end_date, name, target]); // 添加其他依賴項

    const handleFormSubmit = async (values) => {
        // 提交表單前的數據處理
        if (values.end_date) {
            const endDate = values.end_date.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
            values["end_date"] = endDate; 
        }

        BudgetRequest.updateBudget(id, values)
            .then(response => {
                message.success(response.message);
                setIsModalVisible(false); // 正確關閉模態框
                form.resetFields(); // 提交後清空表單
                onEdit();
                window.location.reload();
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

    return (
        <>
            <Modal
                title="編輯目標"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        name="name"
                        label="目標"
                        rules={[{ required: true, message: '請輸入目標名稱！' }]}>
                        <Input placeholder="目標" />
                    </Form.Item>
                    <Form.Item
                        name="start_date"
                        label="起始日"
                    >
                        <DatePicker format="YYYY-MM-DD" placeholder={startTest.format('YYYY-MM-DD')} disabled /> {/* 設置為不可編輯 */}
                    </Form.Item>

                    <Form.Item
                        name="end_date"
                        label="結束日"
                        rules={[{ required: true, message: '請選擇結束日' }]}>
                        <DatePicker format="YYYY-MM-DD" onChange={(date) => form.setFieldsValue({ 'end_date': date })} />
                    </Form.Item>

                    <Form.Item
                        name="target"
                        label="目標金額"
                        rules={[{ required: true, message: '請輸入目標金額' }]}>
                        <Input type="number" placeholder="輸入目標金額" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default BudgetEditDialog;
