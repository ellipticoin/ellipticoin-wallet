import { ETH_BRIDGE_ADDRESS, WETH } from "./constants";

import { ArrowDown } from "react-feather";
import { BASE_FACTOR } from "./constants";
import { BRIDGE_TOKENS } from "./constants";
import BridgeJSON from "./Bridge.json";
import Button from "react-bootstrap/Button";
import TokenSelect from "./Inputs/TokenSelect.js";
import { ChevronLeft } from "react-feather";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import Form from "react-bootstrap/Form";
import { default as React } from "react";
import Spinner from "react-bootstrap/Spinner";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { differenceBy } from "lodash";
import { default as ethers } from "ethers";
import { stringToEthers } from "./helpers";
import { usePostTransaction } from "./mutations";

const { MaxUint256 } = ethers.constants;
const { hexlify, arrayify, parseUnits } = ethers.utils;

async function getSignature(transactionId) {
  return Buffer.from(
    await fetch(
      `https://luna-bridge.herokuapp.com/?transaction_id=${transactionId}`
      // `http://localhost:8085/?transaction_id=${transactionId}`
    ).then((response) => response.arrayBuffer())
  );
}

function erc20FromAddress(address, signer) {
  return new ethers.Contract(address, ERC20JSON.abi, signer);
}

export default function Bridge(props) {
  const {
    onHide,
    blockNumber,
    signer,
    publicKey,
    pushPendingTransation,
    ethAccounts,
  } = props;
  const [amount, setAmount] = React.useState("");
  const [bridge, setBridge] = React.useState();
  const [isApproved, setIsApproved] = React.useState();
  const [transactionPending, setTransactionPending] = React.useState(false);
  const [allowance, setAllowance] = React.useState();
  const [inboundToken, setInboundToken] = React.useState(BRIDGE_TOKENS[0]);
  const [outboundToken, setOutboundToken] = React.useState(BRIDGE_TOKENS[0]);
  const [ethAccount, setEthAccount] = React.useState(ethAccounts[0]);
  let [pendingTransactions, setPendingTransactions] = React.useState([]);
  React.useEffect(() => {
    setEthAccount(ethAccounts[0]);
  }, [ethAccounts]);
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
    if (!allowance) return;
    setIsApproved(stringToEthers(amount).lt(allowance));
  }, [amount, allowance]);

  React.useEffect(() => {
    if (!signer || !inboundToken.address) {
      return;
    }
    (async () => {
      const inboundTokenContract = erc20FromAddress(
        inboundToken.address,
        signer
      );
      const allowance = await inboundTokenContract.allowance(
        await signer.getAddress(),
        ETH_BRIDGE_ADDRESS
      );
      setAllowance(allowance);
    })();
  }, [signer, inboundToken, setAllowance]);
  React.useEffect(() => {
    (async () => {
      const stillPendingTransactions = pendingTransactions.filter(
        ({ blockNumber: transactionBlockNumber }) =>
          parseInt(blockNumber) <= parseInt(transactionBlockNumber)
      );
      let confirmedTransactions = differenceBy(
        pendingTransactions,
        stillPendingTransactions,
        "id"
      );
      if (confirmedTransactions.length) {
        setPendingTransactions(stillPendingTransactions);
        await Promise.all(
          confirmedTransactions.map(async (transaction) => {
            const signature = await getSignature(transaction.id);
            let tx;
            if (inboundToken.address === WETH.address) {
              tx = await bridge.releaseWETH(
                ethAccount,
                stringToEthers(amount),
                parseInt(transaction.id),
                hexlify(signature)
              );
            } else {
              tx = await bridge.release(
                inboundToken.address,
                ethAccount,
                stringToEthers(amount),
                parseInt(transaction.id),
                hexlify(signature)
              );
            }
            await tx.wait();
          })
        );
        clearForm();
        setTransactionPending(false);
        onHide();
      }
    })();
  }, [
    ethAccount,
    onHide,
    blockNumber,
    pendingTransactions,
    amount,
    bridge,
    publicKey,
    inboundToken,
  ]);

  const [postRelease] = usePostTransaction({
    contract: "Bridge",
    functionName: "release",
  });
  const release = async (event) => {
    event.preventDefault();
    setTransactionPending(true);
    try {
      const result = await postRelease(
        Buffer.from(inboundToken.id, "base64"),
        arrayify(ethAccount),
        Math.floor(parseFloat(amount) * BASE_FACTOR)
      );
      setPendingTransactions([...pendingTransactions, result]);
    } catch (e) {
      alert(e.message);
    }
  };

  const approve = async (evt) => {
    evt.preventDefault();
    const inboundTokenContract = erc20FromAddress(inboundToken.address, signer);
    let tx = await inboundTokenContract.approve(ETH_BRIDGE_ADDRESS, MaxUint256);
    setTransactionPending(true);
    await tx.wait();
    setTransactionPending(false);
    setIsApproved(true);
  };

  const clearForm = () => {
    setAmount("");
    setInboundToken(BRIDGE_TOKENS[0]);
  };
  const handleEthAccountChange = (ethAccount) => {
    setEthAccount(ethAccount);
  };

  const mint = async (evt) => {
    evt.preventDefault();
    let tx;
    if (inboundToken.address === WETH.address) {
      tx = await bridge.mintWETH(hexlify(publicKey), {
        value: stringToEthers(amount),
      });
    } else {
      const inboundTokenContract = erc20FromAddress(
        inboundToken.address,
        signer
      );
      const decimals = await inboundTokenContract.decimals();
      console.log(decimals);
      console.log(parseUnits(amount, decimals).toNumber());
      tx = await bridge.mint(
        inboundToken.address,
        hexlify(publicKey),
        parseUnits(amount, decimals)
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
        {signer ? (
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
                  <TokenSelect
                    tokens={BRIDGE_TOKENS}
                    nameProperty={"ethName"}
                    onChange={(token) => setInboundToken(token)}
                    token={inboundToken}
                  />
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
                  <div className="mt-1">{inboundToken.name}</div>
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

                  <TokenSelect
                    tokens={BRIDGE_TOKENS}
                    onChange={(token) => setOutboundToken(token)}
                    token={outboundToken}
                  />
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    disabled={transactionPending}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Amount"
                  />
                </Form.Group>
                <div className="row justify-content-md-center mt-1">
                  <ArrowDown />
                </div>
                <Form.Group className="basic">
                  <Form.Label>Token</Form.Label>
                  <div className="mt-1">{outboundToken.ethName}</div>
                  <hr className="mt-0" />
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    disabled={transactionPending}
                    onChange={(event) => {
                      handleEthAccountChange(event.target.value);
                    }}
                    as="select"
                    value={ethAccount}
                    custom
                  >
                    {ethAccounts.map((ethAccount) => (
                      <option key={ethAccount} value={ethAccount}>
                        {ethAccount}
                      </option>
                    ))}
                  </Form.Control>
                  <hr className="mt-0" />
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>Amount</Form.Label>
                  <div className="mt-1">{amount || "Amount"}</div>
                  <hr className="mt-0" />
                </Form.Group>
                <Button
                  type="submit"
                  disabled={transactionPending}
                  className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                  variant="contained"
                  color="primary"
                >
                  {transactionPending ? (
                    <Spinner size="md" animation="border" />
                  ) : (
                    "Release"
                  )}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        ) : (
          <p className="section mt-2 mb-2">
            Please install{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://metamask.io/"
            >
              Metamask
            </a>{" "}
            or{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://authereum.com/"
            >
              Authereum
            </a>
          </p>
        )}
      </div>
    </>
  );
}
