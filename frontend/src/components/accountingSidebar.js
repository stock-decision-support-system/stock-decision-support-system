import React from 'react';
import {
  PieChartOutlined,
  ContainerOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Menu, Statistic, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const AccountingSidebar = ({ totalAmount, selectedKey }) => {
  const navigate = useNavigate();
  const items = [
    { key: '1', icon: <PieChartOutlined />, label: '記帳', link: '/accounting' },
    {
      key: 'sub1',
      label: '報表查詢',
      icon: <MailOutlined />,
      children: [
        { key: '2', label: '總資產', link: '/generalreport' },
        { key: '3', label: '當日資產' },
      ],
    },
    { key: '4', icon: <ContainerOutlined />, label: '交易查詢', link: '/tradeHistory' },
  ];

  const handleClick = (item) => {
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div style={{ width: 256, marginLeft: '16px' }}>
      <Card style={{ marginBottom: '16px', minHeight: '64px' }}>
        <Statistic title="您的總資產" value={totalAmount} precision={2} />
      </Card>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ width: 256, height: '85%' }}
        items={items}
        onClick={({ item }) => handleClick(item.props)}
      />
    </div>
  );
};

export default AccountingSidebar;
