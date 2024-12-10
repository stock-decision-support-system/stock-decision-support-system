import React, { useState } from "react";
import { Button, List, Card, Space } from "antd";

const TestComponent = () => {
    const [leftItems, setLeftItems] = useState([
        { id: 1, name: "Item 1", selected: false },
        { id: 2, name: "Item 2", selected: false },
        { id: 3, name: "Item 3", selected: false },
        { id: 4, name: "Item 4", selected: false },
        { id: 5, name: "Item 5", selected: false },
        { id: 6, name: "Item 6", selected: false },
    ]);
    const [rightItems, setRightItems] = useState([]);

    const moveToRight = (id) => {
        setLeftItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, selected: true } : item
            )
        );
        setRightItems((prev) => [
            ...prev,
            leftItems.find((item) => item.id === id),
        ]);
    };

    const moveToLeft = (id) => {
        setRightItems((prev) => prev.filter((item) => item.id !== id));
        setLeftItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, selected: false } : item
            )
        );
    };

    const handleSubmit = async () => {
        const payload = rightItems.map((item) => ({
            id: item.id,
            name: item.name,
        }));
        try {
            const response = await fetch("https://example.com/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedItems: payload }),
            });
            if (response.ok) {
                alert("Data submitted successfully!");
            } else {
                alert("Failed to submit data.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while submitting data.");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px" }}>
            <Card style={{ width: "auto", padding: "20px" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                    <div>
                        <h3>
                            Available Item
                        </h3>
                        <Card
                            style={{
                                width: 300,
                                height: "250px", // 固定高度
                                overflowY: "auto", // 啟用垂直滾動
                            }}
                        >
                            <List
                                dataSource={leftItems}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            !item.selected && (
                                                <Button
                                                    type="primary"
                                                    shape="circle"
                                                    onClick={() => moveToRight(item.id)}
                                                >
                                                    &gt;
                                                </Button>
                                            ),
                                        ]}
                                        style={{
                                            color: item.selected ? "gray" : "black",
                                            pointerEvents: item.selected ? "none" : "auto",
                                        }}
                                    >
                                        {item.name}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>

                    <div>
                        <h3>
                            Selected Items
                        </h3>
                        <Card
                            style={{
                                width: 300,
                                height: "250px", // 固定高度
                                overflowY: "auto", // 啟用垂直滾動
                            }}
                        >
                            <List
                                dataSource={rightItems}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="default"
                                                shape="circle"
                                                onClick={() => moveToLeft(item.id)}
                                            >
                                                &lt;
                                            </Button>,
                                        ]}
                                    >
                                        {item.name}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>
                </div>
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <Button type="primary" onClick={handleSubmit}>
                        完成
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default TestComponent;
