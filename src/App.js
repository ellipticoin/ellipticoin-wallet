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
import Migrate from "./Migrate";
import { BASE_FACTOR, USD } from "./constants";
import { LIQUIDITY_TOKENS, TOKENS } from "./constants.js";
import { useLocalStorage } from "./helpers";
import {
  useGetBlockNumber,
  useGetLiquidityTokens,
  useGetTokens,
} from "./queries";
import { Buffer } from "buffer/";
import { ethers } from "ethers";
import { compact } from "lodash";
import { sumBy, find } from "lodash";
import { useMemo, useState } from "react";
import { animated, useTransition } from "react-spring";
import nacl from "tweetnacl";
import { price } from "./selectors";

function App(props) {
  const { setHost, address } = props;
  const [issuanceRewards, setIssuanceRewards] = useState();
  const [signer, setSigner] = useState();
  const [ethAccounts, setEthAccounts] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState();
  const [showPage, setShowPage] = useState();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const {
    data: { tokens } = { tokens: TOKENS },
    error: tokenError,
  } = useGetTokens(address);
  const {
    data: { liquidityTokens } = { liquidityTokens: LIQUIDITY_TOKENS },
    error: liquidityTokenError,
  } = useGetLiquidityTokens(address);
  const blockNumber = useGetBlockNumber();

  const errors = useMemo(
    () => compact([tokenError, liquidityTokenError]));
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
            address={address}
            onHide={() => setShowPage(null)}
            blockNumber={blockNumber}
            signer={signer}
            ethAccounts={ethAccounts}
            pushPendingTransation={(tx) => {
              setPendingTransactions([...pendingTransactions, tx]);
            }}
            tokens={tokens}
          />
        );
      case "Trade":
        return (
          <Trade
            address={address}
            liquidityTokens={liquidityTokens.filter(
              (liquidityToken) => liquidityToken.totalSupply !== 0n
            )}
            tokens={tokens.filter(
              (token) =>
                token.address == USD.address ||
                find(liquidityTokens, ["tokenAddress", token.address])
                  .totalSupply !== 0n
            )}
            onHide={() => setShowPage(null)}
          />
        );
      case "ManageLiquidity":
        return (
          <ManageLiquidity
            onHide={() => setShowPage(null)}
            liquidityTokens={liquidityTokens}
            address={address}
            tokens={tokens}
            setShow={(show) =>
              show ? setShowPage("ManageLiquidity") : setShowModal(null)
            }
            show={showPage === "ManageLiquidity"}
          />
        );

      case "NetworkStatistics":
        return (
          <NetworkStatistics onHide={() => setShowPage(null)} tokens={tokens} liquidityTokens={liquidityTokens} />
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
    const price = token.address === USD.address ? BASE_FACTOR : token.price;
    let total = (token.balance * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);
  const totalLiquidityBalance = liquidityTokens.reduce(
    (sum, liquidityToken) => {
      let total =
        liquidityToken.balance * ((price(liquidityToken) * BigInt(2)) / BASE_FACTOR);
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
          setShowSidebar={setShowSidebar}
        />
        <div id="appCapsule">
          <div className="section wallet-card-section pt-1 mb-2">
            <div className="wallet-card">
              <Total totalBalance={totalBalance} address={address} />
              <Actions setShowModal={setShowModal} setShowPage={setShowPage} />
            </div>
          </div>
          <Balances tokens={tokens} totalBalance={totalBalance} />
          {totalLiquidityBalance && (
            <LiquidityBalances
              address={address}
              blockNumber={blockNumber}
              liquidityTokens={liquidityTokens}
              totalLiquidityBalance={totalLiquidityBalance}
              setIssuanceRewards={setIssuanceRewards}
              issuanceRewards={issuanceRewards}
            />
          )}
        </div>
        <Send
          setShow={(show) => (show ? setShowModal("send") : setShowModal(null))}
          show={showModal === "send"}
          address={address}
          setHost={setHost}
        />
        <Sidebar
          address={address}
          setShowSidebar={setShowSidebar}
          setShowPage={setShowPage}
          showSidebar={showSidebar}
        />
      </div>
    </>
  );
}

export default App;
