import { Percentage } from "./helpers";
import { blockReward } from "ellipticoin";
import { value } from "./helpers";
import { MS } from "./constants";

export default function RewardPerBlock({ liquidityToken, blockNumber }) {
  const yourIssuance =
    (liquidityToken.balance *
      blockReward(blockNumber, liquidityToken.tokenAddress)) /
    liquidityToken.totalSupply;

  return (
    <>
      <Percentage
        numerator={liquidityToken.balance}
        denominator={liquidityToken.totalSupply}
      />
      {` (${value(yourIssuance, MS.address, {
        showCurrency: true,
        zeroString: "N/A",
      })})`}
    </>
  );
}
