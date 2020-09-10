import { BRIDGE_TOKENS, NATIVE_TOKEN, PROD } from "./constants.js";
import { Client as ECClient, Ellipticoin } from "ec-client";
import { default as React, useEffect, useMemo, useState } from "react";

import Actions from "./Actions";
import { BASE_FACTOR } from "./constants";
import Balances from "./Balances";
import Bridge from "./Bridge";
import { Buffer } from "buffer/";
import Exchange from "./Exchange";
import Header from "./Header";
import Loader from "./Loader";
import ManageLiquidity from "./ManageLiquidity";
import PendingTransactions from "./PendingTransactions";
import Rewards from "./Rewards";
import Send from "./Send";
import Sidebar from "./Sidebar";
import { Token } from "ec-client";
import Total from "./Total";
import YourAddress from "./YourAddress";
import YourLiquidity from "./YourLiquidity";
import { default as ethers } from "ethers";
import nacl from "tweetnacl";
import { sumBy } from "lodash";
import { useLocalStorage } from "./helpers";

export async function fetchTokens(ec, publicKey) {
  return (
    await Promise.all(
      [NATIVE_TOKEN, ...BRIDGE_TOKENS].map(async (token) => {
        const tokenContract = new Token(ec, token.issuer, token.id);
        const balance = await tokenContract.getBalance(publicKey);
        const pool = await ec.getPool(token);
        return {
          balance,
          ...token,
          price: pool.price() * BASE_FACTOR,
        };
      })
    )
  ).filter((token) => token.balance !== 0);
}

export async function fetchPools(ec, publicKey) {
  return (
    await Promise.all(
      [NATIVE_TOKEN, ...BRIDGE_TOKENS].map(async (token) => {
        const pool = await ec.getPool(token);
        const balance = await pool.getBalance(publicKey);
        return {
          balance,
          ...token,
          price: pool.price() * BASE_FACTOR,
          issuancePerShare: pool.issuancePerShare(),
        };
      })
    )
  ).filter((pool) => pool.balance !== 0);
}

export async function fetchIssuanceRewards(ec, publicKey) {
  const ellipticoin = new Ellipticoin(ec);
  return ellipticoin.getIssuanceRewards(publicKey);
}
export default function App() {
  const [blockHash, setBlockHash] = useState();
  const [blockNumber, setBlockNumber] = useState(0);
  const [web3] = useState();
  const [ethBlockNumber, setEthBlockNumber] = useState();
  const [issuanceRewards, setIssuanceRewards] = useState();
  const [publicKey, setPublicKey] = useState();
  const [ec, setEc] = useState();
  const [signer, setSigner] = useState();
  const [tokens, setTokens] = useState([]);
  const [pools, setPools] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [secretKey, setSecretKey] = useLocalStorage("secretKey", () => {
    const keyPair = nacl.sign.keyPair();
    return Array.from(keyPair.secretKey);
  });
  React.useEffect(() => {
    (async () => {
      let ethereum = window.ethereum;
      if (!ethereum) return;
      ethereum.autoRefreshOnNetworkChange = false;

      ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });
    })();
  }, []);
  useEffect(() => {
    if (!ec) return;
    ec.addBlockListener((blockHash) => {
      setBlockHash(blockHash);
    });
    return () => ec.close();
  }, [ec]);

  useEffect(() => {
    if (!blockHash || !ec) return;
    (async () => {
      const block = await ec.getBlock(blockHash);
      setBlockNumber(block.number);
    })();
  }, [blockHash, ec]);

  useEffect(() => {
    if (!blockHash || !ec) return;
    (async () => {
      setIssuanceRewards(await fetchIssuanceRewards(ec, publicKey));
    })();
  }, [blockHash, ec, publicKey]);

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
      setEc(
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
      if (!publicKey || !ec) {
        return;
      }
      setTokens(await fetchTokens(ec, publicKey));
    })();
  }, [publicKey, ec, blockHash]);
  useEffect(() => {
    (async () => {
      if (!publicKey || !ec) {
        return;
      }
      setPools(await fetchPools(ec, publicKey));
    })();
  }, [publicKey, ec, blockHash]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const elcPrice = useMemo(() => (tokens[0] ? tokens[0].price : 0), [tokens]);
  const totalTokenValue = useMemo(
    () => sumBy(tokens, (token) => token.balance * (token.price / BASE_FACTOR)),
    [tokens]
  );
  const totalLiquidityValue = useMemo(
    () =>
      sumBy(
        pools,
        (pool) =>
          pool.balance *
          ((pool.issuancePerShare * elcPrice + pool.price * 2) / BASE_FACTOR)
      ),
    [pools, elcPrice]
  );
  const loading = useMemo(
    () => !(pools && tokens && issuanceRewards !== undefined),
    [pools, tokens, issuanceRewards]
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
            <Total total={totalTokenValue} />
            <Actions setShowModal={setShowModal} />
          </div>
        </div>
        <YourAddress publicKey={publicKey} />
        <Rewards
          setPools={setPools}
          setTokens={setTokens}
          publicKey={publicKey}
          elcPrice={elcPrice}
          ec={ec}
          setIssuanceRewards={setIssuanceRewards}
          blockNumber={blockNumber}
          issuanceRewards={issuanceRewards}
          pools={pools}
        />
        <Balances tokens={tokens} total={totalTokenValue} />
        <YourLiquidity
          pools={pools}
          elcPrice={elcPrice}
          total={totalLiquidityValue}
        />
      </div>
      <PendingTransactions
        pendingTransactions={pendingTransactions}
        setPendingTransactions={setPendingTransactions}
        ethBlockNumber={ethBlockNumber}
      />
      <Send
        setShow={(show) => (show ? setShowModal("send") : setShowModal(null))}
        show={showModal === "send"}
        ec={ec}
        setBalance={(balance) => {
          tokens[0] = {
            ...tokens[0],
            balance,
          };
          setTokens(tokens);
        }}
      />
      <ManageLiquidity
        setShow={(show) =>
          show ? setShowModal("manageLiquidity") : setShowModal(null)
        }
        show={showModal === "manageLiquidity"}
        blockHash={blockHash}
        setTokens={setTokens}
        setPools={setPools}
        publicKey={publicKey}
        ec={ec}
        setBalance={(balance) => {
          tokens[0] = {
            ...tokens[0],
            balance,
          };
          setTokens(tokens);
        }}
      />
      <Exchange
        setShow={(show) =>
          show ? setShowModal("exchange") : setShowModal(null)
        }
        show={showModal === "exchange"}
        blockHash={blockHash}
        ec={ec}
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
        ec={ec}
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
