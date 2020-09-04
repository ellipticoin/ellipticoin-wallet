import { Address, SYSTEM_ADDRESS } from "ec-client";
import { ethTokenId, tokenId } from "./helpers";

import base64url from "base64url";

export const BASE_FACTOR = 1000000;
export const PROD = process.env.NODE_ENV === "production";
export const ETH_BRIDGE_ADDRESS = PROD
  ? "0x529264cc9847aa6502b426f2731a8097d99f3c6e"
  : "0xBc95C422Df85a5DF2C211D32d55d8E22b34226B7";
export const BRIDGE_ADDRESS = Address.newPublicKey(
  base64url.toBuffer("OaKmwCWrUhdCCsIMN_ViVcu1uBF0VM3FW3Mi1z_VTNs")
);
export const ELLIPTICOIN_CONTRACT = Address.newContract(
  SYSTEM_ADDRESS,
  "Ellipticoin"
);
export const NATIVE_TOKEN = {
  ticker: "ELC",
  name: "Ellipticoin",
  price: 0.5 * BASE_FACTOR,
  issuer: ELLIPTICOIN_CONTRACT,
  id: tokenId("ELC"),
};
export const BRIDGE_TOKENS = false //PROD
  ? [
      {
        ticker: "DAI",
        name: "DAI",
        address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("6b175474e89094c44da98b954eedeac495271d0f"),
      },
      {
        ticker: "REN",
        name: "Ren",
        address: "0x408e41876cccdc0f92210600ef50372656052a38",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("408e41876cccdc0f92210600ef50372656052a38"),
      },
      {
        ticker: "Kyber",
        name: "Kyber",
        address: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("dd974d5c2e2928dea5f71b9825b8b646686bd200"),
      },
      {
        ticker: "LINK",
        name: "ChainLink",
        address: "0x514910771af9ca656af840dff83e8264ecf986ca",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("514910771af9ca656af840dff83e8264ecf986ca"),
      },
      {
        ticker: "LEND",
        name: "Aave",
        address: "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("80fB784B7eD66730e8b1DBd9820aFD29931aab03"),
      },
      {
        ticker: "LRC",
        name: "Loopring",
        address: "0xEF68e7C694F40c8202821eDF525dE3782458639f",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("EF68e7C694F40c8202821eDF525dE3782458639f"),
      },
      {
        ticker: "SNX",
        name: "Synthetix",
        address: "0xc011a72400e58ecd99ee497cf89e3775d4bd732f",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("c011a72400e58ecd99ee497cf89e3775d4bd732f"),
      },
      {
        ticker: "renBTC",
        name: "renBTC",
        address: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("eb4c2781e4eba804ce9a9803c67d0893436bb27d"),
      },
      {
        ticker: "COMP",
        name: "Compound",
        address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("0xc00e94cb662c3520282e6f5717214004a7f26888"),
      },
    ]
  : [
      {
        ticker: "USD",
        name: "USD",
        address: "0x4748b2e6DB310512Ff9085E533b6C4151ff10746",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("4748b2e6DB310512Ff9085E533b6C4151ff10746"),
      },
      {
        ticker: "BTC",
        name: "Bitcoin",
        address: "0xd617a7861A15372fEb23C40A155806671918c870",
        price: 11354900000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("d617a7861A15372fEb23C40A155806671918c870"),
      },
      {
        ticker: "ETH",
        name: "Ethereum",
        address: "0x59a9eec95f353212444136355ad0bf7e7677b8cd",
        price: 380830000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("59a9eec95f353212444136355ad0bf7e7677b8cd"),
      },
    ];
export const TOKENS = [NATIVE_TOKEN, ...BRIDGE_TOKENS];
