import Logo from "./logo.svg";
import base64url from "base64url";
import { Menu, X } from "react-feather";

export default function WalletMenu(props) {
  const {
    showWarning,
    setShowWarning,
    setShowSidebar,
    publicKey,
    secretKey,
    secretKeyDownloaded,
    setSecretKeyDownloaded,
  } = props;

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
              <button style={{ float: "right" }} onClick={() => hideWarning()}>
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
          Moonshine Wallet
        </div>
      </div>
    </>
  );
}
