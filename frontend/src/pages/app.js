import React from 'react';
import backgroundImage from '../assets/images/background.png';

const App = () => {
  return (
    <div className="kv w-100" style={{}}>
      <div className="container-fluid d-flex" style={{ color: 'white' }}>
        <div className="col-7">
          <div className="text-start mt-5 pt-5 ms-5">
            <h1 style={{ fontSize: '60px', fontWeight: 'bolder' }}>投資無界限，財富薪起點<br />穩健理財，績效非凡</h1>
            <h6><span className="larger-text">智投金紡</span>您的財富管理專家。讓我們的專業團隊引導您，在投資的世界中航向成功。<br />全面的市場分析，客製的投資策略，為您開啟一段卓越的財富增值之旅。</h6>
          </div>
        </div>
        <div className="col-5"></div>
      </div>
      <button className="btn mt-4 ms-5 px-5 py-3" type="button" style={{ fontWeight: 'bolder', color: '#ffffff', background: 'linear-gradient(to right, #26abd9, #26adb9)' }}>
        GET STARTED
      </button>
    </div>
  );
}

export default App;
