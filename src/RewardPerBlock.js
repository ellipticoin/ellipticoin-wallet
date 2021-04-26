import { Percentage } from "./helpers";
import { blockReward } from "ellipticoin";
import { BASE_FACTOR } from "./constants";
export default function RewardPerBlock({ liquidityToken, blockNumber }) {
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
      {` (${yourIssuance} MS)`}
    </>
  );
}
