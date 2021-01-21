import BridgeABI from "../BridgeABI.json";
import TokenSelect from "../Inputs/TokenSelect.js";
import TokenAmountInput from "../Inputs/TokenAmountInput.js";
import {
  BASE_FACTOR,
  BRIDGE_TOKENS,
  TOKEN_METADATA,
  ETH_BRIDGE_ADDRESS,
  WETH,
} from "../constants";
import { parseUnits, Value } from "../helpers";
import { ethers } from "ethers";
import { differenceBy } from "lodash";
import { useEffect, useRef } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Mint from "./Mint";
import Redeem from "./Redeem";
import { ChevronLeft } from "react-feather";
import { actions } from "ellipticoin";

export default function Bridge(props) {
  const { onHide, blockNumber, tokens, address } = props;

  return (
    <div style={{ backgroundColor: "white", height: "100%" }}>
      <div className="appHeader">
        <div className="left">
          <button onClick={() => onHide()} className="headerButton goBack">
            <ChevronLeft />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Bridge</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <Tabs defaultActiveKey="mint" className="nav-tabs lined">
          <Tab eventKey="mint" title="Mint" className="p-2">
            <Mint address={address} onHide={onHide} tokens={tokens} />
          </Tab>
          <Tab eventKey="redeem" title="Redeem" className="p-2">
            <Redeem
              address={address}
              blockNumber={blockNumber}
              onHide={onHide}
              tokens={tokens}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
