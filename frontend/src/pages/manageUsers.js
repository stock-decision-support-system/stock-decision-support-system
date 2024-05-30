import React, { useState, useEffect } from 'react';
import { ConfigProvider, Table, Input, Button, Select, Modal, Form, Switch } from 'antd';
import axios from 'axios';
import { config } from "../config";
import '../assets/css/manageUsers.css'; // 引入CSS文件
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入Bootstrap CSS
import zhTW from 'antd/es/locale/zh_TW';

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // 在組件加載時設置 body 的 overflow 為 auto
    document.body.style.overflow = 'auto';

    // 在組件卸載時重置 body 的 overflow
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

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

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      is_superuser: record.is_superuser,
      is_staff: record.is_staff,
      is_active: record.is_active,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/edit-user/?username=${editingUser.username}`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
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
      sorter: {
        compare: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
      },
      key: 'date_joined',
      render: (text) => {
        const date = new Date(text);
        const formattedDate = date.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        return formattedDate;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Button type="" onClick={() => handleEdit(record)}>
          編輯
        </Button>
      ),
    },
  ];

  return (
    <ConfigProvider
      locale={{
        ...zhTW,
        Table: {
          ...zhTW.Table,
          sortTitle: '點擊進行排序',
        },
      }}
    >
      <div className="container mt-5">
        <h1 className="manage-users-header">管理使用者</h1>
        <div className="search-filters">
          <Input
            placeholder="Search by username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginRight: 0 }}
          />
          <Button type="primary" onClick={handleSearch} className='button2'>
            Search
          </Button>
        </div>
        <div className="table-container">
          <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{ position: ['bottomRight'] }} // 將分頁設置到左下角
          />
        </div>
        <Modal
          title="編輯用戶"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleUpdate}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="is_superuser"
              label="管理者"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="is_staff"
              label="員工"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="is_active"
              label="是否啟用"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default ManageUsers;
