import React from 'react';
import {
  PieChartOutlined,
  ContainerOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Menu, Statistic, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const AccountingSidebar = ({ totalAmount, netAmount, selectedKey }) => {
  const navigate = useNavigate();
  const items = [
    { key: '1', icon: <PieChartOutlined />, label: '記帳', link: '/accounting' },
    { key: '2', icon: <ContainerOutlined />, label: '交易查詢', link: '/tradeHistory' },
    {
      key: 'sub1',
      label: '報表查詢',
      icon: <MailOutlined />,
      children: [
        { key: '3', label: '資產變動', link: '/generalreport' },
        { key: '4', label: '帳戶金額變動', link: '/balancereport' },
        { key: '5', label: '消費習慣分析', link: '/consumereport' },
      ],
    },
  ];

  const handleClick = (item) => {
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div style={{ width: 256, marginLeft: '16px', borderRadius: '8px' }}>
      <Card style={{ marginBottom: '16px', minHeight: '64px', borderRadius: '8px' }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col span={12}>
            <Statistic title="您的總資產" value={totalAmount} precision={2} />
          </Col>
          <Col span={12}>
            <Statistic title="您的淨資產" value={netAmount} precision={2} />
          </Col>
        </Row>
      </Card>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          borderRadius: '8px',
          height: 'calc(90% - 56px)', // 調整為 Menu 佔滿剩餘空間，根據卡片的高度計算
          overflow: 'auto', // 加入滾動條以應對長菜單
        }}
        items={items}
        onClick={({ item }) => handleClick(item.props)}
      />
    </div>
  );
};

export default AccountingSidebar;
