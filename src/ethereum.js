import { useState, useEffect, useMemo } from "react";
import { BASE_FACTOR } from "./constants";
import { ethers } from "ethers";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";

const { hexlify, parseUnits } = ethers.utils;

export function useEthereumAccounts() {
  const [ethereumAccounts, setEthereumAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    if (window.ethereum) {
      setEthereumAccounts(await ethereum.request({ method: "eth_accounts" }));
      window.ethereum.on("accountsChanged", setEthereumAccounts);
    }

    setLoading(false);
  }, []);
  return [loading, ethereumAccounts];
}

export async function sendETH({ to, value }) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const tx = await signer.sendTransaction({
    to: await signer.resolveName(to),
    value: parseUnits((Number(value) / Number(BASE_FACTOR)).toString(), 18),
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
    parseUnits((Number(value) / Number(BASE_FACTOR)).toString(), decimals)
  );
  return tx.wait();
}

export async function ethRequestAccounts() {
  return ethereum.request({ method: "eth_requestAccounts" });
}
