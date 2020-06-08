import React from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import base64url from "base64url";
import { makeStyles } from "@material-ui/core/styles";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import AssignmentIcon from "@material-ui/icons/AssignmentOutlined";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ECCBTokenABI from "./contracts/ECCBTokenABI.json";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import Paper from "@material-ui/core/Paper";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import CircularProgress from '@material-ui/core/CircularProgress';
import copy from "copy-to-clipboard";
import { Client as ECClient, Ellipticoin } from "ec-client";
import {
  ChainId,
  Token,
  TokenAmount,
  Pair,
  TradeType,
  Route,
  Trade,
  Percent,
} from "@uniswap/sdk";
import { ethers } from "ethers";
import { setupWeb3 } from "./ethereum-utils.js";
const WETH_TOKEN = new Token(
  ChainId.KOVAN,
  "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
  18,
  "WETH",
  "Wrapped Ether"
);
// const {utils: {parseEther}} = ethers
const ELLIPTICOIN_ADDRESS = Buffer.from(
  "vQMn3JvS3ATITteQ-gOYfuVSn2buuAH-4e8NY_CvtwA",
  "base64"
);
const ECCB_ADDRESS = "0x89108B7Bf410Ce52e41eFd41e565ca180Df1EC53";
const SLIPPAGE = new Percent(5, 1000);
const ECCB_TOKEN = new Token(
  ChainId.KOVAN,
  ECCB_ADDRESS,
  4,
  "ECCB",
  "Ellipticoin Community Burn Bridge"
);

