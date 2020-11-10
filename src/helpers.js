import {
  BASE_FACTOR,
  BLOCKS_PER_ERA,
  BRIDGE_TOKENS,
  ELC,
  NUMBER_OF_ERAS,
  NETWORK_ID,
} from "./constants";
import Ed25519Signer from "./cose/Ed25519Signer";
import cbor from "cbor";
import ethers from "ethers";
import { BigInt } from "jsbi";
import { find, get } from "lodash";
import { useState } from "react";
import nacl from "tweetnacl";

export function parseUnits(value, units) {
  try {
    return ethers.utils.parseUnits(value, units);
  } catch {
    return ethers.utils.parseUnits("0");
  }
}
export function blockReward(blockNumber) {
  if (blockNumber > BLOCKS_PER_ERA * NUMBER_OF_ERAS) {
    return 0;
  }
  const era = Math.floor(blockNumber / BLOCKS_PER_ERA);
  return (1.28 * 10 ** 8) / 2 ** era / 10 ** 8;
}

export function signTransaction(transaction, secretKey) {
  return sign(
    cbor.encode({ ...transaction, network_id: NETWORK_ID }),
    secretKey
  );
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

export function formatTokenExchangeRate(amount, maxPlaces = 10, sigFigs = 6) {
  if (!amount) return 0;

  if (amount - Math.floor(amount) === 0) {
    const figs = amount.toString().length;
    return figs >= sigFigs ? amount : amount.toFixed(sigFigs - figs);
  }
  let places = 0;
  let tempAmount = amount;
  while (tempAmount < 1) {
    tempAmount *= 10;
    places++;
  }
  return amount.toFixed(
    places === 0 ? 2 : Math.min(maxPlaces, places + sigFigs - 1)
  );
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

export function excludeUsd(liquidityTokens) {
  return liquidityTokens.filter((t) => tokenName(t) !== "USD");
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
    .format(BigInt(Math.round(amount)) / BASE_FACTOR)
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
