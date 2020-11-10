import { formatCurrency } from "./helpers";
import base64url from "base64url";
import copy from "copy-to-clipboard";
import React from "react";
import { Button } from "react-bootstrap";
import { Clipboard } from "react-feather";

export default function Total(props) {
  const { total, publicKey } = props;

  return (
    <div className="actions-top">
      <div className="row">
        <div className="col-lg-8 col-md-12">
          <span className="title">Your Address</span>
          <div className="your-address">
            <h1>{base64url.encode(publicKey)}</h1>
            <Button
              variant="outline-primary"
              onClick={() => copy(base64url.encode(publicKey))}
            >
              <Clipboard size={18} />
              Copy Address
            </Button>
          </div>
        </div>
        <div className="col-lg-4 col-md-12 total-balance">
          <div>Total Balance</div>
          <div>
            <h1>{formatCurrency(total)} USD</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
