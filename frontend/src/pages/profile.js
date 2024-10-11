import React, { useState, useEffect } from 'react';
import { Typography, Card, Avatar, Form, Input, Row, Col, Button, message, Upload } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { config } from "../config";

const BASE_URL = config.API_URL;
const { Title } = Typography;

const Profile = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    avatar: null // 用於存儲上傳的圖片
  });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);


  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      fetchUserProfile(username);
    }
  }, []);

  const fetchUserProfile = (username) => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE_URL}/profile/?username=${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.data.status === 'success') {
          setUser(response.data);
          setFormData({
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            email: response.data.email,
            password: '', // 密碼初始化為空
            avatar: response.data.avatar // 獲取用戶的圖片資料
          });
          const avatar = response.data.avatar;
          if (avatar) {
            localStorage.setItem('avatar', avatar);
          }
        } else {
          alert('User not found.');
        }
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('請上傳圖片文件！');
      return false;
    }
    setAvatarImage(file);
    setFormData(prevFormData => ({
      ...prevFormData,
      avatar: file
    }));
    return false;
  };

  const handleComplete = () => {
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();

    formDataToSend.append('username', user.username);
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }
    if (formData.avatar) {
      formDataToSend.append('avatar', formData.avatar);
    }

    axios.post(`${BASE_URL}/edit-profile/`, formDataToSend, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.data.status === 'success') {
          setUser({ ...user, ...formData });
          message.success('更新成功！');
          setIsEditing(false);
          window.location.reload();
        } else {
          message.error(response.data.message);
        }
      })
      .catch(error => {
        console.error('Error updating profile!', error);
        message.error('Error updating profile!');
      });
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Card style={{ width: 800, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'rgba(232, 180, 188, 0.65)' }}>
        <Row>
          <Col span={21} style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', marginBottom: '20px' }}>
            <Title level={2} style={{ color: '#BD4C7F' }}>個人資料</Title>
          </Col>
          <Col span={3}>
            <Button onClick={handleEdit} disabled={isEditing} className='button2 w-100' style={{
              background: 'linear-gradient(to right, #BD4C7F, #d38a95)',
              borderColor: 'initial', // 重設邊框色
              color: 'white'
            }}>
              編輯</Button>
          </Col>
        </Row>
        <Form layout="vertical" onFinish={handleComplete}>
          <Row gutter={16}>
            <Col span={9} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {avatarImage ? (
                <img
                  src={URL.createObjectURL(avatarImage)}
                  alt="avatar"
                  style={{ width: 120, height: 120, borderRadius: 8, marginBottom: 20 }}
                />
              ) : formData.avatar ? (
                <img
                  src={`${BASE_URL}${formData.avatar}`}
                  alt="avatar"
                  style={{ width: 120, height: 120, borderRadius: 8, marginBottom: 20 }}
                />
              ) : (
                <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 20 }} />
              )}
              <Title level={4} style={{ color: '#BD4C7F' }}>{user.username || 'No User'}</Title>

              {isEditing && (
                <Upload
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                >
                  <Button icon={<UploadOutlined />}>上傳圖片</Button>
                </Upload>
              )}
            </Col>
            <Col span={15}>
              <Form.Item label="帳號:">
                <Input value={user.username} readOnly />
              </Form.Item>
              <Form.Item label="姓:">
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </Form.Item>
              <Form.Item label="名:">
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </Form.Item>
              <Form.Item label="Email:">
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </Form.Item>
              {isEditing && (
                <Form.Item label="密碼:">
                  <Input.Password
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </Form.Item>
              )}
            </Col>
          </Row>
          <Form.Item
            style={{
              display: 'flex',           // 設置為 flex 來控制內部布局
              justifyContent: 'center'   // 讓按鈕置中
            }}
          >
            {isEditing && (
              <Button
                type="primary"
                htmlType="submit"
                className="button2"
                style={{
                  background: 'linear-gradient(to right, #BD4C7F, #d38a95)',
                  borderColor: 'initial',
                  color: 'white',
                  display: 'flex',           // 按鈕內部元素也是 flex
                  justifyContent: 'center'   // 按鈕內容置中
                }}
              >
                完成
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
