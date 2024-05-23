import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from "../config";  

const BASE_URL = config.API_URL;

function ResetPasswordPage() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // 可以在這裡進行一些初始化操作，例如驗證token的有效性
    }, [uid, token]);

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const url = `${BASE_URL}/reset-password/${uid}/${token}/`;  // 確保這裡的端口和路徑正確
            const response = await axios.post(url, { password });
            if (response.data.status === 'success') {
                alert('密碼變更成功');
                navigate('/login');
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert('Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="kv w-100">
            <div className="User">
                <div className="container-fluid">
                    <div className="row justify-content-center align-items-center h-100 pt-5">
                        <div className="col-md-4" style={{ backgroundColor: 'rgba(232, 180, 188, 0.65)' }}>
                            <h2 className="fw-bold d-flex justify-content-center pt-4 mb-3">重設密碼</h2>
                            <form onSubmit={handleResetPassword}>
                                <div className='d-flex justify-content-center'>
                                    <div className='w-75' style={{ marginBottom: '25px' }}>
                                        <label>新密碼:</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{ display: 'block', width: '100%', padding: '8px', border: '1px', borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center'>
                                    <div className='mb-4 w-75'>
                                        <label>確認密碼:</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            style={{ display: 'block', width: '100%', padding: '8px', border: '1px', borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                                <div className='w-100 d-flex align-items-center justify-content-center'>
                                    <button type="submit" className='button2 mb-4 w-50'>
                                        確認更改
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
