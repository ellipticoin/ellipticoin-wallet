import { downloadSecretKey } from "./helpers";
import base64url from "base64url";
import React from "react";
import { Modal } from "react-bootstrap";
import { BarChart, Download, Settings, Upload, X } from "react-feather";

export default function Sidebar(props) {
  let {
    showSidebar,
    setShowSidebar,
    setShowPage,
    publicKey,
    secretKey,
    setSecretKey,
    setSecretKeyDownloaded,
  } = props;

  const downloadPrivateKey = (option) => {
    downloadSecretKey(secretKey, true);
    setSecretKeyDownloaded(true);
  };

  const uploadPrivateKey = (option) => {
    inputEl.current.click();
  };
  const handleFileUpload = (event) => {
    event.preventDefault();
    let input = event.target;
    if (!input.files[0]) return undefined;
    let file = input.files[0];
    let fr = new FileReader();
    fr.onload = (event) => {
      event.preventDefault();
      setSecretKey(Buffer.from(event.target.result, "base64"));
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
              <div className="image-wrapper"></div>
              <div className="in">
                <strong>{base64url.encode(publicKey).slice(0, 20)}...</strong>
                <div className="text-muted"></div>
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
                <button
                  className="item"
                  onClick={() => setShowPage("NetworkStatistics")}
                >
                  <div className="icon-box">
                    <BarChart color="#333" />
                  </div>
                  <div className="in">Network Statistics</div>
                </button>
              </li>
              <li>
                <button
                  className="item"
                  onClick={() => setShowPage("Settings")}
                >
                  <div className="icon-box">
                    <Settings color="#333" />
                  </div>
                  <div className="in">Settings</div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
