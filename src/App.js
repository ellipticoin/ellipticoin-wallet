import { BRIDGE_TOKENS, NATIVE_TOKEN, PROD } from "./constants.js";
import { default as React, useEffect, useMemo, useState } from "react";

import Actions from "./Actions";
import { BASE_FACTOR } from "./constants";
import Balances from "./Balances";
import Bridge from "./Bridge";
import { Buffer } from "buffer/";
import { Client as ECClient } from "ec-client";
import Header from "./Header";
import Loader from "./Loader";
import PendingTransactions from "./PendingTransactions";
import Rewards from "./Rewards";
import Send from "./Send";
import ProvideLiquidity from "./ProvideLiquidity";
import Sidebar from "./Sidebar";
import { Token } from "ec-client";
import Total from "./Total";
import YourAddress from "./YourAddress";
import { default as ethers } from "ethers";
import nacl from "tweetnacl";
import { sumBy } from "lodash";
import { useLocalStorage } from "./helpers";

export default function App() {
  const [blockHash, setBlockHash] = useState();
  const [web3, setWeb3] = useState();
  const [ethBlockNumber, setEthBlockNumber] = useState();
  const [publicKey, setPublicKey] = useState();
  const [ellipticoin, setEllipticoin] = useState();
  const [signer, setSigner] = useState();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secretKey, setSecretKey] = useLocalStorage("secretKey", () => {
    const keyPair = nacl.sign.keyPair();
    return Array.from(keyPair.secretKey);
  });
  React.useEffect(() => {
    (async () => {
      let ethereum = window.ethereum;
      if (!ethereum) return;
      ethereum.autoRefreshOnNetworkChange = false;

      await ethereum.enable();

      setWeb3(window.web3);
    })();
  }, []);
  useEffect(() => {
    if (!ellipticoin) return;
    ellipticoin.addBlockListener((blockHash) => {
      setBlockHash(blockHash);
    });
    return () => ellipticoin.close();
  }, [ellipticoin]);

  React.useEffect(() => {
    if (!web3) return;
    (async () => {
      let provider = new ethers.providers.Web3Provider(web3.currentProvider);
      provider.on("block", (blockNumber) => {
        setEthBlockNumber(blockNumber);
      });
    })();
  }, [web3]);

  React.useEffect(() => {
    if (secretKey) {
      setEllipticoin(
        PROD
          ? new ECClient({
              privateKey: Uint8Array.from(secretKey),
            })
          : new ECClient({
              privateKey: Uint8Array.from(secretKey),
              bootnodes: ["http://127.0.0.1:8080"],
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
      if (!web3) return;
      let provider = new ethers.providers.Web3Provider(web3.currentProvider);
      setSigner(await provider.getSigner());
      window.ethereum.on("accountsChanged", async (accounts) => {
        setSigner(await provider.getSigner());
      });
    })();
  }, [web3]);

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
      setLoading(false);
    })();
  }, [publicKey, ellipticoin, blockHash]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const total = useMemo(
    () => sumBy(tokens, (token) => token.balance * (token.price / BASE_FACTOR)),
    [tokens]
  );

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
        <div className="section wallet-card-section pt-1">
          <div className="wallet-card">
            <Total total={total} />
            <Actions setShowModal={setShowModal} />
          </div>
        </div>
        <YourAddress publicKey={publicKey} />
        <Rewards />
        <Balances tokens={tokens} total={total} />
      </div>
      <PendingTransactions
        pendingTransactions={pendingTransactions}
        setPendingTransactions={setPendingTransactions}
        ethBlockNumber={ethBlockNumber}
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
          setTokens(tokens);
        }}
      />
      <ProvideLiquidity
        setShow={(show) =>
          show ? setShowModal("provideLiquidty") : setShowModal(null)
        }
        show={showModal === "provideLiquidty"}
        blockHash={blockHash}
        ellipticoin={ellipticoin}
        setBalance={(balance) => {
          tokens[0] = {
            ...tokens[0],
            balance,
          };
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
