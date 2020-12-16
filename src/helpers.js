import {
  BASE_FACTOR,
  BLOCKS_PER_ERA,
  BRIDGE_TOKENS,
  ELC,
  NETWORK_ID,
  NUMBER_OF_ERAS,
} from "./constants";
import Ed25519Signer from "./cose/Ed25519Signer";
import cbor from "cbor";
import ethers from "ethers";
import { saveAs } from "file-saver";
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
const PROTOTYPE_ISSUANCE = 130036019000;
const FIRST_ERA_ISSUANCE_PER_BLOCK = (BASE_FACTOR * 128) / 100;
const LAST_BLOCK_OF_FIRST_ERA =
  BLOCKS_PER_ERA * FIRST_ERA_ISSUANCE_PER_BLOCK -
  PROTOTYPE_ISSUANCE / FIRST_ERA_ISSUANCE_PER_BLOCK;
export function blockReward(blockNumber) {
  if (blockNumber > BLOCKS_PER_ERA * NUMBER_OF_ERAS) {
    return 0;
  }

  if (blockNumber <= LAST_BLOCK_OF_FIRST_ERA) {
    return FIRST_ERA_ISSUANCE_PER_BLOCK / BASE_FACTOR;
  }

  const era =
    Math.floor(blockNumber - LAST_BLOCK_OF_FIRST_ERA / BLOCKS_PER_ERA) + 1;
  return (1.28 * BASE_FACTOR) / 2 ** era / BASE_FACTOR;
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
  if (isNaN(amount)) {
    amount = 0;
  }
  return `${(amount * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function formatCurrency(amount) {
  if (isNaN(amount)) {
    amount = 0;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  })
    .format(BigInt(Math.floor(amount * 100)) / BASE_FACTOR / 100)
    .replace(/^(\D+)/, "$1 ");
}

export function formatTokenBalance(amount) {
  if (!amount) return 0;

  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 6,
  })
    .format(BigInt(Math.floor(amount * BASE_FACTOR)) / BASE_FACTOR / BASE_FACTOR)
    .replace(/^(\D+)/, "$1 ");
}

export function formatTokenExchangeRate(amount, maxPlaces = 10, sigFigs = 6) {
  if (!amount) return 0;

  // No decimal
  if (amount - Math.floor(amount) === 0) {
    const figs = amount.toString().length;
    return figs >= sigFigs ? amount : amount.toFixed(sigFigs - figs);
  }

  if (amount > 1) {
    const sigFigsBefore = Math.floor(amount).toString().length;
    return amount.toFixed(
      sigFigsBefore > sigFigs ? 2 : Math.max(2, sigFigs - sigFigsBefore)
    );
  }

  let places = 0;
  let tempAmount = amount;
  while (tempAmount < 1) {
    tempAmount *= 10;
    places++;
  }
  return amount.toFixed(Math.min(maxPlaces, places + sigFigs - 1));
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

export function tokenTicker(token) {
  return get(
    find(
      [ELC, ...BRIDGE_TOKENS],
      ({ issuer, id }) =>
        issuer === token.issuer && id.toString("base64") === token.id
    ),
    "ticker"
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

export function downloadSecretKey(secretKey, noConfirm) {
  if (!noConfirm) {
    // eslint-disable-next-line no-restricted-globals
    let res = confirm(
      "You will be asked to download your private key to prevent loss of funds."
    );
    if (!res) {
      return false;
    }
  }

  let blob = new Blob([Buffer.from(secretKey).toString("base64")], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, "ellipticoin-private-key.txt");
  return true;
}
