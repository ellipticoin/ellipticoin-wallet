import { BOOTNODES } from "./constants";
import { sample } from "lodash";
import { createContext } from "react";
import { useStorageState } from "react-storage-hooks";

const SettingsContext = createContext(false);
export function useSettingsContext(props) {
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
export default SettingsContext;
