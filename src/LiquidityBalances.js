import Rewards from "./Rewards";
import { BASE_FACTOR, USD, TOKEN_METADATA } from "./constants";
import CompoundContext from "./CompoundContext";
import { formatPercentage, value, tokenTicker } from "./helpers";
import { sumBy } from "lodash";
import { Button } from "react-bootstrap";
import { Fragment } from "react";
import RewardPerBlock from "./RewardPerBlock";
import TokenIssuancePerBlock from "./TokenIssuancePerBlock";

export default function LiquidityBalances(props) {
  const {
    address,
    blockNumber,
    issuanceRewards,
    liquidityTokens,
    publicKey,
    zeroLiquidityBalance,
    setIssuanceRewards,
    setShowPage,
  } = props;

  const totalLiquidityBalance = liquidityTokens.reduce(
    (sum, liquidityToken) => {
      if (liquidityToken.balance == 0n) return sum;
      let total =
        ((liquidityToken.underlyingPoolSupplyOfBaseToken *
          liquidityToken.balance) /
          liquidityToken.totalSupply) *
        2n;

      return sum + total;
    },
    0n
  );
  return zeroLiquidityBalance ? (
    <div className="section mt-4">
      <h2 className="text-center">Add Liquidity</h2>
      <div className="text-center muted">
        Add liquidity to start earning Moonshine tokens
      </div>
      <Button
        type="submit"
        style={{ display: "block" }}
        className="btn mt-2 btn-lg btn-primary w-50 mx-auto"
        onClick={() => setShowPage("AddLiquidity")}
      >
        Add Liquidity
      </Button>
    </div>
  ) : (
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
                  MS Issuance per Block
                </th>

                <th scope="col" className="text-right">
                  Your Percentage of Pool (MS per Block)
                </th>
                <th scope="col" className="text-right">
                  Tokens In Pool
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
                        <TokenIssuancePerBlock
                          liquidityToken={liquidityToken}
                          blockNumber={blockNumber}
                        />
                      </td>
                      <td className="text-right" rowSpan="2">
                        <RewardPerBlock
                          liquidityToken={liquidityToken}
                          blockNumber={blockNumber}
                        />
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
                          liquidityToken.underlyingPoolSupplyOfBaseToken
                            ? Number(
                                (liquidityToken.underlyingPoolSupplyOfBaseToken *
                                  liquidityToken.balance *
                                  2n) /
                                  liquidityToken.totalSupply
                              )
                            : 0n,
                          USD.address,
                          { showCurrency: true }
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right no-border no-padding-top">
                        {liquidityToken.totalSupply &&
                          value(
                            liquidityToken.balance
                              ? (liquidityToken.underlyingPoolSupplyOfBaseToken *
                                  liquidityToken.balance) /
                                  liquidityToken.totalSupply
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
