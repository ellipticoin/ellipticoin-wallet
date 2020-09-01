import { formatCurrency, formatTokenBalance } from "./helpers";

import { BASE_FACTOR } from "./constants";
import { default as React } from "react";

export default function YourLiquidity(props) {
  const { pools, total } = props;

  if (pools.length === 0) return <></>;

  return (
    <div className="section mt-2">
      <div className="section-heading">
        <h2 className="title">Your Liquidity</h2>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table rounded">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Number of Shares</th>
                <th scope="col">Value per Share</th>
                <th scope="col" className="text-right">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <tr key={pool.name}>
                  <th scope="row">{pool.name}</th>
                  <td>{formatTokenBalance(pool.balance)}</td>
                  <td>{formatTokenBalance(pool.balance)}</td>
                  <td className="text-right text-primary">
                    {formatCurrency(pool.balance * (pool.price / BASE_FACTOR))}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="text-right text-primary">
                  <strong>Total: {formatCurrency(total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
