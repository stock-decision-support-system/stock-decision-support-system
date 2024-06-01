document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display stock info for 台積電 2330 when the page loads
    fetchStockInfo('2330');
});

document.getElementById('searchButton').addEventListener('click', function() {
    const stockSymbol = document.getElementById('stockSymbol').value.toUpperCase();
    fetchStockInfo(stockSymbol);
});

function fetchStockInfo(stockSymbol) {
    const stockInfo = document.getElementById('stockInfo');

    if (!stockSymbol) {
        stockInfo.innerHTML = '請輸入股票代號';
        return;
    }

    stockInfo.innerHTML = '查詢中...';

    fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}.TW?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`)
        .then(response => response.json())
        .then(data => {
            const result = data.chart.result[0];
            const meta = result.meta;
            const lastPrice = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const priceChange = (lastPrice - previousClose).toFixed(2);
            const priceChangePercent = ((priceChange / previousClose) * 100).toFixed(2);

            stockInfo.innerHTML = `
                <h2>台積電 2330</h2>
                <div class="stock-price">
                    <span class="price">${lastPrice}</span>
                    <span class="change" style="color: ${priceChange >= 0 ? '#09CF41' : 'red'};">
                        ${priceChange >= 0 ? '▲' : '▼'} ${priceChange} (${priceChangePercent}%)
                    </span>
                </div>
                <div class="stock-details">
                    <p>成交量: ${meta.volume}</p>
                    <p>本益比: ${meta.trailingPE}</p>
                    <p>2023/12/07 開17.85 高17.9 低17.75 收17.8 量6748 漲跌0</p>
                </div>
                <div class="stock-chart">
                    <img src="chart.png" alt="Stock Chart">
                </div>
            `;
        })
        .catch(error => {
            stockInfo.innerHTML = '查詢失敗，請重試。';
            console.error('Error fetching stock data:', error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const usernameButton = document.getElementById("usernameButton");
    const dropdown = document.querySelector(".dropdown");

    usernameButton.addEventListener("mouseover", function() {
        dropdown.style.display = "block";
    });

    usernameButton.addEventListener("mouseout", function() {
        setTimeout(function() {
            dropdown.style.display = "none";
        }, 200);
    });

    dropdown.addEventListener("mouseover", function() {
        dropdown.style.display = "block";
    });

    dropdown.addEventListener("mouseout", function() {
        dropdown.style.display = "none";
    });
});
