import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BankProfileRequest } from '../api/request/bankProfileRequest.js';

const { Option } = Select;

const BankDialog = ({ isEdit, initialData, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    region: '',
    branch: '',
    account: '',
    api_key: '',
    secret_key: '',
    ca_file: null,
    ca_passwd: '',
    person_id: '',
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({ ...initialData, ca_file: null });
    }
    showModal();
  }, [isEdit, initialData]);

  const taiwanCities = [
    "基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
    "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "台南市",
    "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const request = isEdit ? BankProfileRequest.updateBankProfile : BankProfileRequest.addBankProfile;
    request(formData)
      .then(response => {
        alert(response.message);
        onClose();
      })
      .catch((error) => {
        alert(error.message);
      });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleFileChange = info => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      setFormData({ ...formData, ca_file: info.file.originFileObj });
    }
  };

  const uploadProps = {
    beforeUpload: file => {
      setFormData({ ...formData, ca_file: file });
      return false;
    },
    onChange: handleFileChange,
    fileList: formData.ca_file ? [formData.ca_file] : [],
  };

  return (
    <>
      <Modal
        title={<h2>{isEdit ? '編輯使用者資料' : '使用者資料'}</h2>}
        visible={isModalOpen}
        onCancel={handleCancel}
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
          <div className="mt-2">銀行名稱</div>
          <Input
            placeholder="請輸入"
            className="mt-1"
            value={formData.bank_name}
            onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
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
          <div className="mt-2">分行名稱</div>
          <Input
            placeholder="請輸入"
            className="mt-1"
            value={formData.branch}
            onChange={e => setFormData({ ...formData, branch: e.target.value })}
          />
          <div className="mt-2">銀行帳號</div>
          <Input
            placeholder="請輸入"
            className="mt-1"
            value={formData.account}
            onChange={e => setFormData({ ...formData, account: e.target.value })}
          />
          <div className="mt-2">永豐金api授權
            <a href="https://www.sinotrade.com.tw/ec/20191125/Main/index.aspx#pag4" target="_blank">参考文件</a>
          </div>
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
          <div className="mt-2">身份證字號</div>
          <Input
            placeholder="請輸入"
            className="mt-1"
            value={formData.person_id}
            onChange={e => setFormData({ ...formData, person_id: e.target.value })}
          />
          <div className="mt-2">下單電子憑證密碼</div>
          <Input
            placeholder="請輸入"
            className="mt-1"
            value={formData.ca_passwd}
            onChange={e => setFormData({ ...formData, ca_passwd: e.target.value })}
          />
          <div className="mt-2">電子憑證</div>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>上傳憑證</Button>
          </Upload>
        </div>
      </Modal>
    </>
  );
};

export default BankDialog;
