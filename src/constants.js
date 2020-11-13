import { BigInt } from "jsbi";
import base64url from "base64url";
export const BASE_FACTOR = BigInt(1000000);
export const BLOCKS_PER_ERA = 8000000;
export const NUMBER_OF_ERAS = 8;
export const NETWORK_ID = 1793045504; // hello-world-0
export const PROD = process.env.NODE_ENV === "production";
export const ETH_BRIDGE_ADDRESS = "0x861B3289E2432138324aB593090E0805f9337DAe";
//export const ETH_BRIDGE_ADDRESS = "0x30CB2293C7b138aF8C9A45589D4577C2Faf91732";
export const LIQUIDITY_FEE = BigInt(3000);
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
};
export const LIQUIDITY_TOKENS = [BTC, ELC, USD, WETH];
export const BRIDGE_TOKENS = [WETH, BTC, USD];
export const TOKENS = [ELC, WETH, BTC, USD];
