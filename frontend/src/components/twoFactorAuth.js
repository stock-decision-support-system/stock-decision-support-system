import React, { useState } from 'react';
import { Input, Button, Form, Checkbox } from 'antd';
import axios from 'axios';
import { config } from "../config";

const BASE_URL = config.API_URL;

const TwoFactorAuth = ({ email, onSuccess }) => {
  const [code, setCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false); // 記住此電腦的狀態

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/verify_code/`, {
        email,
        code,
        remember_device: rememberDevice, // 傳送記住此電腦的選項到後端
      });
      if (response.data.status === 'success') {
        alert('驗證成功');
        onSuccess();
      } else {
        alert('驗證碼不正確');
      }
    } catch (error) {
      console.error('驗證失敗:', error);
      alert('驗證請求出錯');
    }
  };

  return (
    <Form>
      <div className='d-flex justify-content-center'>
        <Form.Item className='w-50'>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="請輸入驗證碼" />
        </Form.Item>
      </div>
      <div className='d-flex justify-content-center'>
        <Form.Item>
          <Checkbox
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          >
            記住此電腦30天
          </Checkbox>
        </Form.Item>
      </div>
      <div className='d-flex justify-content-center'>
        <Button
          type="primary"
          onClick={handleVerify}
          className="w-50 fw-bolder button2 mb-4"
          style={{
            background: 'linear-gradient(to right, #BD4C7F, #d38a95)',
            borderColor: 'initial',
          }}
        >
          送出
        </Button>
      </div>
    </Form>
  );
};

export default TwoFactorAuth;
