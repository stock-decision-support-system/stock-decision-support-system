import React from 'react';
import '../assets/css/index.css'
import { Button, Card, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import processImage1 from '../assets/images/processImage1.png';

const App = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('#');
  };

  return (
    <div className="kv w-100 d-flex justify-content-center" style={{ height: '100vh' }}>
      <div className="d-flex" style={{ width: '60%', paddingTop: '8%', color: '#C25B8B' }}>
        <div className="text-content" style={{ flex: 5, marginRight: '2rem' }}> {/* flex: 1 代表占據 1/3 */}
          <div className="text-start">
            <h1>智投金紡</h1>
            <h6 className="mb-3">全面的財務管理，個性化的記帳策略</h6>
            <h6>為您開啟一段輕鬆掌控財務的旅程</h6>
          </div>
          <button className="mt-4 px-5 py-3 button" type="button" onClick={handleClick}>
            使用教學
          </button>
        </div>
        <Card
          style={{
            flex: 4,  // 占據 2/3 的寬度
            textAlign: 'center',
            height: '60%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1rem',
          }}
        >
          <div style={{ margin: '1rem' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>歡迎回來</h2>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>
              <span>距離目標還有 </span>
              <span style={{ color: 'red' }}>{1}</span>
              <span> 天</span>
            </h3>
            <img
              src={processImage1}
              alt="進度圖示"
              style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '20px' }} />
            <Progress
              percent={Math.min((56 / 65) * 100, 100)}
              strokeColor={{
                from: '#108ee9',
                to: '#87d068',
              }}
              trailColor="#f0f0f0"
              style={{ marginTop: '10px' }}
              format={(percent) => `${percent.toFixed(2)}%`}  // 顯示小數點後兩位
            />
            <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
              <span>還差 </span>
              <span style={{ color: 'red' }}>{9}</span>
              <span> 金額</span>
            </h2>
            <p>不要放棄，加油！你一定可以達成目標！</p>
            <Button
              className="button2"
              style={{ width: '100%' }}
              onClick={() => navigate('/accounting')}>
              前往記帳
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
