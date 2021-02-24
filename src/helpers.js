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
import CompoundContext, { isCompoundToken } from "./CompoundContext";
import { find, get, sumBy } from "lodash";
import { useState, useEffect, useContext } from "react";
import cTokenAbi from "./contracts/cDAIABI.json";

const { arrayify } = ethers.utils;

export function Percentage({ numerator, denomiator }) {
  if (numerator === 0n) return (0).toFixed(4);
  return `${(Number(numerator * 100n) / Number(denomiator)).toFixed(4)}%`;
}

export function price(value, token) {
  const { cDAIExchangeRate } = useContext(CompoundContext);
  if (token && isCompoundToken(token)) {
    if (!cDAIExchangeRate) return null;
    return formatBigInt(value);
  } else {
    return formatBigInt(value, cDAIExchangeRate);
  }
}

export function Price({ children, token }) {
  const { cDAIExchangeRate } = useContext(CompoundContext);
  if (token && isCompoundToken(token)) {
    if (!cDAIExchangeRate) return null;
    return formatBigInt(children);
  } else {
    return formatBigInt(children, cDAIExchangeRate);
  }
}

export function value(value, tokenAddress, options = {}) {
  const { cDAIExchangeRate } = useContext(CompoundContext);
  let formattedValue
  if (tokenAddress && isCompoundToken(tokenAddress)) {
    if (!cDAIExchangeRate) return null;
    formattedValue = formatBigInt(value, cDAIExchangeRate);
  } else {
    formattedValue = formatBigInt(value);
  }

  if (options.showCurrency) {
        if (tokenAddress === USD.address) {
            return `$ ${formattedValue} USD`
        } else {
            return `$ ${formattedValue} ${TOKEN_METADATA[tokenAddress].ticker}`
        }
    } else {
        return formattedValue
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
