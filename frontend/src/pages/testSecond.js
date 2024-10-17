import React, { useState } from 'react';
import { Card, Carousel, Image, Button } from 'antd';

const TestCarouselInCard = () => {
    // 假設這裡是您的圖片數組
    const images = [
        { src: 'https://via.placeholder.com/600x300?text=Image+1', description: '這是圖片 1 的說明' },
        { src: 'https://via.placeholder.com/600x300?text=Image+2', description: '這是圖片 2 的說明' },
        { src: 'https://via.placeholder.com/600x300?text=Image+3', description: '這是圖片 3 的說明' },
        { src: 'https://via.placeholder.com/600x300?text=Image+4', description: '這是圖片 4 的說明' },
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 用於追踪當前顯示的圖片索引
    const carouselRef = React.createRef(); // 創建引用以訪問 Carousel
    const lastIndex = images.length - 1;

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

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card
                style={{ width: 600 }} // 可以根據需要調整寬度
                title="走馬燈示例"
                hoverable
            >
                <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                    <Carousel ref={carouselRef} arrows={false} afterChange={onChange}>
                        {images.map((image, index) => (
                            <Image
                                key={index}
                                src={image.src}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ))}
                    </Carousel>
                </div>
                <div style={{ padding: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '80px' }}>
                        {currentImageIndex !== 0 ? (
                            <Button onClick={goToPrev} style={{ marginRight: '10px' }}>
                                上一張
                            </Button>
                        ) : (
                            <div style={{ width: '80px' }} /> // 占位符
                        )}
                    </div>
                    <p style={{ margin: 0 }}>{images[currentImageIndex].description}</p>
                    <div style={{ width: '80px' }}>
                        {currentImageIndex !== lastIndex ? (
                            <Button onClick={goToNext} style={{ marginLeft: '10px' }}>
                                下一張
                            </Button>
                        ) : (
                            <div style={{ width: '80px' }} /> // 占位符
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TestCarouselInCard;
