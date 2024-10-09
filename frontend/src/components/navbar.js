import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Menu } from 'antd'; // 引入 Ant Design 的 Menu 和 Dropdown 組件
import iconImage from '../assets/images/logo.png';
import '../assets/css/navbar.css';
import headIcon from '../assets/images/account.png';
import axios from 'axios';
import { useUser } from '../userContext'; // 確保正確導入 useUser
import { config } from "../config";

const BASE_URL = config.API_URL;

const Navbar = () => {
  const username = localStorage.getItem('username');
  const { user, logout } = useUser();
  const [isSuperuser, setIsSuperuser] = useState(localStorage.getItem('is_superuser') === 'true');
  const [isStaff, setIsStaff] = useState(localStorage.getItem('is_staff') === 'true');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const avatar = localStorage.getItem('avatar');

  useEffect(() => {
    setIsSuperuser(localStorage.getItem('is_superuser') === 'true');
    setIsStaff(localStorage.getItem('is_staff') === 'true');
  }, [user]);

  const handleLogout = async () => {
    if (!token) {
      console.error('登出失敗：無法獲取 token');
      return;
    }

    try {
      await axios.get(`${BASE_URL}/logout/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('成功登出');
      logout();
    } catch (error) {
      console.error('登出失敗', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_superuser');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('is_login');
    localStorage.removeItem('avatar');
    navigate('/login');
  };

  const investmentMenu = (
    <Menu>
      <Menu.Item key="customInvestment" onClick={() => navigate('/investmentList')}>
        自訂投資組合
      </Menu.Item>
      <Menu.Item key="defaultInvestment" onClick={() => navigate('/defaultInvestment')}>
        預設投資組合
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <a href="/profile">個人資料</a>
      </Menu.Item>
      <Menu.Item key="changePassword">
        <a href="/changePassword">修改密碼</a>
      </Menu.Item>
      <Menu.Item key="bankForm">
        <a href="/bankForm">金流設定</a>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        登出
      </Menu.Item>
    </Menu>
  );

  const handleNavigation = (path) => {
    if (!username) {
      alert('請先登入以繼續訪問該頁面。');
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={{}}>
      <div className="container">
        <a className="navbar-brand d-flex" href="/#">
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
        <div className="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link me-5 justify-content-center d-flex align-items-center"
                aria-current="page"
                onClick={() => handleNavigation('/stockList')}
                style={{ height: '37px', cursor: 'pointer' }}
              >
                股市
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link me-5 justify-content-center d-flex align-items-center"
                aria-current="page"
                onClick={() => handleNavigation('/accounting')}
                style={{ height: '37px', cursor: 'pointer' }}
              >
                記帳
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link me-5 justify-content-center d-flex align-items-center"
                onClick={() => handleNavigation('/reports')}
                style={{ height: '37px', cursor: 'pointer' }}
              >
                報表
              </a>
            </li>
            <li className="nav-item">
              <Dropdown overlay={investmentMenu} placement="bottom">
                <a
                  className="nav-link justify-content-center d-flex align-items-center"
                  style={{ height: '37px', marginRight: '25px', cursor: 'pointer' }}
                >
                  投資績效
                </a>
              </Dropdown>
            </li>

            <Dropdown overlay={userMenu} placement="bottomRight">
              {token ? (
                <li className="nav-item">
                  <span className="nav-link ms-4 justify-content-center d-flex align-items-center no-underline" style={{ height: '37px' }}>
                    {avatar ? (
                      <img
                        src={`${BASE_URL}${avatar}`}
                        alt="avatar"
                        className="me-3"
                        style={{ width: 30 }}
                      />
                    ) : (
                      <img
                        src={headIcon}
                        alt=""
                        className="img-fluid me-3"
                        style={{ width: 30 }}
                      />
                    )}
                    {username}
                  </span>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <div className="justify-content-center d-flex align-items-center">
                      <a
                        className="nav-link me-3 justify-content-center d-flex align-items-center bbb no-underline"
                        href="/login"
                        id="btnb"
                        style={{ width: 100, height: 37 }}
                      >
                        登入
                      </a>
                    </div>
                  </li>
                  <li className="nav-item">
                    <div className="justify-content-center d-flex align-items-center">
                      <a
                        className="nav-link justify-content-center d-flex align-items-center ms-3 aaa no-underline"
                        href="/signUp"
                        id="btnb"
                        style={{ backgroundColor: "#E8B4BC", width: 200, height: 38 }}
                      >
                        建立帳號
                      </a>
                    </div>
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
