import axios from "axios";

const SYMBOL = "BTCUSDT";
const BUY_PRICE = 120672;
const SELL_PRICE = 122121;

const API_URL = "https://testnet.binance.vision"; //https://api.binance.com

let isOpened = false;

async function start() {
    const {data} = await axios.get(`${API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`)
    const candle = data[data.length - 1];
    //[1]open
    //[2]high
    //[3]low
    //[4]close
    const price = parseFloat(candle[4]);

    console.clear()
    console.log(price);

    if (price <= BUY_PRICE && !isOpened) {
        console.log("buy")

        isOpened = true;
    }
    else if (price >= SELL_PRICE && isOpened) {
        console.log("sell")

        isOpened = false;
    }
    else
        console.log("wait")
}

setInterval(() => {
    start();
}, 3000);