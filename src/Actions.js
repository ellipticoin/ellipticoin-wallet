import React from "react";
import { Button } from "react-bootstrap";
import { Droplet, Link, Repeat, Send, LogOut } from "react-feather";

export default function Actions(props) {
  const { setShowModal, setShowPage, zeroBalance } = props;
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
