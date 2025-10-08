import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const SYMBOL = "BTCUSDT";
const QUANTITY = "0.001";

const BINANCE_API_URL = process.env.BINANCE_API_URL || "";
const BINANCE_API_KEY = process.env.BINANCE_API_KEY || "";
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY || "";

let isOpened = false;

type Candle = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

type OrderSide = "buy" | "sell";

type OrderType = "MARKET";

type Order = {
    signature: string,
    symbol: string,
    quantity: string,
    side: OrderSide,
    type: OrderType,
    timestamp: string
}

const CANDLE_DATA_INDEX = {
    OPEN_TIME: 0,
    OPEN: 1,
    HIGH: 2,
    LOW: 3,
    CLOSE: 4,
    VOLUME: 5,
    CLOSE_TIME: 6,
    QUOTE_ASSET_VOLUME: 7,
    NUMBER_OF_TRADES: 8,
    TAKER_BUY_BASE_ASSET_VOLUME: 9,
    TAKER_BUY_QUOTE_ASSET_VOLUME: 10,
    IGNORE: 11
} as const;

function getClosePriceInCandle(candle: Candle) {
    return parseFloat(candle[CANDLE_DATA_INDEX.CLOSE]);
}

function calcSimpleMovingAverage(candles: Candle[]) {
    const closes = candles.map(candle => getClosePriceInCandle(candle))
    const sum = closes.reduce((a,b) => a + b)

    return sum / candles.length;
}

async function start() {
    const responseData = await fetch(`${BINANCE_API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`)
    const responseBody = await responseData.json();

    const candle = responseBody[responseBody.length - 1];

    const price = getClosePriceInCandle(candle);

    console.clear()
    console.log(price);

    const simpleMovingAverage = calcSimpleMovingAverage(responseBody);
    // const simpleMovingAverageIn21Periods = calcSimpleMovingAverage(responseBody);
    // const simpleMovingAverageIn13Periods = calcSimpleMovingAverage(responseBody.slice(8));
    console.log("SMA", simpleMovingAverage);
    // console.log("SMA (13):", simpleMovingAverageIn13Periods);
    // console.log("SMA (21):", simpleMovingAverageIn21Periods);
    console.log("Is Opened:", isOpened);

    // if (simpleMovingAverageIn13Periods > simpleMovingAverageIn21Periods && !isOpened) {
    if (price <= (simpleMovingAverage * 0.9) && !isOpened) {
        isOpened = true;

        newOrder(SYMBOL, QUANTITY, "buy");
    }
    // else if (simpleMovingAverageIn13Periods < simpleMovingAverageIn21Periods && isOpened) {
    else if (price >= (simpleMovingAverage * 1.1) && isOpened) {
        isOpened = false;

        newOrder(SYMBOL, QUANTITY, "sell");
    }
    else {
        console.log("wait")
    }
}

async function newOrder(symbol: string, quantity: string, side: OrderSide) {
    const order: Partial<Order> = { symbol, quantity, side, type: "MARKET", timestamp: Date.now().toString() };

    const signature = crypto
        .createHmac("sha256", BINANCE_SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest("hex");

    order.signature = signature;

    try {
        const response = await fetch(`${BINANCE_API_URL}/api/v3/order?${new URLSearchParams(order).toString()}`, {
            method: "POST",
            headers: {
                "X-MBX-APIKEY": BINANCE_API_KEY
            }
        })
        const responseData = await response.json();

        console.log({responseData})
        console.log({responseDataFills: responseData.fills})
    } catch (error) {
        console.log(error);
    }
}

setInterval(() => {
    start();
}, 3000);