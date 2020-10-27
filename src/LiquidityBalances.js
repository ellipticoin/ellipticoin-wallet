import { blockReward, formatPercentage, tokenName } from "./helpers";
import { formatCurrency, formatTokenBalance } from "./helpers";

import { BASE_FACTOR } from "./constants";
import { default as React } from "react";
import { sumBy } from "lodash";

export default function YourLiquidity(props) {
  const { liquidityTokens, blockNumber } = props;
  const total = sumBy(liquidityTokens, (liquidityToken) => {
    let total =
      liquidityToken.balance * 2 * (liquidityToken.price / BASE_FACTOR);
    return isNaN(total) ? 0 : total;
  });

  return (
    <div className="section mt-2">
      <div className="section-heading">
        <h2 className="title">Your Liquidity</h2>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table rounded">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col" className="text-right">
                  Number of Tokens (Value)
                </th>
                <th scope="col" className="text-right">
                  ELC Issuance Per Block (Percentage Share Pool)
                </th>
                <th scope="col" className="text-right">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {liquidityTokens.map((liquidityToken) => (
                <tr key={liquidityToken.id}>
                  <th scope="row">{tokenName(liquidityToken)}</th>
                  <td className="text-right">
                    {formatTokenBalance(liquidityToken.balance)} (
                    {formatCurrency(
                      (liquidityToken.price * liquidityToken.balance) /
                        BASE_FACTOR
                    )}
                    )
                  </td>
                  <td className="text-right">
                    {formatTokenBalance(
                      (blockReward(blockNumber) * liquidityToken.shareOfPool) /
                        2
                    )}{" "}
                    ({formatPercentage(liquidityToken.shareOfPool)})
                  </td>
                  <td className="text-right">
                    {formatCurrency(
                      (liquidityToken.price * liquidityToken.balance * 2) /
                        BASE_FACTOR
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className="text-right text-primary">
                  <strong>Total: {formatCurrency(total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}