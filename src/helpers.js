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

export function value2(value, tokenAddress, options = {}) {
  const { decimals } = options;
  let valueWithInterest;
  const { cDAIExchangeRate } = useContext(CompoundContext);
  return <>Hi</>;
  // const cDAIExchangeRate = options.cDAIExchangeRate || 1
  // if (tokenAddress && isCompoundToken(tokenAddress)) {
  //   if (!cDAIExchangeRate) return null;
  //   valueWithInterest = applyExchangeRate(value, {
  //     exchangeRate: cDAIExchangeRate,
  //   });
  // } else {
  //   valueWithInterest = applyExchangeRate(value);
  // }
  // if (valueWithInterest === 0 && options.zeroString) return options.zeroString;
  // if (options.showCurrency) {
  //   if (tokenAddress === USD.address) {
  //     return `$ ${formatNumber(valueWithInterest, { decimals })} USD`;
  //   } else {
  //     return `${formatNumber(valueWithInterest, { decimals })} ${
  //       TOKEN_METADATA[tokenAddress].ticker
  //     }`;
  //   }
  // } else {
  //   return formatNumber(valueWithInterest, { decimals });
  // }
}
export function value(value, tokenAddress, options = {}) {
  const { decimals } = options;
  let valueWithInterest;
  const { cDAIExchangeRate } = useContext(CompoundContext);
  // const cDAIExchangeRate = options.cDAIExchangeRate || 1
  if (tokenAddress && isCompoundToken(tokenAddress)) {
    if (!cDAIExchangeRate) return null;
    valueWithInterest = applyExchangeRate(value, {
      exchangeRate: cDAIExchangeRate,
    });
  } else {
    valueWithInterest = applyExchangeRate(value);
  }
  if (valueWithInterest === 0 && options.zeroString) return options.zeroString;
  if (options.showCurrency) {
    if (tokenAddress === USD.address) {
      return `$ ${formatNumber(valueWithInterest, { decimals })} USD`;
    } else {
      return `${formatNumber(valueWithInterest, { decimals })} ${
        TOKEN_METADATA[tokenAddress].ticker
      }`;
    }
  } else {
    return formatNumber(valueWithInterest, { decimals });
  }
}

function applyExchangeRate(n, options = { exchangeRate: 1 }) {
  return (Number(n) * options.exchangeRate) / Number(BASE_FACTOR);
}
function formatNumber(n, options = {}) {
  const decimals = n < 1 ? 6 : options.decimals || 6;

  const [number, decimal] = n.toFixed(decimals).toString().split(".");
  return `${numberWithCommas(number)}.${decimal}`;
}

export function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
