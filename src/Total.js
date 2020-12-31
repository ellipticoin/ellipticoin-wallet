import CopyButton from "./inputs/CopyButton.js";
import { USD } from "./constants";
import { Value } from "./helpers";
import base64url from "base64url";
import { default as React } from "react";

export default function Total(props) {
  const { totalBalance, publicKey } = props;

  return (
    <div className="actions-top">
      <div className="row">
        <div className="col-lg-8 col-md-12">
          <span className="title">Your Address</span>
          <div className="your-address">
            <CopyButton content={base64url.encode(publicKey)}>
              <h1>{base64url.encode(publicKey)}</h1>
            </CopyButton>
          </div>
        </div>
        <div className="col-lg-4 col-md-12 total-balance align-self-end">
          <div>Total Balance</div>
          <div>
            <h1>
              <Value token={USD}>{totalBalance}</Value>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
