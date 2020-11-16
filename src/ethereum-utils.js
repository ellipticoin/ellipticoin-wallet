import { promisify } from "es6-promisify";
import Web3 from "web3";

export async function getAccounts() {
  return window.web3.eth.getAccounts();
}
export async function signUnlock(ellipticoinAddress) {
  const sendAsync = promisify(window.web3.currentProvider.sendAsync);
  const Unlock = [
    { name: "action", type: "string" },
    { name: "ellipticoin_address", type: "string" },
  ];

  const message = {
    action: "unlock",
    ellipticoin_address: ellipticoinAddress,
  };
  const data = JSON.stringify({
    types: {
      EIP712Domain: [{ name: "name", type: "string" }],
      Unlock,
    },
    domain: { name: "Ellipticoin" },
    primaryType: "Unlock",
    message,
  });
  let [signer] = await window.web3.eth.getAccounts();
  let { result } = await sendAsync({
    method: "eth_signTypedData_v3",
    params: [signer, data],
    from: signer,
  });
  const signature = result.substring(2);
  const r = Buffer.from(signature.substring(0, 64), "hex");
  const s = Buffer.from(signature.substring(64, 128), "hex");
  const v = parseInt(signature.substring(128, 130), 16);
  return [v, r, s];
}

export async function setupWeb3() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.autoRefreshOnNetworkChange = false;
    try {
      await window.ethereum.enable();
    } catch (error) {
      console.log(error);
    }
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
  }
}
