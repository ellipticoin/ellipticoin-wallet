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

export function Value({ children, token }) {
  const { cDAIExchangeRate } = useContext(CompoundContext);
  if (token && isCompoundToken(token)) {
    if (!cDAIExchangeRate) return null;
    return formatBigInt(children, cDAIExchangeRate);
  } else {
    return formatBigInt(children);
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
