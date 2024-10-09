import React, { useState } from 'react';
import { Progress, Typography } from 'antd';
import '../assets/css/progressBar.css';
import { LeftCircleOutlined } from '@ant-design/icons'; // 這是一個示例圖標，你可以替換為任何你想用的圖標

const { Title, Text } = Typography;

const GoalProgressBar = () => {
    const title = '目標';
    const currentAmount = 0;
    const targetAmount = 100;
    const dueDate = '2024-10-09';
    const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{ position: 'fixed', top: '10%', right: '0', zIndex: 1000 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ 
                position: 'relative', 
                width: '450px', // 卡片的寬度
                transform: isHovered ? 'translateX(-10%)' : 'translateX(90%)', // 調整未懸停狀態下的偏移量
                transition: 'transform 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex', // 使用 flexbox 來排列圖標和內容
                alignItems: 'center',
            }}>
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
                        {title}
                    </Title>
                    <Progress
                        percent={progressPercentage}
                        strokeColor={{
                            from: '#108ee9',
                            to: '#87d068',
                        }}
                        trailColor="#f0f0f0"
                        style={{ marginTop: '10px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <Text>
                            目前/目標金額: <strong>${currentAmount}</strong> / <strong>${targetAmount}</strong>
                        </Text>
                        <Text style={{ color: '#888' }}>
                            截止日期: <strong>{dueDate}</strong>
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalProgressBar;
