import axios from "axios";

const SYMBOL = "BTCUSDT";
const BUY_PRICE = 120672;
const SELL_PRICE = 122121;

const API_URL = "https://testnet.binance.vision"; //https://api.binance.com

let isOpened = false;

function getClosePriceInCandle(candle) {
    // Campos retornados no candle
    //[1]open
    //[2]high
    //[3]low
    //[4]close
    return parseFloat(candle[4]);
}

function calcSimpleMovingAverage(data) {
    const closes = data.map(candle => getClosePriceInCandle(candle))
    const sum = closes.reduce((a,b) => a + b)

    return sum / data.length;
}

async function start() {
    const {data} = await axios.get(`${API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`)
    const candle = data[data.length - 1];

    const price = getClosePriceInCandle(candle);

    console.clear()
    console.log(price);

    const simpleMovingAverage = calcSimpleMovingAverage(data);
    // const simpleMovingAverageIn21Periods = calcSimpleMovingAverage(data);
    // const simpleMovingAverageIn13Periods = calcSimpleMovingAverage(data.slice(8));
    console.log("SMA", simpleMovingAverage);
    // console.log("SMA (13):", simpleMovingAverageIn13Periods);
    // console.log("SMA (21):", simpleMovingAverageIn21Periods);
    console.log("Is Opened:", isOpened);

    // if (simpleMovingAverageIn13Periods > simpleMovingAverageIn21Periods && !isOpened) {
    if (price <= (simpleMovingAverage * 0.9) && !isOpened) {
        console.log("buy")

        isOpened = true;
    }
    // else if (simpleMovingAverageIn13Periods < simpleMovingAverageIn21Periods && isOpened) {
    else if (price >= (simpleMovingAverage * 1.1) && isOpened) {
        console.log("sell")

        isOpened = false;
    }
    else
        console.log("wait")
}

setInterval(() => {
    start();
}, 3000);