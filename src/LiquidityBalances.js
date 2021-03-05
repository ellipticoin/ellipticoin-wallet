import Rewards from "./Rewards";
import { BASE_FACTOR, USD, MS, TOKEN_METADATA } from "./constants";
import CompoundContext from "./CompoundContext";
import { Percentage, formatPercentage, value, tokenTicker } from "./helpers";
import { sumBy } from "lodash";
import { blockReward } from "ellipticoin";
import { Fragment } from "react";

export default function LiquidityBalances(props) {
  const {
    address,
    blockNumber,
    issuanceRewards,
    liquidityTokens,
    publicKey,
    setIssuanceRewards,
    setShowPage,
  } = props;

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
          setShowPage={setShowPage}
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
                        {liquidityToken.totalSupply
                          ? value(
                              (liquidityToken.poolSupplyOfToken *
                                blockReward(
                                  blockNumber,
                                  liquidityToken.tokenAddress
                                )) /
                                liquidityToken.totalSupply,
                              MS.address,
                              { showCurrency: true, zeroString: "-" }
                            )
                          : "-"}
                      </td>
                      <td className="text-right no-padding-bottom">
                        {value(
                          liquidityToken.totalSupply
                            ? (liquidityToken.poolSupplyOfToken *
                                liquidityToken.balance) /
                                liquidityToken.totalSupply
                            : 0n,
                          liquidityToken.tokenAddress,
                          { showCurrency: true }
                        )}
                      </td>
                      <td className="text-right" rowSpan="2">
                        {value(
                          liquidityToken.poolSupplyOfBaseToken
                            ? (liquidityToken.poolSupplyOfBaseToken *
                                BASE_FACTOR) /
                                liquidityToken.poolSupplyOfToken
                            : 0n,
                          USD.address,
                          { showCurrency: true }
                        )}
                      </td>
                      <td className="text-right" rowSpan="2">
                        {value(
                          liquidityToken.balance
                            ? ((liquidityToken.poolSupplyOfBaseToken *
                                liquidityToken.balance) /
                                liquidityToken.totalSupply) *
                                2n
                            : 0n,
                          USD.address,
                          { showCurrency: true }
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right no-border no-padding-top">
                        {value(
                          liquidityToken.poolSupplyOfBaseToken
                            ? Number(
                                (liquidityToken.poolSupplyOfBaseToken *
                                  liquidityToken.balance) /
                                  liquidityToken.totalSupply
                              )
                            : 0n,
                          USD.address,
                          { showCurrency: true }
                        )}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              <tr>
                <td></td>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total:{" "}
                    {value(totalLiquidityBalance, USD.address, {
                      showCurrency: true,
                    })}
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
