import { InputState, TokenAmountInput, TokenSelect } from "./inputs";
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
import { usePostTransaction } from "./mutations";
import { find, get } from "lodash";
import { ExchangeCalculator } from "ellipticoin";
import { default as React, useMemo, useState, useEffect, useRef } from "react";
import { Button, Form, Collapse } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";

export default function Trade(props) {
  const { onHide, liquidityTokens, userTokens, investorModeEnabled } = props;
  const [inputToken, setInputToken] = useState(USD);
  const [outputToken, setOutputToken] = useState(liquidityTokens[0]);
  const [inputAmount, setInputAmount] = useState();
  const inputAmountRef = useRef(null);
  const [error, setError] = useState("");
  const handleSwap = async (evt) => {
    evt.preventDefault();
    let res = await exchange(
      encodeToken(inputToken),
      encodeToken(outputToken),
      Number(inputAmount),
      0
    );

    if (get(res, "returnValue.Err")) {
      setError(res.returnValue.Err.message);
    } else {
      onHide();
    }
  };
  const [exchange] = usePostTransaction({
    contract: "Exchange",
    functionName: "exchange",
  });

  const setMaxInputAmount = () => {
    inputAmountRef.current.setRawValue(
      Number(inputTokenBalance) / Number(BASE_FACTOR)
    );
  };

  const exchangeRateCalculator = useMemo(() => {
    if (liquidityTokens.length === 0) return;
    let exchangeRateCalculator = new ExchangeCalculator({
      liquidityTokens,
      baseTokenId: USD.id,
    });
    if (!inputAmount || inputAmount == 0n) return;
    return exchangeRateCalculator;
  });

  const outputAmount = useMemo(() => {
    if (!outputToken) return;
    if (!exchangeRateCalculator) return;
    return exchangeRateCalculator.getOutputAmount(
      inputAmount,
      inputToken.id,
      outputToken.id
    );
  });
  const exchangeRate = useMemo(() => {
    if (!outputToken) return;
    if (!exchangeRateCalculator) return;
    return exchangeRateCalculator.getExchangeRate(
      inputAmount,
      inputToken.id,
      outputToken.id
    );
  });
  const fee = useMemo(() => {
    if (!outputToken) return;
    if (!exchangeRateCalculator) return;
    return exchangeRateCalculator.getFee(
      inputAmount,
      inputToken.id,
      outputToken.id
    );
  });
  const disabled = useMemo(
    () =>
      !inputAmount ||
      !outputToken ||
      inputAmount == 0n ||
      findToken(inputToken).ticker === findToken(outputToken).ticker
  );

  const inputTokenBalance = useMemo(
    () => find(userTokens, ["id", inputToken.id]).balance
  );

  return (
    <div className="section">
      <div className="appHeader no-border transparent position-absolute">
        <div className="left">
          <ChevronLeft onClick={() => onHide()} />
        </div>
        <div className="pageTitle"></div>
        <div className="right"></div>
      </div>
      <div id="appCapsule" className="">
        <div className="section text-center">
          <h1>Trade</h1>
        </div>
        <div className="row justify-content-md-center">
          <div className="card col col-8">
            <div className="card-body">
              <Form
                noValidate
                autoComplete="off"
                onSubmit={(evt) => handleSwap(evt)}
              >
                <Form.Group className="basic">
                  <div className="labels">
                    <Form.Label>From</Form.Label>
                    <Form.Label
                      onClick={() => setMaxInputAmount()}
                      className="cursor-pointer"
                    >
                      <u>
                        Your Balance:{" "}
                        <Value token={inputToken}>{inputTokenBalance}</Value>
                      </u>
                    </Form.Label>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <TokenSelect
                        tokens={[USD, ...liquidityTokens]}
                        defaultValue={USD}
                        onChange={(token) => setInputToken(token)}
                        token={inputToken}
                      />
                    </div>
                    <div className="col-4">
                      <TokenAmountInput
                        ref={inputAmountRef}
                        value={inputAmount}
                        onChange={(value) => setInputAmount(value)}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-2">
                      <Button
                        style={{ width: "100%" }}
                        onClick={() => setMaxInputAmount()}
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </Form.Group>
                <div className="row justify-content-md-center mt-1">
                  <ArrowDown />
                </div>
                <Form.Group className="basic">
                  <Form.Label>To</Form.Label>
                  <TokenSelect
                    onChange={setOutputToken}
                    defaultValue={liquidityTokens[0]}
                    tokens={liquidityTokens}
                    disabledTokens={[inputToken]}
                  />
                </Form.Group>
                <Collapse in={!disabled}>
                  <ul className="listview flush transparent simple-listview no-space mt-3">
                    <li>
                      <strong>Transaction Fee</strong>
                      <span className="text-success">Free while in Beta</span>
                    </li>
                    <li>
                      <strong>Liquidity Fee</strong>
                      <Value token={inputToken}>{fee}</Value>
                    </li>
                    <li>
                      <strong>Output Amount</strong>
                      <h3 className="m-0">
                        <Value>{outputAmount}</Value>{" "}
                        {outputToken && tokenTicker(outputToken)}
                        <small>
                          {outputAmount && outputToken.ticker !== "USD" ? (
                            <>
                              {" "}
                              @ <Value token={USD}>{exchangeRate}</Value> /{" "}
                              {tokenTicker(outputToken)}
                            </>
                          ) : null}
                        </small>
                      </h3>
                    </li>
                  </ul>
                </Collapse>
                {error ? (
                  <div id="error-message">
                    <span className="text-danger">
                      <strong>Error: {error}</strong>
                    </span>
                  </div>
                ) : null}
                <Button
                  type="submit"
                  className="btn btn-lg btn-block btn-primary m-1"
                  variant="contained"
                  color="primary"
                  disabled={disabled}
                >
                  Trade
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
