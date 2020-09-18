import { ETH_BRIDGE_ADDRESS, WETH, TOKENS } from "./constants";

import { ArrowDown } from "react-feather";
import { BRIDGE_TOKENS } from "./constants";
import BridgeJSON from "./Bridge.json";
import Button from "react-bootstrap/Button";
import { ChevronLeft } from "react-feather";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import Form from "react-bootstrap/Form";
import React from "react";
import Spinner from "react-bootstrap/Spinner";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Bridge as EcBridge, BASE_FACTOR } from "ec-client";
import { default as ethers } from "ethers";
import { stringToEthers } from "./helpers";

const { MaxUint256 } = ethers.constants;
const { hexlify } = ethers.utils;

export default function Bridge(props) {
  const {
    ec,
    onHide,
    setBalance,
    signer,
    publicKey,
    pushPendingTransation,
  } = props;
  const [amount, setAmount] = React.useState("");
  const [bridge, setBridge] = React.useState();
  const [ETHToken, setETHToken] = React.useState();
  const [isApproved, setIsApproved] = React.useState();
  const [transactionPending, setTransactionPending] = React.useState(false);
  const [allowance, setAllowance] = React.useState();
  const [token, setToken] = React.useState(BRIDGE_TOKENS[0]);
  React.useEffect(() => {
    if (!signer) {
      return;
    }
    let bridge = new ethers.Contract(
      ETH_BRIDGE_ADDRESS,
      BridgeJSON.abi,
      signer
    );
    setBridge(bridge);
  }, [signer]);

  React.useEffect(() => {
    if (!signer) {
      return;
    }
    let ETHToken = new ethers.Contract(token.address, ERC20JSON.abi, signer);
    setETHToken(ETHToken);
  }, [token, signer]);
  React.useEffect(() => {
    if (!allowance) return;
    setIsApproved(stringToEthers(amount).lt(allowance));
  }, [amount, allowance]);

  React.useEffect(() => {
    if (!signer || !token.address) {
      return;
    }
    (async () => {
      const erc20 = new ethers.Contract(token.address, ERC20JSON.abi, signer);
      setAllowance(
        await erc20.allowance(await signer.getAddress(), ETH_BRIDGE_ADDRESS)
      );
    })();
  }, [signer, token, setAllowance]);

  const release = async (event) => {
    event.preventDefault();
    const bridge = new EcBridge(ec, "Bridge", token.id);
    const response = await bridge.release(
      ethers.utils.arrayify(await signer.getAddress()),
      Math.floor(parseFloat(amount) * BASE_FACTOR)
    );
    if (response.return_value.Ok) {
      setBalance(response.return_value.Ok);
    }
    onHide();
    clearForm();
  };

  const approve = async (evt) => {
    evt.preventDefault();
    let tx = await ETHToken.approve(ETH_BRIDGE_ADDRESS, MaxUint256);
    setTransactionPending(true);
    await tx.wait();
    setTransactionPending(false);
    setIsApproved(true);
  };

  const clearForm = () => {
    setAmount("");
    setToken(BRIDGE_TOKENS[0]);
  };
  const handleTokenChange = (address) => {
    const token = TOKENS.find((token) => token.address === address);
    setToken(token);
  };

  const mint = async (evt) => {
    evt.preventDefault();
    let tx
    if(token.address === WETH.address) {
        tx = await bridge.mintWETH(
          hexlify(publicKey), {value: stringToEthers(amount)});
    } else {
        tx = await bridge.mint(
          token.address,
          hexlify(publicKey),
          stringToEthers(amount)
        );
    }
    setTransactionPending(true);
    pushPendingTransation(await tx.wait());
    setTransactionPending(false);
    clearForm();
    onHide();
  };

  const handleAmountChange = (event) => {
    let amount = event.target.value;
    amount = amount.replace(/[^0-9.,]+/g, "");
    setAmount(amount);
  };

  return (
    <>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Bridge</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        {signer ?
        <Tabs defaultActiveKey="mint" className="nav-tabs lined">
          <Tab eventKey="mint" title="Mint" className="p-2">
            <Form
              noValidate
              className="mt-2"
              autoComplete="off"
              onSubmit={(evt) => mint(evt)}
            >
              <Form.Group className="basic">
                <Form.Label>Token</Form.Label>
                <Form.Control
                  onChange={(event) => {
                    handleTokenChange(event.target.value);
                  }}
                  as="select"
                  value={token.address}
                  custom
                >
                  {BRIDGE_TOKENS.map((token) => (
                    <option key={token.name} value={token.address}>
                      {token.ethName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  onChange={(event) => handleAmountChange(event)}
                  value={amount}
                  placeholder="Amount"
                />
              </Form.Group>

              <div className="row justify-content-md-center mt-1">
                <ArrowDown />
              </div>
              <Form.Group className="basic">
                <Form.Label>Token</Form.Label>
                <div className="mt-1">{token.name}</div>
                <hr className="mt-0" />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <div className="mt-1">{amount || "Amount"}</div>
                <hr className="mt-0" />
              </Form.Group>
              {isApproved ? (
                <Button
                  disabled={transactionPending}
                  type="submit"
                  className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                  variant="contained"
                  color="primary"
                >
                  {transactionPending ? (
                    <Spinner size="md" animation="border" />
                  ) : (
                    "Mint"
                  )}
                </Button>
              ) : (
                <Button
                  disabled={transactionPending}
                  onClick={(event) => approve(event)}
                  className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                  variant="contained"
                  color="primary"
                >
                  {transactionPending ? (
                    <Spinner size="md" animation="border" />
                  ) : (
                    "Approve"
                  )}
                </Button>
              )}
            </Form>
          </Tab>
          <Tab eventKey="release" title="Release" className="p-2">
            <Form
              noValidate
              className="mt-2"
              autoComplete="off"
              onSubmit={(evt) => release(evt)}
            >
              <Form.Group className="basic">
                <Form.Label>Token</Form.Label>
                <Form.Control
                  onChange={(event) => {
                    handleTokenChange(event.target.value);
                  }}
                  as="select"
                  value={token.address}
                  custom
                >
                  {BRIDGE_TOKENS.map((token) => (
                    <option key={token.name} value={token.address}>
                      {token.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Amount"
                />
              </Form.Group>
              <div className="row justify-content-md-center mt-1">
                <ArrowDown />
              </div>
              <Form.Group className="basic">
                <Form.Label>Token</Form.Label>
                <div className="mt-1">{token.ethName}</div>
                <hr className="mt-0" />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <div className="mt-1">{amount || "Amount"}</div>
                <hr className="mt-0" />
              </Form.Group>
              <Button
                type="submit"
                className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                variant="contained"
                color="primary"
              >
                Release
              </Button>
            </Form>
          </Tab>
        </Tabs>
        :<p className="section mt-2 mb-2">Please install <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/">Metamask</a> or <a target="_blank" rel="noopener noreferrer" href="https://authereum.com/">Authereum</a></p>
    }
      </div>
    </>
  );
}
