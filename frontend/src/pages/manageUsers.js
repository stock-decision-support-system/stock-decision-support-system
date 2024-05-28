import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select } from 'antd';
import axios from 'axios';
import { config } from "../config";
import '../assets/css/manageUsers.css'; // 引入CSS文件
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap CSS

const { Option } = Select;
const BASE_URL = config.API_URL;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [isSuperuser, setIsSuperuser] = useState('');
  const [isStaff, setIsStaff] = useState('');
  const [isActive, setIsActive] = useState('');
  const [sortBy, setSortBy] = useState('date_joined');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${BASE_URL}/manage-users/`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: query,
          is_superuser: isSuperuser,
          is_staff: isStaff,
          is_active: isActive,
          sort_by: sortBy,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const columns = [
    {
      title: '使用者名稱',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '管理者',
      dataIndex: 'is_superuser',
      key: 'is_superuser',
      render: (text) => (text ? 'Yes' : 'No'),
    },
    {
      title: '員工',
      dataIndex: 'is_staff',
      key: 'is_staff',
      render: (text) => (text ? 'Yes' : 'No'),
    },
    {
      title: '是否啟用',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (text) => (text ? 'Yes' : 'No'),
    },
    {
      title: '註冊時間',
      dataIndex: 'date_joined',
      key: 'date_joined',
    },
  ];

  return (
    <div className="container mt-5">
      <h1 className="manage-users-header">管理使用者</h1>
      <div className="search-filters">
        <Input
          placeholder="Search by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginRight: 0 }}
        />
        
        {/* <Select
          placeholder="Sort by"
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          style={{ marginRight: 8 }}
        >
          <Option value="date_joined">Date Joined (Asc)</Option>
          <Option value="-date_joined">Date Joined (Desc)</Option>
        </Select> */}
        <Button type="primary" onClick={handleSearch} className='button2'>
          Search
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ position: ['bottomRight'] }} // 將分頁設置到左下角
      />
    </div>
  );
};

export default ManageUsers;
