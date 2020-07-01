import { Droplet, Link, Repeat, Send } from "react-feather";

import React from "react";
import { formatCurrency } from "./helpers";

export default function WalletMenu(props) {
  const { balance, setShowModal } = props;
  return (
    <div className="section wallet-card-section pt-1">
      <div className="wallet-card">
        <div className="balance">
          <div className="left">
            <span className="title">Total Balance</span>
            <h1 className="total">{formatCurrency(balance)}</h1>
          </div>
        </div>
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
            <button>
              <div className="icon-wrapper bg-warning">
                <Repeat />
              </div>
              <strong>Exchange</strong>
            </button>
          </div>
          <div className="item">
            <button onClick={() => setShowModal("bridge")}>
              <div className="icon-wrapper bg-danger">
                <Link />
              </div>
              <strong>Bridge</strong>
            </button>
          </div>
          <div className="item">
            <button>
              <div className="icon-wrapper">
                <Droplet className="filled" />
              </div>
              <strong>Provide Liquidity</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
