import {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
  createContext,
} from "react";
import { BOOTNODES, PROD } from "./constants";
import { useGetState } from "./queries";
import { sample } from "lodash";
import { useEthereumAccounts } from "./ethereum";

const AppContext = createContext();

export default AppContext;
