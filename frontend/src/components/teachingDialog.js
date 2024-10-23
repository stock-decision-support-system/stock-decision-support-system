import React, { useState ,useEffect, createRef } from 'react';
import { Card, Carousel, Image, Button, Modal } from 'antd';

const TeachingDialog = ({ onClose }) => {
    // 假設這裡是您的圖片數組
    const images = [
        { src: require('../assets/images/teaching/teaching01.png'), description: '歡迎開始使用智投金紡，接下來我會帶您進行使用教學，如果畫面不清楚可以點按圖片放大' },
        { src: require('../assets/images/teaching/teaching02.png'), description: '剛開始使用的用戶，我們會希望您來到記帳，進行交易紀錄，並實時查看自己的資產狀態' },
        { src: require('../assets/images/teaching/teaching03.png'), description: '點選新增類別/帳戶，使用者可以根據個人習慣新增交易的類型和帳戶' },
        { src: require('../assets/images/teaching/teaching04.png'), description: '點選交易查詢，我們可以查看歷史的交易，並管控收入和支出' },
        { src: require('../assets/images/teaching/teaching05.png'), description: '點選報告圖表，我們可以看到資產的變動，並且獲得AI的儲蓄建議，依據用戶習慣提供推薦的股票' },
        { src: require('../assets/images/teaching/teaching06.png'), description: '點選股市，我們可以看到系統推薦的台灣五十股，或依據自己的需求進行查詢' },
        { src: require('../assets/images/teaching/teaching07.png'), description: '點進任意一支股票，我們可以到股票的詳細數據，並且透過拖曳滑桿，對某個區段進行更詳細的查看' },
        { src: require('../assets/images/teaching/teaching08.png'), description: '來到投資績效，我們可以自由新增投資組合，在儲蓄到一定金額後，我們可以根據這個投資組合的設定去做投資' },
        { src: require('../assets/images/teaching/teaching09.png'), description: '或者您可以查看預設投資組合，有我們為新用戶準備的投資組合' },      
        { src: require('../assets/images/teaching/teaching10.png'), description: '請注意，在您投入第一筆金錢之前，我們需要簽署個人資料運用告知同意書，保障雙方的安全' },
        { src: require('../assets/images/teaching/teaching11.png'), description: '簽署完畢後，我們就可以新增交割戶，目前我們僅提供永豐商業銀行，請您依據參考文件進行帳戶申請' },
        { src: require('../assets/images/teaching/teaching12.png'), description: '新增完畢後可以來到我的股票，查看您所持有的所有股票和損益' },
        { src: require('../assets/images/teaching/teaching13.png'), description: '若您不想受投資組合限制，您也可以自行下單零股' },
        { src: require('../assets/images/teaching/teaching14.png'), description: '若你想透過投資組合下單，可以來到批次下單零股' },
        { src: require('../assets/images/teaching/teaching15.png'), description: '下單不一定會成功，我們另外提供了委託中的訂單，供您查看所有下單狀態' },
        { src: require('../assets/images/teaching/teaching16.png'), description: '點選畫面左上方，我們可以回到首頁，此時點選右下角的+，我們可以新增儲蓄目標，為您的投資儲蓄第一筆金' },
        { src: require('../assets/images/teaching/teaching17.png'), description: '當目標完成會跳出提示，提醒你進行交易操作。教學到此結束。' },
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 用於追踪當前顯示的圖片索引
    const carouselRef = createRef(); // 創建引用以訪問 Carousel
    const [isModalOpen, setIsModalOpen] = useState(false); // 控制 Modal 的顯示
    const lastIndex = images.length - 1;

    useEffect(() => {
      showModal();
    }, []);
  
    const showModal = () => {
      setIsModalOpen(true);
    };

    const onChange = (current) => {
        setCurrentImageIndex(current); // 更新當前圖片索引
    };

    const goToNext = () => {
        const nextIndex = (currentImageIndex + 1) % images.length; // 計算下一個索引
        setCurrentImageIndex(nextIndex);
        carouselRef.current.goTo(nextIndex); // 切換到下一張圖片
    };

    const goToPrev = () => {
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length; // 計算上一個索引
        setCurrentImageIndex(prevIndex);
        carouselRef.current.goTo(prevIndex); // 切換到上一張圖片
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      onClose();
    };

    return (
        <div>
            <Modal
                title="使用教學"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={700} // 可以根據需要調整寬度
            >
                <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                    <Carousel ref={carouselRef} arrows={false} afterChange={onChange}>
                        {images.map((image, index) => (
                            <Image
                                key={index}
                                src={image.src}
                                style={{ maxWidth: '700px', maxHeight: '300px', objectFit: 'cover' }}
                            />
                        ))}
                    </Carousel>
                </div>
                <div style={{ padding: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '80px' }}>
                        {currentImageIndex !== 0 && (
                            <Button onClick={goToPrev} style={{ marginRight: '10px' }}>
                                上一張
                            </Button>
                        )}
                    </div>
                    <p style={{ margin: 0 }}>{images[currentImageIndex].description}</p>
                    <div style={{ width: '80px' }}>
                        {currentImageIndex !== lastIndex && (
                            <Button onClick={goToNext} style={{ marginLeft: '10px' }}>
                                下一張
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeachingDialog;
