import React, { useState, useCallback } from 'react';
import accountIcon from '../assets/images/account.png'
import padlockIcon from '../assets/images/padlock.png'
import '../assets/css/login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  

  const handleSubmit = (event) => {
    event.preventDefault(); // 防止表單默認提交行為

    // 確保所有字段都已填寫
    if (!username || !password) {
      alert('請填寫所有欄位');
      return;
    }

    // 在這裡處理表單提交，例如發送到伺服器
    console.log('Username:', username);
    console.log('Password:', password);
    // 發送表單到你的伺服器...
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
                      style={{}}
                      type="checkbox"
                    />
                  </span>
                  <span className="d-flex align-items-center pe-3 justify-content-center ">
                    remember
                  </span>
                  <div className="w-100">
                    <a
                      className="link align-items-center justify-content-center"
                      href="./forget_password.html"
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
                  <span>沒有帳號?立即<a href="./signUp.html">免費申請！</a></span>
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
