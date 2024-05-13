import React, { useState } from 'react';
import { Button, Modal, DatePicker, Input, Select } from 'antd';

const { Option } = Select;

const BankDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    birthday: null,
    city: '',
    district: '',
    address: '',
    postalCode: '',
    bankName: '',
    bankCity: '',
    bankBranch: '',
    bankAccountName: '',
    bankAccountNumber: '',
    api: '',
    secret: ''
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleOk = async () => {
    if (currentStep === 2) {
      const response = await fetch('http://localhost:8000/api/addBank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setCurrentStep(1);
    }
  };

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
            onClick={currentStep === 1 ? handleNext : handleOk}
          >
            {currentStep === 1 ? '下一步' : '確定'}
          </Button>,
        ]}
      >
        <div className="form-container">
          {currentStep === 1 && (
            <>
              <Input
                placeholder="姓名"
                className="mt-2"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="身份證字號"
                className="mt-1"
                value={formData.idNumber}
                onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
              />
              <DatePicker
                placeholder="yyyy/mm/dd"
                className="w-100 mt-1"
                value={formData.birthday}
                onChange={date => setFormData({ ...formData, birthday: date })}
              />
              <Select
                defaultValue="城市"
                className="mt-1 w-100"
                value={formData.city}
                onChange={value => setFormData({ ...formData, city: value })}
              >
                <Option value="taipei">台北市</Option>
                <Option value="newtaipei">新北市</Option>
              </Select>
              <Select
                defaultValue="區"
                className="mt-1 w-100"
                value={formData.district}
                onChange={value => setFormData({ ...formData, district: value })}
              >
                <Option value="xx">xx區</Option>
                <Option value="oo">oo區</Option>
              </Select>
              <Input
                placeholder="地址"
                className="mt-1"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                placeholder="郵遞區號"
                className="mt-1"
                value={formData.postalCode}
                onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </>
          )}
          {currentStep === 2 && (
            <>
              <div className="mt-2">銀行名稱</div>
              <Select
                defaultValue="請選擇"
                className="mt-1 w-100"
                value={formData.bankName}
                onChange={value => setFormData({ ...formData, bankName: value })}
              >
                <Option value="bank1">銀行1</Option>
                <Option value="bank2">銀行2</Option>
              </Select>
              <div className="mt-2">城市</div>
              <Select
                defaultValue="請選擇"
                className="mt-1 w-100"
                value={formData.bankCity}
                onChange={value => setFormData({ ...formData, bankCity: value })}
              >
                <Option value="taipei">台北市</Option>
                <Option value="newtaipei">新北市</Option>
              </Select>
              <div className="mt-2">分行名稱</div>
              <Select
                defaultValue="請選擇"
                className="mt-1 w-100"
                value={formData.bankBranch}
                onChange={value => setFormData({ ...formData, bankBranch: value })}
              >
                <Option value="branch1">分行1</Option>
                <Option value="branch2">分行2</Option>
              </Select>
              <Input
                placeholder="銀行戶名"
                className="mt-1"
                value={formData.bankAccountName}
                onChange={e => setFormData({ ...formData, bankAccountName: e.target.value })}
              />
              <Input
                placeholder="銀行帳號"
                className="mt-1"
                value={formData.bankAccountNumber}
                onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
              <Input
                placeholder="金鑰"
                className="mt-1"
                value={formData.api}
                onChange={e => setFormData({ ...formData, api: e.target.value })}
              />
              <Input
                placeholder="密鑰"
                className="mt-1"
                value={formData.secret}
                onChange={e => setFormData({ ...formData, secret: e.target.value })}
              />
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
export default BankDialog;
