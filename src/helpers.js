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
import { useState, useEffect, useContext } from "react";

export function Percentage({ numerator, denominator }) {
  if (numerator === 0n) return (0).toFixed(4);
  return `${(Number(numerator * 100n) / Number(denominator)).toFixed(4)}%`;
}

export function formatPercentage(n, options = { decimals: 4 }) {
  return `${(Number(n) / Number(BASE_FACTOR)).toFixed(options.decimals)}%`;
}

export function value(value, tokenAddress, options = {}) {
  const { decimals } = options;
  const number = Number(value) / Number(BASE_FACTOR);
  if (number === 0 && options.zeroString) return options.zeroString;
  if (options.showCurrency) {
    if (tokenAddress === USD.address) {
      return `$ ${formatNumber(number, { decimals })} USD`;
    } else {
      return `${formatNumber(number, { decimals })} ${
        TOKEN_METADATA[tokenAddress].ticker
      }`;
    }
  } else {
    return formatNumber(number, { decimals });
  }
}

function applyExchangeRate(n, options = { exchangeRate: 1 }) {
  return (Number(n) * options.exchangeRate) / Number(BASE_FACTOR);
}

function applyInverseExchangeRate(n, options = { exchangeRate: 1 }) {
  return Number(n) / options.exchangeRate / Number(BASE_FACTOR);
}

export function formatBigInt(n, options = {}) {
  return formatNumber(Number(n) / Number(BASE_FACTOR), options);
}
export function formatNumber(n, options = {}) {
  const decimals = n < 1 ? 6 : options.decimals || 6;

  const [number, decimal] = n.toFixed(decimals).toString().split(".");
  return `${numberWithCommas(number)}.${decimal}`;
}

export function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
