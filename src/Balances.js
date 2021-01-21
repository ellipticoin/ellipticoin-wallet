import { BASE_FACTOR, USD, TOKEN_METADATA } from "./constants";
import { findToken, Value, tokenTicker, USDValue } from "./helpers";

export default function Balances(props) {
  const { tokens, totalBalance } = props;

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
                <th scope="col" className="text-right">
                  Number of Tokens
                </th>
                <th scope="col" className="text-right">
                  Price
                </th>
                <th scope="col" className="text-right">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.address}>
                  <th scope="row">{TOKEN_METADATA[token.address].name}</th>
                  <td className="text-right">
                    <Value>{token.balance}</Value>
                  </td>
                  <td className="text-right">
                    <USDValue>{token.price}</USDValue>
                  </td>
                  <td className="text-right text-primary">
                    <Value token={USD}>
                      {token.balance * token.price/ BASE_FACTOR}
                    </Value>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total: <USDValue>{totalBalance}</USDValue>
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
