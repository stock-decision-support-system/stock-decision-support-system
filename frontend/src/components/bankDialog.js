import React, { useState } from 'react';
import { Button, Modal, DatePicker, Input, Select } from 'antd';

const { Option } = Select;

const BankDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleOk = () => {
    if (currentStep === 2) {
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
              <Input placeholder="姓名" className="mt-2" />
              <Input placeholder="身份證字號" className="mt-1" />
              <DatePicker placeholder="yyyy/mm/dd" className="w-100 mt-1" />
              <Select defaultValue="城市" className="mt-1 w-100">
                <Option value="taipei">台北市</Option>
                <Option value="newtaipei">新北市</Option>
              </Select>
              <Select defaultValue="區" className="mt-1 w-100">
                <Option value="xx">xx區</Option>
                <Option value="oo">oo區</Option>
              </Select>
              <Input placeholder="地址" className="mt-1" />
              <Input placeholder="郵遞區號" className="mt-1" />
            </>
          )}
          {currentStep === 2 && (
            <>
              <div className="mt-2">銀行名稱</div>
              <Select defaultValue="請選擇" className="mt-1 w-100">
                <Option value="taipei">台北市</Option>
                <Option value="newtaipei">新北市</Option>
              </Select>
              城市
              <Select defaultValue="請選擇" className="mt-1 w-100">
                <Option value="xx">xx區</Option>
                <Option value="oo">oo區</Option>
              </Select>
              分行名稱
              <Select defaultValue="請選擇" className="mt-1 w-100">
                <Option value="taipei">台北市</Option>
                <Option value="newtaipei">新北市</Option>
              </Select>
              <Input placeholder="銀行戶名" className="mt-1" />
              <Input placeholder="銀行帳號" className="mt-1" />
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
export default BankDialog;
