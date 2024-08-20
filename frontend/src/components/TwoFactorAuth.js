import React, { useState } from 'react';
import { Input, Button, Form } from 'antd';
import axios from 'axios';
import { config } from "../config"; 

const BASE_URL = config.API_URL;

const TwoFactorAuth = ({ email, onSuccess }) => {
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/verify_code/`, { email, code });
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
        <Input value={code} onChange={(e) => setCode(e.target.value)} />
      </Form.Item>
      </div>
      <div className='d-flex justify-content-center'>
      <Button type="primary" onClick={handleVerify} className="w-50 fw-bolder button2 mb-4" 
                  style={{
                    background: 'linear-gradient(to right, #BD4C7F, #d38a95)',
                    borderColor: 'initial', // 重設邊框色
                  }}>
        送出
      </Button>
      </div>
    </Form>
  );
};

export default TwoFactorAuth;
