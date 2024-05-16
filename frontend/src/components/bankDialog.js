import React, { useState } from 'react';
import { Button, Modal, Input, Select } from 'antd';
import { BankProfileRequest } from '../api/request/bankProfileRequest.js';

const { Option } = Select;

const BankDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    bankName: '',
    region: '',
    branch: '',
    account: '',
    api_key: '',
    secret_key: '',
    ca_path: 'test',
    ca_passwd: 'test',
    person_id: 'test',
  });

  const taiwanCities = [
    "基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
    "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "台南市",
    "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"
];

  const showModal = () => {
    setIsModalOpen(true);
  }

  const handleOk = async () => {
      BankProfileRequest.addBankProfile(formData)
      .then(response => {
        alert(response.message);
        window.location.reload();
      })
      .catch((error) => {
          alert(error.message);
      })
      setIsModalOpen(false);
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        新增銀行資料
      </Button>
      <Modal
        title={<h2>使用者資料</h2>}
        visible={isModalOpen}
        footer={[
          <Button
            type="primary"
            onClick={handleOk}
          >
            確定
          </Button>,
        ]}
      >
        <div className="form-container">
            <>
              <Input
                placeholder="銀行名稱"
                className="mt-1"
                value={formData.bankName}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              />
              <div className="mt-2">城市</div>
              <Select
                  defaultValue="請選擇"
                  className="mt-1 w-100"
                  value={formData.region}
                  onChange={value => setFormData({ ...formData, region: value })}
              >
                  {taiwanCities.map(city => (
                      <Option key={city} value={city}>{city}</Option>
                  ))}
              </Select>
              <Input
                placeholder="分行名稱"
                className="mt-1"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              />
              <Input
                placeholder="銀行帳號"
                className="mt-1"
                value={formData.account}
                onChange={e => setFormData({ ...formData, account: e.target.value })}
              />
              <Input
                placeholder="金鑰"
                className="mt-1"
                value={formData.api_key}
                onChange={e => setFormData({ ...formData, api_key: e.target.value })}
              />
              <Input
                placeholder="密鑰"
                className="mt-1"
                value={formData.secret_key}
                onChange={e => setFormData({ ...formData, secret_key: e.target.value })}
              />
            </>
        </div>
      </Modal>
    </>
  );
};
export default BankDialog;
