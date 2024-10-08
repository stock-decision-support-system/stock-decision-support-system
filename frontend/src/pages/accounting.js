import React, { useState, useEffect } from 'react';
import { Button, Select, Form, message, Spin, Card, Input, DatePicker, Radio, Row, Col } from 'antd';
import AccountingSidebar from '../components/accountingSidebar';
import { AccountingRequest } from '../api/request/accountingRequest';
import { AccountTypeRequest } from '../api/request/accountTypeRequest';
import { CategoryRequest } from '../api/request/categoryRequest';
import CategoryDialog from '../components/categoryDialog';
import AccountDialog from '../components/accountDialog';

const { Option } = Select;

const AccountingForm = () => {
  const [form] = Form.useForm(); // 使用 Ant Design 表單
  const [totalAmount, setTotalAmount] = useState(0)
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState('0');
  const [consumeType, setConsumeType] = useState('1');
  const [consumeTypes, setConsumeTypes] = useState([]);
  const [accountType, setAccountType] = useState('1');
  const [accountTypes, setAccountTypes] = useState([]);
  const [isConsumeDialogVisible, setIsConsumeDialogVisible] = useState(false);
  const [isAccountDialogVisible, setIsAccountDialogVisible] = useState(false);

  useEffect(() => {
    fetchTradeHistory();
    fetchTotalAmount();
    fetchConsumeTypes();
    fetchAccountTypes();
  }, []);

  const fetchConsumeTypes = async () => {
    try {
      const response = await CategoryRequest.searchConsumeType(); // 使用你設計的 API 方法
      setConsumeTypes(response.data); // 假設返回的資料在 response.data
    } catch (error) {
      message.error('獲取消費類型資料失敗');
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const response = await AccountTypeRequest.searchAccountType(); // 使用你設計的 API 方法
      setAccountTypes(response.data); // 假設返回的資料在 response.data
    } catch (error) {
      message.error('獲取消費帳戶資料失敗');
    }
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

  const handleSubmit = async (values) => {
    setLoading(true);
    const newData = { ...values, assetType, consumeType, accountType }
    AccountingRequest.addAccountingData(newData)
      .then(response => {
        message.success(response.message);
        fetchTradeHistory(); // 提交後重新獲取交易歷史
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

  const handleConsumeClick = () => {
    setIsConsumeDialogVisible(true);
  };

  const handleAccountClick = () => {
    setIsAccountDialogVisible(true);
  };

  const handleConsumeClose = () => {
    setIsConsumeDialogVisible(false);
  };

  const handleAccountClose = () => {
    setIsAccountDialogVisible(false);
  };

  return (
    <div className="accounting-kv w-100" style={{ height: '80%', display: 'flex' }}>
      <AccountingSidebar totalAmount={totalAmount} selectedKey={'1'} />
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
                }}>
                <Radio.Button value="0">收入</Radio.Button>
                <Radio.Button value="1">支出</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="consumeType" label="消費類型">
                  <Select
                    onChange={(value) => setConsumeType(value)}
                    style={{ width: '100%' }} // 確保 Select 佔滿 Col 寬度
                  >
                    {consumeTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button
                  type="default"
                  className="ms-auto button1"
                  style={{
                    marginLeft: '10px',
                    width: '100%' // 確保按鈕佔滿 Col 寬度
                  }}
                  onClick={handleConsumeClick}
                >
                  新增類別
                </Button>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="accountType" label="消費帳戶">
                  <Select
                    onChange={(value) => setAccountType(value)}
                    style={{ width: '100%' }} // 確保 Select 佔滿 Col 寬度
                  >
                    {accountTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.icon} {type.account_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button
                  type="default"
                  className="ms-auto button1"
                  style={{
                    marginLeft: '10px',
                    width: '100%' // 確保按鈕佔滿 Col 寬度
                  }}
                  onClick={handleAccountClick}
                >
                  新增帳戶
                </Button>
              </Col>
            </Row>
            <Form.Item name="content" label="備註">
              <Input.TextArea />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              送出
            </Button>
          </Form>
        </Spin>
      </Card>
      {isConsumeDialogVisible && (
        <CategoryDialog
          onClose={handleConsumeClose}
        />
      )}
      {isAccountDialogVisible && (
        <AccountDialog
          onClose={handleAccountClose}
        />
      )}
    </div>
  );
};

export default AccountingForm;
