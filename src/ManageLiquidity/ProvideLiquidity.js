import TokenAmountInput from "../Inputs/TokenAmountInput";
import TokenSelect from "../Inputs/TokenSelect";
import { BASE_FACTOR, USD, LIQUIDITY_TOKENS, TOKENS } from "../constants";
import { encodeToken, tokenName, ValueUSD, Value } from "../helpers";
import { usePostTransaction } from "../mutations";
import { find, get } from "lodash";
import { default as React, useMemo, useState, useRef } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

export default function ProvideLiquidity(props) {
  const { userTokens, liquidityTokens, onHide } = props;
  const [error, setError] = useState();
  const [amount, setAmount] = useState(null);
  const amountRef = useRef(null);
  const [initialPrice, setInitialPrice] = useState(null);
  const [token, setToken] = useState(TOKENS[0]);
  const liquidityToken = useMemo(
    () => find(liquidityTokens, ["id", token.id]),
    [token, userTokens]
  );
  const providePoolExists = useMemo(
    () => liquidityToken && liquidityToken.totalSupply > 0n,
    [liquidityToken]
  );
  const baseTokenAmount = useMemo(() => {
    if (providePoolExists) {
      if (amount === null) return;
      return (
        (amount * liquidityToken.poolSupplyOfBaseToken) /
        liquidityToken.poolSupplyOfToken
      );
    } else {
      if (amount === null || initialPrice == null) return;
      return (amount * initialPrice) / BASE_FACTOR;
    }
  }, [initialPrice, amount, providePoolExists, liquidityToken]);

  const tokenBalance = useMemo(
    () => find(userTokens, ["id", token.id]).balance,
    [token, userTokens]
  );
  const baseTokenBalance = useMemo(
    () => get(find(userTokens, ["id", USD.id]), "balance"),
    [userTokens]
  );
  const disabled = useMemo(
    () =>
      amount == 0n ||
      amount > tokenBalance ||
      baseTokenAmount > baseTokenBalance,
    [amount, baseTokenBalance, baseTokenAmount, tokenBalance]
  );

  const [createPool] = usePostTransaction({
    contract: "Exchange",
    functionName: "create_pool",
  });
  const [addLiquidity] = usePostTransaction({
    contract: "Exchange",
    functionName: "add_liquidity",
  });
  const handleAddLiquidity = async () => {
    const res = await addLiquidity(encodeToken(token), Number(amount));
    if (!res.returnValue) {
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
  };
  const handleCreatePool = async () => {
    const res = await createPool(
      encodeToken(token),
      Number(amount),
      Number(initialPrice)
    );
    if (res.returnValue == null) {
      onHide();
    } else {
      setError(res.returnValue.Err.message);
    }
  };
  const maxProvideAmount = () => {
    if (tokenBalance) {
      setAmount(tokenBalance);
      amountRef.current.setRawValue(Number(tokenBalance) / Number(BASE_FACTOR));
    }
  };
  const handleProvideSubmit = async (evt) => {
    evt.preventDefault();
    if (providePoolExists) {
      await handleAddLiquidity();
    } else {
      await handleCreatePool();
    }
  };

  return (
    <Form
      noValidate
      className="p-2"
      autoComplete="off"
      onSubmit={(evt) => handleProvideSubmit(evt)}
    >
      <Form.Group className="basic">
        <div className="labels">
          <Form.Label>Token</Form.Label>
          <Form.Label
            onClick={() => maxProvideAmount()}
            className={tokenBalance ? "cursor-pointer" : ""}
          >
            Your Balance:{" "}
            <span className={amount > tokenBalance ? "text-danger" : ""}>
              <Value>{tokenBalance}</Value>
            </span>
          </Form.Label>
        </div>
        <TokenSelect
          tokens={LIQUIDITY_TOKENS}
          onChange={(token) => setToken(token)}
          token={token}
          defaultValue={TOKENS[0]}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Amount</Form.Label>
        <TokenAmountInput
          onChange={(amount) => setAmount(amount)}
          state={amount}
          ref={amountRef}
          currency={token.name}
          placeholder="Amount"
        />
      </Form.Group>
      {providePoolExists ? null : (
        <Form.Group className="basic">
          <Form.Label>Initial Price</Form.Label>
          <InputGroup className="mb-3">
            <TokenAmountInput
              currency="USD"
              onChange={(state) => setInitialPrice(state)}
              state={initialPrice}
              placeholder="Inital Price"
            />
          </InputGroup>
        </Form.Group>
      )}
      <Form.Group className="basic">
        <Form.Label>USD to Deposit</Form.Label>
        <div className="mt-1">
          <span
            className={baseTokenAmount > baseTokenBalance ? "text-danger" : ""}
          >
            <Value token={USD}>{baseTokenAmount || 0}</Value>
          </span>{" "}
          of <Value>{baseTokenBalance}</Value>
        </div>
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
        className="btn btn-lg btn-block btn-primary m-1"
        variant="contained"
        color="primary"
        disabled={disabled}
      >
        {providePoolExists ? "Add Liquidity" : "Create Pool"}
      </Button>
      <div className="mt-2">
        <div>
          Warning: You can lose value in fixed constant automated market makers
          due to{" "}
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
  );
}
