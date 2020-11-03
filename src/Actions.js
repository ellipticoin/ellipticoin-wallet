import { Droplet, Link, Repeat, Send } from "react-feather";

import React from "react";

export default function Actions(props) {
  const { setShowModal, setShowPage } = props;
  return (
    <div className="wallet-footer">
      <div className="item">
        <button onClick={() => setShowModal("send")}>
          <div className="icon-wrapper bg-success">
            <Send />
          </div>
          <strong>Send</strong>
        </button>
      </div>
      <div className="item">
        <button onClick={() => setShowPage("Exchange")}>
          <div className="icon-wrapper bg-warning">
            <Repeat />
          </div>
          <strong>Exchange</strong>
        </button>
      </div>
      <div className="item">
        <button onClick={() => setShowPage("Bridge")}>
          <div className="icon-wrapper bg-danger">
            <Link />
          </div>
          <strong>Bridge</strong>
        </button>
      </div>
      <div className="item">
        <button onClick={() => setShowPage("ManageLiquidity")}>
          <div className="icon-wrapper">
            <Droplet className="filled" />
          </div>
          <strong>Manage Liquidity</strong>
        </button>
      </div>
    </div>
  );
}
