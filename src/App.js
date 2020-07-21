import React from "react";
import {default as ethers} from "ethers";
import cbor from "borc";
import { setupWeb3 } from "./ethereum-utils.js";
import nacl from "tweetnacl";
import { Buffer } from "buffer/";
import {padBuffer} from "./helpers";
import Wallet from "./Wallet";
import { Client as ECClient } from "ec-client";
import _ from "lodash";

export default function App() {
  const [balance, setBalance] = React.useState();
  const [sendAmount, setSendAmount] = React.useState(
    // "1"
    ""
  );
  const [toAddress, setToAddress] = React.useState(
    // "jLs9_OvUYqOzGiTzVcRLB3laE3Hp8CZIpdRB5lqrSew"
    // "JZoYzwPNn_k82INoA-auebXqRvZwBWiqYUKLMWUpXCQ"
    ""
  );
  const [publicKey, setPublicKey] = React.useState();
  const [secretKey, setSecretKey] = React.useState(() => {
    if (localStorage.getItem("secretKey")) {
      return Buffer.from(JSON.parse(localStorage.getItem("secretKey")));
    }
  });
  const [ellipticoin, setEllipticoin] = React.useState();
  const [signer, setSigner] = React.useState();
  const setEthereumAccount = React.useState()[1];
  React.useEffect(() => {
    if (secretKey) {
      setEllipticoin(
        process.env.NODE_ENV === "production"
          ? new ECClient({
              privateKey: Uint8Array.from(secretKey),
            })
          : new ECClient({
              networkId: 3750925312,
              privateKey: Uint8Array.from(secretKey),
              bootnodes: ["http://localhost:8080"],
              // bootnodes: ["http://52.73.131.11:80"],
            })
      );
    }
  }, [secretKey]);
  React.useEffect(() => {
    if (secretKey) {
      let keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
      setPublicKey(Array.from(keyPair.publicKey));
    }
  }, [secretKey]);

  React.useEffect(() => {
    (async () => {
      if (!secretKey || !ellipticoin) {
        return;
      }
      const interval = setInterval(async () => {
        const keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
        setBalance(await getBalance(ellipticoin, keyPair.publicKey));
      }, 1000);

      const keyPair = nacl.sign.keyPair.fromSecretKey(
        Buffer.from(ellipticoin.privateKey)
      );
      setBalance(await getBalance(ellipticoin, keyPair.publicKey));

      return () => {
        clearInterval(interval);
      };
    })();
  }, [secretKey, ellipticoin]);
  React.useEffect(() => {
    (async () => {
      await setupWeb3();
      if (!window.web3) {
        return;
      }
      let accounts = await window.web3.eth.getAccounts();
      if (accounts.length) {
        setEthereumAccount(accounts[0]);
      }
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length) {
          setEthereumAccount(accounts[0]);
        }
      });
    })();
  }, [setEthereumAccount]);

  React.useEffect(() => {
    (async () => {
      let ethereum = window.ethereum;

      await ethereum.enable();

      let provider = new ethers.providers.Web3Provider(
        window.web3.currentProvider
      );
      setSigner(await provider.getSigner());
    })();
  }, [setSigner]);

  var blocksSocket = new WebSocket(`ws://localhost:81/websocket`);
  blocksSocket.binaryType = "arraybuffer";
  blocksSocket.onerror = console.log;
  blocksSocket.onmessage = ({ data }) => {
    cbor.decode(Buffer.from(data)).transactions.forEach((transaction) => {
    switch(transaction.function) {
        case "mint":
            if (_.isEqual(transaction.arguments[1], publicKey)) {
            }
        break;
        default:
        break;
    }})
  };
  blocksSocket.onclose = ({ code }) =>
    console.log(`WebSocket disconnect code: ${code}`);

  // Heartbeat
  // https://stackoverflow.com/a/46112000/1356670
  setInterval(() => blocksSocket.send(new ArrayBuffer([])), 30000);

  const getBalance = async (ellipticoin, address) => {
    return (
      (await ellipticoin.getMemory(
        new Buffer(32),
        "Ellipticoin",
        Buffer.concat([new Buffer([1]), Buffer.from(address)])
      )) || 0
    );
  };

  const getTokenBalance = async (ellipticoin, issuer, token, address) => {
    return (
      (await ellipticoin.getMemory(
        new Buffer(32),
        "Token",
        Buffer.concat([
            new Buffer([1]),
            Buffer.from(issuer),
            padBuffer(token, 32),
            Buffer.from(address)
            ]
)
      ))
    );
  };
    (async () => {
if (ellipticoin) {
  console.log(await getTokenBalance(
    ellipticoin,
    Buffer.from("OaKmwCWrUhdCCsIMN/ViVcu1uBF0VM3FW3Mi1z/VTNs=", "base64"),
    Buffer.from("FDAI", "utf8"),
    publicKey,
    ))
}
})();


  const createWallet = () => {
    const keyPair = nacl.sign.keyPair();
    localStorage.setItem(
      "secretKey",
      JSON.stringify(Array.from(keyPair.secretKey))
    );
    setSecretKey(Array.from(keyPair.secretKey));
    setPublicKey(Array.from(keyPair.publicKey));
  };

  return (
    <div>
      {!window.localStorage.getItem("hideWarning") ? <></> : null}
      <Wallet
        {...{
          secretKey,
          toAddress,
          sendAmount,
          setBalance,
          setToAddress,
          setSendAmount,
          ellipticoin,
          balance,
          signer,
          publicKey,
          createWallet,
          setSecretKey,
        }}
      />
    </div>
  );
}
