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
import { ethers } from "ethers";
import CompoundContext, {isCompoundToken} from "./CompoundContext";
import { find, get, sumBy } from "lodash";
import { useState, useEffect, useContext } from "react";
import cTokenAbi from "./contracts/cDAIABI.json";

const { arrayify } = ethers.utils;

export function Percentage({ numerator, denomiator }) {
  if (numerator === 0n) return (0).toFixed(4);
  return `${(Number(numerator * 100n) / Number(denomiator)).toFixed(4)}%`;
}

export function Value({ children, token }) {
  const {cDAIExchangeRate} = useContext(CompoundContext);
  if (token && isCompoundToken(token)) {
    if (!cDAIExchangeRate) return null
    return formatBigInt(children, cDAIExchangeRate)
  } else {
    return formatBigInt(children)
  }
}


function formatBigInt(n, exchangeRate = 1) {
  const [number, decimal] = ((Number(n) * exchangeRate) / Number(BASE_FACTOR))
    .toFixed(6)
    .toString()
    .split(".");
  return `${numberWithCommas(number)}.${decimal}`;
}

export function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function bigIntToNumber(n) {
  return Number(n) / Number(BASE_FACTOR);
}

export function USDValue({ children }) {
  const {cDAIExchangeRate} = useContext(CompoundContext);
  if (!cDAIExchangeRate) return null

  return `$ ${formatBigInt(children, cDAIExchangeRate)} USD`;
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
