import { BASE_FACTOR } from "./constants";
import ethers from "ethers";
import { useState } from "react";

export function stringToEthers(string) {
  return parseEther((parseFloat(string) || 0).toString());
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

export function ethTokenId(address) {
  return Array.from(padBuffer(Buffer.from(address, "hex"), 32));
}

export function tokenToString({ issuer, id }) {
  if (issuer.length === 2) {
    return `${Buffer.concat([
      issuer[0].toBuffer(),
      Buffer.from(issuer[1]),
    ]).toString("base64")}:${Buffer.from(id).toString("base64")}`;
  } else {
    return `${issuer}:${Buffer.from(id).toString(
      "base64"
    )}`;
  }
}

export function sharedWorker(worker) {
  const blob = new Blob([`(${worker.toString()})()`], {
    type: "application/javascript",
  });
  return new SharedWorker(URL.createObjectURL(blob));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD", // CNY for Chinese Yen, EUR for Euro
    minimumFractionDigits: 2,
    currencyDisplay: "symbol",
  })
    .format(amount / BASE_FACTOR)
    .replace(/^(\D+)/, "$1 ");
}

export function formatTokenBalance(amount) {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 6,
  })
    .format(amount / BASE_FACTOR)
    .replace(/^(\D+)/, "$1 ");
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    } else {
      const value =
        initialValue instanceof Function ? initialValue() : initialValue;
      window.localStorage.setItem(key, JSON.stringify(value));
      return value;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const { parseEther } = ethers.utils;
