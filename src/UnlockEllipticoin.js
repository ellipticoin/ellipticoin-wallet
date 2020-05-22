import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import Button from '@material-ui/core/Button';
import AssignmentIcon from "@material-ui/icons/AssignmentOutlined";
import IconButton from "@material-ui/core/IconButton";
import copy from "copy-to-clipboard";
import CircularProgress from '@material-ui/core/CircularProgress';
import base64url from "base64url";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from '@material-ui/core/Paper';
import { Client as ECClient } from "ec-client";
import { signUnlock, setupWeb3, getAccounts } from "./ethereum-utils.js";

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
    publicKey,
    secretKey,
  } = props;
  const classes = useStyles();
  const [accounts, setAccounts] = React.useState([]);
  const [amountUnlocked, setAmountUnlocked] = React.useState();
  const [mining, setMining] = React.useState(false);
  const [web3IsSetup, setWeb3IsSetup] = React.useState(false);
  useEffect(() => {
    (async function() {

      await setupWeb3()
      setWeb3IsSetup(true)
    })();
  }, []);

  useEffect(() => {
    (async function() {
    })();
  }, [secretKey, publicKey, accounts]);
  const getUnlocked = async (address) => {
      const ellipticoin = new ECClient({
        privateKey: Uint8Array.from(secretKey),
      });
      if(publicKey && accounts.length > 0) { 
        const unlocked = await ellipticoin.getStorage(
          new Buffer(32),
          "Ellipticoin",
          Buffer.concat([new Buffer([6]), Buffer.from(accounts[0].substring(2), "hex")])
        );
        return !!unlocked
      }
  }
  useEffect(() => {
    async function callGetAccounts() {
      let accounts = await getAccounts();
      accounts = accounts.map((account) => { return {
        isUnlocked: getUnlocked(account),
        account: account,
        }})
      setAccounts(accounts);
    }
    if (web3IsSetup && window.web3) {
      callGetAccounts();
    }
  }, [setAccounts, web3IsSetup]);

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const unlockEther = async (address) => {
    let signature = window.web3.utils.hexToBytes(await window.web3.eth.personal.sign(window.web3.utils.toHex(`Unlock Ellipticoin at address: ${base64url(publicKey)}`), address));
    const ellipticoin = new ECClient({
      privateKey: Uint8Array.from(secretKey),
    });
    console.log(Buffer.from(signature).toString("hex"))
    setOpen(true)
    let transaction = await ellipticoin.post({
      contract_address: Buffer.concat([
        Buffer(32),
        Buffer.from("Ellipticoin", "utf8"),
      ]),
      function: "unlock_ether",
      arguments: [
        signature,
        Array.from(publicKey),
      ],
    });
    setMining(true)
    let result = await ellipticoin.waitForTransactionToBeMined(transaction)
    console.log(result)
    setMining(false)
    setAmountUnlocked(result.return_value["Ok"])
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{mining ? "Waiting for transaction to be mined": "Unlock Successful!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
    {mining?<>
      <Box
        display="flex"
        justifyContent="center"
alignItems="center"
      >
        <Box
  display="flex"
  justifyContent="center"
  flexDirection="column"
  alignItems="center"
>
      <Box>Waiting for transaction to be mined</Box>
        <CircularProgress style={{margin: "10px"}} />
        </Box>
      </Box>
      </>:
<>
            Congratulations! You&#39;ve unlocked ${amountUnlocked ? (amountUnlocked/10000).toFixed(2): null} EC!
      </>}
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
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableBody>
          {accounts.map(({account, isUnlocked}) => (
            <TableRow key={account}>
              <TableCell component="th" scope="row">
                <a href={`https://etherscan.io/address/${account}`} target="_blank">{account}</a>
              </TableCell>
              <TableCell align="right">
            {isUnlocked?
      <Button disabled="true" variant="contained" color="primary">
        Already Unlocked
      </Button>
              :
      <Button onClick={() => unlockEther(account)} variant="contained" color="primary">
        Unlock
      </Button>
            }
            </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
        </CardContent>
      </Card>
    </>
  );
}
