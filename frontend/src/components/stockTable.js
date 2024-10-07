import React from 'react';
import { Table, Checkbox } from 'antd';
import { Link } from 'react-router-dom';
import '../assets/css/stockTable.css';

const StockTable = ({ data, onCheckboxChange, selectedCodes }) => {
  const columns = [
    {
      title: '',
      key: 'checkbox',
      render: (text, record) => (
        <Checkbox
          checked={selectedCodes.includes(record.code)} // 判斷是否選中
          onChange={(e) => onCheckboxChange(e, record.code)}
        />
      ),
    },
    {
      title: '股票名稱/代號',
      key: 'code',
      render: (text, record) => (
        <>
          <div><Link to={`/stock/${record.code}`}>{record.name}</Link></div>
          <div style={{ color: '#888' }}><Link to={`/stock/${record.code}`}>{record.code}</Link></div>
        </>
      ),
    },
    {
      title: '股價',
      dataIndex: 'close',
      key: 'close',
      render: (text, record) => (
        <span style={{ color: record.change_price >= 0 ? 'green' : 'red' }}>
          {record.close}
        </span>
      ),
    },
    {
      title: '漲跌',
      key: 'change_rate',
      render: (text, record) => (
        <span style={{ color: record.change_price >= 0 ? 'green' : 'red' }}>
          {record.change_price}
        </span>
      ),
    },
    {
      title: '漲跌幅(%)',
      key: 'change_rate',
      render: (text, record) => (
        <span style={{ color: record.change_rate >= 0 ? 'green' : 'red' }}>
          {record.change_rate}%
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
      dataIndex: 'close',
      key: 'close',
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
      dataIndex: 'total_volume',
      key: 'total_volume',
    },
    {
      title: '最後成交時間',
      key: 'ts',
      render: (text, record) => (
        <p>
          {getDate(record.ts)}
        </p>
      ),
    },
  ];

  const getDate = (ts) => {
    const millisecondsTimestamp = ts / 1e6;
    const date = new Date(millisecondsTimestamp);
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':' +
      String(date.getSeconds()).padStart(2, '0');
  };

  return <Table
    className="stock-table"
    scroll={{ y: 700 }}
    columns={columns}
    dataSource={data.map(item => ({ ...item, key: item.code }))}
    pagination={false} />;
};

export default StockTable;
