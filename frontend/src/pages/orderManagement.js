import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message, Popconfirm } from 'antd';
import { config } from '../config';

const BASE_URL = config.API_URL


const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusTranslation = {
    Cancelled: '已刪除',
    Filled: '完全成交',
    PartFilled: '部分成交',
    Failed: '失敗',
    PendingSubmit: '傳送中',
    PreSubmitted: '預約單',
    Submitted: '傳送成功',
  };

  // 獲取活躍的訂單
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${BASE_URL}/api/order-status/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('訂單資料:', response.data);

      if (response.data.status === 'success') {
        const translatedOrders = response.data.data.map(order => {
          return {
            ...order,
            status: {
              ...order.status,
              status: statusTranslation[order.status.status] || order.status.status,
            },
          };
        });

        if (translatedOrders.length === 0) {
          message.info('當前沒有活躍的訂單');
        }

        setOrders(translatedOrders);
      } else {
        message.warning(response.data.message || '沒有找到任何訂單');
        setOrders([]);
      }
    } catch (error) {
      console.error('無法獲取訂單資料:', error);
      message.error('無法獲取訂單資料，請檢查網路連線');
    } finally {
      setLoading(false);
    }
  };

  // 刪除委託單
  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${BASE_URL}/api/cancel-odd-lot-order/`,
        { order_id: orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 'success') {
        message.success('刪單成功');
        fetchOrders(); // 刷新訂單列表
      } else {
        message.error(response.data.message || '刪單失敗');
      }
    } catch (error) {
      console.error('刪單失敗:', error);
      message.error('刪單失敗，請檢查網路連線');
    }
  };

  // 手動刪除紀錄
  const deleteOrderRecord = (orderId) => {
    setOrders(orders.filter(order => order.order.id !== orderId));  // 刪除前端的紀錄
    message.success('紀錄已刪除');
  };

  const columns = [
    {
      title: '訂單ID',
      dataIndex: ['order', 'id'],
      key: 'id',
    },
    {
      title: '股票代號',
      dataIndex: ['contract', 'code'],
      key: 'stock_symbol',
    },
    {
      title: '下單價格',
      dataIndex: ['order', 'price'],
      key: 'price',
    },
    {
      title: '下單數量',
      dataIndex: ['order', 'quantity'],
      key: 'quantity',
    },
    {
      title: '狀態',
      dataIndex: ['status', 'status'],
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Button danger onClick={() => cancelOrder(record.order.id)}>
          刪單
        </Button>
      ),
    },
    {
      title: '刪除紀錄',
      key: 'delete_record',
      render: (text, record) => (
        <Popconfirm
          title="確定要刪除此紀錄嗎？"
          onConfirm={() => deleteOrderRecord(record.order.id)}
          okText="是"
          cancelText="否"
        >
          <Button danger>刪除紀錄</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h1>正在委託中的訂單</h1>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default OrderManagement;
