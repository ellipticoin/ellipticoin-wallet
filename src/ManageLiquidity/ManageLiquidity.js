import { BASE_FACTOR, USD } from "../constants";
import { Button, Form, InputGroup, Tab, Tabs } from "react-bootstrap";
import {
  encodeToken,
  tokenToString,
  formatCurrency,
  formatTokenBalance,
  tokenName,
} from "../helpers";
import { find } from "lodash";
import { BigInt, greaterThan, multiply, divide } from "jsbi";
import { ChevronLeft } from "react-feather";
import { default as React, useMemo, useState, useEffect } from "react";
import TokenAmountInput from "../Inputs/TokenAmountInput";
import TokenSelect from "../Inputs/TokenSelect";
import { usePostTransaction } from "../mutations";

export default function ManageLiquidity(props) {
  const { onHide, liquidityTokens, tokens } = props;
  const [provideAmount, setProvideAmount] = useState();
  const [removeAmount, setRemoveAmount] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [provideToken, setProvideToken] = useState(tokens[0]);
  const [removeToken, setRemoveToken] = useState(tokens[0]);
  const [provideLiquidityToken, setProvideLiquidityToken] = useState(
    liquidityTokens[0]
  );
  const [removeLiquidityToken, setRemoveLiquidityToken] = useState(
    liquidityTokens[0]
  );
  useEffect(() => {
    setProvideToken(find(tokens, ["id", provideToken.id]));
  }, [provideToken, tokens]);
  useEffect(() => {
    setProvideLiquidityToken(find(liquidityTokens, ["id", provideToken.id]));
  }, [provideToken, liquidityTokens]);
  useEffect(() => {
    setRemoveLiquidityToken(find(liquidityTokens, ["id", removeToken.id]));
  }, [removeToken, liquidityTokens]);
  const [createPool] = usePostTransaction({
    contract: "Exchange",
    functionName: "create_pool",
  });
  const [addLiqidity] = usePostTransaction({
    contract: "Exchange",
    functionName: "add_liqidity",
  });
  const [removeLiqidity] = usePostTransaction({
    contract: "Exchange",
    functionName: "remove_liqidity",
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

  const handleRemoveTokenChange = (removeTokenString) => {
    const removeToken = tokens.find(
      (removeToken) => tokenToString(removeToken) === removeTokenString
    );
    setRemoveToken(removeToken);
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
    await addLiqidity(encodeToken(provideToken), Number(provideAmount));
    onHide();
  };
  const handleCreatePool = async () => {
    await createPool(
      encodeToken(provideToken),
      Number(provideAmount),
      Number(initialPrice)
    );
    onHide();
  };
  const handleRemoveLiquidity = async (evt) => {
    evt.preventDefault();
    await removeLiqidity(encodeToken(removeToken), Number(removeAmount));
    onHide();
  };

  const usdAmount = useMemo(() => {
    if (!initialPrice) return 0;
    return divide(multiply(provideAmount, initialPrice), BASE_FACTOR);
  }, [provideAmount, initialPrice]);
  const usdBalance = useMemo(
    () => BigInt(find(tokens, ["id", USD.id]).balance),
    [tokens]
  );
  const provideValidationError = useMemo(() => {
    if (!provideAmount) return;
    if (greaterThan(provideAmount || BigInt(0), BigInt(provideToken.balance))) {
      return `Insufficient ${tokenName(provideToken)} balance`;
    } else if (
      provideAmount &&
      initialPrice &&
      greaterThan(usdAmount, usdBalance)
    ) {
      return `Insufficient USD balance`;
    } else {
      return null;
    }
  }, [
    provideAmount,
    provideToken,
    initialPrice,
    usdAmount,
    usdBalance,
  ]);

  return (
    <>
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
                <Form.Label>Token</Form.Label>
                <TokenSelect
                  tokens={tokens}
                  onChange={(token) => setProvideToken(token)}
                  token={provideToken}
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <TokenAmountInput
                  onChange={(value) => setProvideAmount(value)}
                  value={provideAmount}
                  placeholder="Amount"
                />
              </Form.Group>
              {providePoolExists ? null : (
                <Form.Group className="basic">
                  <Form.Label>Initial Price</Form.Label>
                  <InputGroup className="mb-3">
                    <TokenAmountInput
                      currency="USD"
                      onChange={(value) => setInitialPrice(value)}
                      value={initialPrice}
                      placeholder="Inital Price"
                    />
                  </InputGroup>
                </Form.Group>
              )}
              <div></div>
              {providePoolExists ? (
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
                  className="btn btn-lg btn-block btn-primary mb-1"
                  variant="contained"
                  disabled={provideValidationError}
                  color="primary"
                >
                  {provideValidationError || "Create Pool"}
                </Button>
              )}
              <div className="mt-2">
                <strong>Depositing</strong>
                <div>
                  {tokenName(provideToken)}:{" "}
                  {provideAmount ? formatTokenBalance(provideAmount) : ""}
                </div>
                <div>
                  USD:{" "}
                  {provideBaseTokenAmount === 0
                    ? null
                    : formatCurrency(provideBaseTokenAmount)}
                </div>
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
                <Form.Label>Token</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(event) => {
                    handleRemoveTokenChange(event.target.value);
                  }}
                  value={tokenToString(removeToken)}
                  custom
                >
                  {tokens.map((token) => (
                    <option key={token.id} value={tokenToString(token)}>
                      {tokenName(token)}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Amount</Form.Label>
                <TokenAmountInput
                  onChange={(value) => setRemoveAmount(value)}
                  value={removeAmount}
                  placeholder="Amount"
                />
              </Form.Group>
              <Button
                type="submit"
                disabled={!removePoolExists || !removeAmount}
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
    </>
  );
}
