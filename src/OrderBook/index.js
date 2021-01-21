import MakeOrder from "./MakeOrder";
import TakeOrder from "./TakeOrder";
import { default as React } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ChevronLeft } from "react-feather";

export const ORDER_TYPES = ["Buy", "Sell"];

export default function OrderBook(props) {
  const { onHide, liquidityTokens, tokens, address } = props;

  return (
    <div style={{ backgroundColor: "white", height: "100%" }}>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Order Book</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <Tabs defaultActiveKey="makeOrder" className="nav-tabs lined">
          <Tab eventKey="makeOrder" title="Make">
            <MakeOrder tokens={tokens} address={address} onHide={onHide} />
          </Tab>
          <Tab eventKey="takeOrder" title="Take">
            <TakeOrder tokens={tokens} address={address} onHide={onHide} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
