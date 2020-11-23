import { TokenAmountInput, TokenSelect } from "./Inputs";
import {
  BASE_FACTOR,
  LIQUIDITY_FEE,
  TOKENS,
  ZERO,
  USD,
  ELC,
} from "./constants";
import {
  encodeToken,
  formatTokenBalance,
  formatTokenExchangeRate,
} from "./helpers";
import { usePostTransaction } from "./mutations";
import { BigInt, add, subtract, multiply, divide, EQ } from "jsbi";
import { find } from "lodash";
import { default as React, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";

export default function Trade(props) {
  const { onHide, liquidityTokens, userTokens, investorModeEnabled } = props;
  const [inputAmount, setInputAmount] = React.useState();
  const [fee, setFee] = React.useState(ZERO);
  const [minimumOutputAmount, setMinimumOutputAmount] = React.useState("");
  const [inputToken, setInputToken] = React.useState(USD);
  const [outputToken, setOutputToken] = React.useState(ELC);
  const [inputLiquidityToken, setInputLiquidityToken] = React.useState(
    liquidityTokens
  );
  const [outputLiquidityToken, setOutputLiquidityToken] = React.useState(
    liquidityTokens
  );
  const [userTokenBalance, setUserTokenBalance] = React.useState();
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setInputLiquidityToken(find(liquidityTokens, ["id", inputToken.id]));
  }, [inputToken, liquidityTokens]);
  const [exchange] = usePostTransaction({
    contract: "Trade",
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
    let formattedMinimumOutputAmount =
      minimumOutputAmount.startsWith(".") || minimumOutputAmount === ""
        ? "0" + minimumOutputAmount
        : minimumOutputAmount;
    formattedMinimumOutputAmount = new BigInt(
      parseFloat(formattedMinimumOutputAmount) * BASE_FACTOR
    );
    let res = await exchange(
      encodeToken(inputToken),
      encodeToken(outputToken),
      Number(inputAmount),
      Number(formattedMinimumOutputAmount)
    );

    if (!res.returnValue) {
      clearForm();
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
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
        ? ((inputLiquidityToken.totalPoolSupply / BASE_FACTOR) *
            inputLiquidityToken.price) /
          BASE_FACTOR
        : outputLiquidityToken.totalPoolSupply / BASE_FACTOR;

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
      if(investorModeEnabled) {
        setMinimumOutputAmount((inputAmount / BASE_FACTOR).toString());
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
        setMinimumOutputAmount((inputAmountInBaseToken / BASE_FACTOR).toString());
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
        setMinimumOutputAmount((amount / BASE_FACTOR).toString());
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

  const handleMinimumOutputAmountChanged = (newVal) => {
    if (newVal && (isNaN(newVal) || isNaN(parseFloat(newVal)))) {
      setMinimumOutputAmount(minimumOutputAmount);
      return;
    }

    setMinimumOutputAmount(newVal);
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
                    <Form.Label>
                      Your Balance {formatTokenBalance(userTokenBalance)}
                    </Form.Label>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <TokenAmountInput
                        onChange={(value) => setInputAmount(value)}
                        value={inputAmount}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-6">
                      <TokenSelect
                        onChange={setInputToken}
                        token={inputToken}
                        defaultValue={USD}
                        tokens={TOKENS}
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
                      <Form.Control
                        onChange={(e) =>
                          handleMinimumOutputAmountChanged(e.target.value)
                        }
                        value={minimumOutputAmount}
                        placeholder="Output Token Amount"
                        type="input"
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
                      {outputAmount ? `${formatTokenBalance(outputAmount)} ${outputToken.ticker}` : null}
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
// </div>
// </div>
// </div>
//     <Form noValidate autoComplete="off" onSubmit={(evt) => handleSwap(evt)}>
//       <Form.Group className="basic">
//         <Form.Label>Input Token</Form.Label>
//         <TokenSelect
//           tokens={TOKENS}
//           onChange={(token) => setInputToken(token)}
//           token={inputToken}
//         />
//       </Form.Group>
//       <Form.Group className="basic">
//         <Form.Label>Input Amount</Form.Label>
//         <TokenAmountInput
//           onChange={(value) => setInputAmount(value)}
//           value={inputAmount}
//           placeholder="Amount"
//         />
//       </Form.Group>
//       <Form.Group className="basic">
//         <Form.Label>Your Balance</Form.Label>
//         <span className={inputAmount / userTokenBalance > 1 ? "text-danger" : ""}>
//           {formatTokenBalance(userTokenBalance)}
//         </span>
//       </Form.Group>
//       <div className="row justify-content-md-center mt-1">
//         <ArrowDown />
//       </div>
//       <Form.Group className="basic">
//         <Form.Label>Output Token</Form.Label>
//         <Form.Control
//           as="select"
//           onChange={(event) => {
//             handleOutputTokenChange(event.target.value);
//           }}
//           value={tokenToString(outputToken)}
//           custom
//         >
//           {TOKENS.map((token) => (
//             <option key={token.name} value={tokenToString(token)}>
//               {token.name}
//             </option>
//           ))}
//         </Form.Control>
//       </Form.Group>
//       <Form.Group className="basic">
//         <Form.Label>
//           Minimum Output Token Amount (slippage protection)
//         </Form.Label>
//         <Form.Control
//           onChange={(e) => handleMinimumOutputAmountChanged(e.target.value)}
//           value={minimumOutputAmount}
//           placeholder="Output Token Amount"
//           type="input"
//         />
//       </Form.Group>
//       <Form.Group className="basic">
//         <Form.Label>Current Rate</Form.Label>
//         <span>
//           {exchangeRate ? formatTokenExchangeRate(exchangeRate) : "N/A"}{" "}
//           {outputToken.ticker} {" "}/{" "} {inputToken.ticker}
//
//         </span>
//       </Form.Group>
//       <Form.Group className="basic">
//         <Form.Label>Available Quantity</Form.Label>
//         <span>{formatTokenBalance(availableQuantity * BASE_FACTOR)}</span>
//       </Form.Group>
//       <ul className="listview flush transparent simple-listview no-space mt-3">
//         <li>
//           <strong>Transaction Fee</strong>
//           <span className="text-success">Free while in Beta</span>
//         </li>
//         <li>
//           <strong>Liquidity Fee</strong>
//           <span>
//             {inputAmount ? inputAmount / BASE_FACTOR : 0} *{" "}
//             {inputToken.ticker === outputToken.ticker
//               ? "0"
//               : inputToken.ticker !== "USD" && outputToken.ticker !== "USD"
//               ? `~${LIQUIDITY_FEE / BASE_FACTOR * 2}`
//               : LIQUIDITY_FEE / BASE_FACTOR}{" "}
//             = {fee ? formatTokenExchangeRate(Number(fee) / Number(BASE_FACTOR)) : 0}{" "}
//             {inputToken.ticker}
//           </span>
//         </li>
//         <li>
//           <strong>Output Amount</strong>
//           <h3 className="m-0">
//             {outputAmount ? formatTokenBalance(outputAmount) : null}
//             <small>{outputAmount ? ` @ ${formatTokenExchangeRate(outputAmount / inputAmount)} ${outputToken.ticker} / ${inputToken.ticker}` : ""}</small>
//           </h3>
//         </li>
//       </ul>
//       {error ? (
//         <div id="error-message">
//           <span className="text-danger">
//             <strong>Error: {error}</strong>
//           </span>
//         </div>
//       ) : null}
//       <Button
//         type="submit"
//         className="btn btn-lg btn-block btn-primary m-1"
//         variant="contained"
//         color="primary"
//         disabled={!outputAmount || EQ(outputAmount, ZERO) || !inputAmount || EQ(inputAmount, ZERO) || inputToken.ticker === outputToken.ticker ||  inputAmount / userTokenBalance > 1}
//       >
//         Exchange
//       </Button>
//     </Form>
//   </div>
// </div>
