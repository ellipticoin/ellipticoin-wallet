import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import AssignmentIcon from "@material-ui/icons/AssignmentOutlined";
import IconButton from "@material-ui/core/IconButton";
import copy from "copy-to-clipboard";
import base64url from "base64url";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
    "& form": {
      display: "flex",
      flexDirection: "column",
      margin: theme.spacing(1),
    },
  },
  balance: {
    margin: theme.spacing(1),
  },
  cardHeader: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
  },
  assignmentIcon: {
    margin: theme.spacing(1),
  },
}));
const bytesToNumber = (bytes) =>
  Number(new DataView(new Uint8Array(bytes).buffer).getBigUint64(0, true));
export default function Wallet(props) {
  const { publicKey, ellipticoin, ethereumAccount } = props;
  const classes = useStyles();
  const [amountUnlocked, setAmountUnlocked] = React.useState();
  const [isUnlocked, setUnlocked] = React.useState();
  const [unlockableBalance, setUnlockableBalance] = React.useState();
  const [open, setOpen] = React.useState(false);

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
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Unlock Successful!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Congratulations! You&#39;ve unlocked&nbsp;
            {amountUnlocked ? (amountUnlocked / 10000).toFixed(2) : null} ELC!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Card className={classes.root}>
        <CardHeader
          classes={{
            root: classes.cardHeader,
          }}
          title={
            <>
              Wallet Address: {publicKey ? base64url(publicKey) : ""}
              <IconButton
                aria-label="delete"
                className={classes.margin}
                onClick={() => copy(base64url(publicKey))}
              >
                <AssignmentIcon className={classes.assignmentIcon} />
              </IconButton>
            </>
          }
        />
        <CardContent>
          {window.web3 ? (
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableBody>
                  <TableRow key={ethereumAccount}>
                    <TableCell component="th" scope="row">
                      <a
                        href={`https://etherscan.io/address/${ethereumAccount}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ethereumAccount}
                      </a>
                    </TableCell>
                    <TableCell align="right">
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
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <>
              Please install <a href="https://metamask.io/">MetaMask</a> to
              unlock Ether.
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
