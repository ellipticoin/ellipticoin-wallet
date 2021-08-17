import Logo from "./logo.svg";
import { useLocalStorage, blockCountdown } from "./helpers.js";
import { MIGRATION_BLOCK_NUMBER } from "./constants.js";

import base64url from "base64url";
import { Menu, X, ExternalLink } from "react-feather";

export default function Header(props) {
  const {
    blockNumber,
    showWarning,
    setShowWarning,
    setShowSidebar,
    publicKey,
    secretKey,
    secretKeyDownloaded,
    setSecretKeyDownloaded,
  } = props;

  const [showMigrationWarning, setShowMigrationWarning] = useLocalStorage(
    "showMigrationWarning",
    true
  );
  return (
    <>
      {showMigrationWarning ? (
        <div id="notification-16" className="notification-box show">
          <div className="notification-dialog ios-style bg-danger">
            <div className="notification-content">
              <div className="in">
                <h3 className="subtitle">
                  WARNING: Liquidity Rewards are moving to The Polygon Network
                  in approximately{" "}
                  {blockCountdown(blockNumber, MIGRATION_BLOCK_NUMBER)}
                </h3>
                <div>
                  Read about the migration in{" "}
                  <a
                    href="https://www.masonforest.com/blockchain/ethereum/moonshine/2021/08/17/moonshine-is-moving-to-polygon.html"
                    target="_blank"
                    rel="noopener"
                  >
                    <div className="chip chip-media text-primary bg-white">
                      <i className="chip-icon">
                        <ExternalLink color={"white"} size={10} />
                      </i>
                      <span className="chip-label">The Announcement Post</span>
                    </div>
                  </a>
                  .
                </div>
              </div>
              <button
                style={{ float: "right" }}
                onClick={() => setShowMigrationWarning(false)}
              >
                <X color={"white"} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
