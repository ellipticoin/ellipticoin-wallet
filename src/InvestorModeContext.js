import { BOOTNODES } from "./constants";
import { sample } from "lodash";
import { createContext } from "react";

const InvestorModeContext = createContext(false);
export function useInvestorModeContext(props) {
  const [investorModeEnabled, setInvestorModeEnabled] = useStorageState(
    localStorage,
    "investorModeEnabled",
    false
  );

  return {
    setInvestorModeEnabled,
    investorModeEnabled,
  };
}
export default InvestorModeContext;
