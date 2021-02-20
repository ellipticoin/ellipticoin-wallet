import { InputState, TokenAmountInput, TokenSelect } from "./Inputs";
import {
  BASE_FACTOR,
  ELC,
  LIQUIDITY_FEE,
  TOKENS,
  USD,
  ZERO,
} from "./constants";
import {
  encodeToken,
  formatTokenBalance,
  tokenTicker,
  findToken,
  Value,
  formatCurrency,
} from "./helpers";
import { usePostTransaction, useSignAndMigrate } from "./mutations";
import { find, get } from "lodash";
import { ExchangeCalculator } from "ellipticoin";
import { useMemo, useState, useEffect, useRef } from "react";
import { Button, Form, Collapse } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";
import nacl from "tweetnacl";
import base64url from "base64url";
import { ethers } from "ethers";
import cbor from "cbor";
import EthCrypto from "eth-crypto";
import { actions } from "ellipticoin";

import {
  useEthereumAccounts,
  useEthereumConnected,
  getAccounts,
} from "./ethereum";
import { useLocalStorage } from "./helpers";

export default function Migrate() {
  const [secretKey, setSecretKey] = useLocalStorage(
    "secretKey",
    () => nacl.sign.keyPair().secretKey
  );
  const publicKey = useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
  const accounts = useEthereumAccounts();

  const step = () => {
    if (accounts && accounts[0]) {
      return (
        <SignAndMigrate
          address={accounts[0]}
          secretKey={secretKey}
          publicKey={publicKey}
        ></SignAndMigrate>
      );
    } else if (window.ethereum) {
      return (
        <Button
          onClick={() => ethereum.request({ method: "eth_requestAccounts" })}
        >
          Connect to MetaMask
        </Button>
      );
    } else {
      return <InstallMetamask />;
    }
  };
  return (
    <div className="section">
      <div className="appHeader no-border transparent position-absolute">
        <div className="pageTitle"></div>
        <div className="right"></div>
      </div>
      <div id="appCapsule" className="">
        <div className="section text-center">
          <h1>Migration Required</h1>
        </div>
        <div className="row justify-content-md-center">
          <div className="card col col-8">
            <div className="card-body">
              <p style={{ color: "red", textAlign: "center" }}>
                Ellipticoin is transitioning from native addresses and private
                keys to peer chain addresses and private keys. The first peer
                chain integration is Ethereum. Your private key is from the
                Ellipticoin prototype. Please proceed with migration by clicking
                below.
              </p>
              <div
                className="card-body"
                style={{ display: "flex", justifyContent: "center" }}
              >
                {step()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignAndMigrate(props) {
  const { secretKey, publicKey, setMigrated, address } = props;
  const signAndMigrate = useSignAndMigrate({
    secretKey,
    publicKey,
    setMigrated,
    address,
  });
  return (
    <Button
      onClick={() => signAndMigrate()}
      style={{ margin: "0 auto ", display: "block" }}
    >
      Migrate
    </Button>
  );
}

function Connect(props) {
  const { active, activate: activateWeb3 } = useWeb3();
}

function InstallMetamask(props) {
  const isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  const isFirefox = typeof InstallTrigger !== "undefined";

  if (isChrome) {
    return (
      <a
        href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        className="btn btn-primary"
      >
        Install MetaMask
      </a>
    );
  } else if (isFirefox) {
    return (
      <a
        href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
        target="_blank"
        className="btn btn-primary"
      >
        Install MetaMask
      </a>
    );
  } else {
    return (
      <>
        Please install{" "}
        <a target="_blank" href="https://www.google.com/chrome/">
          Chrome
        </a>{" "}
        or <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
      </>
    );
  }
}
