import React from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import base64url from "base64url";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import AssignmentIcon from "@material-ui/icons/AssignmentOutlined";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Client as ECClient } from "ec-client";
import copy from "copy-to-clipboard";

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

export default function Wallet(props) {
  const {
    secretKey,
    toAddress,
    createWallet,
    sendAmount,
    setToAddress,
    setSendAmount,
    balance,
    publicKey,
  } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    clearForm();
    setOpen(false);
  };
  const confirm = async (evt) => {
    evt.preventDefault();
    setOpen(true);
  };
  const clearForm = () => {
    setSendAmount(0);
    setToAddress(0);
  };
  const send = async (evt) => {
    clearForm();
    setOpen(false);
    const ellipticoin = new ECClient({
      privateKey: Uint8Array.from(secretKey),
      // bootnodes: ["http://localhost:8080"],
    });
    await ellipticoin.post({
      contract_address: Buffer.concat([
        Buffer(32),
        Buffer.from("Ellipticoin", "utf8"),
      ]),
      function: "transfer",
      arguments: [
        Array.from(base64url.toBuffer(toAddress)),
        Math.floor(parseFloat(sendAmount) * 10000),
      ],
    });
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Send Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Send {sendAmount} EC to {toAddress}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={send} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {publicKey ? (
        <Card className={classes.root}>
          <CardHeader
            classes={{
              root: classes.cardHeader,
            }}
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
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
            <form
              noValidate
              autoComplete="off"
              onSubmit={(evt) => confirm(evt)}
            >
              <TextField
                id="outlined-basic"
                label="To Address"
                variant="outlined"
                style={{ width: "64ch" }}
                value={toAddress}
                onChange={(event) => setToAddress(event.target.value)}
              />
              <TextField
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                style={{ width: "20ch" }}
                value={sendAmount}
                onChange={(event) => setSendAmount(event.target.value)}
              />
              <Button
                type="submit"
                style={{ width: "20em" }}
                variant="contained"
                color="primary"
              >
                Send
              </Button>
            </form>
            <Box className={classes.balance}>
              Balance: {(balance / 10000).toFixed(4)} ELC
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => createWallet()}
          variant="contained"
          color="primary"
        >
          Create Wallet
        </Button>
      )}
    </>
  );
}
