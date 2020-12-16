import Rewards from "./Rewards";
import { BASE_FACTOR } from "./constants";
import {
  blockReward,
  excludeUsd,
  formatCurrency,
  formatPercentage,
  formatTokenBalance,
  tokenName,
  tokenTicker,
} from "./helpers";
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
      (2 * liquidityToken.poolSupplyOfBaseToken * liquidityToken.balance) /
      liquidityToken.totalSupply;
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
                  Share of Pool
                </th>
                <th scope="col" className="text-right">
                  ELC Issuance Per Block
                </th>
                <th scope="col" className="text-right">
                  Tokens In Pool
                </th>
                <th scope="col" className="text-right">
                  Token Price
                </th>
                <th scope="col" className="text-right">
                  Total Value In Pool
                </th>
              </tr>
            </thead>
            <tbody>
              {excludeUsd(liquidityTokens).map((liquidityToken) => (
                <React.Fragment key={liquidityToken.id}>
                  <tr>
                    <th scope="row" rowSpan="2">
                      {tokenName(liquidityToken)}
                    </th>
                    <td className="text-right" rowSpan="2">
                      {formatPercentage(
                        liquidityToken.balance / liquidityToken.totalSupply
                      )}
                    </td>
                    <td className="text-right" rowSpan="2">
                      {formatTokenBalance(
                        (blockReward(blockNumber) *
                          liquidityToken.balance *
                          BASE_FACTOR) /
                          (liquidityToken.totalSupply * 3)
                      )}
                    </td>
                    <td className="text-right no-padding-bottom">
                      {formatTokenBalance(
                        (liquidityToken.poolSupplyOfToken *
                          liquidityToken.balance) /
                          liquidityToken.totalSupply
                      )}{" "}
                      {tokenTicker(liquidityToken)}
                    </td>
                    <td className="text-right" rowSpan="2">
                      {formatCurrency(
                        (liquidityToken.poolSupplyOfBaseToken * BASE_FACTOR) /
                          liquidityToken.poolSupplyOfToken
                      )}
                    </td>
                    <td className="text-right" rowSpan="2">
                      {formatCurrency(
                        ((liquidityToken.poolSupplyOfBaseToken *
                          liquidityToken.balance) /
                          liquidityToken.totalSupply) *
                          2
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right no-border no-padding-top">
                      +{" "}
                      {formatCurrency(
                        (liquidityToken.poolSupplyOfBaseToken *
                          liquidityToken.balance) /
                          liquidityToken.totalSupply
                      )}{" "}
                      USD
                    </td>
                  </tr>
                </React.Fragment>
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
