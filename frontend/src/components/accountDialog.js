import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Form, message } from 'antd';
import Picker from "emoji-picker-react";
import { AccountTypeRequest } from '../api/request/accountTypeRequest.js';

const AccountDialog = ({ onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [icon, setIcon] = useState("");
  const [form] = Form.useForm(); // 使用 Ant Design 的 Form hook

  useEffect(() => {
    showModal();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // 驗證表單並獲取表單值
      if (!values.name.trim()) {
        alert("請輸入類別名稱！");
        return;
      }
      AccountTypeRequest.addAccountType({ ...values, icon }) // 傳遞表單的值和 icon
        .then(response => {
          message.success(response.message);
          onClose();
          setIsModalOpen(false);
        })
        .catch((error) => {
          message.error(error.message);
        });
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onClose();
  };

  return (
    <Modal
      title="新增消費帳戶"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          確定
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Form form={form} layout="vertical" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Input
            style={{
              border: 'none', // 去除邊框
              boxShadow: 'none', // 去除陰影
              fontSize: '3rem', // 字體大小設置為三倍
              marginBottom: '16px', // 調整底部邊距
              textAlign: 'center'
            }}
            value={icon}
            onChange={(e) => e.target.value}
            onFocus={(e) => e.target.style.border = 'none'} // 確保聚焦時無邊框
            readOnly
          />
          <Form.Item
            name="account_name"
            style={{ width: '90%' }}
            rules={[{ required: true, message: '請輸入帳戶名稱！' }]} // 驗證規則
          >
            <Input
              placeholder="輸入帳戶名稱"
              style={{ textAlign: 'center' }} // 文字置中
            />
          </Form.Item>
        </Form>
        <Picker onEmojiClick={(emojiObject) => setIcon(emojiObject.emoji)} style={{ width: '90%' }} />
      </div>
    </Modal>
  );
};

export default AccountDialog;
