import { BASE_FACTOR, TOKENS } from "./constants";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { fetchPools, fetchTokens } from "./App.js";

import { Pool } from "ec-client";
import React from "react";
import { tokenToString } from "./helpers";

export default function ManageLiquidity(props) {
  const {
    show,
    setShow,
    ec,
    setBalance,
    blockHash,
    setTokens,
    setPools,
    publicKey,
  } = props;
  const [reserveAmount, setReserveAmount] = React.useState("");
  const [initialPrice, setInitialPrice] = React.useState("");
  const [token, setToken] = React.useState(TOKENS[0]);
  const [pool, setPool] = React.useState(new Pool(ec));
  React.useEffect(() => {
    (async () => {
      const pool = await ec.getPool(token);
      setPool(pool);
    })();
  }, [ec, token, blockHash]);
  const clearForm = () => {
    setReserveAmount("");
    setInitialPrice("");
  };
  const handleTokenChange = (tokenString) => {
    const token = TOKENS.find((token) => tokenToString(token) === tokenString);
    setToken(token);
  };
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (pool.exists()) {
      await addLiquidity();
    } else {
      await createPool();
    }
  };

  const addLiquidity = async () => {
    const response = await pool.addLiquidity(
      Math.floor(parseFloat(reserveAmount) * BASE_FACTOR)
    );
    if (response.return_value.Ok) {
      setBalance(response.return_value.Ok);
    }
    setPool(await ec.getPool(token));
    setShow(false);
    clearForm();
  };
  const createPool = async () => {
    console.log(reserveAmount);
    console.log(initialPrice);
    const response = await pool.create(
      Math.floor(parseFloat(reserveAmount) * BASE_FACTOR),
      Math.floor(parseFloat(initialPrice) * BASE_FACTOR)
    );
    if (response.return_value.hasOwnProperty("Ok")) {
      setTokens(await fetchTokens(ec, publicKey));
      setPools(await fetchPools(ec, publicKey));
    }
    setPool(await ec.getPool(token));
    setShow(false);
    clearForm();
  };
  return (
    <Modal show={show} className="action-sheet" onHide={() => setShow(false)}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Provide Liquidity</h5>
          </div>
          <div className="modal-body">
            <div className="action-sheet-content">
              <Form
                noValidate
                autoComplete="off"
                onSubmit={(evt) => handleSubmit(evt)}
              >
                <Form.Group className="basic">
                  <Form.Label>Token</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(event) => {
                      handleTokenChange(event.target.value);
                    }}
                    value={tokenToString(token)}
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
                    onChange={(event) => setReserveAmount(event.target.value)}
                    value={reserveAmount}
                    placeholder="Amount"
                  />
                </Form.Group>
                {pool.exists() ? null : (
                  <Form.Group className="basic">
                    <Form.Label>Initial Price</Form.Label>
                    {pool.exists() ? (
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
                            x {reserveAmount} = {reserveAmount * initialPrice}{" "}
                            USD
                          </InputGroup.Text>
                        </InputGroup.Append>
                      </InputGroup>
                    )}
                  </Form.Group>
                )}
                {pool.exists() ? (
                  <Button
                    type="submit"
                    className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                    variant="contained"
                    color="primary"
                  >
                    Add Liquidity
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                    variant="contained"
                    color="primary"
                  >
                    Create Pool
                  </Button>
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
