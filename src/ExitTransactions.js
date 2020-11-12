import { default as React } from "react";
import cbor from "cbor";
import { toChecksumAddress } from "ethereumjs-util"
import { BigInt } from "jsbi";

import {useGetTransactionsByContractFunction} from './queries'
import {BASE_FACTOR, TOKENS} from './constants'
import {Button, Form} from 'react-bootstrap'

const decodeExitTxArgs = (txArgs) => {
  const decoded = cbor.decode(Buffer.from(txArgs, 'base64'))

  return {
    token: TOKENS.find(token => token.id === decoded[0].toString('base64')),
    address: toChecksumAddress("0x" + decoded[1].toString('hex')),
    amount: new BigInt(decoded[2]) / BASE_FACTOR
  };
}

function ExitTransactions({page, onReplayTransaction}) {

  const
  {
    data: { transactionsByContractFunction } = {transactionsByContractFunction: []}
  } = useGetTransactionsByContractFunction("Bridge", "release", page);

  const transactions = transactionsByContractFunction.map(tx => {
    const copy = {...tx};
    copy.arguments = decodeExitTxArgs(tx.arguments);
    return copy;
  });

  return (
    <div className="section mt-2">
      <ul className="listview flush simple-listview no-space mt-3">
        {transactions.map(tx => (
          <li key={tx.id}>
            <Form noValidate onSubmit={(evt) => onReplayTransaction(evt, tx.id, tx.arguments.token.address, tx.arguments.amount)}>
              <div className="container">
                <div className="row">
                  <div className="col-sm">
                    <span>Token:</span>
                  </div>
                  <div className="col-sm">
                    {tx.arguments.token.ticker}
                  </div>
                  <div className="col-sm">
                  </div>
                  <div className="col-sm">
                    Quantity:
                  </div>
                  <div className="col-sm">
                    {tx.arguments.amount}
                  </div>
                  <div className="col-sm">
                  </div>
                  <div className="col-sm">
                    ELC Block Number:
                  </div>
                  <div className="col-sm">
                    {tx.blockNumber}
                  </div>
                  <div className="col-sm">
                  </div>
                  <div className="col-sm">
                  </div>
                  <div className="col-sm">
                    <Button
                      type="submit"
                      className="btn btn-lg btn-block btn-primary m-1"
                      variant="contained"
                      color="primary"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default React.memo(ExitTransactions);
