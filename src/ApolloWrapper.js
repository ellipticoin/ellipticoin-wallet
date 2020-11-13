import { default as App } from "./App";
import CurrentMinerContext from "./CurrentMinerContext";
import HostContext from "./HostContext";
import { BOOTNODES, PROD } from "./constants";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { sample } from "lodash";
import {
  default as React,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export default function ApolloWrapper() {
  const [host, setHost] = useState(sample(BOOTNODES));
  const [currentMiner, setCurrentMiner] = useState(sample(BOOTNODES));
  const [blockNumber, setBlockNumber] = useState();
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
  React.useEffect(() => {
    if (eventSource.current) {
      eventSource.current.removeEventListener("block", refetchCallback);
    }
    eventSource.current = new EventSource(uri);
    eventSource.current.addEventListener("block", refetchCallback);
  }, [refetchCallback, uri, eventSource]);
  React.useEffect(() => {
    const cache = new InMemoryCache();
    setApolloClient(
      new ApolloClient({
        uri,
        cache,
      })
    );
  }, [uri]);
  React.useEffect(() => {
    apolloClient.reFetchObservableQueries();
  }, [apolloClient, blockNumber]);
  return (
    <HostContext.Provider value={[host, setHost]}>
      <CurrentMinerContext.Provider value={[currentMiner, setCurrentMiner]}>
        <ApolloProvider client={apolloClient}>
          <App />
        </ApolloProvider>
      </CurrentMinerContext.Provider>
    </HostContext.Provider>
  );
}
