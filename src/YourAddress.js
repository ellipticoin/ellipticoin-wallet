import { Clipboard } from "react-feather";
import React from "react";
import base64url from "base64url";
import copy from "copy-to-clipboard";

export default function YourAddress(props) {
  const { publicKey } = props;
  return (
    <div className="section mt-1">
      <div className="section-title">Your Address</div>
      <div className="card">
        <div className="card-body">
          <div className="your-address">
            {base64url.encode(publicKey)}
            <button onClick={() => copy(base64url.encode(publicKey))}>
              <Clipboard size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
