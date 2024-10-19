import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import fontUrl from '../assets/fonts/NotoSansTC-VariableFont_wght.ttf'; // 引入支持中文的字體
import acceptForm from '../assets/pdf/acceptForm.pdf'; // 引入你的現有 PDF
import fontkit from '@pdf-lib/fontkit'; // 引入 fontkit
import { Button, Input, Checkbox, Card, Form } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

function BankWriteDialog() {
    const sigCanvas = useRef({});
    const guardianSigCanvas = useRef({});
    const [isAdult, setIsAdult] = useState(false); // 是否滿18歲
    const [isAgree, setIsAgree] = useState(false); // 是否同意
    const [isSigned, setIsSigned] = useState(false); // 是否已簽名
    const [code, setCode] = useState('');
    const [fatherCode, setFatherCode] = useState('');

    const handleCheckboxChange = () => {
        setIsAdult(!isAdult);
    };

    const handleSubmit = () => {
        downloadPDF(); // 下载PDF文件
    };

    // 清除簽名
    const clearSignature = () => {
        sigCanvas.current.clear();
        setIsSigned(false);
    };

    // 下載簽名後的 PDF
    const downloadPDF = async () => {
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
            size: 12,
            font: customFont,
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

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'signed_document.pdf';
        link.click();
    };

    return (
        <div>
            <Card>
                <div style={{ height: '300px', overflowY: 'scroll', width: '100%', border: '1px solid black', borderRadius: '5px' }}>
                    <Document file={acceptForm}>
                        <Page pageNumber={1} size="A4" scale={1.5}/>
                    </Document>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <label>
                        <Checkbox
                            checked={isAdult}
                            onChange={handleCheckboxChange}
                        >
                            我已滿18歲
                        </Checkbox>
                    </label>
                    <br />
                    <label>
                        <Checkbox
                            required
                        >
                            我已詳細閱覽
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
                                <Input value={fatherCode} onChange={(e) => setFatherCode(e.target.value)}  style={{ width: '300px' }} />
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Button className='button2' onClick={handleSubmit}>提交</Button>
                </div>
            </Card>
        </div>
    );
}

export default BankWriteDialog;
