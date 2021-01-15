import Rewards from "./Rewards";
import { BASE_FACTOR, USD } from "./constants";
import {
  Percentage,
  formatPercentage,
  Value,
  Price,
  tokenName,
  findToken,
  tokenTicker,
} from "./helpers";
import { sumBy } from "lodash";
import { blockReward } from "ellipticoin";

import { default as React } from "react";
import { NumeralFormatter } from "cleave.js";

const numeralFormatter = new NumeralFormatter();
export default function LiquidityBalances(props) {
  const {
    liquidityTokens,
    blockNumber,
    publicKey,
    setIssuanceRewards,
    issuanceRewards,
  } = props;

  const totalLiquidityBalance = liquidityTokens.reduce(
    (sum, liquidityToken) => {
<<<<<<< HEAD
      const price =
        findToken(liquidityToken).name === "USD"
          ? BASE_FACTOR
          : liquidityToken.price;
      let total = liquidityToken.balance * ((price * 2n) / BASE_FACTOR);
=======
      let total =
        ((liquidityToken.poolSupplyOfBaseToken * liquidityToken.balance) /
          liquidityToken.totalSupply) *
        2n;

>>>>>>> mainnet
      return sum + total;
    },
    0n
  );

  return (
    <div className="section mt-2">
      <div className="section-heading">
        <h2 className="title">Your Liquidity</h2>
      </div>
      <Rewards
        publicKey={publicKey}
        setIssuanceRewards={setIssuanceRewards}
        issuanceRewards={issuanceRewards}
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
              {liquidityTokens.map((liquidityToken) => (
                <React.Fragment key={liquidityToken.id}>
                  <tr>
                    <th scope="row" rowSpan="2">
                      {findToken(liquidityToken).name}
                    </th>
                    <td className="text-right" rowSpan="2">
                      <Percentage
                        numerator={liquidityToken.balance}
                        denomiator={liquidityToken.totalSupply}
                      />
                    </td>
                    <td className="text-right" rowSpan="2">
                      {blockReward(blockNumber)}{" "}
                      {liquidityToken.balance ? (
                        <Value>
                          {((blockReward(blockNumber) *
                            BASE_FACTOR *
                            liquidityToken.balance) /
                            liquidityToken.totalSupply) *
                            3n}
                        </Value>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="text-right no-padding-bottom">
                      <Value>
                        {liquidityToken.totalSupply
                          ? (liquidityToken.poolSupplyOfToken *
                              liquidityToken.balance) /
                            liquidityToken.totalSupply
                          : 0n}
                      </Value>{" "}
                      {tokenTicker(liquidityToken)}
                    </td>
                    <td className="text-right" rowSpan="2">
                      <Price>
                        {liquidityToken.poolSupplyOfBaseToken
                          ? (liquidityToken.poolSupplyOfBaseToken *
                              BASE_FACTOR) /
                            liquidityToken.poolSupplyOfToken
                          : 0n}
                      </Price>
                    </td>
                    <td className="text-right" rowSpan="2">
                      <Price>
                        {liquidityToken.balance
                          ? ((liquidityToken.poolSupplyOfBaseToken *
                              liquidityToken.balance) /
                              liquidityToken.totalSupply) *
                            2n
                          : 0n}
                      </Price>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right no-border no-padding-top">
                      +{" "}
                      <Value token={USD}>
                        {liquidityToken.poolSupplyOfBaseToken
                          ? (liquidityToken.poolSupplyOfBaseToken *
                              liquidityToken.balance) /
                            liquidityToken.totalSupply
                          : 0n}
                      </Value>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              <tr>
                <td></td>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total: <Value token={USD}>{totalLiquidityBalance}</Value>
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
