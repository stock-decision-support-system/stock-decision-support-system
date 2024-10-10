import React, { useState, useEffect } from 'react';
import { Progress, Typography, message, Modal } from 'antd';
import '../assets/css/progressBar.css';
import { LeftCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // 引入所需的 Ant Design 圖標
import { BudgetRequest } from '../api/request/budgetRequest.js';
import { SmileOutlined } from '@ant-design/icons';  // 用於 Modal 的圖標

const { Title, Text } = Typography;

const GoalProgressBar = () => {
    const [data, setData] = useState({});
    const [isData, setIsData] = useState(false);
    const token = localStorage.getItem('token');
    const [isHovered, setIsHovered] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const fetchBudgetData = async () => {
            BudgetRequest.searchBudget()
                .then(response => {
                    setIsData(true);
                    setData(response.data);
                    if (response.data.is_successful) {
                        setShowModal(true);  // 如果 is_successful 是 true，顯示 Modal
                        setIsData(false);
                    }
                })
                .catch((error) => {
                    console.log(error.message);
                });
        };

        if (token) {
            fetchBudgetData();
        }
    }, [token]);

    const handleDelete = async (id) => {
    };

    const handleEdit = async (id) => {
    };


    // 計算花費的天數
    const calculateDaysSpent = () => {
        const startDate = new Date(data.start_date);
        const endDate = new Date();
        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // 轉換為天
        return daysDifference;
    };
    {/*<>{isData&&()}</>*/ }

    return (
        <>
            {token && (
                <div
                    style={{
                        position: 'fixed',
                        top: '10%', // 控制卡片的垂直位置
                        right: '0', // 卡片初始在右側
                        zIndex: 1000,
                        transition: 'transform 0.3s ease', // 為平滑過渡設置動畫效果
                        transform: isHovered ? 'translateX(0%)' : 'translateX(90%)', // 懸停時進入畫面，否則在畫面外
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div style={{
                        position: 'relative',
                        width: '450px', // 卡片的寬度
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex', // 使用 flexbox 來排列圖標和內容
                        alignItems: 'center',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            display: 'flex',
                            gap: '10px', // 設置按鈕之間的間距
                        }}>
                            <button
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleEdit(data.id)} // 假設你的目標資料有一個 id
                            >
                                <EditOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                            </button>
                            <button
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleDelete(data.id)} // 假設你的目標資料有一個 id
                            >
                                <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                            </button>
                        </div>
                        <div style={{ marginRight: '10px' }}>
                            <LeftCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} /> {/* 圖標 */}
                        </div>
                        <div
                            style={{
                                flex: 1, // 讓卡片填滿剩餘的空間
                                backgroundColor: 'transparent', // 背景透明以便與外部背景融合
                                border: 'none', // 去掉邊框
                            }}
                            hoverable
                            bodyStyle={{ padding: '0' }} // 移除內部填充
                        >
                            <Title level={4} style={{ marginBottom: 10 }}>
                                {data.name}
                            </Title>
                            <Progress
                                percent={Math.min((data.current / data.target) * 100, 100)}
                                strokeColor={{
                                    from: '#108ee9',
                                    to: '#87d068',
                                }}
                                trailColor="#f0f0f0"
                                style={{ marginTop: '10px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <Text>
                                    目前/目標金額: <strong>${data.current}</strong> / <strong>${data.target}</strong>
                                </Text>
                                <Text style={{ color: '#888' }}>
                                    截止日期: <strong>{data.end_date}</strong>
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                open={showModal}
                title={
                    <>
                        <SmileOutlined style={{ fontSize: '24px', color: '#108ee9' }} /> 儲蓄目標達成！
                    </>
                }
                onOk={() => setShowModal(false)}
                onCancel={() => setShowModal(false)}
                footer={null}
                style={{ textAlign: 'center' }} // 這裡將內容置中
                bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} // 內容也置中
            >
                <p>🎉 恭喜您已成功達成儲蓄目標！</p>
                <p>花費的天數: <strong>{calculateDaysSpent()} 天</strong></p>
                <p>目前的金額: <strong>${data.current}</strong></p>
            </Modal>
        </>
    );
};

export default GoalProgressBar;
