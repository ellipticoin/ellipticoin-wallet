import { BRIDGE_ADDRESS, ETH_BRIDGE_ADDRESS, TOKENS } from "./constants";
import { stringToEthers, tokenToString } from "./helpers";

import { BRIDGE_TOKENS } from "./constants";
import BridgeJSON from "./Bridge.json";
import Button from "react-bootstrap/Button";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import React from "react";
import Spinner from "react-bootstrap/Spinner";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Token } from "ec-client";
import { default as ethers } from "ethers";

const { MaxUint256 } = ethers.constants;
const { hexlify } = ethers.utils;

export default function Bridge(props) {
  const {
    show,
    ellipticoin,
    onHide,
    setBalance,
    signer,
    publicKey,
    pushPendingTransation,
    tokens,
  } = props;
  const [amount, setAmount] = React.useState("0.01");
  const [bridge, setBridge] = React.useState();
  const [tokenAddress, setTokenAddress] = React.useState(
    BRIDGE_TOKENS[0].address
  );
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
    if (!signer || !tokenAddress) {
      return;
    }
    let ETHToken = new ethers.Contract(tokenAddress, ERC20JSON.abi, signer);
    setETHToken(ETHToken);
  }, [tokenAddress, signer]);
  React.useEffect(() => {
    if (!allowance) return;
    setIsApproved(stringToEthers(amount).lt(allowance));
  }, [amount, allowance]);

  React.useEffect(() => {
    if (!signer || !tokenAddress) {
      return;
    }
    (async () => {
      const erc20 = new ethers.Contract(tokenAddress, ERC20JSON.abi, signer);
      setAllowance(
        await erc20.allowance(await signer.getAddress(), ETH_BRIDGE_ADDRESS)
      );
    })();
  }, [signer, tokenAddress, setAllowance]);

  const release = async (event) => {
    event.preventDefault();
    const tokenContract = new Token(ellipticoin, token.issuer, token.id);
    const response = await tokenContract.transfer(
      BRIDGE_ADDRESS,
      Math.floor(parseFloat(amount) * 10000)
    );
    if (response.return_value.Ok) {
      setBalance(response.return_value.Ok);
    }

    setAmount("");
    setTokenAddress(tokens[0].address);
    onHide();
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
    setTokenAddress(tokens[0].address);
  };
  const handleTokenChange = (tokenString) => {
    const token = TOKENS.find((token) => tokenToString(token) === tokenString);
    setToken(token);
  };

  const mint = async (evt) => {
    evt.preventDefault();
    let tx = await bridge.mint(
      token.address,
      hexlify(publicKey),
      stringToEthers(amount)
    );
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
    <Modal show={show} className="action-sheet" onHide={onHide}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Bridge</h5>
          </div>
          <div className="modal-body">
            <div className="action-sheet-content">
              <Tabs defaultActiveKey="mint" className="nav-tabs lined">
                <Tab eventKey="mint" title="Mint">
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
                        value={token}
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
                        onChange={(event) => handleAmountChange(event)}
                        value={amount}
                        placeholder="Amount"
                      />
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
                <Tab>
                  <Form
                    noValidate
                    className="mt-2"
                    autoComplete="off"
                    onSubmit={(event) => release(event)}
                  >
                    <Form.Group className="basic">
                      <Form.Label>Token</Form.Label>
                      <Form.Control
                        onChange={(event) => {
                          handleTokenChange(event.target.value);
                        }}
                        as="select"
                        value={token}
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
                        onChange={(event) => handleAmountChange(event)}
                        value={amount}
                        placeholder="Amount"
                      />
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
                <Tab className="nav-item" eventKey="release" title="Release">
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
                          setTokenAddress(event.target.value);
                        }}
                        as="select"
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
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
