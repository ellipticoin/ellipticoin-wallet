import React from "react";
import { Button } from "react-bootstrap";
import { Droplet, Link, Repeat, Send, LogOut, Download } from "react-feather";
import { useContext } from "react";
import SettingsContext from "./SettingsContext";

export default function Actions(props) {
  const { setShowModal, setShowPage, zeroBalance } = props;
  const { investorModeEnabled, setInvestorModeEnabled } = useContext(
    SettingsContext
  );
  const actions = {
    Send: {
      icon: <Send />,
      style: "success",
      action: () => setShowModal("send"),
      text: "Send",
    },
    Trade: {
      icon: <Repeat />,
      style: "warning",
      action: () => setShowPage("Trade"),
      text: "Trade",
    },
    Deposit: {
      icon: <Download />,
      style: "deposit",
      action: () => setShowPage("Deposit"),
      text: "Deposit",
    },
    Withdraw: {
      icon: <LogOut />,
      style: "danger",
      action: () => setShowPage("Withdraw"),
      text: "Withdraw",
    },
    OrderBook: {
      icon: <LogOut />,
      style: "info",
      action: () => setShowPage("OrderBook"),
      text: "OrderBook",
    },
  };

  let investorActions = ["Send", "Trade", "OrderBook", "Deposit", "Withdraw"];
  let defaultActions = ["Send", "Trade", "Deposit", "Withdraw"];
  let activeActions = investorModeEnabled ? investorActions : defaultActions;

  return (
    <div className="wallet-footer">
      {activeActions.map((action, index) => (
        <div className="item" key={index}>
          <Button
            tabIndex={`${index}`}
            disabled={zeroBalance}
            onClick={(e) => {
              e.stopPropagation();
              actions[action].action();
            }}
            className={`icon-wrapper btn-${actions[action].style}`}
          >
            {actions[action].icon}
          </Button>
          <strong>{actions[action].text}</strong>
        </div>
      ))}
    </div>
  );
  return (
    <div className="wallet-footer">
      <div className="item">
        <Button
          tabIndex="1"
          disabled={zeroBalance}
          onClick={(e) => {
            e.stopPropagation();
            setShowModal("send");
          }}
          className="icon-wrapper btn-success"
        >
          <Send />
        </Button>
        <strong>Send</strong>
      </div>
      <div className="item">
        <Button
          tabIndex="2"
          disabled={zeroBalance}
          onClick={(e) => {
            e.stopPropagation();
            setShowPage("Trade");
          }}
          className="icon-wrapper btn-warning"
        >
          <Repeat />
        </Button>
        <strong>Trade</strong>
      </div>
      <div className="item">
        <Button
          tabIndex="2"
          disabled={zeroBalance}
          onClick={(e) => {
            e.stopPropagation();
            setShowPage("Withdraw");
          }}
          className="icon-wrapper btn-danger"
        >
          <LogOut />
        </Button>
        <strong>Withdraw</strong>
      </div>
    </div>
  );
}
