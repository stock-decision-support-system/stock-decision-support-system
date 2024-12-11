import React, { useState, useEffect } from 'react';
import { Table, Modal, Badge, Button, List } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axios from 'axios';
import { config } from '../config';

const BASE_URL = config.API_URL;

const MyStocks = () => {
  const [stockData, setStockData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制投資建議通知彈窗
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false); // 控制通知紀錄彈窗
  const [notifications, setNotifications] = useState([]); // 存儲通知內容

  const fetchNotifications = (token) => {
    axios
      .get(`${BASE_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('通知數據:', response.data.notifications);
        setNotifications(response.data.notifications || []);

        // 檢查是否已顯示過當天通知
        const todayKey = new Date().toISOString().split('T')[0];
        const shownNotifications = JSON.parse(localStorage.getItem('shownNotifications')) || [];
        if (!shownNotifications.includes(todayKey)) {
          setIsModalVisible(true); // 顯示投資建議彈窗
          localStorage.setItem(
            'shownNotifications',
            JSON.stringify([...shownNotifications, todayKey])
          );
        }
      })
      .catch((error) => {
        console.error('無法獲取通知:', error);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); // 從 localStorage 獲取保存的 Token

    if (!token) {
      console.error('Token 不存在，無法進行請求');
      return;
    }

    // 獲取持有股票數據
    axios
      .get(`${BASE_URL}/api/portfolio-status/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { positions } = response.data;
        setStockData(positions);
      })
      .catch((error) => {
        console.error('無法獲取持有股票資料:', error);
      });

    // 生成專屬通知
    axios
      .post(`${BASE_URL}/api/generate-user-notification/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('生成通知:', response.data.message);
        // 生成成功後立即刷新通知列表
        fetchNotifications(token);
      })
      .catch((error) => {
        console.error('無法生成通知:', error);
      });
    // 初次進入頁面時獲取通知數據
    fetchNotifications(token);
  }, []);

  const handleNotificationModalOpen = () => {
    setIsNotificationModalVisible(true);
  };

  const handleNotificationModalClose = () => {
    setIsNotificationModalVisible(false);
  };

  const handleInvestmentModalClose = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '股票代號',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '股票名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '股數',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => `${text} 股`,
    },
    {
      title: '總成本 (NT$)',
      key: 'total_cost',
      render: (_, record) => {
        const totalCost = record.quantity * record.price;
        return `NT$ ${totalCost.toLocaleString()}`;
      },
    },
    {
      title: '目前價格 (NT$)',
      dataIndex: 'last_price',
      key: 'last_price',
      render: (price) => `NT$ ${price.toLocaleString()}`,
    },
    {
      title: '總市價 (NT$)',
      key: 'total_market_value',
      render: (_, record) => {
        const totalMarketValue = record.quantity * record.last_price;
        return `NT$ ${totalMarketValue.toLocaleString()}`;
      },
    },
    {
      title: '損益 (NT$)',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl) => `NT$ ${pnl.toLocaleString()}`,
    },
  ];

  return (
    <div className="container">
      <h1 className="title" style={{ marginTop: '-15%' }}>我的股票持有狀況與損益</h1>
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <Badge count={notifications.length}>
          <Button
            shape="circle"
            icon={<BellOutlined />}
            onClick={handleNotificationModalOpen}
          />
        </Badge>
      </div>
      <Table
        columns={columns}
        dataSource={stockData}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />
      <Modal
        title="投資組合通知"
        visible={isModalVisible}
        onOk={handleInvestmentModalClose}
        onCancel={handleInvestmentModalClose}
      >
        <p>您有新的投資建議，請查看通知記錄。</p>
      </Modal>
      <Modal
        title="通知記錄"
        visible={isNotificationModalVisible}
        onOk={handleNotificationModalClose}
        onCancel={handleNotificationModalClose}
        footer={null}
        width={700} // 設置彈窗寬度
        bodyStyle={{ maxHeight: '400px', overflowY: 'auto' }} // 設置彈窗內部樣式
      >
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item style={{ display: 'block', padding: '10px 0' }}>
            <div style={{ lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {item.message}
            </div>
          </List.Item>
        )}
      />
      </Modal>
    </div>
  );
};

export default MyStocks;
