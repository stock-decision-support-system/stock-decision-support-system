import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 假設你使用 react-router-dom 進行導航
import AntdDrop from './antdDrop.js';
import iconImage from '../assets/images/logo192.png';
import '../assets/css/login.css';
import { Button, Dropdown, Space } from 'antd';
import headIcon from '../assets/images/head.png'
import axios from 'axios';
import { useUser } from '../userContext'; // 确保正确导入 useUser



const Navbar = () => {
  const [username, setUsername] = useState('');
  const { user, logout } = useUser();
  const navigate = useNavigate();  // 获取 navigate 函数

    useEffect(() => {
      // 如果 userContext 更新了 user，更新 local state
      if (user) {
        setUsername(user.username);
      } else {
        setUsername('');
      }
    }, [user])

    const handleLogout = () => {
      // 清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('username');
  
      // 更新用户状态
      setUsername(null);
  
      // 可以发送登出请求到服务器 (如果需要)
  
      // 重定向到登录页或主页
        axios.post('/logout/').then(() => {
        console.log('Logged out successfully');
      }).catch(error => {
        console.error('Logout failed', error);
      });

      navigate('/login')
    };
    
    const items = [
      { key: 'profile', label: <a href="/profile">個人資料</a> },
      { key: 'settings', label: <a href="/settings">帳戶設置</a> },
      { key: 'security', label: <a href="/security">安全中心</a> },
      { key: 'messages', label: <a href="/messages">消息中心</a> },
      { key: 'support', label: <a href="/support">幫助與支持</a> },
      { key: 'feedback', label: <a href="/feedback">提交反饋</a> },
      { key: 'logout', label: <a onClick={handleLogout}>登出</a> },
    ];
    
    
    return (
      
        <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#060A1B" }}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="/#">
            <img
              src={iconImage}
              alt=""
              className="img-fluid"
              style={{ width: 30 }}
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
                <a className="nav-link active me-3" aria-current="page" href="/test">
                  測路由
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active me-3" aria-current="page" href="#">
                  個股
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-3" href="#">
                  熱門成交股
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-3" href="#">
                  台灣五十股
                </a>
              </li>
              <li className="nav-item">
                <AntdDrop items={[
                    {
                        label: '1st menu item',
                        key: '1',
                    },
                    {
                        label: '2nd menu item',
                        key: '2',
                    },
                    {
                        label: '3rd menu item',
                        key: '3',
                    },
                ]} />
                </li>

                  <Dropdown
                    menu={{
                      items,
                    }}
                    placement="bottom"
                  >
                {username ? (
          // 如果用户已登录，显示用户名称
                <li className="nav-item">
                  <span className="nav-link ms-2">
                    <img
                    src={headIcon}
                    alt=""
                    className="img-fluid me-2"
                    style={{ width: 30 }}
                  />
                    {username}
                  </span>
                </li>
              ) : (
                // 如果用户未登录，显示登录和注册链接
                <>
                  <li className="nav-item">
                    <a
                      className="nav-link me-3 ms-2 text-center"
                      href="/login" // 使用路由路径，确保以 `/` 开头
                      id="btnb"
                      style={{ width: 100, height: 37 }}
                    >
                      LOG IN
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link me-3 text-center"
                      href="/signUp" // 使用路由路径，确保以 `/` 开头
                      id="btnb"
                      style={{ backgroundColor: "#424551", width: 200, height: 38 }}
                    >
                      CREATE ACCOUNT
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
