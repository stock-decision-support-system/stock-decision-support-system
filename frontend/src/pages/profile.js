import React, { useState, useEffect } from 'react';
import { Typography, Card, Avatar, Form, Input, Row, Col, Button, message } from 'antd';
import axios from 'axios';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Profile = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      fetchUserProfile(username);
    }
  }, []);

  const fetchUserProfile = (username) => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8000/profile/?username=${username}`, {
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
          email: response.data.email
        });
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

  const handleComplete = () => {
    const token = localStorage.getItem('token');
    axios.post(`http://localhost:8000/edit-profile/`, {
      username: user.username,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.data.status === 'success') {
        setUser({...user, ...formData});
        message.success('更新成功！');
        setIsEditing(false);
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
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
      <Card style={{ width: 800, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'rgba(232, 180, 188, 0.65)'}}>
        <Row>
          <Col span={21} style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', marginBottom: '20px'}}>
            <Title level={2} style={{ color: '#BD4C7F' }}>個人資料</Title>
          </Col>
          <Col span={3}>
            <Button onClick={handleEdit} disabled={isEditing} className='button2 w-100'>編輯</Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={9} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: 20 }} />
            <Title level={4} style={{ color: '#BD4C7F' }}>{user.username || 'No User'}</Title>
          </Col>
          <Col span={15}>
            <Form layout="vertical">
              <Form.Item label="Username:">
                <Input value={user.username} readOnly />
              </Form.Item>
              <Form.Item label="First Name:">
                <Input name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={!isEditing} />
              </Form.Item>
              <Form.Item label="Last Name:">
                <Input name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={!isEditing} />
              </Form.Item>
              <Form.Item label="Email:">
                <Input name="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} />
              </Form.Item>
            </Form>
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: '20px' }}>
          <Col span={2}>
            {isEditing && (
              <Button onClick={handleComplete} className='button2'>完成</Button>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile;
