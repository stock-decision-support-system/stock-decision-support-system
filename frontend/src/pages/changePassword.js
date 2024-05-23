import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import {useNavigate } from 'react-router-dom';
import { config } from "../config";  

const BASE_URL = config.API_URL;

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 從 localStorage 中獲取 JWT token
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/change-password/`,
        {
          old_password: values.oldPassword,
          new_password: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      if (response.data.status === "success") {
        message.success(response.data.message);
        navigate('/#')
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("更改密碼時出錯");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="kv w-100">
      <div className="User">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center h-100 pt-5">
            <div className="col-md-4" style={{ backgroundColor: 'rgba(232, 180, 188, 0.65)' }}>
              <h2 className="fw-bold d-flex justify-content-center pt-4">USER LOGIN</h2>
              <h4 className="d-flex justify-content-center mb-4" style={{ fontSize: '16px' }}>
                Welcome to the website
              </h4>
              <div className="d-flex justify-content-center">
      <Form
        name="change_password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        justify="center"
        className="w-75"
      >
        <Form.Item
          label="舊密碼"
          name="oldPassword"
          rules={[{ required: true, message: "請輸入舊密碼" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="新密碼"
          name="newPassword"
          rules={[{ required: true, message: "請輸入新密碼" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block className="button2"  style={{
                    background: 'linear-gradient(to right, #BD4C7F, #d38a95)',
                    borderColor: 'initial', // 重設邊框色
                  }} >
            更改密碼
          </Button>
        </Form.Item>
      </Form>
      </div>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;