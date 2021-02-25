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
import ActionsHeader from "./ActionsHeader";
import Trade from "./Trade";
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
import { sumBy, find, get } from "lodash";
import { useMemo, useState, useEffect, useContext } from "react";
import { animated, useTransition } from "react-spring";
import CompoundContext from "./CompoundContext";
import Loading from "./Loading";
import nacl from "tweetnacl";
import { price } from "./selectors";

function App(props) {
  const { setHost, address } = props;
  const compoundContext = useContext(CompoundContext);
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
  const errors = useMemo(() => compact([tokenError, liquidityTokenError]));
  const zeroBalance = useMemo(
    () =>
      tokens.every((token) => token.balance === 0n) &&
      liquidityTokens.every((liquidityToken) => liquidityToken.balance === 0n)
  );
  const loading = useMemo(() => compoundContext.loading && !zeroBalance);
  const fadeIn = useTransition(compoundContext.loading, null, {
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
          <NetworkStatistics
            onHide={() => setShowPage(null)}
            tokens={tokens}
            liquidityTokens={liquidityTokens}
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
          <Header setShowSidebar={setShowSidebar} />
          <div id="appCapsule">
            <div className="section wallet-card-section pt-1 mb-2">
              <div className="wallet-card">
                <ActionsHeader
                  usdBalance={usdBalance}
                  totalBalance={totalBalance}
                  address={address}
                />
                <Actions
                  setShowModal={setShowModal}
                  setShowPage={setShowPage}
                />
              </div>
            </div>
            {tokens.some(({ balance }) => balance > 0n) && (
              <Balances tokens={tokens} totalBalance={totalBalance} />
            )}
            {liquidityTokens.some(({ balance }) => balance > 0n) && (
              <LiquidityBalances
                address={address}
                blockNumber={blockNumber}
                liquidityTokens={liquidityTokens}
                setIssuanceRewards={setIssuanceRewards}
                issuanceRewards={issuanceRewards}
              />
            )}
          </div>
          <Send
            setShow={(show) =>
              show ? setShowModal("send") : setShowModal(null)
            }
            show={showModal === "send"}
            address={address}
            setHost={setHost}
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
