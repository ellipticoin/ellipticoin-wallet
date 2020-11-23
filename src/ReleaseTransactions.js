import { BASE_FACTOR, TOKENS } from "./constants";
import { useGetTransactionsByContractFunction } from "./queries";
import cbor from "cbor";
import { toChecksumAddress } from "ethereumjs-util";
import { BigInt } from "jsbi";
import { default as React } from "react";
import { Button, Form } from "react-bootstrap";

const decodeReleaseTxArgs = (txArgs) => {
  const decoded = cbor.decode(Buffer.from(txArgs, "base64"));

  return {
    token: TOKENS.find((token) => token.id === decoded[0].toString("base64")),
    address: toChecksumAddress("0x" + decoded[1].toString("hex")),
    amount: new BigInt(decoded[2]) / BASE_FACTOR,
  };
};

const pageSize = 10;

function ReleaseTransactions({ onReplayTransaction }) {
  const [page, setPage] = React.useState(0);
  const [releasing, setReleasing] = React.useState(false);

  const {
    data: { transactionsByContractFunction } = {
      transactionsByContractFunction: [],
    },
  } = useGetTransactionsByContractFunction("Bridge", "release", page, pageSize);

  const transactions = transactionsByContractFunction.map((tx) => {
    const txCopy = { ...tx };
    txCopy.arguments = decodeReleaseTxArgs(tx.arguments);
    return txCopy;
  });

  const nextOrPrev = (amountToAdd) => {
    setPage(page + amountToAdd);
  };

  const handleReplayTransactionEvent = async (
    evt,
    txId,
    tokenAddress,
    amount
  ) => {
    evt.preventDefault();
    setReleasing(true);
    await onReplayTransaction(evt, txId, tokenAddress, amount);
    setReleasing(false);
  };

  return (
    <div className="section mt-2">
      <h2>Ellipticoin Release Transactions:</h2>

      {page > 0 || transactions.length === pageSize ? (
        <nav>
          <ul className="pagination justify-content-end">
            <li className={page > 0 ? "page-item" : "page-item disabled"}>
              <a
                className="page-link"
                href="/#"
                onClick={(e) => nextOrPrev(-1)}
              >
                Newer
              </a>
            </li>
            <li
              className={
                transactions.length === pageSize
                  ? "page-item"
                  : "page-item disabled"
              }
            >
              <a className="page-link" href="/#" onClick={(e) => nextOrPrev(1)}>
                Older
              </a>
            </li>
          </ul>
        </nav>
      ) : null}

      {(transactions && transactions.length) || page !== 0 ? (
        <table className="table table-hover table-sm">
          <thead>
            <tr className="d-flex">
              <th className="col-4" scope="col">
                Block Number
              </th>
              <th className="col-3" scope="col">
                Token
              </th>
              <th className="col-4" scope="col">
                Quantity
              </th>
              <th className="col-1" scope="col">
                {" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr className="d-flex" key={tx.id}>
                <td className="col-4">{tx.blockNumber}</td>
                <td className="col-3">{tx.arguments.token.ticker}</td>
                <td className="col-4">{tx.arguments.amount}</td>
                <td className="col-1">
                  <Form
                    noValidate
                    onSubmit={(evt) =>
                      handleReplayTransactionEvent(
                        evt,
                        tx.id,
                        tx.arguments.token.address,
                        tx.arguments.amount
                      )
                    }
                  >
                    <Button
                      type="submit"
                      className="btn btn-block btn-primary m-1"
                      variant="contained"
                      color="primary"
                      disabled={releasing}
                    >
                      Resubmit
                    </Button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h3>No Release Transactions</h3>
      )}
    </div>
  );
}

export default React.memo(ReleaseTransactions);
