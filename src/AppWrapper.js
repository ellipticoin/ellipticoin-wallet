import { default as App } from "./App";
import CurrentMinerContext from "./CurrentMinerContext";
import AppContext, { useAppContext } from "./AppContext";
import { useSpring, useTransition, animated } from "react-spring";
import { BOOTNODES, PROD } from "./constants";
import UnlockMetamask from "./UnlockMetamask";
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
import SettingsContext, { useSettingsContext } from "./SettingsContext";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useEthereumAccounts } from "./ethereum";

export const CDAIExchangeRateContext = createContext();
export default function AppWrapper() {
  const [apolloClient, setApolloClient] = useState();
  const [host, setHost] = useState(sample(BOOTNODES));
  const [blockNumber, setBlockNumber] = useState();
  const [currentMiner, setCurrentMiner] = useState(sample(BOOTNODES));
  const [loadingEthereumAcccounts, ethereumAcccounts] = useEthereumAccounts();
  const uri = useMemo(() => `${PROD ? "https" : "http"}://${host}`, [host]);
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

  const settingsContext = useSettingsContext();
  const refetchCallback = useCallback((event) => {
    setBlockNumber(parseInt(event.lastEventId) + 1);
    setCurrentMiner(event.data);
  }, []);
  const eventSourceRef = useRef();
  useEffect(() => {
    if (eventSourceRef.current) return;
    const eventSource = new EventSource(uri);
    eventSourceRef.current = eventSource;
    eventSourceRef.current.addEventListener("block", refetchCallback);
    return () => {
      eventSource.removeEventListener("block", refetchCallback);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [refetchCallback, uri, eventSourceRef]);
  const metamaskUnlocked = useMemo(
    () => ethereumAcccounts && ethereumAcccounts.length > 0
  );

  if (loadingEthereumAcccounts) return <></>;
  if (!apolloClient) return <></>;

  return metamaskUnlocked ? (
    <SettingsContext.Provider value={settingsContext}>
      <ApolloProvider client={apolloClient}>
        <AppContext.Provider
          value={{
            blockNumber,
            address: ethereumAcccounts[0],
            setHost,
            currentMiner,
          }}
        >
          <App address={ethereumAcccounts[0]} />
        </AppContext.Provider>
      </ApolloProvider>
    </SettingsContext.Provider>
  ) : (
    <UnlockMetamask />
  );
}
