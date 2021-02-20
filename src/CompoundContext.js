import {
  useState,
  createContext,
  useContext,
  useEffect
} from "react";
import { ethers } from "ethers";
import {USD} from "./constants";

const {hexlify} = ethers.utils;

const CompoundContext = createContext();
const CDAI = "0x6d7f0754ffeb405d23c51ce938289d4835be3b14"
const COMPOUND_TOKENS = [CDAI]
export function useCompoundContext(dependencies) {
    const [context, setContext] = useState({})
    useEffect(async () =>  {
    const signer = new ethers.providers.Web3Provider(
            window.ethereum
            ).getSigner();
    const cToken = new ethers.Contract(
            CDAI,
            [
            "function exchangeRateCurrent() view returns(uint256)",
            "function supplyRatePerBlock() constant view returns(uint256)",
            ],
            signer
            );
    const exchangeRateCurrent = await cToken.exchangeRateCurrent();
    console.log(exchangeRateCurrent.toString());
    const mantissa = 28;
    const cDAIExchangeRate= (exchangeRateCurrent / Math.pow(10, mantissa));
    const supplyRatePerBlock = await cToken.supplyRatePerBlock();
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
    })
    },dependencies);
    return context
}

export function interestRate(token) {
  const {cDAIAPY} = useContext(CompoundContext);
  if (token.address == USD.address) {
    return `${cDAIAPY.toFixed(2)}%`
  }
}

export function isCompoundToken(token) {
    return COMPOUND_TOKENS.includes(hexlify(Buffer.from(token.address, "base64")));
}

export default CompoundContext;
