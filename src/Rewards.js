import React from "react";

export default function Rewards(props) {
  return (
    <div className="section">
      <div className="row mt-2">
        <div className="col-6">
          <div className="stat-box">
            <div className="title">Your Liquidity Rewards</div>
            <div className="value text-success">$ 0.00</div>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-box">
            <div className="title">Total Network Issuance per Day</div>
            <div className="value text-success">$ 0.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
