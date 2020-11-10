import Actions from "./Actions";
import Balances from "./Balances";
import Bridge from "./Bridge";
import Exchange from "./Exchange";
import Header from "./Header";
import LiquidityBalances from "./LiquidityBalances";
import ManageLiquidity from "./ManageLiquidity/ManageLiquidity";
import PendingTransactions from "./PendingTransactions";
import Rewards from "./Rewards";
import Send from "./Send";
import Sidebar from "./Sidebar";
import Total from "./Total";
import YourAddress from "./YourAddress";
import { BASE_FACTOR } from "./constants";
import { LIQUIDITY_TOKENS, TOKENS } from "./constants.js";
import { useLocalStorage } from "./helpers";
import {
  useGetCurrentBlock,
  useGetLiquidityTokens,
  useGetTokens,
} from "./queries";
import { Buffer } from "buffer/";
import { default as ethers } from "ethers";
import { compact } from "lodash";
import { sumBy } from "lodash";
import { default as React, useMemo, useState } from "react";
import { animated, useTransition } from "react-spring";
import nacl from "tweetnacl";

function App(props) {
  const { setHost } = props;
  const [ethBlockNumber, setEthBlockNumber] = useState();
  const [issuanceRewards, setIssuanceRewards] = useState();
  const [signer, setSigner] = useState();
  const [ethAccounts, setEthAccounts] = useState([]);
  const [secretKey, setSecretKey] = useLocalStorage(
    "secretKey",
    () => nacl.sign.keyPair().secretKey
  );
  const publicKey = useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );

  React.useEffect(() => {
    (async () => {
      let ethereum = window.ethereum;
      if (!ethereum) return;
      ethereum.enable();
      ethereum.autoRefreshOnNetworkChange = false;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const onAccountsChanged = async (accounts) => {
        const signer = provider.getSigner();
        setSigner(signer);
        setEthAccounts(accounts);
      };
      window.ethereum.on("accountsChanged", onAccountsChanged);
      onAccountsChanged(await provider.listAccounts());
    })();
  }, []);

  React.useEffect(() => {
    if (!signer) return;
    (async () => {
      signer.provider.on("block", (blockNumber) => {
        setEthBlockNumber(blockNumber);
      });
    })();
  }, [signer]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState();
  const [showPage, setShowPage] = useState();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const {
    data: { tokens } = { tokens: TOKENS },
    error: tokenError,
  } = useGetTokens();
  const {
    data: { liquidityTokens } = { liquidityTokens: LIQUIDITY_TOKENS },
    error: liquidityTokenError,
  } = useGetLiquidityTokens();
  const {
    data: { currentBlock } = { currentBlock: {} },
    error: currentBlockError,
  } = useGetCurrentBlock();

  const errors = useMemo(
    () => compact([tokenError, currentBlockError, liquidityTokenError]),
    [tokenError, currentBlockError, liquidityTokenError]
  );
  const totalLockedValue = useMemo(
    () =>
      sumBy(tokens, (token) => {
        return (
          (parseInt(token.totalSupply) * parseInt(token.price) || 0) /
          BASE_FACTOR
        );
      }),
    [tokens]
  );
  const pageTransition = useTransition(showPage, null, {
    enter: { transform: "translate3d(0,0,0)" },
    from: { transform: "translate3d(-100%,0,0)" },
    leave: { transform: "translate3d(-100%,0,0)" },
  });
  const page = () => {
    switch (showPage) {
      case "Bridge":
        return (
          <Bridge
            onHide={() => setShowPage(null)}
            blockNumber={currentBlock.number}
            signer={signer}
            ethAccounts={ethAccounts}
            pushPendingTransation={(tx) => {
              setPendingTransactions([...pendingTransactions, tx]);
            }}
            publicKey={publicKey}
            tokens={tokens}
          />
        );
      case "Exchange":
        return (
          <Exchange
            liquidityTokens={liquidityTokens}
            onHide={() => setShowPage(null)}
            publicKey={publicKey}
          />
        );
      case "ManageLiquidity":
        return (
          <ManageLiquidity
            onHide={() => setShowPage(null)}
            liquidityTokens={liquidityTokens}
            tokens={tokens}
            setShow={(show) =>
              show ? setShowPage("ManageLiquidity") : setShowModal(null)
            }
            show={showPage === "ManageLiquidity"}
            publicKey={publicKey}
          />
        );

      default:
        return null;
    }
  };
  if (errors && errors.length)
    return (
      <>
        {errors.map((error) => (
          <div style={{ color: "red" }}>{error.toString()}</div>
        ))}
      </>
    );
  const totalLiquidityValue = 0;
  const totalTokenValue = sumBy(tokens, (token) => {
    let total = token.balance * (token.price / BASE_FACTOR);
    return isNaN(total) ? 0 : total;
  });

  return (
    <>
      {pageTransition.map(({ item, key, props }) =>
        item ? (
          <animated.div
            style={{
              zIndex: 10000,
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "white",
              ...props,
            }}
            key={key}
          >
            {page()}
          </animated.div>
        ) : null
      )}
      <div style={{ display: showPage ? "none" : "block" }}>
        <Header
          setShowSidebar={setShowSidebar}
          publicKey={publicKey}
          setSecretKey={setSecretKey}
        />
        <div id="appCapsule">
          <div className="section wallet-card-section pt-1">
            <div className="wallet-card">
              <Total total={totalTokenValue} />
              <Actions setShowModal={setShowModal} setShowPage={setShowPage} />
            </div>
          </div>
          <YourAddress publicKey={publicKey} />
          <Rewards
            publicKey={publicKey}
            setIssuanceRewards={setIssuanceRewards}
            issuanceRewards={issuanceRewards}
            totalLockedValue={totalLockedValue}
            blockNumber={currentBlock.number}
          />
          <Balances tokens={tokens} total={totalTokenValue} />
          <LiquidityBalances
            blockNumber={currentBlock.number}
            liquidityTokens={liquidityTokens}
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
          setHost={setHost}
          publicKey={publicKey}
        />
        <Sidebar
          setShowSidebar={setShowSidebar}
          showSidebar={showSidebar}
          publicKey={publicKey}
          secretKey={secretKey}
          setSecretKey={setSecretKey}
        />
      </div>
    </>
  );
}

export default App;
