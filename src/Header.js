import { Menu, X } from "react-feather";

import Identicon from "react-identicons";
import Logo from "./logo.svg";
import React from "react";
import base64url from "base64url";
import { useLocalStorage } from "./helpers";

export default function WalletMenu(props) {
  const { setShowSidebar, publicKey } = props;
  const [showWarning, setShowWarning] = useLocalStorage("showWarning", true);

  return (
    <>
      {showWarning ? (
        <div id="notification-16" class="notification-box show">
          <div class="notification-dialog ios-style bg-danger">
            <div class="notification-content">
              <div class="in">
                <h3 class="subtitle">
                  WARNING: Ellipticoin hasn't been audited please don't purchase
                  more tokens than you'd be happy to loose.
                </h3>
              </div>
              <button
                style={{ float: "right" }}
                onClick={() => setShowWarning(false)}
              >
                <X color={"white"} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="appHeader bg-primary text-light">
        <div className="left">
          <button
            className="headerButton"
            data-toggle="modal"
            data-target="#sidebarPanel"
          >
            <Menu onClick={() => setShowSidebar(true)} />
          </button>
        </div>
        <div className="pageTitle">
          <img src={Logo} alt="logo" className="logo" />
          Ellipticoin Wallet
        </div>
        <div className="right">
          <a href="app-settings.html" className="headerButton">
            <Identicon
              bg="#fff"
              size="32"
              string={base64url.encode(publicKey)}
            />
          </a>
        </div>
      </div>
    </>
  );
}
