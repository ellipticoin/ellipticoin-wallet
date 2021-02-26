import React from "react";
import { Droplet, Link, Repeat, Send } from "react-feather";

export default function Actions(props) {
  const { setShowModal, setShowPage } = props;
  return (
    <div className="wallet-footer">
      <div className="item">
        <button onClick={() => setShowModal("send")}>
          <div className="icon-wrapper btn-success">
            <Send />
          </div>
          <strong>Send</strong>
        </button>
      </div>
      <div className="item">
        <button onClick={() => setShowPage("Trade")}>
          <div className="icon-wrapper btn-warning">
            <Repeat />
          </div>
          <strong>Trade</strong>
        </button>
      </div>
      <div className="item">
        <button onClick={() => setShowPage("Bridge")}>
          <div className="icon-wrapper btn-danger">
            <Link />
          </div>
          <strong>Bridge</strong>
        </button>
      </div>
      <div className="item">
        <button onClick={() => setShowPage("ManageLiquidity")}>
          <div className="icon-wrapper btn-primary">
            <Droplet className="filled" />
          </div>
          <strong>Manage Liquidity</strong>
        </button>
      </div>
    </div>
  );
}
