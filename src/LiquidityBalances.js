import Rewards from "./Rewards";
import { BASE_FACTOR } from "./constants";
import {
  blockReward,
  formatPercentage,
  tokenName,
  tokenTicker,
} from "./helpers";
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
                <th scope="col" className="text-right">
                  Your Share of Pool
                </th>
                <th scope="col" className="text-right">
                  Your ELC Issuance Per Block
                </th>
                <th scope="col" className="text-right">
                  Your Tokens In Pool
                </th>
                <th scope="col" className="text-right">
                  Implied Price Per Token
                </th>
                <th scope="col" className="text-right">
                  Your Total Value In Pool
                </th>
              </tr>
            </thead>
            <tbody>
              {excludeUsd(liquidityTokens).map((liquidityToken) => (
                <tr key={liquidityToken.id}>
                  <th scope="row">{tokenName(liquidityToken)}</th>
                  <td className="text-right">
                    {formatPercentage(liquidityToken.shareOfPool)}
                  </td>
                  <td className="text-right">
                    {formatTokenBalance(
                      (blockReward(blockNumber) * liquidityToken.shareOfPool) /
                        2
                    )}
                  </td>
                  <td className="text-right">
                    <p className="no-margin">
                      {formatTokenBalance(
                        liquidityToken.poolSupplyOfToken *
                          (liquidityToken.shareOfPool / BASE_FACTOR)
                      )}{" "}
                      {tokenTicker(liquidityToken)}
                    </p>
                    <p className="no-margin">
                      {"+ "}
                      {formatTokenBalance(
                        liquidityToken.poolSupplyOfBaseToken *
                          (liquidityToken.shareOfPool / BASE_FACTOR)
                      )}
                      {" USD"}
                    </p>
                  </td>
                  <td className="text-right">
                    {formatCurrency(liquidityToken.price)}
                  </td>
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
                <td></td>
                <td colSpan="5" className="text-right text-primary">
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
