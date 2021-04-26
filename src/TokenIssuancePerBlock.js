import { value } from "./helpers";
import { blockReward } from "ellipticoin";
import { MS } from "./constants";
export default function RewardPerBlock({ liquidityToken, blockNumber }) {
  const tokenIssuance = blockReward(blockNumber, liquidityToken.tokenAddress);

  return (
    <>
      {liquidityToken.totalSupply &&
      blockReward(blockNumber, liquidityToken.tokenAddress)
        ? `${value(tokenIssuance, MS.address, {
            showCurrency: true,
            zeroString: "N/A",
          })}`
        : null}
    </>
  );
}
