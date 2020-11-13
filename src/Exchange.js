import { BASE_FACTOR, LIQUIDITY_FEE, TOKENS } from "./constants";
import { Button, Form } from "react-bootstrap";
import { encodeToken, tokenToString, formatTokenBalance } from "./helpers";

import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";
import { BigInt, add, subtract, multiply, divide } from "jsbi";
import { find } from "lodash";
import { default as React, useMemo } from "react";
import { usePostTransaction } from "./mutations";
import { TokenAmountInput, TokenSelect } from "./Inputs";

export default function Exchange(props) {
  const { onHide, liquidityTokens } = props;
  const [inputAmount, setInputAmount] = React.useState();
  const [inputToken, setInputToken] = React.useState(TOKENS[0]);
  const [outputToken, setOutputToken] = React.useState(TOKENS[3]);
  const [inputLiquidityToken, setInputLiquidityToken] = React.useState(
    liquidityTokens
  );
  React.useEffect(() => {
    setInputLiquidityToken(find(liquidityTokens, ["id", inputToken.id]));
  }, [inputToken, liquidityTokens]);
  const [exchange] = usePostTransaction({
    contract: "Exchange",
    functionName: "exchange",
  });
  const clearForm = () => {
    setInputAmount("");
  };
  const handleOutputTokenChange = (tokenString) => {
    const outputToken = TOKENS.find(
      (token) => tokenToString(token) === tokenString
    );
    setOutputToken(outputToken);
  };
  const handleSwap = async (evt) => {
    evt.preventDefault();
    await exchange(
      encodeToken(inputToken),
      encodeToken(outputToken),
      Number(inputAmount),
      Number(0)
    );
    clearForm();
    onHide();
  };
  const fee = useMemo(() => {
    return (LIQUIDITY_FEE * inputAmount) / BASE_FACTOR;
  }, [inputAmount]);
  const outputAmount = useMemo(() => {
    if (!inputAmount || !inputLiquidityToken.totalSupply) return;
    const elcPool = BigInt(inputLiquidityToken.totalSupply);
    const usdPool = divide(
      multiply(
        BigInt(inputLiquidityToken.totalSupply),
        BigInt(inputLiquidityToken.price)
      ),
      BASE_FACTOR
    );
    const invarient = multiply(elcPool, usdPool);
    const newElcPool = subtract(add(elcPool, inputAmount), fee);
    const newUsdPool = divide(invarient, newElcPool);
    const outputAmount = subtract(usdPool, newUsdPool);
    console.log(outputToken.name);
    if (outputToken.name === "USD") {
      return outputAmount;
    }
  }, [fee, inputAmount, inputLiquidityToken, outputToken]);
  return (
    <>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Exchange</h2>
      </div>
      <div id="appCapsule" className="p2 m-2">
        <Form noValidate autoComplete="off" onSubmit={(evt) => handleSwap(evt)}>
          <Form.Group className="basic">
            <Form.Label>Input Token</Form.Label>
            <TokenSelect
              tokens={TOKENS}
              onChange={(token) => setInputToken(token)}
              token={inputToken}
            />
          </Form.Group>
          <Form.Group className="basic">
            <Form.Label>Input Amount</Form.Label>
            <TokenAmountInput
              onChange={(value) => setInputAmount(value)}
              value={inputAmount}
              placeholder="Amount"
            />
          </Form.Group>
          <div className="row justify-content-md-center mt-1">
            <ArrowDown />
          </div>
          <Form.Group className="basic">
            <Form.Label>Output Token</Form.Label>
            <Form.Control
              as="select"
              onChange={(event) => {
                handleOutputTokenChange(event.target.value);
              }}
              value={tokenToString(outputToken)}
              custom
            >
              {TOKENS.map((token) => (
                <option key={token.name} value={tokenToString(token)}>
                  {token.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <ul className="listview flush transparent simple-listview no-space mt-3">
            <li>
              <strong>Transaction Fee</strong>
              <span className="text-success">Free while in Beta</span>
            </li>
            <li>
              <strong>Liquidity Fee</strong>
              <span>
                {inputAmount ? formatTokenBalance(inputAmount) : 0} *{" "}
                {LIQUIDITY_FEE / BASE_FACTOR} ={" "}
                {fee ? Number(fee) / Number(BASE_FACTOR) : 0}{" "}
                {inputToken.ticker}
              </span>
            </li>
            <li>
              <strong>Output Amount</strong>
              <h3 className="m-0">
                {outputAmount ? formatTokenBalance(outputAmount) : null}
              </h3>
            </li>
          </ul>
          <Button
            type="submit"
            className="btn btn-lg btn-block btn-primary m-1"
            variant="contained"
            color="primary"
          >
            Exchange
          </Button>
        </Form>
      </div>
    </>
  );
}
