import React from 'react';
import { Table, Checkbox } from 'antd';

const StockTable = ({ data, onCheckboxChange }) => {
  const columns = [
    {
      title: '',
      key: 'checkbox',
      render: (text, record) => (
        <Checkbox
          value={record.code}
          onChange={(e) => onCheckboxChange(e, record.code)}
        />
      ),
    },
    {
      title: '股票名稱/代號',
      key: 'name',
      render: (text, record) => (
        <>
          <div>{record.name}</div>
          <div style={{ color: '#888' }}>{record.code}</div>
        </>
      ),
    },
    {
      title: '股價',
      dataIndex: 'price',
      key: 'price',
      render: (text, record) => (
        <span style={{ color: record.change >= 0 ? 'green' : 'red' }}>
          {record.price}
        </span>
      ),
    },
    {
      title: '漲跌',
      key: 'change',
      render: (text, record) => (
        <span style={{ color: record.change >= 0 ? 'green' : 'red' }}>
          {record.change}
        </span>
      ),
    },
    {
      title: '漲跌幅(%)',
      key: 'changePercent',
      render: (text, record) => (
        <span style={{ color: record.changePercent >= 0 ? 'green' : 'red' }}>
          {record.changePercent}%
        </span>
      ),
    },
    {
      title: '開盤',
      dataIndex: 'open',
      key: 'open',
    },
    {
      title: '昨日收盤價',
      dataIndex: 'previousClose',
      key: 'previousClose',
    },
    {
      title: '最高',
      dataIndex: 'high',
      key: 'high',
    },
    {
      title: '最低',
      dataIndex: 'low',
      key: 'low',
    },
    {
      title: '成交量(張)',
      dataIndex: 'volume',
      key: 'volume',
    },
    {
      title: '時間',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};

export default StockTable;