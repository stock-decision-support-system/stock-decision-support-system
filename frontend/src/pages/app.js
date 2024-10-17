import React, { useState, useEffect } from 'react';
import '../assets/css/index.css'
import { Button, Card, Progress, Modal, Form, Input, DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import processImage1 from '../assets/images/processImage1.png';
import successImage1 from '../assets/images/successImage1.png';
import { BudgetRequest } from '../api/request/budgetRequest.js';
import indexpic from '../assets/images/indexpic.png'

const App = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [isData, setIsData] = useState(false);
  const token = localStorage.getItem('token');
  const [targetDay, setTargetDay] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // 使用 Ant Design 的 Form hook

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); // 清空表單
  };

  const handleClick = () => {
    navigate('#');
  };

  useEffect(() => {
    const fetchBudgetData = async () => {
      BudgetRequest.searchBudget()
        .then(response => {
          setData(response.data);
          if (response.data.length != 0) {
            setIsData(true);
            const targetDate = new Date(response.data.end_date);
            const today = new Date();
            const timeDifference = targetDate - today;
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
            setTargetDay(daysDifference);
          }
          if (response.data.is_successful) {
            setIsData(false);
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    };

    if (token) {
      fetchBudgetData();
    }
  }, [token]);



  const handleFormSubmit = async (values) => {
    // 提交表單前的數據處理
    if (values.start_date) {
      const startDate = new Date(values.start_date);
      values["start_date"] = startDate.toISOString().split('T')[0];  // 格式化為 YYYY-MM-DD
    }

    if (values.end_date) {
      const endDate = new Date(values.end_date);
      values["end_date"] = endDate.toISOString().split('T')[0];  // 格式化為 YYYY-MM-DD
    }

    BudgetRequest.addBudget(values)
      .then(response => {
        message.success(response.message);
        setIsModalVisible(false); // 正確關閉模態框
        form.resetFields(); // 提交後清空表單
        window.location.reload();
      })
      .catch((error) => {
        message.error(error.message);
      });
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
        {token ? (
          <>
            {isData ? (  // 檢查 isData 是否為 true
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
                    <span style={{ color: 'red' }}>{targetDay}</span>
                    <span> 天</span>
                  </h3>
                  <img
                    src={processImage1}
                    alt="進度圖示"
                    style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '20px' }} />
                  <Progress
                    percent={Math.min((data.current / data.target) * 100, 100)}
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
                    <span style={{ color: 'red' }}>${data.target - data.current}</span>
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
            ) : (
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
                  <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>歡迎回到<br />智投金紡</h2>
                  <img
                    src={successImage1}
                    alt="儲蓄圖示"
                    style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '20px' }} />
                  <p>現在就設定一個目標吧，不論大小<br />每一步都能帶您更接近夢想！</p>
                  <Button
                    className="button2"
                    style={{ width: '100%' }}
                    onClick={showModal}>
                    新增目標
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          <div
            className="image-content"
            style={{
              float: 'right', // 圖片會靠左，文字會在右邊流動
              margin: '1rem', // 四周留點空間
              width: '50%'
            }}>
            <img
              className="img-fluid"
              src={indexpic}
            />
          </div>
        )}
      </div>
      <Modal
        title="新增目標"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="目標"
            rules={[{ required: true, message: '請輸入目標名稱！' }]}
          >
            <Input placeholder="目標" />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="起始日"
            rules={[{ required: true, message: '請選擇起始日' }]}
          >
            <DatePicker format="YYYY-MM-DD" onChange={(date) => form.setFieldsValue({ 'start_date': date })} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="結束日"
            rules={[{ required: true, message: '請選擇結束日' }]}
          >
            <DatePicker format="YYYY-MM-DD" onChange={(date) => form.setFieldsValue({ 'end_date': date })} />
          </Form.Item>

          <Form.Item
            name="target"
            label="目標金額"
            rules={[{ required: true, message: '請輸入目標金額' }]}
          >
            <Input type="number" placeholder="輸入目標金額" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
