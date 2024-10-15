import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message } from 'antd';

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
      const response = await axios.get('http://localhost:8000/api/order-status/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('訂單資料:', response.data); // 打印訂單資料

      if (response.data.status === 'success') {
        const translatedOrders = response.data.data.map(order => {
          return {
            ...order,
            status: {
              ...order.status,
              status: statusTranslation[order.status.status] || order.status.status,  // 翻譯狀態
            },
          };
        });

        if (translatedOrders.length === 0) {
          message.info('當前沒有活躍的訂單');
        }

        setOrders(translatedOrders); // 設置翻譯後的訂單資料
      } else {
        message.warning(response.data.message || '沒有找到任何訂單');
        setOrders([]); // 清空訂單列表
      }
    } catch (error) {
      console.error('無法獲取訂單資料:', error);
      message.error('無法獲取訂單資料，請檢查網路連線');
    } finally {
      setLoading(false);
    }
  };

  // 刪單功能
  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:8000/api/cancel-odd-lot-order/',
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

  const columns = [
    {
      title: '訂單ID',
      dataIndex: ['order', 'id'],  // 對應資料結構中的 order.id
      key: 'id',
    },
    {
      title: '股票代號',
      dataIndex: ['contract', 'code'],  // 對應資料結構中的 contract.code
      key: 'stock_symbol',
    },
    {
      title: '下單價格',
      dataIndex: ['order', 'price'],  // 對應資料結構中的 order.price
      key: 'price',
    },
    {
      title: '下單數量',
      dataIndex: ['order', 'quantity'],  // 對應資料結構中的 order.quantity
      key: 'quantity',
    },
    {
      title: '狀態',
      dataIndex: ['status', 'status'],  // 對應資料結構中的 status.status
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
