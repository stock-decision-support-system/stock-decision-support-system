import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Input, Button } from 'antd';
import ForgotPasswordIcon from '../assets/images/forgot-password.png'; // 確保這個路徑是正確的

const { Title } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // 簡單的電子郵件格式驗證
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      alert('請輸入有效的電子郵件地址');
      return;
    }

    // 提交邏輯...
    console.log('電子郵件:', email);
    alert('重設鏈接已發送至您的郵箱');
    navigate('/login'); // 導航回登錄頁面或其他頁面
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-md-4 mt-5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', padding: '50px' }}>
          <form onSubmit={handleSubmit}>
            <Row justify="center" style={{ marginBottom: '30px' }}>
              <Col>
                <img
                  src={ForgotPasswordIcon}
                  alt="Forgot Password Icon"
                  style={{ width: '100px', height: '100px', display: 'block', margin: '0 auto 30px' }}
                />
              </Col>
            </Row>
            <Row justify="center" style={{ marginBottom: '2px' }}>
              <Col>
                <Title level={2} style={{ color: 'white', textAlign: 'center' }}>忘記密碼</Title>
              </Col>
            </Row>
            <Row justify="center" style={{ marginBottom: '10px' }}>
              <Col>
                <p style={{ color: 'white', textAlign: 'center' }}>
                  請輸入您的電子郵件地址以便接收重設密碼的鏈接。
                </p>
              </Col>
            </Row>
            <Row justify="center" style={{ marginBottom: '20px' }}>
              <Col span={24}>
                <Input
                  type="email"
                  placeholder="輸入您的電子郵件"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
            <Row justify="center">
              <Col>
                <Button type="submit" className="btn w-100 d-flex align-items-center fw-bolder loginBtn mt-3" >
                  <span>發送重設郵件</span>
                </Button>
              </Col>
            </Row>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
