import { BOOTNODES } from "./constants";
import { createContext } from "react";
import { sample } from "lodash";

const HostContext = createContext([sample(BOOTNODES), () => {}]);

export default HostContext;
