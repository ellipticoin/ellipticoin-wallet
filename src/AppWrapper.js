import { default as App } from "./App";
import Migrate from "./Migrate";
import CurrentMinerContext from "./CurrentMinerContext";
import HostContext from "./HostContext";
import { BOOTNODES, PROD } from "./constants";
import { useEthereumAccounts } from "./ethereum";
import UnlockMetaMask from "./UnlockMetaMask";
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
import CompoundContext, {useCompoundContext} from "./CompoundContext";

export const CDAIExchangeRateContext = createContext();
function onEvent(event) {
  console.log(event);
}
export default function AppWrapper() {
  const [host, setHost] = useState(sample(BOOTNODES));
  const [currentMiner, setCurrentMiner] = useState(sample(BOOTNODES));
  const [blockNumber, setBlockNumber] = useState();
  const [cDAIExchangeRate, setCDAIExchangeRate] = useState();
  const ethereumAcccounts = useEthereumAccounts();
  const uri = useMemo(() => `${PROD ? "https" : "http"}://${host}`, [host]);
  const [apolloClient, setApolloClient] = useState(() => {
    const cache = new InMemoryCache();
    return new ApolloClient({
      uri,
      cache,
    });
  });
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
  }, [uri]);
  useEffect(() => {
    apolloClient.reFetchObservableQueries();
  }, [apolloClient, blockNumber]);
  const compoundContext = useCompoundContext([blockNumber]);

  const page = () => {
    if (
      window.localStorage.getItem("secretKey") &&
      !window.localStorage.getItem("migrated")
    ) {
      return <Migrate />;
    } else if (!ethereumAcccounts) {
      return <></>;
    } else if (ethereumAcccounts && ethereumAcccounts.length == 0) {
      return <UnlockMetaMask />;
    } else {
      return <App address={ethereumAcccounts[0]} />;
    }
  };
  if (!compoundContext.cDAIExchangeRate) return null
  return (
    <HostContext.Provider value={[host, setHost]}>
      <CompoundContext.Provider value={compoundContext}>
        <CurrentMinerContext.Provider value={[currentMiner, setCurrentMiner]}>
          <ApolloProvider client={apolloClient}>{page()}</ApolloProvider>
        </CurrentMinerContext.Provider>
      </CompoundContext.Provider>
    </HostContext.Provider>
  );
}
