import Rewards from "./Rewards";
import { BASE_FACTOR } from "./constants";
import { blockReward, formatPercentage, tokenName } from "./helpers";
import { excludeUsd, formatCurrency, formatTokenBalance } from "./helpers";
import { sumBy } from "lodash";
import { default as React } from "react";

export default function LiquidityBalances(props) {
  const {
    liquidityTokens,
    blockNumber,
    publicKey,
    setIssuanceRewards,
    issuanceRewards,
    totalLockedValue,
  } = props;
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
      <Rewards
        publicKey={publicKey}
        setIssuanceRewards={setIssuanceRewards}
        issuanceRewards={issuanceRewards}
        totalLockedValue={totalLockedValue}
        blockNumber={blockNumber}
      />
      <div className="card">
        <div className="table-responsive">
          <table className="table rounded">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col" className="text-center">
                  ELC Issuance Per Block (Percentage Share Pool)
                </th>
                <th scope="col" className="text-center">
                  Tokens Locked
                </th>
                <th scope="col" className="text-center">
                  +
                </th>
                <th scope="col" className="text-center">
                  USD Locked
                </th>
                <th scope="col" className="text-right">
                  =
                </th>
                <th scope="col" className="text-right">
                  Total Locked Value
                </th>
              </tr>
            </thead>
            <tbody>
              {excludeUsd(liquidityTokens).map((liquidityToken) => (
                <tr key={liquidityToken.id}>
                  <th scope="row">{tokenName(liquidityToken)}</th>
                  <td className="text-center">
                    {formatTokenBalance(
                      (blockReward(blockNumber) * liquidityToken.shareOfPool) /
                        2
                    )}{" "}
                    ({formatPercentage(liquidityToken.shareOfPool)})
                  </td>
                  <td className="text-center">
                    {formatTokenBalance(
                      liquidityToken.poolSupplyOfToken *
                        (liquidityToken.shareOfPool / BASE_FACTOR)
                    )}
                  </td>
                  <td></td>
                  <td className="text-center">
                    {formatTokenBalance(
                      liquidityToken.poolSupplyOfBaseToken *
                        (liquidityToken.shareOfPool / BASE_FACTOR)
                    )}
                  </td>
                  <td></td>
                  <td className="text-right">
                    {formatCurrency(
                      liquidityToken.poolSupplyOfBaseToken *
                        (liquidityToken.shareOfPool / BASE_FACTOR) *
                        2
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="6"></td>
                <td className="text-right text-primary">
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
