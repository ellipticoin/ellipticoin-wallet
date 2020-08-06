import { Settings, Unlock, X, Download, Upload } from "react-feather";

import Identicon from "react-identicons";
import { Modal } from "react-bootstrap";
import React from "react";
import base64url from "base64url";
import { saveAs } from "file-saver";

export default function Sidebar(props) {
  let {
    showSidebar,
    setShowSidebar,
    publicKey,
    secretKey,
    setSecretKey,
  } = props;

  const downloadPrivateKey = (option) => {
    var blob = new Blob([Buffer.from(secretKey).toString("base64")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "ellipticoin-private-key.txt");
  };

  const uploadPrivateKey = (option) => {
    inputEl.current.click();
  };
  const handleFileUpload = (event) => {
    let input = event.target;
    if (!input.files[0]) return undefined;
    let file = input.files[0];
    let fr = new FileReader();
    fr.onload = (event) => {
      setSecretKey(Array.from(Buffer.from(event.target.result, "base64")));
    };
    fr.readAsText(file);
  };
  const inputEl = React.useRef(null);
  return (
    <>
      <input
        type="file"
        onChange={handleFileUpload}
        style={{ visibility: "hidden" }}
        ref={inputEl}
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
                <strong>{base64url.encode(publicKey).slice(0, 20)}...</strong>
                <div className="text-muted">test-test-123</div>
              </div>
              <button
                className="sidebar-close"
                onClick={() => setShowSidebar(false)}
              >
                <X />
              </button>
            </div>
            <ul className="listview flush transparent no-line image-listview">
              <li>
                <button className="item" onClick={() => downloadPrivateKey()}>
                  <div className="icon-box">
                    <Download color="#333" />
                  </div>
                  <div className="in">Download Private Key</div>
                </button>
              </li>
              <li>
                <button className="item" onClick={() => uploadPrivateKey()}>
                  <div className="icon-box">
                    <Upload color="#333" />
                  </div>
                  <div className="in">Load Private Key</div>
                </button>
              </li>
              <li>
                <button className="item">
                  <div className="icon-box">
                    <Settings color="#333" />
                  </div>
                  <div className="in">Settings</div>
                </button>
              </li>
              <li>
                <a href="app-index.html" className="item">
                  <div className="icon-box">
                    <Unlock color="#333" />
                  </div>
                  <div className="in">Unlock Ether</div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
