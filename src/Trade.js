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
  formatTokenExchangeRate,
} from "./helpers";
import { usePostTransaction } from "./mutations";
import { BigInt, EQ, GT, add, divide, multiply, subtract } from "jsbi";
import { find } from "lodash";
import { default as React, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";

export default function Trade(props) {
  const { onHide, liquidityTokens, userTokens, investorModeEnabled } = props;

  const [fee, setFee] = React.useState(ZERO);
  const [inputToken, setInputToken] = React.useState(USD);
  const [outputToken, setOutputToken] = React.useState(ELC);
  const [inputAmountState, setInputAmountState] = React.useState(
    new InputState(null, inputToken.ticker)
  );
  const [
    minimumOutputAmountState,
    setMinimumOutputAmountState,
  ] = React.useState(new InputState(ZERO, outputToken.ticker));
  const [inputLiquidityToken, setInputLiquidityToken] = React.useState(
    liquidityTokens
  );
  const [outputLiquidityToken, setOutputLiquidityToken] = React.useState(
    liquidityTokens
  );
  const [userTokenBalance, setUserTokenBalance] = React.useState();
  const [error, setError] = React.useState("");

  const inputAmount = useMemo(() => {
    return inputAmountState.value;
  }, [inputAmountState]);

  const minimumOutputAmount = useMemo(() => {
    return minimumOutputAmountState.value;
  }, [minimumOutputAmountState]);

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
    setInputAmountState(new InputState(null));
    setMinimumOutputAmountState(new InputState(ZERO));
    setError("");
  };

  const setFeeInInputToken = (
    feeInBaseToken,
    priceInBaseToken,
    inputTokenName
  ) => {
    setFee(
      inputTokenName === "USD"
        ? feeInBaseToken / BASE_FACTOR
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
    setInputLiquidityToken(find(liquidityTokens, ["id", inputToken.id]));
    const userToken = find(userTokens, ["id", inputToken.id]);
    setUserTokenBalance(userToken.balance);
  }, [liquidityTokens, inputToken, userTokens]);

  React.useEffect(() => {
    setOutputLiquidityToken(find(liquidityTokens, ["id", outputToken.id]));
  }, [liquidityTokens, outputToken]);

  const availableQuantity = useMemo(() => {
    const quantity =
      outputToken.name === "USD"
        ? ((inputLiquidityToken.poolSupplyOfToken / BASE_FACTOR) *
            inputLiquidityToken.price) /
          BASE_FACTOR
        : outputLiquidityToken.poolSupplyOfToken / BASE_FACTOR;

    return isNaN(quantity) ? ZERO : quantity;
  }, [outputToken, inputLiquidityToken, outputLiquidityToken]);

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
      if (EQ(totalSupply, ZERO)) return new BigInt(0);
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
      if (EQ(totalSupply, ZERO)) return new BigInt(0);
      const baseTokenReserves = getBaseTokenReserves(totalSupply, price);
      const invariant = multiply(baseTokenReserves, totalSupply);
      const newTokenReserves = divide(
        invariant,
        add(baseTokenReserves, amountInBaseToken)
      );
      return subtract(totalSupply, newTokenReserves);
    };

    if (!inputAmount || !inputLiquidityToken.poolSupplyOfToken) {
      setFee(ZERO);
      return;
    }
    if (inputToken.name === outputToken.name) {
      setFee(ZERO);
      if (investorModeEnabled) {
        setMinimumOutputAmountState(
          new InputState(inputAmount, inputToken.name)
        );
      }
      return inputAmount;
    }

    let feeInBaseToken = 0;
    let inputAmountInBaseToken;
    if (inputToken.name === "USD") {
      inputAmountInBaseToken = inputAmount;
    } else {
      const inputAmountAfterFee = applyFee(inputAmount);
      feeInBaseToken =
        (inputAmount - inputAmountAfterFee) * inputLiquidityToken.price;

      inputAmountInBaseToken = calculateInputAmountInBaseToken(
        inputAmountAfterFee,
        new BigInt(inputLiquidityToken.poolSupplyOfToken),
        new BigInt(inputLiquidityToken.price)
      );
    }

    if (outputToken.name === "USD") {
      setFeeInInputToken(
        feeInBaseToken,
        inputLiquidityToken.price,
        inputToken.name
      );
      if (investorModeEnabled) {
        setMinimumOutputAmountState(
          new InputState(inputAmountInBaseToken, "USD")
        );
      }

      return inputAmountInBaseToken;
    }

    const outputAmountInBaseToken = applyFee(
      new BigInt(inputAmountInBaseToken)
    );
    const outputFeeInBaseToken =
      (inputAmountInBaseToken - outputAmountInBaseToken) * BASE_FACTOR;
    feeInBaseToken += Number(outputFeeInBaseToken);

    setFeeInInputToken(
      feeInBaseToken,
      inputLiquidityToken.price,
      inputToken.name
    );
    const amount = calculateAmountInOutputToken(
      outputAmountInBaseToken,
      new BigInt(outputLiquidityToken.poolSupplyOfToken),
      new BigInt(outputLiquidityToken.price)
    );
    if (investorModeEnabled) {
      setMinimumOutputAmountState(new InputState(amount));
    }
    return amount;
  }, [
    investorModeEnabled,
    inputAmount,
    inputToken,
    inputLiquidityToken,
    outputToken,
    outputLiquidityToken,
  ]);

  const maxInputAmount = () => {
    if (userTokenBalance) {
      setInputAmountState(
        new InputState(new BigInt(userTokenBalance), inputToken.ticker)
      );
    }
  };

  const inputTokenChanged = (token) => {
    setInputToken(token);
    setInputAmountState(new InputState(null));
    setMinimumOutputAmountState(new InputState(ZERO));
  };

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
                      onClick={() => maxInputAmount()}
                      className={userTokenBalance ? "cursor-pointer" : ""}
                    >
                      Your Balance:{" "}
                      {inputAmount &&
                      (!userTokenBalance ||
                        GT(inputAmount, userTokenBalance)) ? (
                        <span className="text-danger">
                          {formatTokenBalance(userTokenBalance)}
                        </span>
                      ) : (
                        formatTokenBalance(userTokenBalance)
                      )}
                    </Form.Label>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <TokenAmountInput
                        onChange={(state) => setInputAmountState(state)}
                        currency={inputToken.ticker}
                        state={inputAmountState}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-6">
                      <TokenSelect
                        tokens={TOKENS}
                        defaultValue={USD}
                        onChange={(token) => inputTokenChanged(token)}
                        token={inputToken}
                      />
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
                    defaultValue={ELC}
                    tokens={TOKENS}
                    disabledTokens={[inputToken]}
                  />
                </Form.Group>
                {investorModeEnabled ? (
                  <>
                    <Form.Group className="basic">
                      <Form.Label>
                        Minimum Output Token Amount (slippage protection)
                      </Form.Label>
                      <TokenAmountInput
                        onChange={(state) => setMinimumOutputAmountState(state)}
                        state={minimumOutputAmountState}
                        currency={outputToken.ticker}
                        placeholder="Output Token Amount"
                      />
                    </Form.Group>
                    <Form.Group className="basic">
                      <Form.Label>Current Rate</Form.Label>
                      <span>
                        {exchangeRate
                          ? formatTokenExchangeRate(exchangeRate)
                          : "N/A"}{" "}
                        {outputToken.ticker} / {inputToken.ticker}
                      </span>
                    </Form.Group>
                    <Form.Group className="basic">
                      <Form.Label>Available Quantity</Form.Label>
                      <span>
                        {formatTokenBalance(availableQuantity * BASE_FACTOR)}
                      </span>
                    </Form.Group>
                  </>
                ) : null}
                <ul className="listview flush transparent simple-listview no-space mt-3">
                  <li>
                    <strong>Transaction Fee</strong>
                    <span className="text-success">Free while in Beta</span>
                  </li>
                  <li>
                    <strong>Liquidity Fee</strong>
                    <span>
                      {inputAmount ? inputAmount / BASE_FACTOR : 0} *{" "}
                      {inputToken.ticker === outputToken.ticker
                        ? "0"
                        : inputToken.ticker !== "USD" &&
                          outputToken.ticker !== "USD"
                        ? `~${(LIQUIDITY_FEE / BASE_FACTOR) * 2}`
                        : LIQUIDITY_FEE / BASE_FACTOR}{" "}
                      ={" "}
                      {fee
                        ? formatTokenExchangeRate(
                            Number(fee) / Number(BASE_FACTOR)
                          )
                        : 0}{" "}
                      {inputToken.ticker}
                    </span>
                  </li>
                  <li>
                    <strong>Output Amount</strong>
                    <h3 className="m-0">
                      {outputAmount
                        ? `${formatTokenBalance(outputAmount)} ${
                            outputToken.ticker
                          }`
                        : null}
                      <small>
                        {outputAmount
                          ? ` @ ${formatTokenExchangeRate(
                              outputAmount / inputAmount
                            )} ${outputToken.ticker} / ${inputToken.ticker}`
                          : ""}
                      </small>
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
                  disabled={
                    !outputAmount ||
                    EQ(outputAmount, ZERO) ||
                    !inputAmount ||
                    EQ(inputAmount, ZERO) ||
                    inputToken.ticker === outputToken.ticker ||
                    inputAmount / userTokenBalance > 1
                  }
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
