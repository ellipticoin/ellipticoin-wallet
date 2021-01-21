import { useState, useEffect, useMemo } from "react";
import { parseUnits } from "./helpers";
import { ethers } from "ethers";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";

const { hexlify } = ethers.utils;

export function useEthereumAccounts() {
  const [accounts, setAccounts] = useState();
  useEffect(async () => {
    if (window.ethereum) {
      setAccounts(await ethereum.request({ method: "eth_accounts" }));
      window.ethereum.on("accountsChanged", setAccounts);
    }
  }, []);
  return accounts;
}

export async function sendETH({ to, value }) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const tx = await signer.sendTransaction({
    to: await signer.resolveName(to),
    value,
  });
  return tx.wait();
}

export async function sendTokens({ token, to, value }) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const tokenAddress = hexlify(Buffer.from(token, "base64"));
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20JSON.abi,
    signer
  );
  const decimals = await tokenContract.decimals();
  const tx = await tokenContract.transfer(
    to,
    parseUnits(value.toString(), decimals)
  );
  return tx.wait();
}

export async function ethRequestAccounts() {
  return ethereum.request({ method: "eth_requestAccounts" });
}
