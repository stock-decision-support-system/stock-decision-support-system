import React, { useState, useEffect } from 'react';
import 'flatpickr/dist/flatpickr.min.css';
import { Button, Select, Form, message, Spin, Card, Input, DatePicker, Radio } from 'antd';
import AccountingSidebar from '../components/accountingSidebar';
import { AccountingRequest } from '../api/request/accountingRequest';

const { Option } = Select;

const AccountingForm = () => {
  const [form] = Form.useForm(); // 使用 Ant Design 表單
  const [totalAmount, setTotalAmount] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState('0');
  const [consumeType, setConsumeType] = useState('1');
  const [accountType, setAccountType] = useState('1');

  useEffect(() => {
    fetchTradeHistory();
    fetchTotalAmount();
  }, []);

  const fetchTradeHistory = async () => {
    setLoading(true);
    AccountingRequest.getAccountingList()
      .then(response => {
        const sortedHistory = response.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        setTradeHistory(sortedHistory);
      })
      .catch((error) => {
        message.error(error.message);
      });
    setLoading(false);
  };

  const fetchTotalAmount = async () => {
    setLoading(true);
    AccountingRequest.getFinancialSummary()
      .then(response => {
        setTotalAmount(response.data.total_assets);
      })
      .catch((error) => {
        message.error(error.message);
      });
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const newData = { ...values, assetType, consumeType, accountType }
    AccountingRequest.addAccountingData(newData)
      .then(response => {
        message.success(response.message);
        fetchTradeHistory(); // 提交後重新獲取交易歷史
        fetchTotalAmount(); // 更新總金額
        form.resetFields(); // 重置表單
      })
      .catch((error) => {
        message.error(error.message);
      });
    setLoading(false);
  };

  const onDateChange = (date, dateString) => {
    console.log(date, dateString);
  };

  const onRadioChange = (e) => {
    console.log(`radio checked:${e.target.value}`);
  };

  return (
    <div className="accounting-kv w-100" style={{ height: '80%', display: 'flex' }}>
      <AccountingSidebar totalAmount={totalAmount} selectedKey={'1'}/>
      <Card style={{ marginLeft: '2rem', width: '80%' }}>
        <Spin spinning={loading}>
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item name="transactionDate" label="交易日期" rules={[{ required: true, message: '請選擇日期' }]}>
              <DatePicker onChange={onDateChange} locale />
            </Form.Item>
            <Form.Item name="accountingName" label="消費名稱" rules={[{ required: true, message: '請簡述消費行為' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="amount" label="金額" rules={[{ required: true, message: '請輸入金額' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="assetType" label="交易行為">
              <Radio.Group
                onChange={(e) => {
                  setAssetType(e.target.value);
                }}
                defaultValue="0">
                <Radio.Button value="0">收入</Radio.Button>
                <Radio.Button value="1">支出</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="consumeType" label="消費類型">
              <Select
                onChange={(e) => {
                  setConsumeType(e.target.value);
                }}
                defaultValue="1">
                <Option value="1">現金</Option>
                <Option value="2">銀行</Option>
                <Option value="3">信用卡</Option>
              </Select>
            </Form.Item>
            <Button
              type="primary"
              className="ms-auto button2"
              style={{
                marginLeft: '10px'
              }}
            >
              選擇消費類型圖示
            </Button>
            <Form.Item name="accountType" label="支付方式">
              <Select
                onChange={(e) => {
                  setAccountType(e.target.value);
                }}
                defaultValue="1">
                <Option value="1">現金</Option>
              </Select>
            </Form.Item>
            <Form.Item name="content" label="備註">
              <Input.TextArea />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              送出
            </Button>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default AccountingForm;
