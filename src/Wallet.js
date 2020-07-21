import React from "react";
import Button from "react-bootstrap/Button";
import base64url from "base64url";
import Identicon from "react-identicons";
import copy from "copy-to-clipboard";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Bridge from "./Bridge";
import PendingTransactions from "./PendingTransactions";
import Logo from "./logo.svg";
import { useTransition, animated } from "react-spring";
import MenuIcon from "react-ionicons/lib/MdMenu";
import CloseIcon from "react-ionicons/lib/MdClose";
import ArrowForwardIcon from "react-ionicons/lib/MdArrowForward";
import SettingsIcon from "react-ionicons/lib/MdSettings";
import UnlockIcon from "react-ionicons/lib/MdUnlock";
import SwapIcon from "react-ionicons/lib/MdSwap";
import WaterIcon from "react-ionicons/lib/MdWater";
import ClipboardIcon from "react-ionicons/lib/MdClipboard";

const ELC_PRICE = 0.00005;

export default function Wallet(props) {
  const {
    ellipticoin,
    toAddress,
    createWallet,
    sendAmount,
    setToAddress,
    setBalance,
    setSendAmount,
    balance,
    publicKey,
    signer,
  } = props;
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showSend, setShowSend] = React.useState(false);
  const [showModal, setShowModal] = React.useState(null);
  const [pendingTransactions, setPendingTransactions] = React.useState([]);

  const [usdBalance, setUsdBalance] = React.useState();
  React.useEffect(() => {
    setUsdBalance(balance * ELC_PRICE);
  }, [balance]);

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    if (typeof balance !== "undefined") {
      setLoading(false);
    }
  }, [balance]);

  const clearForm = () => {
    setSendAmount(0);
    setToAddress(0);
  };
  const send = async (evt) => {
    evt.preventDefault();
    clearForm();
    setShowSend(false);
    let response = await ellipticoin.post({
      contract_address: Buffer.concat([
        Buffer(32),
        Buffer.from("Ellipticoin", "utf8"),
      ]),
      function: "transfer",
      arguments: [
        Array.from(base64url.toBuffer(toAddress)),
        Math.floor(parseFloat(sendAmount) * 10000),
      ],
    });
    if (response.return_value.Ok) {
      setBalance(response.return_value.Ok);
    }
  };

  const loader = useTransition(loading, null, {
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  return (
    <>
      {publicKey ? (
        <>
          {loader.map(({ item, key, props }) =>
            item ? (
              <animated.div key={item} style={props} id="loader">
                <img src={Logo} alt="icon" className="loading-icon" />
              </animated.div>
            ) : (
              <animated.div key={item} style={props}></animated.div>
            )
          )}

          <div className="appHeader bg-primary text-light">
            <div className="left">
              <button
                className="headerButton"
                data-toggle="modal"
                data-target="#sidebarPanel"
              >
                <MenuIcon
                  name="menu-outline"
                  color="#fff"
                  aria-label="menu outline"
                  onClick={() => setShowSidebar(true)}
                ></MenuIcon>
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
          <div id="appCapsule">
            <div className="section wallet-card-section pt-1">
              <div className="wallet-card">
                <div className="balance">
                  <div className="left">
                    <span className="title">Total Balance</span>
                    <h1 className="total">
                      $ {new Intl.NumberFormat().format(usdBalance.toFixed(2))}
                    </h1>
                  </div>
                </div>
                <div className="wallet-footer">
                  <div className="item">
                    <button onClick={() => setShowSend(true)}>
                      <div className="icon-wrapper bg-success">
                        <ArrowForwardIcon color="white" />
                      </div>
                      <strong>Send</strong>
                    </button>
                  </div>
                  <div className="item">
                    <button>
                      <div className="icon-wrapper bg-warning">
                        <SwapIcon color="white" />
                      </div>
                      <strong>Exchange</strong>
                    </button>
                  </div>
                  <div className="item">
                    <button onClick={() => setShowModal("bridge")}>
                      <div className="icon-wrapper bg-danger">
                        <SwapIcon color="white" />
                      </div>
                      <strong>Bridge</strong>
                    </button>
                  </div>
                  <div className="item">
                    <button>
                      <div className="icon-wrapper">
                        <WaterIcon color="white" />
                      </div>
                      <strong>Provide Liquidity</strong>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="section mt-1 mb-2">
              <div className="section-title">Your Address</div>
              <div className="card">
                <div className="card-body">
                  <div
                    className="alert alert-outline-secondary"
                    style={{ fontSize: 25 }}
                    role="alert"
                  >
                    {base64url.encode(publicKey)}
                    <button
                      onClick={() => copy(base64url.encode(publicKey))}
                      style={{ position: "absolute", top: 5, right: 5 }}
                    >
                      <ClipboardIcon color="#8494A8" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
            <div className="section mt-2">
              <div className="section-heading">
                <h2 className="title">Your Balances</h2>
              </div>
              <div className="card">
                <div className="table-responsive">
                  <table className="table rounded">
                    <thead>
                      <tr>
                        <th scope="col">Token</th>
                        <th scope="col">Change (24h)</th>
                        <th scope="col">Number of Tokens</th>
                        <th scope="col">Price</th>
                        <th scope="col" className="text-right">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Ellipticoin</th>
                        <td>0.00%</td>
                        <td>{(balance / 10000).toFixed(4)}</td>
                        <td>$ 0.50</td>
                        <td className="text-right text-primary">
                          ${" "}
                          {new Intl.NumberFormat().format(
                            usdBalance.toFixed(2)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="text-right text-primary">
                          <strong>
                            Total: ${" "}
                            {new Intl.NumberFormat().format(
                              usdBalance.toFixed(2)
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <PendingTransactions
            pendingTransactions={pendingTransactions}
            setPendingTransactions={setPendingTransactions}
          />
          <Modal
            show={showSend}
            className="action-sheet"
            onHide={() => setShowSend(false)}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Send</h5>
                </div>
                <div className="modal-body">
                  <div className="action-sheet-content">
                    <Form
                      noValidate
                      autoComplete="off"
                      onSubmit={(evt) => send(evt)}
                    >
                      <Form.Group className="basic">
                        <Form.Label>Token</Form.Label>
                        <Form.Control as="select" custom>
                          <option>Ellipticoin</option>
                          <option>USD</option>
                          <option>Bitcoin</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className="basic">
                        <Form.Label>To Address</Form.Label>
                        <Form.Control
                          onChange={(event) => setToAddress(event.target.value)}
                          placeholder="To Address"
                        />
                      </Form.Group>

                      <Form.Group className="basic">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          onChange={(event) =>
                            setSendAmount(event.target.value)
                          }
                          placeholder="Amount"
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                        variant="contained"
                        color="primary"
                      >
                        Send
                      </Button>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          <Bridge
            show={showModal === "bridge"}
            onHide={() => setShowModal(null)}
            signer={signer}
            pushPendingTransation={(tx) =>
              setPendingTransactions([...pendingTransactions, tx])
            }
            publicKey={publicKey}
          />
          <Modal
            show={showSidebar}
            className="sidebar dialogBox panelbox panelbox-left"
            onHide={() => setShowSidebar(false)}
          >
            <div className="modal-content">
              <div className="modal-body p-0">
                <div className="profileBox pt-2 pb-2">
                  <div className="image-wrapper">
                    <Identicon
                      bg="#fff"
                      size="32"
                      string={base64url.encode(publicKey)}
                    />
                  </div>
                  <div className="in">
                    <strong>
                      {base64url.encode(publicKey).slice(0, 20)}...
                    </strong>
                    <div className="text-muted">test-test-123</div>
                  </div>
                  <button
                    className="sidebar-close"
                    onClick={() => setShowSidebar(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <ul className="listview flush transparent no-line image-listview">
                  <li>
                    <a href="app-index.html" className="item">
                      <div className="icon-box">
                        <SettingsIcon color="#333" />
                      </div>
                      <div className="in">Settings</div>
                    </a>
                  </li>
                  <li>
                    <a href="app-index.html" className="item">
                      <div className="icon-box">
                        <UnlockIcon color="#333" />
                      </div>
                      <div className="in">Unlock Ether</div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <Button
          onClick={() => createWallet()}
          variant="contained"
          color="primary"
        >
          Create Wallet
        </Button>
      )}
    </>
  );
}
