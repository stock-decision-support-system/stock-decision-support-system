import React, { useState, useEffect } from 'react';
import { Table, Modal, Badge, Popover, Button, List } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axios from 'axios';
import { config } from '../config';

const BASE_URL = config.API_URL;

const MyStocks = () => {
  const [stockData, setStockData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制通知視窗的狀態
  const [notifications, setNotifications] = useState([]); // 存儲通知內容
  const [isPopoverVisible, setIsPopoverVisible] = useState(false); // 小鈴鐺的狀態

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
          setIsModalVisible(true); // 顯示模態框
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

  const handleModalClose = () => {
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
        <Popover
          content={
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item>
                  <div>
                    <strong>{item.date}</strong>: {item.message}
                  </div>
                </List.Item>
              )}
            />
          }
          title="通知記錄"
          trigger="click"
          visible={isPopoverVisible}
          onVisibleChange={(visible) => setIsPopoverVisible(visible)}
        >
          <Badge count={notifications.length}>
            <Button shape="circle" icon={<BellOutlined />} />
          </Badge>
        </Popover>
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
        onOk={handleModalClose}
        onCancel={handleModalClose}
      >
        <p>您有新的投資建議，請查看小鈴鐺。</p>
      </Modal>
    </div>
  );
};

export default MyStocks;
