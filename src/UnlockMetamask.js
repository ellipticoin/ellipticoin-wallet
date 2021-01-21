import { ethRequestAccounts } from "./ethereum";
import { useEthereumAccounts } from "./ethereum";
import { useState } from "react";
import { useStorageState } from "react-storage-hooks";
import Button from "react-bootstrap/Button";
import InstallMetamask from "./InstallMetamask";

export default function UnlockMetamask(props) {
  const [agreedToTestnet, setAgreedToTestnet] = useStorageState(
    localStorage,
    "agreedToTestnet",
    false
  );
  const [loadingEthereumAcccounts, ethereumAcccounts] = useEthereumAccounts();
  if (loadingEthereumAcccounts) return null;

  return window.ethereum ? (
    agreedToTestnet ? (
      <div
        className="d-flex align-content-center flex-wrap"
        style={{ height: "100%" }}
      >
        <Button
          onClick={() => ethRequestAccounts()}
          style={{ margin: "auto" }}
          className="align-self-center"
        >
          Unlock Metamask
        </Button>
      </div>
    ) : (
      <div
        className="d-flex align-content-center flex-wrap"
        style={{ height: "100%", backgroundColor: "white" }}
      >
        <div
          className="d-flex align-self-center align-content-center flex-column"
          style={{ margin: "auto" }}
        >
          <h1 className="text-center">This is a testnet.</h1>
          <h1 className="text-center">
            Bugs will be present and balances will be reset.
          </h1>
          <Button
            className="btn"
            style={{ margin: "auto" }}
            onClick={() => setAgreedToTestnet(true)}
          >
            I Agree
          </Button>
        </div>
      </div>
    )
  ) : (
    <InstallMetamask />
  );
}
