import {  Exchange } from "ec-client";
import base64url from "base64url";
export const BASE_FACTOR = 1000000;
export const PROD = process.env.NODE_ENV === "production";
export const ETH_BRIDGE_ADDRESS = "0x4085B42AB99A5c64D09d074b8315173FD32CCcDe";
export const BRIDGE_ADDRESS = base64url.toBuffer("OaKmwCWrUhdCCsIMN_ViVcu1uBF0VM3FW3Mi1z_VTNs");
export const NATIVE_TOKEN = {
  ticker: "ELC",
  name: "Ellipticoin",
  issuer: "Ellipticoin",
  id: Buffer.from("ELC", "utf8"),
};
export const WETH = {
    ticker: "ETH",
    ethName: "Ether",
    name: "Ethereum",
    address: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
    issuer: "Bridge",
    id: Exchange.ethTokenId("eb4c2781e4eba804ce9a9803c67d0893436bb27d"),
}
export const BRIDGE_TOKENS = [
  {
    ticker: "USD",
    name: "USD",
    ethName: "DAI",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    issuer: "Bridge",
    id: Exchange.ethTokenId("6b175474e89094c44da98b954eedeac495271d0f"),
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    ethName: "renBTC",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    issuer: "Bridge",
    id: Exchange.ethTokenId("c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
  },
  WETH,
];
export const TOKENS = [NATIVE_TOKEN, ...BRIDGE_TOKENS];
