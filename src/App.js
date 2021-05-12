import Actions from "./Actions";
import Balances from "./Balances";
import Bridge from "./Bridge";
import Settings from "./Settings";
import Governance from "./Governance";
import OrderBook from "./OrderBook";
import Withdraw from "./Withdraw";
import Deposit from "./Deposit";
import Header from "./Header";
import LiquidityBalances from "./LiquidityBalances";
import AddLiquidity from "./AddLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import NetworkStatistics from "./NetworkStatistics";
import PendingTransactions from "./PendingTransactions";
import Send from "./Send";
import Sidebar from "./Sidebar";
import { default as BalancesEmptyState } from "./Balances/EmptyState";
import ActionsHeader from "./ActionsHeader";
import Trade from "./Trade";
import { BASE_FACTOR, USD } from "./constants";
import { LIQUIDITY_TOKENS, BRIDGE_TOKENS, TOKENS } from "./constants.js";
import {
  useGetBlockNumber,
  useGetLiquidityTokens,
  useGetTokens,
} from "./queries";
import { Buffer } from "buffer/";
import { ethers } from "ethers";
import { compact } from "lodash";
import { sumBy, find, get } from "lodash";
import { useMemo, useState, useEffect, useContext } from "react";
import { animated, useTransition } from "react-spring";
import AppContext from "./AppContext";
import Loading from "./Loading";
import { Button } from "react-bootstrap";
import nacl from "tweetnacl";
import { price } from "./selectors";

function App(props) {
  const { address } = useContext(AppContext);
  const [issuanceRewards, setIssuanceRewards] = useState();
  const [signer, setSigner] = useState();
  const [ethAccounts, setEthAccounts] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState();
  const [showPage, setShowPage] = useState();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const {
    data: { tokens } = { tokens: TOKENS },
    loading: tokensLoading,
    error: tokenError,
  } = useGetTokens(address);
  const bridgeTokens = useMemo(() =>
    tokens.filter((token) =>
      BRIDGE_TOKENS.find(({ address }) => address === token.address)
    )
  );
  const {
    data: { liquidityTokens } = { liquidityTokens: LIQUIDITY_TOKENS },
    loading: liquidityTokensLoading,
    error: liquidityTokenError,
  } = useGetLiquidityTokens(address);
  const blockNumber = useGetBlockNumber();
  const errors = useMemo(() => compact([tokenError, liquidityTokenError]));
  const zeroLiquidityBalance = useMemo(() =>
    liquidityTokens.every((liquidityToken) => liquidityToken.balance === 0n)
  );
  const zeroBalance = useMemo(
    () => tokens.every((token) => token.balance === 0n) && zeroLiquidityBalance
  );
  const loading = useMemo(() => tokensLoading || liquidityTokensLoading);
  const fadeIn = useTransition(loading, null, {
    from: {
      zIndex: 10000,
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity: 1,
    },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
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
      case "Governance":
        return (
          <Governance
            tokens={tokens}
            address={address}
            onHide={() => setShowPage(null)}
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
                get(
                  find(liquidityTokens, ["tokenAddress", token.address]),
                  "totalSupply",
                  0n
                ) !== 0n
            )}
            onHide={() => setShowPage(null)}
          />
        );
      case "AddLiquidity":
        return (
          <AddLiquidity
            onHide={() => setShowPage(null)}
            liquidityTokens={liquidityTokens}
            address={address}
            tokens={tokens}
            setShow={(show) =>
              show ? setShowPage("AddLiquidity") : setShowModal(null)
            }
            show={showPage === "AddLiquidity"}
          />
        );
      case "RemoveLiquidity":
        return (
          <RemoveLiquidity
            onHide={() => setShowPage(null)}
            liquidityTokens={liquidityTokens}
            address={address}
            tokens={tokens}
            setShow={(show) =>
              show ? setShowPage("RemoveLiquidity") : setShowModal(null)
            }
            show={showPage === "RemoveLiquidity"}
          />
        );

      case "NetworkStatistics":
        return (
          <NetworkStatistics
            onHide={() => setShowPage(null)}
            tokens={tokens}
            liquidityTokens={liquidityTokens}
          />
        );
      case "Deposit":
        return (
          <Deposit onHide={() => setShowPage(null)} tokens={bridgeTokens} />
        );
      case "Withdraw":
        return (
          <Withdraw
            address={address}
            onHide={() => setShowPage(null)}
            blockNumber={blockNumber}
            signer={signer}
            ethAccounts={ethAccounts}
            pushPendingTransation={(tx) => {
              setPendingTransactions([...pendingTransactions, tx]);
            }}
            tokens={bridgeTokens}
          />
        );
      case "Settings":
        return <Settings onHide={() => setShowPage(null)} />;
      case "OrderBook":
        return (
          <OrderBook
            onHide={() => setShowPage(null)}
            address={address}
            tokens={tokens}
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
  const totalBalance = tokens.reduce((sum, token) => {
    const price = token.address === USD.address ? BASE_FACTOR : token.price;
    let total = (token.balance * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);
  const usdBalance = get(find(tokens, ["address", USD.address]), "balance");

  return fadeIn.map(({ item, key, props }) =>
    item ? (
      <animated.div key={key} style={props}>
        <Loading />
      </animated.div>
    ) : (
      <div key={key}>
        {pageTransition.map(({ item, key, props }) =>
          item ? (
            <animated.div
              style={{
                zIndex: 1001,
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
          <Header setShowSidebar={setShowSidebar} />
          <div id="appCapsule">
            <>
              <div className="section wallet-card-section pt-1 mb-2">
                <div className="wallet-card">
                  <ActionsHeader
                    usdBalance={usdBalance}
                    totalBalance={totalBalance}
                    address={address}
                  />
                  {zeroBalance && zeroLiquidityBalance ? (
                    <BalancesEmptyState
                      onHide={() => setShowPage(null)}
                      tokens={bridgeTokens}
                    />
                  ) : (
                    <Actions
                      setShowModal={setShowModal}
                      setShowPage={setShowPage}
                      zeroBalance={zeroBalance}
                    />
                  )}
                </div>
              </div>
              {zeroBalance && zeroLiquidityBalance ? null : (
                <>
                  <Balances tokens={tokens} totalBalance={totalBalance} />
                  <LiquidityBalances
                    address={address}
                    blockNumber={blockNumber}
                    liquidityTokens={liquidityTokens}
                    zeroLiquidityBalance={zeroLiquidityBalance}
                    setIssuanceRewards={setIssuanceRewards}
                    setShowPage={setShowPage}
                    issuanceRewards={issuanceRewards}
                  />
                </>
              )}
            </>
          </div>
          <Send
            setShow={(show) =>
              show ? setShowModal("send") : setShowModal(null)
            }
            show={showModal === "send"}
            address={address}
            tokens={tokens}
          />
          <Sidebar
            address={address}
            setShowSidebar={setShowSidebar}
            setShowPage={setShowPage}
            showSidebar={showSidebar}
          />
        </div>
      </div>
    )
  );
}

export default App;
