import { BASE_FACTOR, TOKENS } from "./constants";
import { Button, Form, InputGroup, Modal, Tab, Tabs } from "react-bootstrap";
import { fetchPools, fetchTokens } from "./App.js";

import { Pool } from "ec-client";
import React from "react";
import { tokenToString } from "./helpers";

export default function ManageLiquidity(props) {
  const {
    show,
    setShow,
    ec,
    blockHash,
    setTokens,
    setPools,
    publicKey,
  } = props;
  const [provideAmount, setProvideAmount] = React.useState("");
  const [removeAmount, setRemoveAmount] = React.useState("");
  const [initialPrice, setInitialPrice] = React.useState("");
  const [provideToken, setProvideToken] = React.useState(TOKENS[0]);
  const [removeToken, setRemoveToken] = React.useState(TOKENS[0]);
  const [providePool, setProvidePool] = React.useState(new Pool(ec));
  const [removePool, setRemovePool] = React.useState(new Pool(ec));
  React.useEffect(() => {
    (async () => {
      const providePool = await ec.getPool(provideToken);
      setProvidePool(providePool);
    })();
  }, [ec, provideToken, blockHash]);
  React.useEffect(() => {
    (async () => {
      const removePool = await ec.getPool(removeToken);
      setRemovePool(removePool);
    })();
  }, [ec, removeToken, blockHash]);
  const clearForm = () => {
    setProvideAmount("");
    setInitialPrice("");
  };
  const handleProvideTokenChange = (provideTokenString) => {
    const provideToken = TOKENS.find((provideToken) => tokenToString(provideToken) === provideTokenString);
    setProvideToken(provideToken);
  };
  const handleRemoveTokenChange = (removeTokenString) => {
    const removeToken = TOKENS.find((removeToken) => tokenToString(removeToken) === removeTokenString);
    setRemoveToken(removeToken);
  };
  const handleProvideSubmit = async (evt) => {
    evt.preventDefault();
    if (providePool.exists()) {
      await addLiquidity();
    } else {
      await createPool();
    }
  };

  const handleRemoveSubmit = async (evt) => {
    evt.preventDefault();
    await removeLiquidity();
  };


  const addLiquidity = async () => {
    const response = await providePool.addLiquidity(
      Math.floor(parseFloat(provideAmount) * BASE_FACTOR)
    );
    if (response.return_value.hasOwnProperty("Ok")) {
      setTokens(await fetchTokens(ec, publicKey));
      setPools(await fetchPools(ec, publicKey));
    }
    setProvidePool(await ec.getPool(provideToken));
    setShow(false);
    clearForm();
  };
  const removeLiquidity = async () => {
    const response = await removePool.removeLiquidity(
      Math.floor(parseFloat(removeAmount) * BASE_FACTOR)
    );
    if (response.return_value.hasOwnProperty("Ok")) {
      setTokens(await fetchTokens(ec, publicKey));
      setPools(await fetchPools(ec, publicKey));
    } else {
        console.error(response.return_value)
    }
    setProvidePool(await ec.getPool(provideToken));
    setShow(false);
    clearForm();
  };
  const createPool = async () => {
    const response = await providePool.create(
      Math.floor(parseFloat(provideAmount) * BASE_FACTOR),
      Math.floor(parseFloat(initialPrice) * BASE_FACTOR)
    );
    if (response.return_value.hasOwnProperty("Ok")) {
      setTokens(await fetchTokens(ec, publicKey));
      setPools(await fetchPools(ec, publicKey));
    }
    setProvidePool(await ec.getPool(provideToken));
    setShow(false);
    clearForm();
  };
  return (
    <Modal show={show} className="action-sheet" onHide={() => setShow(false)}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Manage Liquidity</h5>
          </div>
            <Tabs defaultActiveKey="provideLiquidity" className="nav-tabs lined">
            <Tab eventKey="provideLiquidity" title="Provide Liquidity">
              <Form
                noValidate
                className="p-2"
                autoComplete="off"
                onSubmit={(evt) => handleProvideSubmit(evt)}
              >
                <Form.Group className="basic">
                  <Form.Label>Token</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(event) => {
                      handleProvideTokenChange(event.target.value);
                    }}
                    value={tokenToString(provideToken)}
                    custom
                  >
                    {TOKENS.map((provideToken) => (
                      <option key={provideToken.name} value={tokenToString(provideToken)}>
                        {provideToken.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    onChange={(event) => setProvideAmount(event.target.value)}
                    value={provideAmount}
                    placeholder="Amount"
                  />
                </Form.Group>
                {providePool.exists() ? null : (
                  <Form.Group className="basic">
                    <Form.Label>Initial Price</Form.Label>
                    {providePool.exists() ? (
                      <Form.Control
                        onChange={(event) =>
                          setInitialPrice(event.target.value)
                        }
                        value={initialPrice}
                        placeholder="Initial Price"
                      />
                    ) : (
                      <InputGroup className="mb-3">
                        <Form.Control
                          onChange={(event) =>
                            setInitialPrice(event.target.value)
                          }
                          value={initialPrice}
                          placeholder="Inital Price"
                        />
                        <InputGroup.Append>
                          <InputGroup.Text id="basic-addon2">
                            x {provideAmount} = {provideAmount * initialPrice}{" "}
                            USD
                          </InputGroup.Text>
                        </InputGroup.Append>
                      </InputGroup>
                    )}
                  </Form.Group>
                )}
                {providePool.exists() ? (
                  <Button
                    type="submit"
                    className="btn btn-lg btn-block btn-primary"
                    variant="contained"
                    color="primary"
                  >
                    Add Liquidity
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="btn btn-lg btn-block btn-primary m-1"
                    variant="contained"
                    color="primary"
                  >
                    Create Pool
                  </Button>
                )}
              </Form>
            </Tab>
            <Tab eventKey="removeLiquidity" title="Remove Liquidity">
              <Form
                noValidate
                className="p-2"
                autoComplete="off"
                onSubmit={(evt) => handleRemoveSubmit(evt)}
              >
                <Form.Group className="basic">
                  <Form.Label>Token</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(event) => {
                      handleRemoveTokenChange(event.target.value);
                    }}
                    value={tokenToString(removeToken)}
                    custom
                  >
                    {TOKENS.map((token) => (
                      <option key={token.name} value={tokenToString(token)}>
                        {token.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    onChange={(event) => setRemoveAmount(event.target.value)}
                    value={removeAmount}
                    placeholder="Amount"
                  />
                </Form.Group>
                  <Button
                    type="submit"
                    disabled={!removePool.exists()}
                    className="btn btn-lg btn-block btn-primary"
                    variant="contained"
                    color="primary"
                  >
                    Remove Liquidity
                  </Button>
              </Form>
            </Tab>
            </Tabs>
            </div>
          </div>
    </Modal>
  );
}
