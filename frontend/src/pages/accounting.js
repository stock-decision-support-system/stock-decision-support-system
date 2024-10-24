import React, { useState, useEffect } from 'react';
import { Button, Select, Form, message, Spin, Card, Input, DatePicker, Radio, Row, Col } from 'antd';
import AccountingSidebar from '../components/accountingSidebar';
import { AccountingRequest } from '../api/request/accountingRequest';
import { AccountTypeRequest } from '../api/request/accountTypeRequest';
import { CategoryRequest } from '../api/request/categoryRequest';
import CategoryDialog from '../components/categoryDialog';
import AccountDialog from '../components/accountDialog';
import '../assets/css/accounting.css'

const { Option } = Select;

const AccountingForm = () => {
  const [form] = Form.useForm(); // 使用 Ant Design 表單
  const [totalAmount, setTotalAmount] = useState(0)
  const [netAmount, setNetAmount] = useState(0)
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState('0');
  const [consumeType, setConsumeType] = useState('1');
  const [consumeTypes, setConsumeTypes] = useState([]);
  const [accountType, setAccountType] = useState('1');
  const [accountTypes, setAccountTypes] = useState([]);
  const [isConsumeDialogVisible, setIsConsumeDialogVisible] = useState(false);
  const [isAccountDialogVisible, setIsAccountDialogVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);  // 初始狀態為不顯示

  const toggleVisibility = () => {
    setIsVisible(!isVisible);  // 切換顯示狀態
  };

  useEffect(() => {
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
        setNetAmount(response.data.net_assets);
      })
      .catch((error) => {
        message.error(error.message);
      });
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    if (values.transactionDate) {
      const tDate = new Date(values.transactionDate);
      values["transactionDate"] = tDate.toISOString().split('T')[0];  // 格式化為 YYYY-MM-DD
    }

    const newData = { ...values, assetType, consumeType, accountType }
    AccountingRequest.addAccountingData(newData)
      .then(response => {
        message.success(response.message);
        form.resetFields(); // 重置表單
        window.location.reload();
      })
      .catch((error) => {
        message.error(error.message);
      });
    setLoading(false);
  };

  const handleConsumeClick = () => {
    setIsConsumeDialogVisible(true);
  };

  const handleAccountClick = () => {
    setIsAccountDialogVisible(true);
  };

  const handleConsumeClose = () => {
    setConsumeTypes([]);
    fetchConsumeTypes();
    setIsConsumeDialogVisible(false);
  };

  const handleAccountClose = () => {
    setAccountTypes([]);
    fetchAccountTypes();
    setIsAccountDialogVisible(false);
  };

  return (
    <div className="accounting-kv">
      <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'1'} isVisible={isVisible} toggle={toggleVisibility} />
      <div className="generalreport-container-all">
        <Card title="記帳" className={`accounting-card ${!isVisible ? 'visible' : 'hidden'}`}>
          <Spin spinning={loading}>
            <Form form={form} onFinish={handleSubmit} className="accouting-form">
              <Form.Item name="transactionDate" label="交易日期" rules={[{ required: true, message: '請選擇日期' }]} className='fs-0'>
                <DatePicker className="w-100" />
              </Form.Item>
              <Form.Item name="accountingName" label="消費名稱" rules={[{ required: true, message: '請簡述消費行為' }]} className='fs-0'>
                <Input />
              </Form.Item>
              <Form.Item name="amount" label="金額" rules={[{ required: true, message: '請輸入金額' }]} className='fs-0'>
                <Input />
              </Form.Item>
              <Form.Item name="assetType" label="交易行為" className='fs-0'>
                <Radio.Group onChange={(e) => setAssetType(e.target.value)} >
                  <Radio.Button value="0">收入</Radio.Button>
                  <Radio.Button value="1">支出</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Row gutter={16} justify="start" align="start"> {/* 第一行 */}
                <Col xs={24} lg={16}> {/* 手機佔滿整行，電腦 4:3 比例中的 4 部分 */}
                  <Form.Item name="consumeType" label="消費類型" className='fs-0'>
                    <Select onChange={(value) => setConsumeType(value)} className='w-100'>
                      {consumeTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}> {/* 手機佔滿整行，電腦 4:3 比例中的 3 部分 */}
                  <Button
                    type="default"
                    className="button1 w-100"
                    onClick={handleConsumeClick}
                  >
                    新增類別
                  </Button>
                </Col>
              </Row>
              <Row gutter={16} justify="start" align="start"> {/* 第二行 */}
                <Col xs={24} lg={16}> {/* 手機佔滿整行，電腦 4:3 比例中的 4 部分 */}
                  <Form.Item name="accountType" label="消費帳戶" className='fs-0'>
                    <Select onChange={(value) => setAccountType(value)} className='w-100'>
                      {accountTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                          {type.icon} {type.account_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}> {/* 手機佔滿整行，電腦 4:3 比例中的 3 部分 */}
                  <Button
                    type="default"
                    className="button1 w-100"
                    onClick={handleAccountClick}
                  >
                    新增帳戶
                  </Button>
                </Col>
              </Row>
              <Form.Item name="content" label="備註" className='fs-0'>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="button1 w-100">
                送出
              </Button>
            </Form>
          </Spin>
        </Card>
      </div>{
        isConsumeDialogVisible && (
          <CategoryDialog
            onClose={handleConsumeClose}
          />
        )
      }
      {
        isAccountDialogVisible && (
          <AccountDialog
            onClose={handleAccountClose}
          />
        )
      }
    </div >
  );
};

export default AccountingForm;