import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 假設你使用 react-router-dom 進行導航
import 'bootstrap/dist/css/bootstrap.min.css'; // 假設你通過 npm 或 yarn 安裝了 bootstrap
import '../assets/css/signUp.css' // SignUp.css 的路徑
import axios from 'axios'

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 進行表單驗證
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('請填寫所有必填字段');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('密碼和確認密碼不一致');
      return;
    }

    // 準備要發送的數據
    const dataToSend = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      // 使用 axios 發送數據到註冊 API
      const response = await axios.post('http://localhost:8000/register/', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // 處裡回覆
      if (response.data.status === 'success') {
        alert('註冊成功！請返回登入頁面重新登入');
        navigate('/login'); // 導到登入畫面
      } else {
        alert('註冊失敗：' + response.data.message);
      }
    } catch (error) {
      console.error('註冊請求出錯:', error);
      alert('已有相同的使用者名稱或電子信箱，請再試一次');
    }
  };

  return (
    <div className="kv w-100">
      {/*...導航欄組件...*/}
      <div className="register">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center h-100 pt-5">
            <div className="col-12 col-sm-8 col-md-6 col-lg-4 p-5 rounded custom-col-lg" style={{ backgroundColor: 'rgba(232, 180, 188, 0.65)' }}>
              <h2 className="fw-bold text-center">註冊</h2>
              <h4 className="text-center mb-4">歡迎來到網站</h4>
              <form className="px-5" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group flex-nowrap mb-4">
                      <input type="text" className="form-control" placeholder="FirstName" aria-label="FirstName" value={formData.firstName} onChange={handleChange} name="firstName" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group flex-nowrap mb-4">
                      <input type="text" className="form-control" placeholder="LastName" aria-label="LastName" value={formData.lastName} onChange={handleChange} name="lastName" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group flex-nowrap mb-4">
                      <input type="text" className="form-control" placeholder="Username" aria-label="Username" value={formData.username} onChange={handleChange} name="username" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group flex-nowrap mb-4">
                      <input type="email" className="form-control" placeholder="E-mail" aria-label="E-mail" value={formData.email} onChange={handleChange} name="email" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group flex-nowrap mb-4">
                      <input type="password" id="password" className="form-control" placeholder="Password" aria-label="Password" value={formData.password} onChange={handleChange} name="password" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group flex-nowrap mb-4">
                      <input type="password" id="confirm_password" className="form-control" placeholder="Repeat password" aria-label="Repeat password" value={formData.confirmPassword} onChange={handleChange} name="confirmPassword" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="button2 w-100 fw-bolder login mb-4">立即註冊</button>
                <button type="button" className="button2 fw-bolder w-100 mb-1" onClick={() => navigate('/login')}>返回上頁</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
