import { BASE_FACTOR } from "./constants";
import { default as React } from "react";
import { formatCurrency, formatTokenBalance } from "./helpers";

export default function Balances(props) {
  const { tokens, total } = props;

  return (
    <div className="section mt-2">
      <div className="section-heading">
        <h2 className="title">Your Balances</h2>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table rounded">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Number of Tokens</th>
                <th scope="col">Price</th>
                <th scope="col" className="text-right">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens
                .filter((token) => token.balance > 0)
                .map((token) => (
                  <tr key={token.name}>
                    <th scope="row">{token.name}</th>
                    <td>{formatTokenBalance(token.balance)}</td>
                    <td>{formatCurrency(token.price)}</td>
                    <td className="text-right text-primary">
                      {formatCurrency(
                        token.balance * (token.price / BASE_FACTOR)
                      )}
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
