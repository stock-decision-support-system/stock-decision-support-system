import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import fontUrl from '../assets/fonts/NotoSansTC-VariableFont_wght.ttf'; // 引入支持中文的字體
import acceptForm from '../assets/pdf/acceptForm.pdf'; // 引入你的現有 PDF
import fontkit from '@pdf-lib/fontkit'; // 引入 fontkit

function TestPage() {
    const sigCanvas = useRef({});
    const [isSigned, setIsSigned] = useState(false);

    // 清除簽名
    const clearSignature = () => {
        sigCanvas.current.clear();
        setIsSigned(false);
    };

    // 下載簽名後的 PDF
    const downloadPDF = async () => {
        const canvas = await html2canvas(document.querySelector("#signature-area"));
        const imgData = canvas.toDataURL('image/png');

        const existingPdfBytes = await fetch(acceptForm).then((res) => res.arrayBuffer());

        // 加載 PDF 文檔
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // 註冊 fontkit
        pdfDoc.registerFontkit(fontkit);

        // 加載字體文件
        const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
        const customFont = await pdfDoc.embedFont(fontBytes);

        // 嵌入簽名圖片
        const pngImage = await pdfDoc.embedPng(imgData);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const date = new Date();
        const taiwanYear = date.getFullYear() - 1911; // 計算民國年份
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份（從 0 開始）
        const day = String(date.getDate()).padStart(2, '0'); // 日期
        // 繪製當前日期
        firstPage.drawText(`日期：${taiwanYear} 年 ${month} 月 ${day} 日`, {
            x: 50,
            y: 60, // 調整位置
            size: 12,
            font: customFont, // 使用自定義字體
            color: rgb(0, 0, 0),
        });

        // 繪製簽名圖片
        firstPage.drawImage(pngImage, {
            x: 110,
            y: 150, // 調整位置
            width: 70, // 根據需要調整大小
            height: 35,
        });


        const pdfBytes = await pdfDoc.save();

        // 創建 blob 並下載 PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'signed_document.pdf';
        link.click();
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>線上簽名範例</h1>

            <div id="signature-area" style={{ border: '1px solid black', marginBottom: '1rem', width: '300px', height: '150px', margin: '0 auto' }}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black" // 筆的顏色
                    canvasProps={{
                        width: 300,
                        height: 150,
                        className: 'sigCanvas'
                    }}
                    minWidth={1} // 最小筆畫寬度
                    maxWidth={3} // 最大筆畫寬度，讓筆跡更自然
                    velocityFilterWeight={0.7} // 調整筆畫隨速度變化的敏感度
                    onEnd={() => setIsSigned(true)}
                />
            </div>

            <button onClick={clearSignature} className="btn btn-danger">
                清除簽名
            </button>
            <button
                onClick={downloadPDF}
                className="btn btn-success"
                disabled={!isSigned}
                style={{ marginLeft: '1rem' }}
            >
                下載 PDF
            </button>
        </div>
    );
}

export default TestPage;
