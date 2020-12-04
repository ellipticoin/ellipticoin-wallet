import { InputState } from "../Inputs";
import TokenAmountInput from "../Inputs/TokenAmountInput";
import TokenSelect from "../Inputs/TokenSelect";
import { BASE_FACTOR, ZERO, LIQUIDITY_TOKENS, TOKENS } from "../constants";
import {
  excludeUsd,
  encodeToken,
  tokenName,
  formatCurrency,
  formatTokenBalance,
} from "../helpers";
import { usePostTransaction } from "../mutations";
import { EQ, BigInt, GT } from "jsbi";
import { find } from "lodash";
import { default as React, useMemo, useState } from "react";
import { Button, Form, InputGroup, Tab, Tabs } from "react-bootstrap";
import { ChevronLeft } from "react-feather";

export default function ManageLiquidity(props) {
  const { onHide, liquidityTokens, userTokens } = props;
  const [provideAmountState, setProvideAmountState] = useState(
    new InputState(ZERO)
  );
  const [removeAmountState, setRemoveAmountState] = useState(
    new InputState(ZERO)
  );
  const [initialPriceState, setInitialPriceState] = useState(
    new InputState(ZERO, "USD")
  );
  const [provideToken, setProvideToken] = useState(TOKENS[0]);
  const [removeToken, setRemoveToken] = useState(TOKENS[0]);
  const [provideLiquidityToken, setProvideLiquidityToken] = useState(
    liquidityTokens[0]
  );
  const [removeLiquidityToken, setRemoveLiquidityToken] = useState(
    liquidityTokens[0]
  );
  const [error, setError] = React.useState("");

  const userBaseTokenBalance = userTokens.filter(
    (t) => tokenName(t) === "USD"
  )[0].balance;

  const provideAmount = useMemo(() => {
    return provideAmountState.value;
  }, [provideAmountState]);
  const removeAmount = useMemo(() => {
    return removeAmountState.value;
  }, [removeAmountState]);
  const initialPrice = useMemo(() => {
    return initialPriceState.value;
  }, [initialPriceState]);

  React.useEffect(() => {
    const provideLiquidityToken = liquidityTokens.find(
      (liquidityToken) => liquidityToken.id === provideToken.id
    );
    setProvideLiquidityToken(provideLiquidityToken);
  }, [provideToken, liquidityTokens]);
  React.useEffect(() => {
    setRemoveLiquidityToken(find(liquidityTokens, ["id", removeToken.id]));
  }, [removeToken, liquidityTokens]);

  const [createPool] = usePostTransaction({
    contract: "Exchange",
    functionName: "create_pool",
  });
  const [addliquidity] = usePostTransaction({
    contract: "Exchange",
    functionName: "add_liquidity",
  });
  const [removeliquidity] = usePostTransaction({
    contract: "Exchange",
    functionName: "remove_liquidity",
  });
  const providePoolExists = useMemo(
    () => parseInt(provideLiquidityToken.totalSupply) > 0,
    [provideLiquidityToken]
  );
  const removePoolExists = useMemo(
    () => parseInt(removeLiquidityToken.totalSupply) > 0,
    [removeLiquidityToken]
  );
  const providePrice = useMemo(() => {
    return providePoolExists ? provideLiquidityToken.price : initialPrice;
  }, [provideLiquidityToken, providePoolExists, initialPrice]);
  const provideBaseTokenAmount = useMemo(
    () => (provideAmount * providePrice) / BASE_FACTOR,
    [provideAmount, providePrice]
  );
  const userProvideTokenBalance = useMemo(() => {
    return userTokens.filter((t) => t.id === provideToken.id)[0].balance;
  }, [provideToken, userTokens]);

  const userTokensInPool = useMemo(() => {
    return (
      Math.round(
        (removeLiquidityToken.shareOfPool *
          removeLiquidityToken.poolSupplyOfToken) /
          BASE_FACTOR /
          10
      ) * 10
    );
  }, [removeLiquidityToken]);

  const userBaseTokensInPool = useMemo(() => {
    if (EQ(removeLiquidityToken.shareOfPool, ZERO)) return ZERO;
    return (userTokensInPool * removeLiquidityToken.price) / BASE_FACTOR;
  }, [removeLiquidityToken, userTokensInPool]);

  const userHasEnoughProvideToken = () => {
    return provideAmount / userProvideTokenBalance <= 1;
  };
  const userHasEnoughRemoveToken = () => {
    return removeAmount / userTokensInPool <= 1;
  };
  const userHasEnoughBaseToken = () => {
    return (providePrice / BASE_FACTOR) * provideAmount <= userBaseTokenBalance;
  };

  const handleProvideSubmit = async (evt) => {
    evt.preventDefault();
    if (providePoolExists) {
      await handleAddLiquidity();
    } else {
      await handleCreatePool();
    }
  };
  const handleAddLiquidity = async () => {
    const res = await addliquidity(
      encodeToken(provideToken),
      Number(provideAmount)
    );
    if (!res.returnValue) {
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
  };
  const handleCreatePool = async () => {
    const res = await createPool(
      encodeToken(provideToken),
      Number(provideAmount),
      Number(initialPrice)
    );
    if (!res.returnValue) {
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
  };
  const handleRemoveLiquidity = async (evt) => {
    evt.preventDefault();

    let amountToRemove = removeAmount;
    if (EQ(removeAmount, userTokensInPool)) {
      amountToRemove = BigInt(
        (removeLiquidityToken.shareOfPool *
          removeLiquidityToken.poolSupplyOfToken) /
          BASE_FACTOR
      );
    }

    const res = await removeliquidity(
      encodeToken(removeToken),
      Number(amountToRemove)
    );
    if (!res.returnValue) {
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
  };

  const handleProvideTokenChanged = (token) => {
    setProvideToken(token);
    setProvideAmountState(new InputState(ZERO));
    setInitialPriceState(new InputState(ZERO, "USD"));
  };

  return (
    <div style={{ backgroundColor: "white", height: "100%" }}>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Manage Liquidity</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <Tabs defaultActiveKey="provideLiquidity" className="nav-tabs lined">
          <Tab eventKey="provideLiquidity" title="Provide Liquidity">
            <Form
              noValidate
              className="p-2"
              autoComplete="off"
              onSubmit={(evt) => handleProvideSubmit(evt)}
            >
              <Form.Group className="basic">
                <div className="labels">
                  <Form.Label>Token</Form.Label>
                  <Form.Label>
                    Your Balance:{" "}
                    <span
                      className={
                        !userHasEnoughProvideToken() ? "text-danger" : ""
                      }
                    >
                      {userProvideTokenBalance
                        ? formatTokenBalance(userProvideTokenBalance)
                        : "0"}
                    </span>
                  </Form.Label>
                </div>
                <TokenSelect
                  tokens={excludeUsd(LIQUIDITY_TOKENS)}
                  onChange={(token) => handleProvideTokenChanged(token)}
                  token={provideToken}
                  defaultValue={TOKENS[0]}
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <TokenAmountInput
                  onChange={(state) => setProvideAmountState(state)}
                  state={provideAmountState}
                  currency={provideToken.name}
                  placeholder="Amount"
                />
              </Form.Group>
              {providePoolExists ? null : (
                <Form.Group className="basic">
                  <Form.Label>Initial Price</Form.Label>
                  <InputGroup className="mb-3">
                    <TokenAmountInput
                      currency="USD"
                      onChange={(state) => setInitialPriceState(state)}
                      state={initialPriceState}
                      placeholder="Inital Price"
                    />
                  </InputGroup>
                </Form.Group>
              )}
              <Form.Group className="basic">
                <Form.Label>USD to Deposit</Form.Label>
                <div className="mt-1">
                  <span
                    className={userHasEnoughBaseToken() ? "" : "text-danger"}
                  >
                    {!provideBaseTokenAmount
                      ? "0"
                      : formatCurrency(provideBaseTokenAmount)}
                  </span>{" "}
                  of{" "}
                  {userBaseTokenBalance
                    ? formatTokenBalance(userBaseTokenBalance)
                    : "0"}
                </div>
                <hr className="mt-0" />
              </Form.Group>
              <div></div>
              {error ? (
                <div id="error-message">
                  <span className="text-danger">
                    <strong>Error: {error}</strong>
                  </span>
                </div>
              ) : null}
              <Button
                type="submit"
                className="btn btn-lg btn-block btn-primary mb-1"
                variant="contained"
                color="primary"
                disabled={
                  !userHasEnoughProvideToken() || !userHasEnoughBaseToken()
                }
              >
                {providePoolExists ? "Add Liquidity" : "Create Pool"}
              </Button>
              <div className="mt-2">
                <div>
                  Warning: You can lose value in fixed constant automated market
                  makers due to{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://blog.bancor.network/beginners-guide-to-getting-rekt-by-impermanent-loss-7c9510cb2f22"
                  >
                    impermanent loss
                  </a>
                  .
                </div>
              </div>
            </Form>
          </Tab>
          <Tab eventKey="removeLiquidity" title="Remove Liquidity">
            <Form
              noValidate
              className="p-2"
              autoComplete="off"
              onSubmit={(evt) => handleRemoveLiquidity(evt)}
            >
              <Form.Group className="basic">
                <div className="labels">
                  <Form.Label>Token</Form.Label>
                  <Form.Label>
                    Your Balance:{" "}
                    <span
                      className={
                        !userHasEnoughRemoveToken() ? "text-danger" : ""
                      }
                    >
                      {userTokensInPool
                        ? formatTokenBalance(userTokensInPool)
                        : "0"}
                    </span>
                  </Form.Label>
                </div>
                <TokenSelect
                  tokens={excludeUsd(LIQUIDITY_TOKENS)}
                  onChange={(token) => setRemoveToken(token)}
                  token={removeToken}
                  defaultValue={TOKENS[0]}
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <TokenAmountInput
                  onChange={(state) => setRemoveAmountState(state)}
                  state={removeAmountState}
                  currency={removeToken.name}
                  placeholder="Amount"
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>USD to Withdraw</Form.Label>
                <div>
                  <span
                    className={
                      (removeAmount / userTokensInPool) * userBaseTokensInPool >
                      userBaseTokensInPool
                        ? "text-danger"
                        : ""
                    }
                  >
                    {!removeAmount
                      ? "0"
                      : formatTokenBalance(
                          (removeAmount / userTokensInPool) *
                            userBaseTokensInPool
                        )}
                  </span>
                  <span>
                    {" "}
                    of{" "}
                    {userBaseTokensInPool
                      ? formatTokenBalance(userBaseTokensInPool)
                      : "0"}
                  </span>
                </div>
                <hr className="mt-0" />
              </Form.Group>
              {error ? (
                <div id="error-message">
                  <span className="text-danger">
                    <strong>Error: {error}</strong>
                  </span>
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={
                  !removePoolExists ||
                  !removeAmount ||
                  EQ(removeAmount, ZERO) ||
                  !userHasEnoughRemoveToken()
                }
                className="btn btn-lg btn-block btn-primary"
                variant="contained"
                color="primary"
              >
                Remove Liquidity
              </Button>
              <div className="mt-2">
                <div>
                  * Values will likely differ from original deposit values. You
                  were making a market, so when someone bought/sold, you
                  sold/bought to/from them in exchange for trading fees.
                </div>
              </div>
              <div className="mt-2"> </div>
            </Form>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
