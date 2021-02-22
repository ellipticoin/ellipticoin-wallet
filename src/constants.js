import base64url from "base64url";
import { BigInt } from "jsbi";

export const BASE_FACTOR = 1000000n;
export const BLOCKS_PER_ERA = 8000000n;
export const NUMBER_OF_ERAS = 8n;
export const NETWORK_ID = 1;
export const PROD = process.env.NODE_ENV === "production";
export const LIQUIDITY_FEE = 3000n;
export const ZERO = 0n;
export const BOOTNODES = PROD
  ? ["battery.ellipticoin.org"]
  : ["localhost:8080"];
export const MNS = {
  ticker: "MNS",
  name: "Moonshine",
  address: Buffer.from(
    "0000000000000000000000000000000000000001",
    "hex"
  ).toString("base64"),
  balance: 0n,
  decimals: 6,
  totalSupply: 0n,
};
export const WETH = {
  ticker: "ETH",
  ethName: "Ether",
  name: "Ethereum",
  address: Buffer.from(
    "0000000000000000000000000000000000000000",
    "hex"
  ).toString("base64"),
  balance: 0n,
  decimals: 18,
  totalSupply: 0n,
};
export const BTC = {
  ticker: "BTC",
  name: "Bitcoin",
  ethName: "renBTC",
  issuer: "Bridge",
  address: Buffer.from(
    "eb4c2781e4eba804ce9a9803c67d0893436bb27d",
    // "804d9Dc7363593CcFeedbF685d76EE8f0fD844cC",
    "hex"
  ).toString("base64"),
  balance: 0n,
  decimals: 8,
  totalSupply: 0n,
};
export const USD = {
  ticker: "USD",
  name: "USD",
  ethName: "cDAI",
  address: Buffer.from(
    "5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    // "6d7f0754ffeb405d23c51ce938289d4835be3b14",
    "hex"
  ).toString("base64"),
  balance: 0n,
  decimals: 8,
  totalSupply: 0n,
};

export const LIQUIDITY_TOKENS = [BTC, MNS, WETH];
export const BRIDGE_TOKENS = [WETH, BTC, USD];
export const TOKENS = [MNS, WETH, BTC, USD];
export const TOKEN_METADATA = {
  [USD.address]: USD,
  [BTC.address]: BTC,
  [MNS.address]: MNS,
  [WETH.address]: WETH,
  [BTC.address]: BTC,
  [MNS.address]: MNS,
};
