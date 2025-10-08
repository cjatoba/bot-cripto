import axios from "axios";

const SYMBOL = "BTCUSD";
const BUY_PRICE = 120672;
const SELL_PRICE = 122121;

const API_URL = "https://testnet.binance.vision";

async function start() {
    const {data} = await axios.get(`${API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`)
    const candle = data[data.length - 1];

    console.log(candle);
}

setInterval(() => {
    start();
}, 3000);