import { useState, createContext, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { USD } from "./constants";
import Compound from "@compound-finance/compound-js";

const { hexlify, getAddress } = ethers.utils;
// const {address} = constants;
console.log(Compound.address);
const CompoundContext = createContext();
// const CDAI = "0x6d7f0754ffeb405d23c51ce938289d4835be3b14";
const CDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
const COMPOUND_TOKENS = [CDAI];
export function useCompoundContext(dependencies) {
  const [context, setContext] = useState({});
  useEffect(async () => {
    if (!window.ethereum) return

    // const signer = new ethers.providers.Web3Provider(
    //   window.ethereum
    // ).getSigner();
    // const cToken = new ethers.Contract(
    //   CDAI,
    //   [
    //     "function exchangeRateCurrent() view returns(uint256)",
    //     "function supplyRatePerBlock() constant view returns(uint256)",
    //   ],
    //   signer
    // );
    const network = Compound.util.getNetNameWithChainId(
      await ethereum.request({ method: "net_version" })
    );
    const CDAI = Compound.util.getAddress(Compound.cDAI, network);
    let exchangeRateCurrent = await Compound.eth.read(
      CDAI,
      "function exchangeRateCurrent() returns (uint)",
      [],
      { provider: window.ethereum } 
    );
    let supplyRatePerBlock = await Compound.eth.read(
      CDAI,
      "function supplyRatePerBlock() constant view returns(uint256)",
      [],
      { provider: window.ethereum } 
    );
    const mantissa = 28;
    const cDAIExchangeRate = exchangeRateCurrent / Math.pow(10, mantissa);
    const ethMantissa = 10 ** 18;
    const blocksPerDay = 4 * 60 * 24;
    const daysPerYear = 365;

    const cDAIAPY =
      (((supplyRatePerBlock / ethMantissa) * blocksPerDay + 1) ** daysPerYear -
        1) *
      100;
    setContext({
      cDAIExchangeRate,
      cDAIAPY,
    });
  }, dependencies);
  return context;
}

export function interestRate(token) {
  const { cDAIAPY } = useContext(CompoundContext);
  if (token.address == USD.address) {
    return `${cDAIAPY.toFixed(2)}%`;
  }
}

export function isCompoundToken(token) {
  return COMPOUND_TOKENS.includes(
    getAddress(hexlify(Buffer.from(token.address, "base64")))
  );
}

export default CompoundContext;
