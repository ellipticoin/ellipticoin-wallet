import Rewards from "./Rewards";
import { BASE_FACTOR, USD, TOKEN_METADATA } from "./constants";
import CompoundContext from "./CompoundContext";
import { Percentage, formatPercentage, Value, tokenTicker } from "./helpers";
import { sumBy } from "lodash";
import { blockReward } from "ellipticoin";
import { Fragment, useContext } from "react";

export default function LiquidityBalances(props) {
  const {
    address,
    liquidityTokens,
    blockNumber,
    publicKey,
    setIssuanceRewards,
    issuanceRewards,
  } = props;

  const { cDAIExchangeRate } = useContext(CompoundContext);
  const totalLiquidityBalance = liquidityTokens.reduce(
    (sum, liquidityToken) => {
      if (liquidityToken.balance == 0n) return sum;
      let total =
        ((liquidityToken.poolSupplyOfBaseToken * liquidityToken.balance) /
          liquidityToken.totalSupply) *
        2n;

      return sum + total;
    },
    0n
  );
  return (
    <div className="section mt-2">
      <div className="section-heading">
        <h2 className="title">Your Liquidity</h2>
      </div>
      {address && (
        <Rewards
          address={address}
          publicKey={publicKey}
          setIssuanceRewards={setIssuanceRewards}
          issuanceRewards={issuanceRewards}
          blockNumber={blockNumber}
        />
      )}
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
              {liquidityTokens
                .filter((liquidityToken) => liquidityToken.balance !== 0n)
                .map((liquidityToken) => (
                  <Fragment key={liquidityToken.tokenAddress}>
                    <tr>
                      <th scope="row" rowSpan="2">
                        {TOKEN_METADATA[liquidityToken.tokenAddress].name}
                      </th>
                      <td className="text-right" rowSpan="2">
                        <Percentage
                          numerator={liquidityToken.balance}
                          denomiator={liquidityToken.totalSupply}
                        />
                      </td>
                      <td className="text-right" rowSpan="2">
                        {liquidityToken.balance ? <Value>{0n}</Value> : 0}
                      </td>
                      <td className="text-right no-padding-bottom">
                        <Value>
                          {liquidityToken.totalSupply
                            ? (liquidityToken.poolSupplyOfToken *
                                liquidityToken.balance) /
                              liquidityToken.totalSupply
                            : 0n}
                        </Value>{" "}
                        {TOKEN_METADATA[liquidityToken.tokenAddress].ticker}
                      </td>
                      <td className="text-right" rowSpan="2">
                        ${" "}
                        <Value token={USD}>
                          {liquidityToken.poolSupplyOfBaseToken
                            ? (liquidityToken.poolSupplyOfBaseToken *
                                BASE_FACTOR) /
                              liquidityToken.poolSupplyOfToken
                            : 0n}
                        </Value>{" "}
                        USD
                      </td>
                      <td className="text-right" rowSpan="2">
                        ${" "}
                        <Value token={USD}>
                          {liquidityToken.balance
                            ? ((liquidityToken.poolSupplyOfBaseToken *
                                liquidityToken.balance) /
                                liquidityToken.totalSupply) *
                              2n
                            : 0n}
                        </Value>{" "}
                        USD
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right no-border no-padding-top">
                        + ${" "}
                        <Value>
                          {liquidityToken.poolSupplyOfBaseToken
                            ? Number(
                                (liquidityToken.poolSupplyOfBaseToken *
                                  liquidityToken.balance) /
                                  liquidityToken.totalSupply
                              ) * cDAIExchangeRate
                            : 0n}
                        </Value>{" "}
                        USD
                      </td>
                    </tr>
                  </Fragment>
                ))}
              <tr>
                <td></td>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total: $ <Value token={USD}>{totalLiquidityBalance}</Value>
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
