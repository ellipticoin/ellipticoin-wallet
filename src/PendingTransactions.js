import { default as React, useEffect } from "react";

import { ExternalLink } from "react-feather";
import Spinner from "react-bootstrap/Spinner";
import classNames from "classnames";

export default function PendingTransactions(props) {
  const { pendingTransactions, setPendingTransactions, ethBlockNumber } = props;
  useEffect(() => {
    const confirmedTransactions = pendingTransactions.filter(
      ({ blockNumber }) => ethBlockNumber - blockNumber >= 6
    );
    if (confirmedTransactions.length) {
      setPendingTransactions(
        pendingTransactions.filter((pendingTransaction) =>
          confirmedTransactions.find(
            ({ transactionHash }) => transactionHash === pendingTransaction.hash
          )
        )
      );
    }
  }, [pendingTransactions, setPendingTransactions, ethBlockNumber]);

  return (
    <div
      className={classNames("toast-box", "toast-bottom", {
        show: pendingTransactions.length,
      })}
    >
      {pendingTransactions.map((pendingTransaction) => (
        <div
          key={pendingTransaction.hash || pendingTransaction.transactionHash}
        >
          <div>
            Waiting for Ethereum{" "}
            <span role="img" aria-label="tutle">
              &#128034;
            </span>
          </div>
          <div>
            <Spinner size="sm" animation="border" />
            Confirmations{" "}
            {Math.max(ethBlockNumber - pendingTransaction.blockNumber, 0)}/6: <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://etherscan.io/tx/${
                pendingTransaction.hash || pendingTransaction.transactionHash
              }`}
            >
              {pendingTransaction.hash || pendingTransaction.transactionHash}{" "}
              <ExternalLink size={12} color="#2196f3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
