import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Typography } from 'antd';
import ForgotPasswordIcon from '../assets/images/forgot-password.png'; // 確保這個路徑是正確的
import axios from 'axios';

const { Title } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (values) => {
    console.log('Received values of form: ', values);
    const email = values.email; // 從表單數據中獲取 email
    // 使用 Axios 發送 POST 請求
    axios.post('http://localhost:8000/password-reset/', { email })
      .then(response => {
        if (response.data.status === 'success') {
          alert('重設鏈接已發送至您的郵箱');
          navigate('/login'); // 導航回登錄頁面或其他頁面
        } else {
          alert(response.data.message);
        }
      })
      .catch(error => {
        alert('發送郵件過程中出現問題，請稍後再試');
        console.error('Error sending password reset email:', error);
      });
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center h-100 mt-4">
        <div className="col-md-4 mt-5" style={{ backgroundColor: 'rgba(232, 180, 188, 0.65)', padding: '50px', color: '#BD4C7F' }}>
          <Form onFinish={handleSubmit}>
            <Row justify="center" style={{ marginBottom: '30px' }}>
              <Col>
                <img
                  src={ForgotPasswordIcon}
                  alt="忘記密碼圖標"
                  style={{ width: '100px', height: '100px', display: 'block', margin: '0 25px' }}
                />
              </Col>
            </Row>
            <Row justify="center" style={{ marginBottom: '2px' }}>
              <Col>
                <Title level={2} style={{ color: '#BD4C7F', textAlign: 'center' }}>忘記密碼</Title>
              </Col>
            </Row>
            <Row justify="center" style={{ marginBottom: '10px' }}>
              <Col>
                <p style={{ textAlign: 'center' }}>
                  請輸入您的電子郵件地址以便接收重設密碼的鏈接。
                </p>
              </Col>
            </Row>
            <Form.Item
              name="email"
              rules={[{ required: true, message: '請輸入您的電子郵件地址!' }]}
            >
              <Input
                type="email"
                placeholder="輸入您的電子郵件"
              />
            </Form.Item>
            <Row justify="center">
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-100 d-flex align-items-center fw-bolder loginBtn mt-3 button2"
                  style={{
                    background: 'linear-gradient(to right, #BD4C7F, #d38a95)',
                    borderColor: 'initial', // 重設邊框色
                  }}
                >
                  <span>發送重設郵件</span>
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
