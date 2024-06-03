import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import '../assets/css/investmentList.css';

const columns = [
  {
    title: '投資組合名稱',
    dataIndex: 'name',
    key: 'name',
    render: text => <strong>{text}</strong>,
  },
  {
    title: '總回報率 (%)',
    dataIndex: 'performance',
    key: 'performance',
    render: text => <span style={{ color: text >= 0 ? 'red' : 'green' }}>{text}%</span>,
  },
  {
    title: '當日增減 (%)',
    dataIndex: 'dayChange',
    key: 'dayChange',
    render: text => <span style={{ color: text.startsWith('+') ? 'red' : 'green' }}>{text}</span>,
  },
  {
    title: '市值',
    dataIndex: 'marketValue',
    key: 'marketValue',
    render: text => `NT$ ${text.toLocaleString()}`,
  },
  {
    title: '年化收益率 (%)',
    dataIndex: 'annualReturn',
    key: 'annualReturn',
    render: text => <span style={{ color: text >= 0 ? 'red' : 'green' }}>{text}%</span>,
  },
];

const data = [
  { key: '1', name: '台灣前50大公司', performance: 5.2, dayChange: '+0.8%', marketValue: 1236830, annualReturn: '6.5', path: '/investmentPerformance' },
  { key: '2', name: '人工智慧概念股', performance: -3.4, dayChange: '-1.2%', marketValue: 394250, annualReturn: '-3.4', path: '/investmentPerformance/aiConceptStocks' },
  // 更多数据...
];

const InvestmentList = () => {
  const navigate = useNavigate();

  return (
    <div className='container'>
      <h1 className="title">投資組合總覽</h1>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false} 
        onRow={(record) => ({
          onClick: () => { navigate(record.path); }
        })}
        bordered
        rowClassName={(record) => record.performance >= 0 ? 'positive-row' : 'negative-row'}
      />
    </div>
  );
};

export default InvestmentList;
