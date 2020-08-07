import { ethTokenId, padBuffer, tokenId } from "./helpers";

import { SYSTEM_ADDRESS } from "ec-client";
import base64url from "base64url";
export const PROD = process.env.NODE_ENV === "production";
const NETWORK_IDS = {
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  KOVAN: 42,
};

export const ETH_TOKENS = {
  [NETWORK_IDS["KOVAN"]]: {
    "Fake DAI": "0x4748b2e6DB310512Ff9085E533b6C4151ff10746",
  },
  [NETWORK_IDS["MAINNET"]]: {
    "Wrapped Ether": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    renBTC: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
    Compound: "0xc00e94cb662c3520282e6f5717214004a7f26888",
    Ren: "0x408e41876cccdc0f92210600ef50372656052a38",
    Synthetix: "0xc011a72400e58ecd99ee497cf89e3775d4bd732f",
    Loopring: "0xEF68e7C694F40c8202821eDF525dE3782458639f",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    Aave: "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03",
    ChainLink: "0x514910771af9ca656af840dff83e8264ecf986ca",
    Kyber: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
  },
};
export const BRIDGE_ADDRESS = Array.from(
  base64url.toBuffer("OaKmwCWrUhdCCsIMN_ViVcu1uBF0VM3FW3Mi1z_VTNs")
);
export const NATIVE_TOKEN = {
  ticker: "ELC",
  name: "Ellipticoin",
  price: 500000,
  issuer: [SYSTEM_ADDRESS, Buffer.from("Ellipticoin")],
  id: tokenId("ELC"),
};
export const BRIDGE_TOKENS = PROD
  ? [
      {
        ticker: "ELC",
        name: "Ellipticoin",
        price: 500000,
        issuer: SYSTEM_ADDRESS,
        id: padBuffer(Buffer.from("ELC"), 32),
      },
    ]
  : [
      {
        ticker: "FDAI",
        name: "Fake DAI",
        address: "0x4748b2e6DB310512Ff9085E533b6C4151ff10746",
        price: 1000000,
        issuer: BRIDGE_ADDRESS,
        id: ethTokenId("4748b2e6DB310512Ff9085E533b6C4151ff10746"),
      },
    ];
export const TOKENS = [NATIVE_TOKEN, ...BRIDGE_TOKENS];
