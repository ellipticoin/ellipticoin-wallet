import { value } from "./helpers";
import { blockReward } from "ellipticoin";
import { BASE_FACTOR } from "./constants";
export default function RewardPerBlock({ liquidityToken, blockNumber, MS }) {
  const numerator = liquidityToken.balance;
  const denominator = liquidityToken.totalSupply;
  const percentage = Number(numerator * 100n) / Number(denominator);

  const issuanceNumerator =
    liquidityToken.poolSupplyOfToken *
    blockReward(blockNumber, liquidityToken.tokenAddress);
  const issuance = issuanceNumerator / liquidityToken.totalSupply;
  const yourIssuance = (
    (Number(issuance) * percentage) /
    Number(BASE_FACTOR)
  ).toFixed(6);

  return (
    <>
      {liquidityToken.totalSupply &&
      blockReward(blockNumber, liquidityToken.tokenAddress)
        ? ` (${value(issuance, MS.address, {
            showCurrency: true,
            zeroString: "N/A",
          })}) = ${yourIssuance} MS`
        : null}
    </>
  );
}
