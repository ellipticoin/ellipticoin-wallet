import { BOOTNODES } from "./constants";
import { sample } from "lodash";
import { createContext } from "react";

const HostContext = createContext([sample(BOOTNODES), () => {}]);

export default HostContext;
