import React from 'react';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PieChartOutlined,
  ContainerOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Menu, Statistic, Card, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../assets/css/accountingSidebar.css';  // 將動畫相關的 CSS 分離至外部檔案中

const AccountingSidebar = ({ totalAmount, netAmount, selectedKey, isVisible, toggle }) => {
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
    <>
      <div className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
        <Card style={{ marginBottom: '16px', minHeight: '90px', borderRadius: '8px' }}>
          <Row gutter={16} style={{ flexDirection: 'column' }}>
            <Col span={12}>
              <Statistic
                title="您的總資產"
                value={totalAmount}
                precision={2}
                valueStyle={{ fontSize: '1.5rem' }} // 調整字體大小
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="您的淨資產"
                value={netAmount}
                precision={2}
                valueStyle={{ fontSize: '1.5rem' }} // 調整字體大小
              />
            </Col>
          </Row>
        </Card>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            borderRadius: '8px',
            height: '80%', // 調整為 Menu 佔滿剩餘空間，根據卡片的高度計算
            overflow: 'auto', // 加入滾動條以應對長菜單
          }}
          items={items}
          onClick={({ item }) => handleClick(item.props)}
        />
      </div>
      <Button onClick={toggle} className={`menuButton ${isVisible ? 'visible' : 'hidden'}`}>
        {isVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
      </Button>
    </>
  );
};

export default AccountingSidebar;
