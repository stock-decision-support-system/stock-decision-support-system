import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 假設你使用 react-router-dom 進行導航
import AntdDrop from './antdDrop.js';
import iconImage from '../assets/images/logo.png';
import '../assets/css/navbar.css';
import { Button, Dropdown, Space } from 'antd';
import headIcon from '../assets/images/account.png'
import axios from 'axios';
import { useUser } from '../userContext'; // 确保正确导入 useUser



const Navbar = () => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const { user, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post('/logout/');
      console.log('成功登出');
    } catch (error) {
      console.error('登出失敗', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    navigate('/login');
  };

  const items = [
    { key: 'profile', label: <a href="/profile">個人資料</a> },
    { key: 'changePassword', label: <a href="/changePassword">修改密碼</a> },
    { key: 'support', label: <a href="/support">幫助與支持</a> },
    { key: 'feedback', label: <a href="/feedback">提交反饋</a> },
    { key: 'logout', label: <a onClick={handleLogout}>登出</a> }
  ];

  return (

    <nav
      className="navbar navbar-expand-lg fixed-top"
      style={{}}
    >
      <div className="container">
        <a className="navbar-brand d-flex " href="/#">
          <img
            src={iconImage}
            alt=""
            className="img-fluid justify-content-center align-items-center"
            style={{ width: 150, marginTop: '10px' }}
          />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNavDropdown"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link me-5  justify-content-center d-flex align-items-center" aria-current="page" href="/test" style={{ height: '37px' }}>
                測路由
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link me-5  justify-content-center d-flex align-items-center" aria-current="page" href="#" style={{ height: '37px' }}>
                記帳
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link me-5  justify-content-center d-flex align-items-center" href="#" style={{ height: '37px' }}>
                報表
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link justify-content-center d-flex align-items-center" href="#" style={{ height: '37px', marginRight: '25px' }}>
                投資績效
              </a>
            </li>

            <Dropdown
              menu={{
                items,
              }}
              placement="bottom"
            >
              {username ? (
                // 如果用戶已登入，顯示用戶名稱
                <li className="nav-item">
                  <span className="nav-link ms-4 justify-content-center d-flex align-items-center" style={{ height: '37px' }}>
                    <img
                      src={headIcon}
                      alt=""
                      className="img-fluid me-3"
                      style={{ width: 30 }}
                    />
                    {username}
                  </span>
                </li>
              ) : (
                // 如果用戶未登入，顯示登入和註冊連結
                <>
                  <li className="nav-item">
                    <a
                      className="nav-link me-3 justify-content-center d-flex align-items-center bbb"
                      href="/login" // 使用路由路徑，確保已 '/' 開頭
                      id="btnb"
                      style={{ width: 100, height: 37 }}
                    >
                      登入
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link  justify-content-center d-flex align-items-center ms-3 aaa"
                      href="/signUp" // 使用路由路徑，確保已 '/' 開頭
                      id="btnb"
                      style={{ backgroundColor: "#E8B4BC", width: 200, height: 38 }}
                    >
                      建立帳號
                    </a>
                  </li>
                </>
              )}
            </Dropdown>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
