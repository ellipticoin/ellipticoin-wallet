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
import { useState, useEffect, useContext } from "react";

export function Percentage({ numerator, denomiator }) {
  if (numerator === 0n) return (0).toFixed(4);
  return `${(Number(numerator * 100n) / Number(denomiator)).toFixed(4)}%`;
}

export function value(value, tokenAddress, options = {}) {
  const { decimals } = options;
  const { cDAIExchangeRate } = useContext(CompoundContext);
  let formattedValue;
  if (tokenAddress && isCompoundToken(tokenAddress)) {
    if (!cDAIExchangeRate) return null;
    formattedValue = formatBigInt(value, {
      exchangeRate: cDAIExchangeRate,
      decimals,
    });
  } else {
    formattedValue = formatBigInt(value, { exchangeRate: 1, decimals });
  }

  if (options.showCurrency) {
    if (tokenAddress === USD.address) {
      return `$ ${formattedValue} USD`;
    } else {
      return `$ ${formattedValue} ${TOKEN_METADATA[tokenAddress].ticker}`;
    }
  } else {
    return formattedValue;
  }
}

function formatBigInt(n, options = {}) {
  const numberAndDecimal =
    (Number(n) * options.exchangeRate) / Number(BASE_FACTOR);
  const decimals = numberAndDecimal < 1 ? 6 : options.decimals || 6;

  const [number, decimal] = numberAndDecimal
    .toFixed(decimals)
    .toString()
    .split(".");
  return `${numberWithCommas(number)}.${decimal}`;
}

export function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
