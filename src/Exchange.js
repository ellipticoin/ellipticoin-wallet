import { TokenAmountInput, TokenSelect } from "./Inputs";
import { BASE_FACTOR, LIQUIDITY_FEE, TOKENS } from "./constants";
import {
  encodeToken,
  tokenToString,
  formatTokenBalance,
  formatTokenExchangeRate,
} from "./helpers";
import { usePostTransaction } from "./mutations";
import { BigInt, add, subtract, multiply, divide } from "jsbi";
import { find } from "lodash";
import { default as React, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";

export default function Exchange(props) {
  const { onHide, liquidityTokens } = props;
  const [inputAmount, setInputAmount] = React.useState();
  const [fee, setFee] = React.useState(new BigInt(0));
  const [minimumOutputAmount, setMinimumOutputAmount] = React.useState(
    new BigInt(0)
  );
  const [inputToken, setInputToken] = React.useState(TOKENS[0]);
  const [outputToken, setOutputToken] = React.useState(TOKENS[3]);
  const [inputLiquidityToken, setInputLiquidityToken] = React.useState(
    liquidityTokens
  );
  const [outputLiquidityToken, setOutputLiquidityToken] = React.useState(
    liquidityTokens
  );
  const [error, setError] = React.useState("");
  const [availableQuantity, setAvailableQuantity] = React.useState(
    new BigInt(0)
  );

  const handleOutputTokenChange = (tokenString) => {
    const outputToken = TOKENS.find(
      (token) => tokenToString(token) === tokenString
    );
    setOutputToken(outputToken);
  };
  const handleSwap = async (evt) => {
    evt.preventDefault();
    let res = await exchange(
      encodeToken(inputToken),
      encodeToken(outputToken),
      Number(inputAmount),
      Number(minimumOutputAmount)
    );

    if (!res.returnValue) {
      clearForm();
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
  };

  const [exchange] = usePostTransaction({
    contract: "Exchange",
    functionName: "exchange",
  });
  const clearForm = () => {
    setInputAmount("");
    setError("");
    setMinimumOutputAmount("0");
  };

  const calculateAvailableQuantity = (
    inputLiquidityToken,
    outputLiquidityToken,
    outputTokenName
  ) => {
    const quantity =
      outputTokenName === "USD"
        ? (inputLiquidityToken.totalSupply / inputLiquidityToken.price) *
          BASE_FACTOR
        : outputLiquidityToken.totalSupply / BASE_FACTOR;

    setAvailableQuantity(isNaN(quantity) ? new BigInt(0) : quantity);
  };

  const setFeeInInputToken = (
    feeInBaseToken,
    priceInBaseToken,
    inputTokenName
  ) => {
    setFee(
      inputTokenName === "USD"
        ? feeInBaseToken
        : feeInBaseToken / priceInBaseToken
    );
  };

  const applyFee = (amount) => {
    return subtract(
      amount,
      divide(multiply(amount, LIQUIDITY_FEE), BASE_FACTOR)
    );
  };

  const getBaseTokenReserves = (totalSupply, price) => {
    return divide(multiply(totalSupply, price), BASE_FACTOR);
  };

  React.useEffect(() => {
    const _inputLiquidityToken = find(liquidityTokens, ["id", inputToken.id]);
    setInputLiquidityToken(_inputLiquidityToken);

    const _outputLiquidityToken = find(liquidityTokens, ["id", outputToken.id]);
    setOutputLiquidityToken(_outputLiquidityToken);

    calculateAvailableQuantity(
      inputLiquidityToken,
      outputLiquidityToken,
      outputToken.name
    );
  }, [
    inputToken,
    outputToken,
    inputLiquidityToken,
    outputLiquidityToken,
    liquidityTokens,
  ]);

  const exchangeRate = useMemo(() => {
    if (inputToken.ticker === outputToken.ticker) {
      return 1;
    }

    let outputTokenPrice =
      outputToken.ticker === "USD"
        ? BASE_FACTOR
        : outputLiquidityToken.price || 0;
    let inputTokenPrice =
      inputToken.ticker === "USD"
        ? BASE_FACTOR
        : inputLiquidityToken.price || 0;
    if (outputTokenPrice !== 0) {
      return inputTokenPrice / outputTokenPrice;
    } else {
      return null;
    }
  }, [inputToken, outputToken, inputLiquidityToken, outputLiquidityToken]);

  const outputAmount = useMemo(() => {
    const calculateInputAmountInBaseToken = (amount, totalSupply, price) => {
      const baseTokenReserves = getBaseTokenReserves(totalSupply, price);
      const invariant = multiply(baseTokenReserves, totalSupply);
      const newBaseTokenReserves = divide(invariant, add(totalSupply, amount));
      return baseTokenReserves - newBaseTokenReserves;
    };

    const calculateAmountInOutputToken = (
      amountInBaseToken,
      totalSupply,
      price
    ) => {
      const baseTokenReserves = getBaseTokenReserves(totalSupply, price);
      const invariant = multiply(baseTokenReserves, totalSupply);
      const newTokenReserves = divide(
        invariant,
        add(baseTokenReserves, amountInBaseToken)
      );
      return subtract(totalSupply, newTokenReserves);
    };
    if (!inputAmount || !inputLiquidityToken.totalSupply) {
      setFee(new BigInt(0));
      return;
    }
    if (inputToken.name === outputToken.name) {
      setFee(new BigInt(0));
      setMinimumOutputAmount(inputAmount);
      return inputAmount;
    }

    let feeInBaseToken = 0;
    let inputAmountInBaseToken;
    if (inputToken.name === "USD") {
      inputAmountInBaseToken = inputAmount;
    } else {
      const fee = applyFee(inputAmount);
      feeInBaseToken = (inputAmount - fee) * inputLiquidityToken.price;

      inputAmountInBaseToken = calculateInputAmountInBaseToken(
        fee,
        new BigInt(inputLiquidityToken.totalSupply),
        new BigInt(inputLiquidityToken.price)
      );
    }

    if (outputToken.name === "USD") {
      setFeeInInputToken(
        feeInBaseToken,
        inputLiquidityToken.price,
        inputToken.name
      );
      setMinimumOutputAmount(inputAmountInBaseToken);
      return inputAmountInBaseToken;
    }

    const fee = applyFee(inputAmountInBaseToken);
    feeInBaseToken += inputAmountInBaseToken - fee;

    setFeeInInputToken(
      feeInBaseToken,
      inputLiquidityToken.price,
      inputToken.name
    );
    const amount = calculateAmountInOutputToken(
      fee,
      new BigInt(outputLiquidityToken.totalSupply),
      new BigInt(outputLiquidityToken.price)
    );
    setMinimumOutputAmount(amount);
    return amount;
  }, [
    inputAmount,
    inputToken,
    inputLiquidityToken,
    outputToken,
    outputLiquidityToken,
  ]);

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
          <Form.Group className="basic">
            <Form.Label>
              Minimum Output Token Amount (slippage protection)
            </Form.Label>
            <TokenAmountInput
              onChange={(value) => setMinimumOutputAmount(value)}
              value={minimumOutputAmount}
              placeholder="Output Token Amount"
            />
          </Form.Group>
          <Form.Group className="basic">
            <Form.Label>Current Rate</Form.Label>
            <span>
              {inputToken.ticker} ={" "}
              {exchangeRate ? formatTokenExchangeRate(exchangeRate) : "N/A"}{" "}
              {outputToken.ticker}
            </span>
          </Form.Group>
          <Form.Group className="basic">
            <Form.Label>Available Quantity</Form.Label>
            <span>{formatTokenBalance(availableQuantity * BASE_FACTOR)}</span>
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
                {inputToken.ticker === outputToken.ticker
                  ? "0"
                  : inputToken.ticker !== "USD" && outputToken.ticker !== "USD"
                  ? (LIQUIDITY_FEE / BASE_FACTOR) * 2
                  : LIQUIDITY_FEE / BASE_FACTOR}{" "}
                = {fee ? Number(fee) / Number(BASE_FACTOR) : 0}{" "}
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
            disabled={!outputAmount || outputAmount < 0 || !inputAmount || inputAmount < 0 || inputToken.ticker === outputToken.ticker}
          >
            Exchange
          </Button>
        </Form>
      </div>
    </>
  );
}
