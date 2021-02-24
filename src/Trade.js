import { InputState, TokenAmountInput, TokenSelect } from "./Inputs";
import {
  TOKEN_METADATA,
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
  value,
  formatCurrency,
} from "./helpers";
import { usePostTransaction } from "./mutations";
import { find, get } from "lodash";
import { ExchangeCalculator } from "ellipticoin";
import { useMemo, useState, useEffect, useRef } from "react";
import { Button, Form, Collapse } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";
import { actions } from "ellipticoin";

export default function Trade(props) {
  const { onHide, liquidityTokens, tokens, address } = props;
  const [inputToken, setInputToken] = useState(USD);
  const [outputToken, setOutputToken] = useState(tokens[0]);
  const [inputAmount, setInputAmount] = useState();
  const inputAmountRef = useRef(null);
  const [error, setError] = useState("");
  const inputLiquidityToken = useMemo(() =>
    find(liquidityTokens, ["tokenAddress", inputToken.address])
  );
  const outputLiquidityToken = useMemo(() =>
    find(liquidityTokens, ["tokenAddress", outputToken.address])
  );
  const [trade] = usePostTransaction(actions.Trade, address);
  const handleTrade = async (e) => {
    e.preventDefault();
    let result = await trade(
      inputAmount,
      inputToken.address,
      outputAmount,
      outputToken.address
    );

    if (result) {
      setError(result);
    } else {
      onHide();
    }
  };

  const setMaxInputAmount = () => {
    inputAmountRef.current.setRawValue(
      Number(inputTokenBalance) / Number(BASE_FACTOR)
    );
  };

  const exchangeRateCalculator = useMemo(() => {
    if (liquidityTokens.length === 0) return;
    let exchangeRateCalculator = new ExchangeCalculator({
      liquidityTokens,
      baseTokenAddress: USD.address,
    });
    if (!inputAmount || inputAmount == 0n) return;
    return exchangeRateCalculator;
  });

  const outputAmount = useMemo(() => {
    if (!outputToken) return;
    if (!exchangeRateCalculator) return;
    return exchangeRateCalculator.getOutputAmount(
      inputAmount,
      inputToken.address,
      outputToken.address
    );
  });
  const exchangeRate = useMemo(() => {
    if (!outputToken) return;
    if (!exchangeRateCalculator) return;
    return exchangeRateCalculator.getExchangeRate(
      inputAmount,
      inputToken.address,
      outputToken.address
    );
  });
  const fee = useMemo(() => {
    if (!outputToken) return;
    if (!exchangeRateCalculator) return;
    return exchangeRateCalculator.getFee(
      inputAmount,
      inputToken.address,
      outputToken.address
    );
  });
  const disabled = useMemo(
    () =>
      !inputAmount ||
      !outputToken ||
      inputAmount == 0n ||
      inputToken.address.toString("hex") === outputToken.address.toString("hex")
  );

  const inputTokenBalance = useMemo(
    () => find(tokens, ["address", inputToken.address]).balance
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
                onSubmit={(e) => handleTrade(e)}
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
                        {value(inputToken, inputToken.address)}
                      </u>
                    </Form.Label>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <TokenSelect
                        tokens={tokens}
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
                    tokens={tokens}
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
                      {value(fee, inputToken.address)}
                    </li>
                    <li>
                      <strong>Output Amount</strong>
                      <h3 className="m-0">
                        <Value>{outputAmount}</Value>{" "}
                        {outputToken &&
                          TOKEN_METADATA[outputToken.address].ticker}
                        <small>
                          {outputAmount && outputToken.ticker !== "USD" ? (
                            <>
                              {" "}
                              @ <Value token={USD}>{exchangeRate}</Value> /{" "}
                              {TOKEN_METADATA[outputToken.address].ticker}
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
