import { default as React, useEffect, useState } from "react";

import { ExternalLink } from "react-feather";
import Spinner from "react-bootstrap/Spinner";
import classNames from "classnames";
import { difference } from "lodash";

const CONFIRMATION_API_ENDPOINT = "http://localhost:8085";
export default function PendingTransactions(props) {
  const { pendingTransactions, setPendingTransactions } = props;
  const [listeners, setListeners] = useState({});
  const [confirmations, setConfirmations] = useState({});

  useEffect(() => {
    difference(pendingTransactions, Object.keys(listeners)).forEach(
      (pendingTransaction) => {
        const evtSource = new EventSource(
          `${CONFIRMATION_API_ENDPOINT}/confirmations/${pendingTransaction}`
        );
        evtSource.addEventListener("confirmation", function (event) {
          let number = parseInt(event.data);
          if (number === 6) {
            setPendingTransactions(
              pendingTransactions.filter((p) => p !== pendingTransaction)
            );
          } else {
            setConfirmations({
              ...confirmations,
              [pendingTransaction]: number,
            });
          }
        });
        listeners[pendingTransaction] = evtSource;
        setListeners(listeners);
      }
    );
  }, [pendingTransactions, listeners, setPendingTransactions, confirmations]);
  return (
    <div
      className={classNames("toast-box", "toast-bottom", {
        show: pendingTransactions.length,
      })}
    >
      {pendingTransactions.map((pendingTransaction) => (
        <div key={pendingTransaction}>
          <div>
            Waiting for Ethereum{" "}
            <span role="img" aria-label="tutle">
              &#128034;
            </span>
          </div>
          <div>
            <Spinner size="sm" animation="border" />
            Confirmations {confirmations[pendingTransaction] || 0}/6:{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://etherscan.io/tx/${pendingTransaction}`}
            >
              {pendingTransaction} <ExternalLink size={12} color="#2196f3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
