import { default as React, useEffect, useState, useMemo } from "react";

import Actions from "./Actions";
import Balances from "./Balances";
import Bridge from "./Bridge";
import { Buffer } from "buffer/";
import { Client as ECClient } from "ec-client";
import Header from "./Header";
import PendingTransactions from "./PendingTransactions";
import Rewards from "./Rewards";
import Send from "./Send";
import Sidebar from "./Sidebar";
import { BRIDGE_TOKENS, NATIVE_TOKEN } from "./constants.js";
import { Token } from "ec-client";
import YourAddress from "./YourAddress";
import Loader from "./Loader";
import { useLocalStorage } from "./helpers";
import { default as ethers } from "ethers";
import nacl from "tweetnacl";

export default function App() {
  const [blockHash, setBlockHash] = useState();
  const [publicKey, setPublicKey] = useState();
  const [ellipticoin, setEllipticoin] = useState();
  const [signer, setSigner] = useState();
  const [tokens, setTokens] = useState([]);
  const [secretKey, setSecretKey] = useLocalStorage("secretKey", () => {
    const keyPair = nacl.sign.keyPair();
    return Array.from(keyPair.secretKey);
  });
  React.useEffect(() => {
    let source;

    source = new EventSource("http://159.89.83.21/");
    source.addEventListener("block", async (event) => {
      setBlockHash(event.data);
    });
    if (secretKey) {
      setEllipticoin(
        process.env.NODE_ENV === "production"
          ? new ECClient({
              networkId: 3750925312,
              bootnodes: ["http://159.89.83.21"],
              privateKey: Uint8Array.from(secretKey),
            })
          : new ECClient({
              networkId: 3750925312,
              privateKey: Uint8Array.from(secretKey),
              bootnodes: ["http://159.89.83.21"],
              // bootnodes: ["http://52.73.131.11:80"],
            })
      );
    }
  }, [secretKey]);

  React.useEffect(() => {}, [blockHash]);
  React.useEffect(() => {
    if (secretKey) {
      let keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
      setPublicKey(Array.from(keyPair.publicKey));
    }
  }, [secretKey]);

  React.useEffect(() => {
    (async () => {
      let ethereum = window.ethereum;
      if (!ethereum) return;

      await ethereum.enable();

      let provider = new ethers.providers.Web3Provider(
        window.web3.currentProvider
      );
      setSigner(await provider.getSigner());
      window.ethereum.on("accountsChanged", async (accounts) => {
        setSigner(await provider.getSigner());
      });
    })();
  }, [setSigner]);

  useEffect(() => {
    (async () => {
      if (!publicKey || !ellipticoin) {
        return;
      }
      let tokens = await Promise.all(
        [NATIVE_TOKEN, ...BRIDGE_TOKENS].map(async (token) => {
          const tokenContract = new Token(ellipticoin, token.issuer, token.id);
          const balance = await tokenContract.getBalance(publicKey);
          return {
            balance,
            ...token,
          };
        })
      );
      setTokens(tokens);
    })();
  }, [publicKey, ellipticoin, blockHash]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const loading = useMemo(() => !(tokens[0] && tokens[0].balance), [tokens]);

  if (!publicKey) return null;
  return (
    <>
      <Loader loading={loading} />
      <Header
        setShowSidebar={setShowSidebar}
        publicKey={publicKey}
        setSecretKey={setSecretKey}
      />
      <div id="appCapsule">
        <Actions
          balance={
            tokens.length ? tokens[0].balance * (tokens[0].price / 10000) : 0
          }
          setShowModal={setShowModal}
        />
        <YourAddress publicKey={publicKey} />
        <Rewards />
        <Balances tokens={tokens} />
      </div>
      <PendingTransactions
        pendingTransactions={pendingTransactions}
        setPendingTransactions={setPendingTransactions}
      />
      <Send
        setShow={(show) => (show ? setShowModal("send") : setShowModal(null))}
        show={showModal === "send"}
        ellipticoin={ellipticoin}
        setBalance={(balance) => {
          tokens[0] = {
            ...tokens[0],
            balance,
          };
          console.log(tokens[0]);
          setTokens(tokens);
        }}
      />
      <Bridge
        show={showModal === "bridge"}
        onHide={() => setShowModal(null)}
        ellipticoin={ellipticoin}
        signer={signer}
        pushPendingTransation={(tx) =>
          setPendingTransactions([...pendingTransactions, tx])
        }
        publicKey={publicKey}
        setBalance={(balance) => {
          tokens[0] = {
            ...tokens[0],
            balance,
          };
          console.log(tokens[0]);
          setTokens(tokens);
        }}
        tokens={tokens}
      />
      <Sidebar
        setShowSidebar={setShowSidebar}
        showSidebar={showSidebar}
        publicKey={publicKey}
        secretKey={secretKey}
        setSecretKey={setSecretKey}
      />
    </>
  );
}
