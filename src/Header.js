import { useLocalStorage } from "./helpers";
import Logo from "./logo.svg";
import base64url from "base64url";
import React from "react";
import { Menu, X } from "react-feather";
import Identicon from "react-identicons";

export default function WalletMenu(props) {
  const { setShowSidebar, publicKey } = props;
  const [showWarning, setShowWarning] = useLocalStorage("showWarning", true);

  return (
    <>
      {showWarning ? (
        <div id="notification-16" className="notification-box show">
          <div className="notification-dialog ios-style bg-danger">
            <div className="notification-content">
              <div className="in">
                <h3 className="subtitle">
                  WARNING: Ellipticoin hasn't been audited please don't purchase
                  more tokens than you'd be happy to lose.
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
          <Identicon bg="#fff" size="32" string={base64url.encode(publicKey)} />
        </div>
      </div>
    </>
  );
}
