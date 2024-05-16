import React from 'react';
import '../assets/css/index.css'
import indexpic from '../assets/images/indexpic.png'
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('#');
  };

  return (
    <div className="kv w-100 container">
      <div className="d-flex justify-content-between" style={{ paddingTop: '8%', color: '#C25B8B' }}>
        <div className="text-content">
          <div className="text-start">
            <h1>
            智投金紡
            </h1>
            <h6 className='mb-3'>
            全面的財務管理，個性化的記帳策略
            </h6>
            <h6>
            為您開啟一段輕鬆掌控財務的旅程
            </h6>
          </div>
          <button className="mt-4 px-5 py-3 button" type="button"  onClick={handleClick}>
            GET STARTED
          </button>
        </div>
        <div className="image-content">
          <img
            alt="描述圖片內容"
            className="img-fluid"
            src={indexpic}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
