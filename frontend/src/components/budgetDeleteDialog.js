import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { BudgetRequest } from '../api/request/budgetRequest.js';
import moment from 'moment';
import cryImage from '../assets/images/cryicon.png';

const BudgetDeleteDialog = ({ id, end_date, target, current_amount, onDelete }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        showModal();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        onDelete();
    };

    const handleDelete = async () => {
        try {
            await BudgetRequest.deleteBudget(id);
            message.success('儲蓄目標已刪除');
            setIsModalVisible(false);
            onDelete();
            window.location.reload();
        } catch (error) {
            message.error('刪除儲蓄目標失敗');
        }
    };

    if (!id) return null; // 如果數據尚未加載，則不渲染對話框

    // 計算距離目標的天數和金額差距
    const daysLeft = moment(end_date).diff(moment(), 'days');
    const amountLeft = target - current_amount;

    return (
        <>
            <Modal    
                title={<h2 style={{ fontSize: '28px' }}>確定要刪除儲蓄目標嗎?</h2>}  // 調整字體大小
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="danger"
                        onClick={handleDelete}
                        style={{ backgroundColor: 'red', color: 'white', borderColor: 'red' }} // 設置按鈕背景和文字顏色
                    >
                        確認刪除
                    </Button>,
                ]}

                style={{
                    textAlign: 'center',
                    minHeight: '300px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }} // 增加卡片長度
            >
                <h3 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>距離目標還有 {daysLeft} 天</h3>
                <img
                    src={cryImage}
                    alt="勸退圖示"
                    style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '20px' }} />
                <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
                    <span>還差 </span>
                    <span style={{ color: 'red' }}>{amountLeft}</span>
                    <span> 金額</span>
                </h2>
                <p>不要放棄，加油！你一定可以達成目標！</p>
            </Modal >
        </>
    );
};

export default BudgetDeleteDialog;
