import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BankProfileRequest } from '../api/request/bankProfileRequest.js';
import { config } from "../config";

const BASE_URL = config.API_URL;
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
    ca_path: '',
    ca_passwd: '',
    person_id: '',
  });
  const [fileList, setFileList] = useState([]);
  const [isNewFile, setIsNewFile] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({ ...initialData });
      setFileList(initialData.ca_path ? [{ uid: '-1', name: decodeURIComponent(initialData.ca_path.split('/ca_file/').pop()), status: 'done', url: `${BASE_URL}${initialData.ca_path}` }] : []);
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
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    if (isNewFile) {
      if (fileList.length > 0) {
        formDataToSend.append('ca_file', fileList[0].originFileObj);
      }
    }
    const request = isEdit ? BankProfileRequest.updateBankProfile : BankProfileRequest.addBankProfile;
    try {
      const response = await request(formDataToSend);
      alert(response.message);
      onClose();
    } catch (error) {
      alert(error.message);
    }

    setIsModalOpen(false);
    setIsNewFile(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleFileChange = info => {
    let newFileList = [...info.fileList];
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      newFileList = newFileList.slice(-1);
    }
    setFileList(newFileList);
    setIsNewFile(true);
  };

  const uploadProps = {
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    onChange: handleFileChange,
    fileList,
  };

  return (
    <>
      <Modal
        title={<h2>{isEdit ? '編輯使用者資料' : '使用者資料'}</h2>}
        visible={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            確定
          </Button>,
        ]}
      >
        <div className="form-container">
          <div className="mt-2">銀行名稱</div>
          <Input
            placeholder="永豐商業銀行"
            className="mt-1"
            value="永豐商業銀行"
            onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
            disabled // 設置為禁用狀態
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
          {isEdit ? (<>
            <Input.Password
              placeholder="請輸入"
              className="mt-1"
              value={formData.account}
              onChange={e => setFormData({ ...formData, account: e.target.value })}
            />
            <div className="mt-2">永豐金api授權
              <a href="https://www.sinotrade.com.tw/ec/20191125/Main/index.aspx#pag4" target="_blank">参考文件</a>
            </div>
            <Input.Password
              placeholder="金鑰"
              className="mt-1"
              value={formData.api_key}
              onChange={e => setFormData({ ...formData, api_key: e.target.value })}
            />
            <Input.Password
              placeholder="密鑰"
              className="mt-1"
              value={formData.secret_key}
              onChange={e => setFormData({ ...formData, secret_key: e.target.value })}
            />
            <div className="mt-2">身份證字號</div>
            <Input.Password
              placeholder="請輸入"
              className="mt-1"
              value={formData.person_id}
              onChange={e => setFormData({ ...formData, person_id: e.target.value })}
            />
            <div className="mt-2">下單電子憑證密碼</div>
            <Input.Password
              placeholder="請輸入"
              className="mt-1"
              value={formData.ca_passwd}
              onChange={e => setFormData({ ...formData, ca_passwd: e.target.value })}
            />
          </>
          ) : (
            <>
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
            </>
          )}
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