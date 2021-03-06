import base64url from "base64url";
import { BigInt } from "jsbi";

export const BASE_FACTOR = 1000000n;
export const BLOCKS_PER_ERA = 8000000n;
export const NUMBER_OF_ERAS = 8n;
export const NETWORK_ID = 1_793_045_504; // hello-world-0
export const PROD = process.env.NODE_ENV === "production";
export const ETH_BRIDGE_ADDRESS = "0x861B3289E2432138324aB593090E0805f9337DAe";
export const LIQUIDITY_FEE = 3000n;
export const ZERO = 0n;
export const BRIDGE_ADDRESS = base64url.toBuffer(
  "OaKmwCWrUhdCCsIMN_ViVcu1uBF0VM3FW3Mi1z_VTNs"
);
export const BOOTNODES = PROD
  ? ["davenport.ellipticoin.org"]
  : ["localhost:8080"];
export const ELC = {
  ticker: "ELC",
  name: "Ellipticoin",
  issuer: "Ellipticoin",
  id: Buffer.from("ELC", "utf8").toString("base64"),
  balance: 0n,
  totalSupply: 0n,
};
export const WETH = {
  ticker: "ETH",
  ethName: "Ether",
  name: "Ethereum",
  // address: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
  address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  issuer: "Bridge",
  // id: Buffer.from("d0a1e359811322d97991e03f863a0c30c2cf029c", "hex").toString(
  id: Buffer.from("c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "hex").toString(
    "base64"
  ),
  balance: 0n,
  totalSupply: 0n,
};
export const BTC = {
  ticker: "BTC",
  name: "Bitcoin",
  ethName: "renBTC",
  address: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  issuer: "Bridge",
  id: Buffer.from("eb4c2781e4eba804ce9a9803c67d0893436bb27d", "hex").toString(
    "base64"
  ),
  balance: 0n,
  totalSupply: 0n,
};
export const USD = {
  ticker: "USD",
  name: "USD",
  ethName: "DAI",
  // address: "0x4748b2e6db310512ff9085e533b6c4151ff10746",
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  issuer: "Bridge",
  // id: Buffer.from("4748b2e6db310512ff9085e533b6c4151ff10746", "hex").toString(
  id: Buffer.from("6b175474e89094c44da98b954eedeac495271d0f", "hex").toString(
    "base64"
  ),
  balance: 0n,
  totalSupply: 0n,
};
export const LIQUIDITY_TOKENS = [BTC, ELC, WETH];
export const BRIDGE_TOKENS = [WETH, BTC, USD];
export const TOKENS = [ELC, WETH, BTC, USD];
