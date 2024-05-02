import axios from 'axios';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 假設你使用 react-router-dom 進行導航
import accountIcon from '../assets/images/account.png'
import padlockIcon from '../assets/images/padlock.png'
import '../assets/css/login.css';
import { useUser } from '../userContext'; // 導入 useUser 鉤子

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const { setUser } = useUser(); // 獲取 setUser 函數
  const { login } = useUser();  // 使用 Context 中的 login 函数

  const handleSubmit = async (event) => {
    event.preventDefault(); // 防止表单默认提交行为

    // 确保所有字段都已填写
    if (!username || !password) {
      alert('請填寫所有欄位');
      return;
    }

    // 准备要发送的数据
    const loginData = {
      username,
      password,
    };

    try {
      // 使用 axios 发送数据
      const response = await axios.post('http://localhost:8000/login/', loginData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // 处理后端返回的数据，例如保存 token 或者重定向到其他页面
      console.log(response.data);
      if (response.data.status === 'success') {
        login(username);  // 使用 login 方法设置用户
        localStorage.setItem('token', response.data.token);
        console.log(response.data)
        console.log('登入成功');
        navigate('/')
      } else {
        // alert(response.data.message);
        alert('帳號或密碼錯誤，請再試一次')
      }
    } catch (error) {
      // 处理错误情况
      console.error('登入失敗:', error);
      alert('登入請求出錯');
    }
  };
  

  const executeRecaptcha = useCallback(() => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute('6LdmwcgpAAAAAChdggC5Z37c_r09EmUk1stanjTj', { action: 'login' })
          .then((token) => {
            console.log('reCAPTCHA token:', token);
          });
      });
    }
  }, []);

  

  return (
    <div className="kv w-100">
      <div className="User">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center h-100 pt-5">
            <div className="col-md-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}>
              <h2 className="fw-bold d-flex justify-content-center pt-4">USER LOGIN</h2>
              <h4 className="d-flex justify-content-center mb-5" style={{ fontSize: '16px' }}>
                Welcome to the website
              </h4>
              <form className="px-5" onSubmit={handleSubmit}>
                {/* 用戶名輸入 */}
                <div className="input-group flex-nowrap mb-4">
                  <span className="input-group-text" id="addon-wrapping">
                  <img
                    alt=""
                    className="img-fluid"
                    src={accountIcon}
                    style={{
                      width: '20px'
                    }}
                  />
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Username" 
                    aria-label="Username" 
                    aria-describedby="addon-wrapping" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                {/* 密碼輸入 */}
                <div className="input-group flex-nowrap mb-4">
                  <span className="input-group-text" id="addon-wrapping">
                  <img
                    alt=""
                    className="img-fluid"
                    src={padlockIcon}
                    style={{
                      width: '20px'
                    }}
                  />
                  </span>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Password" 
                    aria-label="Password" 
                    aria-describedby="addon-wrapping" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="text-end mb-3 d-flex">
                  <span>
                    <input
                      className="form-check-input text-end mx-2"
                      defaultValue=""
                      id="flexCheckDefault"
                      type="checkbox"
                    />
                  </span>
                  <span className="d-flex align-items-center pe-3 justify-content-center ">
                    remember
                  </span>
                  <div className="w-100">
                    <a
                      className="link align-items-center justify-content-center"
                      href="./forgotPassword"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>

                {/* 提交按鈕 */}
                <button type="submit" className="btn w-100 fw-bolder loginBtn mb-4">
                  登入
                </button>
                {/* 其他鏈接 */}
                <div className="text-center mb-3">
                  <span>沒有帳號?立即<a href="./signUp">免費申請！</a></span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
