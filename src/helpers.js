import {
  BASE_FACTOR,
  BLOCKS_PER_ERA,
  BRIDGE_TOKENS,
  ELC,
  NUMBER_OF_ERAS,
} from "./constants";
import { find, get } from "lodash";

import { BigInt } from "jsbi";
import Ed25519Signer from "./cose/Ed25519Signer";
import cbor from "cbor";
import ethers from "ethers";
import nacl from "tweetnacl";
import { useState } from "react";

export function stringToEthers(string) {
  return parseEther((parseFloat(string) || 0).toString());
}

export function blockReward(blockNumber) {
  if (blockNumber > BLOCKS_PER_ERA * NUMBER_OF_ERAS) {
    return 0;
  }
  const era = Math.floor(blockNumber / BLOCKS_PER_ERA);
  return (1.28 * 10 ** 8) / 2 ** era / 10 ** 8;
}

export function signTransaction(transaction, secretKey) {
  return sign(cbor.encode({ ...transaction, network_id: 0 }), secretKey);
}
export function sign(message, secretKey) {
  const { publicKey } = nacl.sign.keyPair.fromSecretKey(secretKey);
  const signer = new Ed25519Signer(publicKey, secretKey);
  return cbor.encode(signer.sign(Buffer.from(message)));
}

export function padBuffer(buffer, len) {
  return Buffer.concat([
    buffer,
    Buffer.from(Array(len - buffer.length).fill(0)),
  ]);
}

export function tokenId(ticker) {
  return Array.from(padBuffer(Buffer.from(ticker), 32));
}

// export function signTransaction(transaction, privateKey) {}

export function ethTokenId(address) {
  return Array.from(padBuffer(Buffer.from(address, "hex"), 32));
}

export function tokenToString({ id }) {
  return id;
}

export function encodeToken(token) {
  return [encodeAddress(token.issuer), Buffer(token.id, "base64")];
}

export function formatPercentage(amount) {
  if (isNaN(amount)) return;

  return `${((BigInt(amount) * 100) / BASE_FACTOR)
    .toFixed(2)
    .replace(/\.?0+$/, "")}%`;
}

export function formatCurrency(amount) {
  if (isNaN(amount)) return;

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  })
    .format(BigInt(Math.floor(amount)) / BASE_FACTOR)
    .replace(/^(\D+)/, "$1 ");
}

export function tokenName(token) {
  return get(
    find(
      [ELC, ...BRIDGE_TOKENS],
      ({ issuer, id }) =>
        issuer === token.issuer && id.toString("base64") === token.id
    ),
    "name"
  );
}

export function encodeAddress(address) {
  if (typeof address === "string") {
    return {
      Contract: address,
    };
  } else {
    return {
      PublicKey: address,
    };
  }
}

export function formatTokenBalance(amount) {
  if (!amount) return 0;

  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 6,
  })
    .format(BigInt(amount) / BASE_FACTOR)
    .replace(/^(\D+)/, "$1 ");
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      return cbor.decode(Buffer.from(item, "base64"));
    } else {
      const value =
        initialValue instanceof Function ? initialValue() : initialValue;
      window.localStorage.setItem(key, cbor.encode(value).toString("base64"));
      return value;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(
        key,
        cbor.encode(valueToStore).toString("base64")
      );
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const { parseEther } = ethers.utils;
