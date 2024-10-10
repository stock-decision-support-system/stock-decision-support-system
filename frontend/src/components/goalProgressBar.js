import React, { useState, useEffect } from 'react';
import { Progress, Typography, message, Modal } from 'antd';
import '../assets/css/progressBar.css';
import { LeftCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BudgetRequest } from '../api/request/budgetRequest.js';
import { SmileOutlined } from '@ant-design/icons';
import BudgetEditDialog from './budgetEditDialog';
import BudgetDeleteDialog from './budgetDeleteDialog';

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
                    setData(response.data);
                    if (response.data.length != 0) {
                        setIsData(true);
                    }
                    if (response.data.is_successful) {
                        setShowModal(true);
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

    // 計算花費的天數
    const calculateDaysSpent = () => {
        const startDate = new Date(data.start_date);
        const endDate = new Date();
        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // 轉換為天
        return daysDifference;
    };

    return (
        <>
            {token && (
                <>
                    {isData ? (  // 檢查 isData 是否為 true
                        <div
                            style={{
                                position: 'fixed',
                                top: '10%',
                                right: '0',
                                zIndex: 1000,
                                transition: 'transform 0.3s ease',
                                transform: isHovered ? 'translateX(0%)' : 'translateX(90%)',
                            }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div style={{
                                position: 'relative',
                                width: '450px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                padding: '20px',
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    display: 'flex',
                                    gap: '10px',
                                }}>
                                    <button
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setShowEditModal(true)} // 打開編輯對話框
                                    >
                                        <EditOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                    </button>
                                    <button
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setShowDeleteModal(true)} // 打開刪除對話框
                                    >
                                        <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                                    </button>
                                </div>
                                <div style={{ marginRight: '10px' }}>
                                    <LeftCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                    }}
                                    hoverable
                                    bodyStyle={{ padding: '0' }}
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
                    ) : (
                        <div
                            style={{
                                position: 'fixed',
                                top: '10%',
                                right: '0',
                                zIndex: 1000,
                                transition: 'transform 0.3s ease',
                                transform: isHovered ? 'translateX(0%)' : 'translateX(90%)',
                            }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div style={{
                                position: 'relative',
                                width: '450px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                padding: '20px',
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <div style={{ marginRight: '10px' }}>
                                    <LeftCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        border: 'none', alignItems: 'center'
                                    }}
                                    hoverable
                                    bodyStyle={{ padding: '0' }}
                                >
                                    <Title level={3} style={{ textAlign: 'center' }}>尚未新增儲蓄目標</Title>
                                </div>
                            </div>
                        </div>
                    )}
                </>
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
                style={{ textAlign: 'center' }}
                bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <p>🎉 恭喜您已成功達成儲蓄目標！</p>
                <p>花費的天數: <strong>{calculateDaysSpent()} 天</strong></p>
                <p>目前的金額: <strong>${data.current}</strong></p>
            </Modal>

            {showEditModal &&
                <BudgetEditDialog
                    id={data.id} // 傳遞預算的 ID
                    name={data.name}
                    start_date={data.start_date}
                    end_date={data.end_date}
                    target={data.target}
                    onEdit={() => {
                        setShowEditModal(false);
                        // 這裡可以添加邏輯以更新預算列表或觸發重新加載
                    }}
                />
            }

            {showDeleteModal &&
                <BudgetDeleteDialog
                    id={data.id} // 傳遞預算的 ID
                    end_date={data.end_date}
                    target={data.target}
                    current_amount={data.current}
                    onDelete={() => {
                        setShowDeleteModal(false);
                        // 這裡可以添加邏輯以更新預算列表或觸發重新加載
                    }}
                />
            }
        </>
    );
};

export default GoalProgressBar;
