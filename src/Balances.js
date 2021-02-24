import { useContext } from "react";
import { BASE_FACTOR, USD, TOKEN_METADATA } from "./constants";
import { value } from "./helpers";
import CompoundContext, {
  interestRate,
  isCompoundToken,
} from "./CompoundContext";

export default function Balances(props) {
  const { tokens, totalBalance } = props;
  const { cDAIExchangeRate } = useContext(CompoundContext);

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
                  Interest Rate
                </th>
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
                  <td className="text-right">{interestRate(token) || "-"}</td>
                  <td className="text-right">{value(token.balance, token.address)}</td>
                  <td className="text-right">
                    {token.address === USD.address ? "$ 1.00": value(token.price, USD.address, {showCurrency: true})}
                  </td>
                  <td className="text-right text-primary">
                    {value(
                      (token.balance * token.price) / BASE_FACTOR,
                      USD.address
                    , {showCurrency: true})}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total: {value(totalBalance, USD.address, {showCurrency: true})}
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