const useStyles = makeStyles((theme) => ({
  balance: {
    margin: theme.spacing(1),
  },
  tableContainer: {
    maxWidth: 500,
    position: "relative",
    marginBottom: 20,
  },
  cardHeader: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
  },
  assignmentIcon: {
    margin: theme.spacing(1),
  },
  currencyIcon: {
    width: 12,
    margin: 5,
    verticalAlign: "bottom",
  },
}));
export default function Wallet(props) {
  const { createWallet, balance, publicKey, secretKey } = props;
  const classes = useStyles();
  const [tradeType, setTradeType] = React.useState("sell");
  const [inputAmount, setInputAmount] = React.useState(1.0);
  const [etherAmount, setEtherAmount] = React.useState(null);
  const [ellipticoinAmount, setEllipticoinAmount] = React.useState(0);
  const [ethBidPrice, setEthBidPrice] = React.useState(null);
  const [ethBalance, setEthBalance] = React.useState();
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      setupWeb3()
      let [ethereumAddress] = await window.web3.eth.getAccounts();
      setEthBalance(await window.web3.eth.getBalance(ethereumAddress))

    })();
  }, []);

  React.useEffect(() => {
    (async () => {
        let pair = await Pair.fetchData(
          WETH_TOKEN,
          ECCB_TOKEN,
          ethers.getDefaultProvider("kovan")
        );
        let trade;
        let route;
        if (tradeType === "buy" && etherAmount > 0) {
          route = new Route([pair], WETH_TOKEN);
          trade = new Trade(
            route,
            new TokenAmount(
              WETH_TOKEN,
              etherAmount
            ),
            TradeType.EXACT_INPUT
          );
        setEllipticoinAmount(trade.minimumAmountOut(SLIPPAGE).raw.toString());
        } else if(ellipticoinAmount > 0) {
          route = new Route([pair], ECCB_TOKEN);
          trade = new Trade(
            route,
            new TokenAmount(
              ECCB_TOKEN,
              Math.floor(ellipticoinAmount)
            ),
            TradeType.EXACT_INPUT
          );
          setEtherAmount(trade.minimumAmountOut(SLIPPAGE).raw.toString());
        }
    })();
  }, [tradeType, etherAmount, inputAmount, ellipticoinAmount]);

  React.useEffect(() => {
    (async () => {
    if (!ethBidPrice) {
      return
    }
    if (tradeType === "buy") {
      setEtherAmount(ethers.utils.parseEther((inputAmount / ethBidPrice).toFixed(8).toString()));
    } else if(inputAmount && inputAmount > 0) {
    let pair = await Pair.fetchData(
      WETH_TOKEN,
      ECCB_TOKEN,
      ethers.getDefaultProvider("kovan")
    );
          let route = new Route([pair], ECCB_TOKEN);
      try{
          let trade = new Trade(
            route,
            new TokenAmount(
              ECCB_TOKEN,
              inputAmount
            ),
            TradeType.EXACT_INPUT
          );
      setEllipticoinAmount(inputAmount/ethers.utils.formatEther(trade.minimumAmountOut(SLIPPAGE).raw.toString())/ethBidPrice)
      } catch {
      }
      }
  })()
  }
      , [inputAmount, ethBidPrice, tradeType]);
  React.useEffect(() => {
    fetch("https://api.infura.io/v1/ticker/ethusd")
      .then((response) => response.json())
      .then(({ bid }) => setEthBidPrice(bid));
  }, []);

  const clearForm = () => {
    setInputAmount(0);
  };

  const sell = async () => {
    setLoading(true)
    setupWeb3();
    clearForm();
    const ellipticoin = new ECClient({
      privateKey: Uint8Array.from(secretKey),
    });
    Ellipticoin.client = ellipticoin;
    const OWNER_ADDRESS = Buffer.from(
      "vQMn3JvS3ATITteQ-gOYfuVSn2buuAH-4e8NY_CvtwA",
      "base64"
    );
    let [ethereumAddress] = await window.web3.eth.getAccounts();
    await Ellipticoin.approve(
      Array.from(Buffer.concat([
        OWNER_ADDRESS,
        Buffer.from("EthereumBridge", "utf8"),
      ])),
      Math.floor(parseFloat(ellipticoinAmount))
    );

    await ellipticoin.post({
      contract_address: Buffer.concat([
        OWNER_ADDRESS,
        Buffer.from("EthereumBridge", "utf8"),
      ]),
      function: "burn_and_swap",
      arguments: [
        Math.floor(parseFloat(ellipticoinAmount)),
        Array.from(Buffer.from(ethereumAddress.substring(2), "hex")),
      ],
    });
  };
  React.useEffect(() => {
    const interval = setInterval(async () => {
      let [ethereumAddress] = await window.web3.eth.getAccounts();
      let newEthBalance = await window.web3.eth.getBalance(ethereumAddress);
      if(ethBalance !== newEthBalance) {
        setLoading(false)
        setEthBalance(newEthBalance)
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ethBalance]);
  const buy = async () => {
    setLoading(true);
    await setupWeb3();
    let [ethereumAddress] = await window.web3.eth.getAccounts();
    const ECCBToken = new window.web3.eth.Contract(ECCBTokenABI, ECCB_ADDRESS, {
      from: ethereumAddress,
    });
    let pair = await Pair.fetchData(
      WETH_TOKEN,
      ECCB_TOKEN,
      ethers.getDefaultProvider("kovan")
    );
    let route = new Route([pair], WETH_TOKEN);
    const trade = new Trade(
      route,
      new TokenAmount(
        WETH_TOKEN,
        etherAmount
      ),
      TradeType.EXACT_INPUT
    );
    let deadline = Math.ceil(Date.now() / 1000) + 60 * 20;
    try {
    await ECCBToken.methods
      .swapAndBurn(
        trade.minimumAmountOut(SLIPPAGE).raw.toString(),
        trade.route.path.map((t) => t.address),
        ELLIPTICOIN_ADDRESS,
        deadline
      )
      .send({
        value: new window.web3.utils.BN(
          trade.maximumAmountIn(SLIPPAGE).raw.toString()
        ),
      });
    } catch {
      setLoading(false)
    }
  };
  const trade = async (evt) => {
    evt.preventDefault();
    await (tradeType === "buy" ? buy() : sell());
  };
  const toggleTradeType = () => {
    tradeType === "buy" ? setTradeType("sell") : setTradeType("buy");
  };
  const rows = [
    <TableRow key="2">
      <TableCell component="th" scope="row" style={{ paddingLeft: 80 }}>
        {tradeType === "sell" ? "From" : "To"}
      </TableCell>
      <TableCell align="left">
        <img
          className={classes.currencyIcon}
          style={{ position: "relative", height: 15, top: 2 }}
          src="ethereum_logo.svg"
          alt="Ethereum Logo"
        />
        Ethereum
      </TableCell>
      <TableCell align="right">{etherAmount ? ethers.utils.formatEther(etherAmount): null}</TableCell>
    </TableRow>,
    <TableRow key="1">
      <TableCell component="th" scope="row" style={{ paddingLeft: 80 }}>
        {tradeType === "buy" ? "From" : "To"}
      </TableCell>
      <TableCell align="left">
        <img
          className={classes.currencyIcon}
          src="ellipticoin_logo.svg"
          alt="Ellipticoin Logo"
        />
        Ellipticoin
      </TableCell>
      <TableCell align="right" style={{minWidth: 100}}>{(ellipticoinAmount/10000).toFixed(4)}</TableCell>
    </TableRow>,
  ];

  return (
    <>
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
            <form noValidate autoComplete="off" onSubmit={(evt) => trade(evt)}>
              <CurrencyTextField
                label="Amount (USD)"
                variant="standard"
                value={inputAmount}
                width="10ch"
                currencySymbol="$"
                style={{
                  width: "20ch",
                  position: "relative",
                  marginBottom: 20,
                }}
                onChange={(event, value) => setInputAmount(value)}
              />
              <TableContainer
                className={classes.tableContainer}
                style={{}}
                component={Paper}
              >
                <Table className={classes.table} aria-label="simple table">
                  <TableBody>
                    {tradeType === "buy"
                      ? [...rows].map((row) => row)
                      : [...rows].reverse().map((row) => row)}
                  </TableBody>
                </Table>
                <IconButton
                  style={{
                    position: "absolute",
                    top: 30,
                    left: 10,
                    maxWidth: 400,
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                  }}
                  onClick={() => toggleTradeType()}
                  aria-label="delete"
                  size="medium"
                >
                  <SwapVertIcon fontSize="inherit" />
                </IconButton>
              </TableContainer>
              <Button
                type="submit"
                disabled={loading}
                style={{ width: "20em" }}
                variant="contained"
                color="primary"
              >
        {loading? <CircularProgress size="1.5rem" style={{padding: 1}} />: "Trade"}
              </Button>
            </form>
            {balance?
            <div style={{marginTop: 20}}>
            EC Balance: {(balance/10000).toFixed(2)}
            </div>: null}
            {ethBalance?
            <div>
            ETH Balance: {ethers.utils.formatEther(ethBalance)}
            </div>
            :null}
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
