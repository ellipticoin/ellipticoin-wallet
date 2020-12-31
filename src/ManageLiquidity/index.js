import ProvideLiquidity from "./ProvideLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import { default as React } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ChevronLeft } from "react-feather";

export default function ManageLiquidity(props) {
  const { onHide, liquidityTokens, userTokens } = props;

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
              liquidityTokens={liquidityTokens}
              onHide={onHide}
              userTokens={userTokens}
            />
          </Tab>
          <Tab eventKey="removeLiquidity" title="Remove Liquidity">
            <RemoveLiquidity
              liquidityTokens={liquidityTokens}
              onHide={onHide}
              userTokens={userTokens}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
