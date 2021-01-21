import { InputState } from "./Inputs";
import TokenSelect from "./Inputs/TokenSelect";
import { BASE_FACTOR, ZERO, LIQUIDITY_TOKENS, TOKENS } from "./constants";
import { value } from "./helpers";
import { usePostTransaction } from "./mutations";
import { find, get } from "lodash";
import { useMemo, useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import NumberFormat from "react-number-format";
import { actions } from "ellipticoin";
import { ChevronLeft } from "react-feather";

export default function RemoveLiquidity(props) {
  const { address, tokens, liquidityTokens, onHide } = props;
  const [error, setError] = useState("");
  const [percentage, setPercentage] = useState({
    value: BASE_FACTOR,
  });
  const [token, setToken] = useState(TOKENS[0]);
  const liquidityToken = useMemo(() =>
    find(liquidityTokens, ["tokenAddress", token.address])
  );
  const [removeLiquidity] = usePostTransaction(
    actions.RemoveLiquidity,
    address
  );
  const tokensInPool = useMemo(() => {
    if (!liquidityToken || liquidityToken.balance === 0n) {
      return 0n;
    }

    return (
      (liquidityToken.balance * liquidityToken.poolSupplyOfToken) /
      liquidityToken.totalSupply
    );
  }, [liquidityToken]);
  const baseTokensInPool = useMemo(() => {
    if (!liquidityToken || liquidityToken.balance === 0n) {
      return 0n;
    }

    return (
      (liquidityToken.balance * liquidityToken.poolSupplyOfBaseToken) /
      liquidityToken.totalSupply
    );
  }, [liquidityToken]);
  const handleRemoveLiquidity = async (event) => {
    event.preventDefault();

    const result = await removeLiquidity(percentage.value, token.address);
    if (result == null) {
      onHide();
    } else {
      setError(result);
    }
  };

  const removePoolExists = useMemo(
    () => liquidityToken && liquidityToken.totalSupply > 0n
  );

  return (
    <div style={{ backgroundColor: "white", height: "100%" }}>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Remove Liquidity</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
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
                  {value(tokensInPool)}
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
                values.value =
                  (BigInt(parseInt(values.value)) * BASE_FACTOR) / 100n;
                setPercentage(values);
              }}
            />
          </Form.Group>
          <Form.Group className="basic">
            <Form.Label>{token.name} to Remove</Form.Label>
            <div>
              {value((percentage.value * tokensInPool) / BASE_FACTOR)}
              of {value(tokensInPool)}
            </div>
            <hr className="mt-0" />
          </Form.Group>
          <Form.Group className="basic">
            <Form.Label>USD To Remove</Form.Label>
            <div>
              {value((percentage.value * baseTokensInPool) / BASE_FACTOR)}
              of {value(baseTokensInPool)}
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
            disabled={
              !removePoolExists || !percentage || percentage == 0n || false
            }
            className="btn btn-lg btn-block btn-primary mt-1"
            variant="contained"
            color="primary"
          >
            Remove Liquidity
          </Button>
        </Form>
      </div>
    </div>
  );
}
