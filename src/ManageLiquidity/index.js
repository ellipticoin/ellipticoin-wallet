import ProvideLiquidity from "./ProvideLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import { default as React } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ChevronLeft } from "react-feather";

export default function ManageLiquidity(props) {
  const { onHide, liquidityTokens, tokens, address } = props;

  return (
    <div style={{ backgroundColor: "white", height: "100%" }}>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Manage Liquidity</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <Tabs defaultActiveKey="provideLiquidity" className="nav-tabs lined">
          <Tab eventKey="provideLiquidity" title="Provide Liquidity">
            <ProvideLiquidity
              address={address}
              liquidityTokens={liquidityTokens}
              onHide={onHide}
              tokens={tokens}
            />
          </Tab>
          <Tab eventKey="removeLiquidity" title="Remove Liquidity">
            <RemoveLiquidity
              address={address}
              liquidityTokens={liquidityTokens}
              onHide={onHide}
              tokens={tokens}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
