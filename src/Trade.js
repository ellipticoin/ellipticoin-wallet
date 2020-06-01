import React from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import InputAdornment from "@material-ui/core/InputAdornment";
import base64url from "base64url";
import TextField from "@material-ui/core/TextField";
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
import copy from "copy-to-clipboard";
import { Client as ECClient } from "ec-client";
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
import FlipMove from "react-flip-move";
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
const ECCB_ADDRESS = "0xDca3a8576197460da74e43fD44fd760D68A80647";
const SLIPPAGE = new Percent(5, 1000);
const ECCB_TOKEN = new Token(
  ChainId.KOVAN,
  ECCB_ADDRESS,
  4,
  "ECCB",
  "Ellipticoin Community Burn Bridge"
);

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
  const { createWallet, balance, publicKey, secretKey } = props;
  const classes = useStyles();
  const [tradeType, setTradeType] = React.useState("buy");
  const [inputAmount, setInputAmount] = React.useState(0.01);
  const [outputAmount, setOutputAmount] = React.useState(0);
  React.useEffect(() => {
    (async () => {
      if (inputAmount > 0) {
        let pair = await Pair.fetchData(
          WETH_TOKEN,
          ECCB_TOKEN,
          ethers.getDefaultProvider("kovan")
        );
        let trade;
        let route;
        if (tradeType === "buy") {
          route = new Route([pair], WETH_TOKEN);
          trade = new Trade(
            route,
            new TokenAmount(
              WETH_TOKEN,
              ethers.utils.parseEther(inputAmount.toString())
            ),
            TradeType.EXACT_INPUT
          );
        } else {
          route = new Route([pair], ECCB_TOKEN);
          console.log(parseFloat(inputAmount) * 1000);
          trade = new Trade(
            route,
            new TokenAmount(
              ECCB_TOKEN,
              ethers.utils.parseEther(inputAmount.toString())
              // Math.floor(parseFloat(inputAmount) * 10000)
            ),
            TradeType.EXACT_INPUT
          );
        }
        setOutputAmount(trade.minimumAmountOut(SLIPPAGE).raw.toString());
      }
    })();
  }, [inputAmount, tradeType]);

  const handleChangeTradeType = (value) => {
    setTradeType(value);
  };
  const clearForm = () => {
    setInputAmount(0);
  };
  const sell = async () => {
    setupWeb3();
    clearForm();
    const ellipticoin = new ECClient({
      privateKey: Uint8Array.from(secretKey),
      bootnodes: ["http://localhost:4461"],
    });
    const OWNER_ADDRESS = Buffer.from(
      "vQMn3JvS3ATITteQ-gOYfuVSn2buuAH-4e8NY_CvtwA",
      "base64"
    );
    let [ethereumAddress] = await window.web3.eth.getAccounts();
    await ellipticoin.post({
      contract_address: Buffer.concat([
        OWNER_ADDRESS,
        Buffer.from("EthereumBridge", "utf8"),
      ]),
      function: "burn_and_swap",
      arguments: [
        Math.floor(parseFloat(inputAmount) * 10000),
        Array.from(Buffer.from(ethereumAddress.substring(2), "hex")),
      ],
    });
  };
  const buy = async () => {
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
        ethers.utils.parseEther(inputAmount.toString())
      ),
      TradeType.EXACT_INPUT
    );
    let deadline = Math.ceil(Date.now() / 1000) + 60 * 20;
    console.log(trade.minimumAmountOut(SLIPPAGE).raw.toString());
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
  };
  const trade = async (evt) => {
    evt.preventDefault();
    await (tradeType === "buy" ? buy() : sell());
  };
  const rows = [
    <TableRow key="2">
      <TableCell component="th" scope="row" style={{ paddingLeft: 80 }}>
        To
      </TableCell>
      <TableCell align="left">
        <img src="" />
        Ethereum
      </TableCell>
      <TableCell align="right">{inputAmount}</TableCell>
    </TableRow>,
    <TableRow key="1">
      <TableCell component="th" scope="row" style={{ paddingLeft: 80 }}>
        From
      </TableCell>
      <TableCell align="left">
        <img src="" />
        Ellipticoin
      </TableCell>
      <TableCell align="right">{(outputAmount / 10000).toFixed(4)}</TableCell>
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
              <TextField
                id="outlined-basic"
                label="Input"
                variant="outlined"
                style={{ width: "50ch" }}
                value={inputAmount}
                onChange={(event) => setInputAmount(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: "10px" }}>
                        <span>
                          Balance:{" "}
                          {tradeType === "buy"
                            ? `? ETH`
                            : `${(balance / 10000).toFixed(2)} EC`}
                        </span>
                      </div>
                      <div>
                        <ToggleButtonGroup
                          value={tradeType}
                          exclusive
                          onChange={(e) => {
                            handleChangeTradeType(
                              e.target.closest("button").value
                            );
                          }}
                          aria-label="text alignment"
                        >
                          <ToggleButton
                            value="buy"
                            style={{ width: "4em" }}
                            aria-label="ETH"
                          >
                            ETH
                          </ToggleButton>
                          <ToggleButton
                            value="sell"
                            style={{ width: "4em" }}
                            aria-label="EC"
                          >
                            EC
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                id="outlined-basic"
                label="Output"
                variant="outlined"
                disabled={true}
                style={{ width: "50ch" }}
                value={(outputAmount / 10000).toFixed(4)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <ToggleButtonGroup
                        value={tradeType}
                        exclusive
                        onChange={(e) =>
                          handleChangeTradeType(
                            e.target.closest("button").value
                          )
                        }
                        aria-label="text alignment"
                      >
                        <ToggleButton
                          value="sell"
                          style={{ width: "4em" }}
                          aria-label="ETH"
                        >
                          ETH
                        </ToggleButton>
                        <ToggleButton
                          value="buy"
                          style={{ width: "4em" }}
                          aria-label="EC"
                        >
                          EC
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                style={{ width: "20em" }}
                variant="contained"
                color="primary"
              >
                Trade
              </Button>
            </form>
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
