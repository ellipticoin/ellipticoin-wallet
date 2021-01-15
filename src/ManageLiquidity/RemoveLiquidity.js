import { InputState } from "../Inputs";
import TokenSelect from "../Inputs/TokenSelect";
import { BASE_FACTOR, ZERO, LIQUIDITY_TOKENS, TOKENS } from "../constants";
import { stringToBigInt, encodeToken, Value } from "../helpers";
import { usePostTransaction } from "../mutations";
import { find, get } from "lodash";
import { default as React, useMemo, useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import NumberFormat from "react-number-format";

export default function RemoveLiquidity(props) {
  const { userTokens, liquidityTokens, onHide } = props;
  const [error, setError] = useState("");
  const [percentage, setPercentage] = useState({
    value: 100n * BASE_FACTOR,
  });
  const [removeToken, setRemoveToken] = useState(TOKENS[0]);
  const [removeLiquidity] = usePostTransaction({
    contract: "Exchange",
    functionName: "remove_liquidity",
  });
  const [removeLiquidityToken, setRemoveLiquidityToken] = useState(
    liquidityTokens[0]
  );
  const tokensInPool = useMemo(() => {
    if (!removeLiquidityToken || removeLiquidityToken.balance === 0n) return 0n;

    return (
      (removeLiquidityToken.balance * removeLiquidityToken.poolSupplyOfToken) /
      removeLiquidityToken.totalSupply
    );
  }, [removeLiquidityToken]);
  const baseTokensInPool = useMemo(() => {
    if (!removeLiquidityToken || removeLiquidityToken.balance === 0n) return 0n;

    return (
      (removeLiquidityToken.balance *
        removeLiquidityToken.poolSupplyOfBaseToken) /
      removeLiquidityToken.totalSupply
    );
  }, [removeLiquidityToken]);
  const handleRemoveLiquidity = async (event) => {
    event.preventDefault();

    const res = await removeLiquidity(
      encodeToken(removeToken),
      Number(percentage.value / 100n)
    );
    if (get(res, "returnValue.Err")) {
      setError(res.returnValue.Err.message);
    } else {
      onHide();
    }
  };
  useEffect(() => {
    setRemoveLiquidityToken(find(liquidityTokens, ["id", removeToken.id]));
  }, [removeToken, liquidityTokens]);

  const removePoolExists = useMemo(
    () => removeLiquidityToken && removeLiquidityToken.totalSupply > 0n,
    [removeLiquidityToken]
  );

  return (
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
            Tokens in Pool:{" "}
            <span className={false ? "text-danger" : ""}>
              <Value>{tokensInPool}</Value>
            </span>
          </Form.Label>
        </div>
        <TokenSelect
          tokens={LIQUIDITY_TOKENS}
          onChange={(token) => setRemoveToken(token)}
          token={removeToken}
          defaultValue={TOKENS[0]}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Percentage to Remove</Form.Label>
        <NumberFormat
          customInput={Form.Control}
          thousandSeparator={true}
          allowNegative={false}
          suffix="%"
          isAllowed={({ floatValue }) => !floatValue || floatValue <= 100}
          defaultValue="100"
          decimalScale={2}
          placeholder="Amount"
          onValueChange={(values) => {
            values.value = stringToBigInt(values.value);
            setPercentage(values);
          }}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>{removeToken.name} to Remove</Form.Label>
        <div>
          <Value>
            {(percentage.value * tokensInPool) / (BASE_FACTOR * 100n)}
          </Value>{" "}
          of <Value>{tokensInPool}</Value>
        </div>
        <hr className="mt-0" />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>USD To Remove</Form.Label>
        <div>
          <Value>
            {(percentage.value * baseTokensInPool) / (BASE_FACTOR * 100n)}
          </Value>{" "}
          of <Value>{baseTokensInPool}</Value>
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
        disabled={!removePoolExists || !percentage || percentage == 0n || false}
        className="btn btn-lg btn-block btn-primary mt-1"
        variant="contained"
        color="primary"
      >
        Remove Liquidity
      </Button>
      <div className="mt-2"> </div>
    </Form>
  );
}
