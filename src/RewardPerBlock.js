import { Percentage, value } from "./helpers";
import { blockReward } from "ellipticoin";
import { BASE_FACTOR } from "./constants";
export default function RewardPerBlock({ liquidityToken, blockNumber, MS }) {
  const yourPercentageOfIssuance =
    Number(liquidityToken.balance) / Number(liquidityToken.totalSupply);
  const tokenIssuance = blockReward(blockNumber, liquidityToken.tokenAddress);

  const yourIssuance = (
    (Number(tokenIssuance) * yourPercentageOfIssuance) /
    Number(BASE_FACTOR)
  ).toFixed(6);

  return (
    <>
      <Percentage
        numerator={liquidityToken.balance}
        denominator={liquidityToken.totalSupply}
      />
      {liquidityToken.totalSupply &&
      blockReward(blockNumber, liquidityToken.tokenAddress)
        ? ` (${value(tokenIssuance, MS.address, {
            showCurrency: true,
            zeroString: "N/A",
          })}) = ${yourIssuance} MS`
        : null}
    </>
  );
}
