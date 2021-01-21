import base64url from "base64url";
import copy from "copy-to-clipboard";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";

const bytesToNumber = (bytes) =>
  Number(new DataView(new Uint8Array(bytes).buffer).getBigUint64(0, true));
export default function Wallet(props) {
  const { publicKey, ellipticoin, ethereumAccount } = props;
  const [amountUnlocked, setAmountUnlocked] = useState();
  const [isUnlocked, setUnlocked] = useState();
  const [unlockableBalance, setUnlockableBalance] = useState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ellipticoin || !ethereumAccount) {
      return;
    }
    (async function () {
      setUnlockableBalance(
        bytesToNumber(
          await ellipticoin.getStorage(
            new Buffer(32),
            "Ellipticoin",
            Buffer.concat([
              new Buffer([3]),
              Buffer.from(ethereumAccount.substring(2), "hex"),
            ])
          )
        ) / 100
      );
    })();
  }, [ellipticoin, ethereumAccount]);

  useEffect(() => {
    if (!ethereumAccount) {
      return;
    }
    (async function () {
      setUnlocked(
        (
          await ellipticoin.getStorage(
            new Buffer(32),
            "Ellipticoin",
            Buffer.concat([
              new Buffer([5]),
              Buffer.from(ethereumAccount.substring(2), "hex"),
            ])
          )
        )[0] === 1
      );
    })();
  }, [ellipticoin, ethereumAccount, open]);

  const handleClose = () => {
    setOpen(false);
  };

  const unlockEther = async (address) => {
    let {
      web3: {
        utils: { hexToBytes, toHex },
        eth: {
          personal: { sign },
        },
      },
    } = window;
    let signature = hexToBytes(
      await sign(
        toHex(`Unlock Ellipticoin at address: ${base64url(publicKey)}`),
        address
      )
    );
    setOpen(true);
    let transaction = await ellipticoin.post({
      contract_address: Buffer.concat([
        Buffer(32),
        Buffer.from("Ellipticoin", "utf8"),
      ]),
      function: "unlock_ether",
      arguments: [signature, Array.from(publicKey)],
    });
    setAmountUnlocked(transaction.return_value["Ok"]);
  };

  if (!ethereumAccount || isUnlocked === undefined) {
    return <></>;
  }
  // <Dialog
  //   open={open}
  //   onClose={handleClose}
  //   aria-labelledby="alert-dialog-title"
  //   aria-describedby="alert-dialog-description"
  // >
  //   <DialogTitle id="alert-dialog-title">
  //     {"Unlock Successful!"}
  //   </DialogTitle>
  //   <DialogContent>
  //     <DialogContentText id="alert-dialog-description">
  //       Congratulations! You&#39;ve unlocked&nbsp;
  //       {amountUnlocked ? (amountUnlocked / 10000).toFixed(2) : null} ELC!
  //     </DialogContentText>
  //   </DialogContent>
  //   <DialogActions>
  //     <Button onClick={handleClose} color="primary" autoFocus>
  //       Ok
  //     </Button>
  //   </DialogActions>
  // </Dialog>
  return (
    <>
      <Card>
        <div
          title={
            <>
              Wallet Address: {publicKey ? base64url(publicKey) : ""}
              <div
                aria-label="delete"
                onClick={() => copy(base64url(publicKey))}
              ></div>
            </>
          }
        />
        <div>
          {window.web3 ? (
            <Table aria-label="simple table">
              <body>
                <tr key={ethereumAccount}>
                  <td component="th" scope="row">
                    <a
                      href={`https://etherscan.io/address/${ethereumAccount}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ethereumAccount}
                    </a>
                  </td>
                  <td align="right">
                    {isUnlocked ? (
                      <Button
                        disabled={true}
                        variant="contained"
                        color="primary"
                      >
                        Already Unlocked
                      </Button>
                    ) : (
                      <Button
                        onClick={() => unlockEther(ethereumAccount)}
                        variant="contained"
                        color="primary"
                      >
                        Unlock {unlockableBalance} ELC
                      </Button>
                    )}
                  </td>
                </tr>
              </body>
            </Table>
          ) : (
            <>
              Please install <a href="https://metamask.io/">MetaMask</a> to
              unlock Ether.
            </>
          )}
        </div>
      </Card>
    </>
  );
}
