import { USD, BASE_FACTOR } from "./constants";

export function price(liquidityToken) {
  if (liquidityToken.tokenAddress === USD.address) return BASE_FACTOR;
  if (liquidityToken.poolSupplyOfToken === 0n) return BigInt(0);
  return (
    (liquidityToken.poolSupplyOfBaseToken * BASE_FACTOR) /
    liquidityToken.poolSupplyOfToken
  );
}
