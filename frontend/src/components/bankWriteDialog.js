import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import fontUrl from '../assets/fonts/NotoSansTC-VariableFont_wght.ttf'; // 引入支持中文的字體
import acceptForm from '../assets/pdf/acceptForm.pdf'; // 引入你的現有 PDF
import fontkit from '@pdf-lib/fontkit'; // 引入 fontkit
import { Button, Input, Checkbox, Card, Modal } from 'antd';
import { BankProfileRequest } from '../api/request/bankProfileRequest.js';
import { useNavigate } from 'react-router-dom'; // 使用 useNavigate 來進行跳轉
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

function BankWriteDialog() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAdult, setIsAdult] = useState(false); // 是否滿18歲
    const [isAgree, setIsAgree] = useState(false); // 是否同意
    const [isSigned, setIsSigned] = useState(false); // 是否已簽名
    const [code, setCode] = useState('');
    const [fatherCode, setFatherCode] = useState('');
    const sigCanvas = useRef({});
    const guardianSigCanvas = useRef({});
    const navigate = useNavigate();

    useEffect(() => {
        showModal();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleAdultChange = () => {
        setIsAdult(!isAdult);
    };

    const handleAgreeChange = () => {
        setIsAgree(!isAgree);
    };

    // 清除簽名
    const clearSignature = () => {
        sigCanvas.current.clear();
        guardianSigCanvas.current.clear();
        setIsSigned(false);
    };

    // 下載簽名後的 PDF
    const handleSubmit = async () => {
        const canvas = await html2canvas(document.querySelector("#signature-area"));
        const imgData = canvas.toDataURL('image/png');
        let guardianImgData = null;

        if (!isAdult) {
            const guardianCanvas = await html2canvas(document.querySelector("#guardian-signature-area"));
            guardianImgData = guardianCanvas.toDataURL('image/png');
        }

        const existingPdfBytes = await fetch(acceptForm).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        pdfDoc.registerFontkit(fontkit);
        const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
        const customFont = await pdfDoc.embedFont(fontBytes);

        const pngImage = await pdfDoc.embedPng(imgData);
        let guardianPngImage = null;
        if (guardianImgData) {
            guardianPngImage = await pdfDoc.embedPng(guardianImgData);
        }

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const date = new Date();
        const taiwanYear = date.getFullYear() - 1911;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        firstPage.drawText(code, {
            x: 370,
            y: 163,
            size: 12,
            color: rgb(0, 0, 0),
        });

        if (!isAdult) {
            firstPage.drawText(fatherCode, {
                x: 370,
                y: 117,
                size: 12,
                color: rgb(0, 0, 0),
            });
        }
        firstPage.drawText(`日期：${taiwanYear} 年 ${month} 月 ${day} 日`, {
            x: 50,
            y: 60,
            font: customFont,
            size: 12,
            color: rgb(0, 0, 0),
        });

        firstPage.drawImage(pngImage, {
            x: 110,
            y: 150,
            width: 70,
            height: 35,
        });

        if (!isAdult) {
            firstPage.drawImage(guardianPngImage, {
                x: 195,
                y: 100, // 調整法定代理人簽名位置
                width: 70,
                height: 35,
            });
        }
        /*
                // 確保身分證字號字首大寫
                const idNumberUpperCase = code.charAt(0).toUpperCase() + code.slice(1);
        
                // 使用身分證字號加密 PDF
                pdfDoc.encrypt({
                    userPassword: idNumberUpperCase,
                    ownerPassword: idNumberUpperCase, // 可以設定為不同的密碼
                    permissions: {
                        printing: 'highResolution',
                        modifying: false,
                        copying: false,
                    },
                });*/

        const pdfBytes = await pdfDoc.save();

        const username = localStorage.getItem('username');

        // 創建 FormData 並將 PDF 檔案加入
        const formData = new FormData();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        formData.append('pdfFile', pdfBlob, `${username}.pdf`);

        if (!isAgree) {
            alert("請詳閱後勾選我同意");
        }
        try {
            BankProfileRequest.uploadPDF(formData)
                .then(response => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(pdfBlob);
                    link.download = 'signed_document.pdf';
                    link.click();
                    navigate('/');
                })
                .catch((error) => {
                    alert(error.message);
                });
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div>
            <Modal
                title="簽名表單"
                open={isModalVisible}
                footer={null}
                width={1050} // 控制彈窗的寬度
            >
                <Card>
                    <div style={{ height: '300px', overflowY: 'scroll', width: '100%', border: '1px solid black', borderRadius: '5px' }}>
                        <Document file={acceptForm}>
                            <Page pageNumber={1} size="A4" scale={1.5} />
                        </Document>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <label>
                            <Checkbox
                                checked={isAdult}
                                onChange={handleAdultChange}
                            >
                                我已滿18歲
                            </Checkbox>
                        </label>
                        <br />
                        <label>
                            <Checkbox
                                checked={isAgree}
                                onChange={handleAgreeChange}
                                required
                            >
                                我已詳細閱覽，我同意
                            </Checkbox>
                        </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ textAlign: 'center', marginTop: '1rem' }}>簽名區</h3>
                            <div
                                id="signature-area"
                                style={{
                                    border: '1px solid black',
                                    marginBottom: '1rem',
                                    width: '300px',
                                    height: '150px',
                                    margin: '0 auto',
                                }}
                            >
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor="black"
                                    canvasProps={{
                                        width: 300,
                                        height: 150,
                                        className: 'sigCanvas',
                                    }}
                                    minWidth={1}
                                    maxWidth={3}
                                    velocityFilterWeight={0.7}
                                    onEnd={() => setIsSigned(true)}
                                />
                            </div>
                            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
                                <p>申請人統一編號(身分證字號):</p>
                                <Input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '300px' }} />
                            </div>
                        </div>

                        {!isAdult && (
                            <div>
                                <h3 style={{ textAlign: 'center', marginTop: '1rem' }}>法定代理人簽名區</h3>
                                <div
                                    id="guardian-signature-area"
                                    style={{
                                        border: '1px solid black',
                                        marginBottom: '1rem',
                                        width: '300px',
                                        height: '150px',
                                        margin: '0 auto',
                                    }}
                                >
                                    <SignatureCanvas
                                        ref={guardianSigCanvas}
                                        penColor="black"
                                        canvasProps={{
                                            width: 300,
                                            height: 150,
                                            className: 'guardianSigCanvas',
                                        }}
                                        minWidth={1}
                                        maxWidth={3}
                                        velocityFilterWeight={0.7}
                                    />
                                </div>
                                <div style={{ textAlign: 'left', marginTop: '1rem' }}>
                                    <p>法定代理人統一編號(身分證字號):</p>
                                    <Input value={fatherCode} onChange={(e) => setFatherCode(e.target.value)} style={{ width: '300px' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Button className='button1' onClick={clearSignature}>清除簽名</Button>
                        <Button className='button2' onClick={handleSubmit}>提交</Button>
                    </div>
                </Card>
            </Modal>
        </div>
    );
}

export default BankWriteDialog;
