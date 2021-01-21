import {
  BASE_FACTOR,
  BLOCKS_PER_ERA,
  BRIDGE_TOKENS,
  TOKENS,
  MNS,
  USD,
  TOKEN_METADATA,
  NETWORK_ID,
  NUMBER_OF_ERAS,
} from "./constants";
import Ed25519Signer from "./cose/Ed25519Signer";
import Sign1 from "./cose/Sign1";
import CBOR from "cbor";
import { ethers } from "ethers";
import { saveAs } from "file-saver";
import { find, get, sumBy } from "lodash";
import { useState } from "react";
import nacl from "tweetnacl";

const { arrayify } = ethers.utils;

export function parseUnits(value, units) {
  try {
    return ethers.utils.parseUnits(value, units);
  } catch {
    return ethers.utils.parseUnits("0");
  }
}
export function signTransaction(transaction, secretKey) {
  return sign(
    CBOR.encode({ ...transaction, network_id: NETWORK_ID }),
    secretKey
  );
}
export function sign(message, secretKey) {
  const { publicKey } = nacl.sign.keyPair.fromSecretKey(secretKey);
  const signer = new Ed25519Signer(publicKey, secretKey);
  return CBOR.encode(signer.sign(Buffer.from(message)));
}

export function encodeAddress(address) {
  if (address.startsWith("0x")) {
    return Array.from(arrayify(address));
  } else {
    return Array.from(Buffer.from(address, "base64"));
  }
}
export function padBuffer(buffer, len) {
  return Buffer.concat([
    buffer,
    Buffer.from(Array(len - buffer.length).fill(0)),
  ]);
}

export function tokenToString({ id }) {
  return id;
}

export function encodeToken(token) {
  return [encodeAddress(token.issuer), Buffer(token.id, "base64")];
}

export function Percentage({ numerator, denomiator }) {
  if (numerator === 0n) return (0).toFixed(4);
  return `${(Number(numerator * 100n) / Number(denomiator)).toFixed(4)}%`;
}

export function Value({ children, token }) {
  return (
    <>
      {token && token.address === USD.address ? "$ " : null}
      {children === 0n ? "0" : formatBigInt(children)}
      {token ? ` ${TOKEN_METADATA[token.address].ticker}` : null}
    </>
  );
}

function formatBigInt(n) {
  const [number, decimal] = (Number(n) / Number(BASE_FACTOR))
    .toFixed(6)
    .toString()
    .split(".");
  return `${numberWithCommas(number)}.${decimal}`;
}

function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function bigIntToNumber(n) {
  return Number(n) / Number(BASE_FACTOR);
}

export function USDValue({ children }) {
  if (children !== 0n && children < BASE_FACTOR) {
    return `$ ${formatBigInt(children)} USD`;
  } else {
    return `$ ${bigIntToNumber(children).toFixed(2)} USD`;
  }
}

export function tokenTicker(token) {
  return get(
    find(
      [MNS, ...BRIDGE_TOKENS],
      ({ issuer, id }) =>
        issuer === token.issuer && id.toString("base64") === token.id
    ),
    "ticker"
  );
}

export function stringToBigInt(string) {
  const [integerValue, decimaValue = "0"] = string.split(".");
  return (
    BigInt(integerValue) * BASE_FACTOR +
    BigInt(decimaValue.padEnd(BASE_FACTOR.toString().length - 1, "0"))
  );
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      return CBOR.decode(Buffer.from(item, "base64"));
    } else {
      const value =
        initialValue instanceof Function ? initialValue() : initialValue;
      window.localStorage.setItem(key, CBOR.encode(value).toString("base64"));
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
        CBOR.encode(valueToStore).toString("base64")
      );
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export function concatTypedArrays(arrays) {
  var result = new arrays[0].constructor(sumBy(arrays, "length"));
  var index = 0;
  for (var array of arrays) {
    result.set(array, index);
    index += array.length;
  }
  return result;
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
