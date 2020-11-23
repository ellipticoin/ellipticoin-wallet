import base64url from "base64url";
import copy from "copy-to-clipboard";
import React from "react";
import { Button } from "react-bootstrap";
import { Clipboard } from "react-feather";

export default function YourAddress(props) {
  const { publicKey } = props;
  return (
    <div className="section mt-1">
      <div className="row">
        <div className="col-9">
          <div className="section-heading">
            <h2 className="title">Your Address</h2>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="your-address">
                {base64url.encode(publicKey)}
                <Button
                  variant="outline-primary"
                  onClick={() => copy(base64url.encode(publicKey))}
                >
                  <Clipboard size={18} />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
