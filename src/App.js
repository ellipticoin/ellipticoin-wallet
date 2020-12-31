import Actions from "./Actions";
import Balances from "./Balances";
import Bridge from "./Bridge";
import Header from "./Header";
import LiquidityBalances from "./LiquidityBalances";
import ManageLiquidity from "./ManageLiquidity";
import NetworkStatistics from "./NetworkStatistics";
import PendingTransactions from "./PendingTransactions";
import Send from "./Send";
import Sidebar from "./Sidebar";
import Total from "./Total";
import Trade from "./Trade";
import { BASE_FACTOR } from "./constants";
import { LIQUIDITY_TOKENS, TOKENS } from "./constants.js";
import { downloadSecretKey, findToken, useLocalStorage } from "./helpers";
import {
  useGetCurrentBlock,
  useGetLiquidityTokens,
  useGetTokens,
} from "./queries";
import { Buffer } from "buffer/";
import { ethers } from "ethers";
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
  const [secretKeyDownloaded, setSecretKeyDownloaded] = useLocalStorage(
    "secretKeyDownloaded",
    false
  );
  const [showWarning, setShowWarning] = useLocalStorage("showWarning", true);

  const publicKey = useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
  const [investorModeEnabled, setInvestorModeEnabled] = useLocalStorage(
    "investorModeEnabled",
    false
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
        setEthBlockNumber(BigInt(blockNumber));
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
  const pageTransition = useTransition(showPage, null, {
    enter: { transform: "translate3d(0,0,0)" },
    from: { transform: "translate3d(-100%,0,0)" },
    leave: { transform: "translate3d(-100%,0,0)" },
  });
  const downloadPrivateKey = () => {
    if (secretKeyDownloaded || !showWarning) {
      return true;
    }
    const res = downloadSecretKey(secretKey);
    setSecretKeyDownloaded(res);
    return res;
  };
  const page = () => {
    switch (showPage) {
      case "Bridge":
        if (!downloadPrivateKey()) {
          setShowPage(null);
          return;
        }
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
            userTokens={tokens}
          />
        );
      case "Trade":
        if (!downloadPrivateKey()) {
          setShowPage(null);
          return;
        }
        return (
          <Trade
            liquidityTokens={liquidityTokens}
            investorModeEnabled={investorModeEnabled}
            userTokens={tokens}
            onHide={() => setShowPage(null)}
            publicKey={publicKey}
          />
        );
      case "ManageLiquidity":
        if (!downloadPrivateKey()) {
          setShowPage(null);
          return;
        }
        return (
          <ManageLiquidity
            onHide={() => setShowPage(null)}
            liquidityTokens={liquidityTokens}
            userTokens={tokens}
            setShow={(show) =>
              show ? setShowPage("ManageLiquidity") : setShowModal(null)
            }
            show={showPage === "ManageLiquidity"}
            publicKey={publicKey}
          />
        );

      case "NetworkStatistics":
        return (
          <NetworkStatistics onHide={() => setShowPage(null)} tokens={tokens} />
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
  const totalBalance = tokens.reduce((sum, token) => {
    const price = findToken(token).name === "USD" ? BASE_FACTOR : token.price;
    let total = (token.balance * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);
  const totalLiquidityBalance = liquidityTokens.reduce(
    (sum, liquidityToken) => {
      const price =
        findToken(liquidityToken).name === "USD"
          ? BASE_FACTOR
          : liquidityToken.price;
      let total = liquidityToken.balance * ((price * 2n) / BASE_FACTOR);
      return sum + total;
    },
    0n
  );

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
              background: "#EDEDF5",
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
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          setShowSidebar={setShowSidebar}
          publicKey={publicKey}
          setSecretKey={setSecretKey}
          secretKey={secretKey}
          secretKeyDownloaded={secretKeyDownloaded}
          setSecretKeyDownloaded={setSecretKeyDownloaded}
        />
        <div id="appCapsule">
          <div className="section wallet-card-section pt-1 mb-2">
            <div className="wallet-card">
              <Total totalBalance={totalBalance} publicKey={publicKey} />
              <Actions setShowModal={setShowModal} setShowPage={setShowPage} />
            </div>
          </div>
          <Balances tokens={tokens} totalBalance={totalBalance} />
          {totalLiquidityBalance && (
            <LiquidityBalances
              publicKey={publicKey}
              blockNumber={currentBlock.number}
              liquidityTokens={liquidityTokens}
              totalLiquidityBalance={totalLiquidityBalance}
              setIssuanceRewards={setIssuanceRewards}
              issuanceRewards={issuanceRewards}
            />
          )}
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
          setShowPage={setShowPage}
          showSidebar={showSidebar}
          publicKey={publicKey}
          secretKey={secretKey}
          setSecretKey={setSecretKey}
          setSecretKeyDownloaded={setSecretKeyDownloaded}
        />
      </div>
    </>
  );
}

export default App;
