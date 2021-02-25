import { default as App } from "./App";
import CurrentMinerContext from "./CurrentMinerContext";
import HostContext from "./HostContext";
import { useSpring, useTransition, animated } from "react-spring";
import { BOOTNODES, PROD } from "./constants";
import { useEthereumAccounts } from "./ethereum";
import UnlockMetamask from "./UnlockMetamask";
import Loading from "./Loading";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { sample } from "lodash";
import cTokenAbi from "./contracts/cDAIABI.json";
import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  createContext,
} from "react";
import CompoundContext, { useCompoundContext } from "./CompoundContext";

export const CDAIExchangeRateContext = createContext();
export default function AppWrapper() {
  const [host, setHost] = useState(sample(BOOTNODES));
  const [currentMiner, setCurrentMiner] = useState(sample(BOOTNODES));
  const [blockNumber, setBlockNumber] = useState();
  const [loadingEthereumAcccounts, ethereumAcccounts] = useEthereumAccounts();
  const uri = useMemo(() => `${PROD ? "https" : "http"}://${host}`, [host]);
  const [apolloClient, setApolloClient] = useState();
  // () => {
  //     const cache = new InMemoryCache();
  //     return new ApolloClient({
  //       uri,
  //       cache,
  //     });
  //   });
  const refetchCallback = useCallback(
    (event) => {
      setBlockNumber(parseInt(event.lastEventId) + 1);
      setCurrentMiner(event.data);
    },
    [setBlockNumber, setCurrentMiner]
  );
  const eventSource = useRef();
  useEffect(() => {
    if (eventSource.current) return;
    eventSource.current = new EventSource(uri);
    eventSource.current.addEventListener("block", refetchCallback);
    return () => {
      eventSource.current.removeEventListener("block", refetchCallback);
    };
  }, [refetchCallback, uri, eventSource]);
  useEffect(() => {
    const cache = new InMemoryCache();
    setApolloClient(
      new ApolloClient({
        uri,
        cache,
      })
    );
    return function cleanup() {};
  }, [uri]);
  useEffect(() => {
    if (!apolloClient) return;
    apolloClient.reFetchObservableQueries();
  }, [apolloClient, blockNumber]);
  const compoundContext = useCompoundContext({
    blockNumber,
    ethereumAcccounts,
  });

  const [toggle, set] = useState(false);
  const loading = useMemo(() => compoundContext.loading);
  const fadeIn = useTransition(loading, null, {
    from: { position: "absolute", width: "100%", height: "100%", opacity: 0 },
    immediate: loading,
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  const metamaskUnlocked = useMemo(
    () => ethereumAcccounts && ethereumAcccounts.length > 0
  );

  return (
    <>
      {metamaskUnlocked ? (
        fadeIn.map(({ item, key, props }) =>
          item ? (
            <animated.div key={key} style={props}>
              <Loading />
            </animated.div>
          ) : (
            <animated.div key={key} style={props}>
              <HostContext.Provider value={[host, setHost]}>
                <CompoundContext.Provider value={compoundContext}>
                  <CurrentMinerContext.Provider
                    value={[currentMiner, setCurrentMiner]}
                  >
                    <ApolloProvider client={apolloClient}>
                      <App address={ethereumAcccounts[0]} />
                    </ApolloProvider>
                  </CurrentMinerContext.Provider>
                </CompoundContext.Provider>
              </HostContext.Provider>
            </animated.div>
          )
        )
      ) : (
        <UnlockMetamask />
      )}
    </>
  );
}
