import React from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import base64url from "base64url";
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
import CircularProgress from "@material-ui/core/CircularProgress";
import copy from "copy-to-clipboard";
import { Client as ECClient, Ellipticoin } from "ec-client";
import {
  ChainId,
  Token,
  TokenAmount,
  Pair,
  TradeType,
  Route,
  InsufficientInputAmountError,
  Trade as UniswapTrade,
  Percent,
} from "@uniswap/sdk";
import { ethers } from "ethers";
import { setupWeb3 } from "./ethereum-utils.js";
import useStyles from "./Trade.styles.js";
const WETH = new Token(
  ChainId.KOVAN,
  "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
  18
);
const ECCB = new Token(
  ChainId.KOVAN,
  "0x07afee68F707eF6eC040Aa58c2FA182Cf10A1634",
  4
);
const DAI = new Token(
  ChainId.KOVAN,
  "0xD169aCd2bE441fDBE6773BC5736467593343ac49",
  18
);
const SLIPPAGE = new Percent(5, 1000);
const OWNER_ADDRESS = Buffer.from(
  "vQMn3JvS3ATITteQ-gOYfuVSn2buuAH-4e8NY_CvtwA",
  "base64"
);

function convert(amount, route) {
  try {
    const trade = new UniswapTrade(
      route,
      tokenAmount(route.input, amount),
      TradeType.EXACT_INPUT
    );
    return trade.outputAmount.toFixed();
  } catch (e) {
    if (e instanceof InsufficientInputAmountError) {
    } else {
      throw e;
    }
  }
}

function tokenAmount(token, amount = 0) {
  if (token.decimals === 18) {
    return new TokenAmount(
      token,
      ethers.utils.parseEther((amount || 0).toString())
    );
  } else {
    return new TokenAmount(
      token,
      Math.round(amount * Math.pow(10, token.decimals)).toString()
    );
  }
}
export default function Wallet(props) {
  const { createWallet, balance, publicKey, secretKey } = props;
  const classes = useStyles();
  const [tradeType, setTradeType] = React.useState("sell");
  const [inputAmount, setInputAmount] = React.useState();
  const [etherAmount, setEtherAmount] = React.useState(null);
  const [ellipticoinAmount, setEllipticoinAmount] = React.useState();
  const [ethBalance, setEthBalance] = React.useState();
  const [firstRoute, setFirstRoute] = React.useState();
  const [secondRoute, setSecondRoute] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [ethereumAccount, setEthereumAccount] = React.useState();
  React.useEffect(() => {
    (async () => {
      if (tradeType === "buy") {
        let DAI_WETH = await Pair.fetchData(
          DAI,
          WETH,
          ethers.getDefaultProvider("kovan")
        );
        let WETH_ECCB = await Pair.fetchData(
          WETH,
          ECCB,
          ethers.getDefaultProvider("kovan")
        );
        setFirstRoute(new Route([DAI_WETH], DAI));
        setSecondRoute(new Route([WETH_ECCB], WETH));
      } else {
        let DAI_WETH = await Pair.fetchData(
          DAI,
          WETH,
          ethers.getDefaultProvider("kovan")
        );
        let WETH_ECCB = await Pair.fetchData(
          WETH,
          ECCB,
          ethers.getDefaultProvider("kovan")
        );
        setFirstRoute(new Route([DAI_WETH, WETH_ECCB], DAI));
        let ECCB_WETH = await Pair.fetchData(
          ECCB,
          WETH,
          ethers.getDefaultProvider("kovan")
        );
        setSecondRoute(new Route([ECCB_WETH], ECCB));
      }
    })();
  }, [tradeType, loading]);

  React.useEffect(() => {
    (async () => {
      await setupWeb3();
      let accounts = await window.web3.eth.getAccounts();
      if (accounts.length) {
        setEthereumAccount(accounts[0]);
      }
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length) {
          setEthereumAccount(accounts[0]);
        }
      });
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (ethereumAccount) {
        setEthBalance(await window.web3.eth.getBalance(ethereumAccount));
      }
    })();
  }, [ethereumAccount]);
  React.useEffect(() => {
    (async () => {
      if (!firstRoute || !secondRoute) {
        return;
      }

      if (tradeType === "buy") {
        let newEtherAmount = convert(inputAmount, firstRoute);
        if (newEtherAmount) {
          setEtherAmount(newEtherAmount);
          setEllipticoinAmount(convert(newEtherAmount, secondRoute));
        } else {
          setEtherAmount(null);
          setEllipticoinAmount(null);
        }
      } else {
        let newEllipticoinAmount = convert(inputAmount, firstRoute);
        if (newEllipticoinAmount) {
          setEllipticoinAmount(newEllipticoinAmount);
          setEtherAmount(convert(newEllipticoinAmount, secondRoute));
        } else {
        }
      }
    })();
  }, [inputAmount, tradeType, firstRoute, secondRoute]);

  const clearForm = () => {
    setInputAmount(null);
  };

  const sell = async () => {
    setLoading(true);
    setupWeb3();
    clearForm();
    const ellipticoin = new ECClient({
      privateKey: Uint8Array.from(secretKey),
    });
    Ellipticoin.client = ellipticoin;
    await Ellipticoin.approve(
      Array.from(
        Buffer.concat([OWNER_ADDRESS, Buffer.from("EthereumBridge", "utf8")])
      ),
      Math.floor(parseFloat(ellipticoinAmount) * 10000)
    );

    // await ellipticoin.waitForTransactionToBeMined(approve)

    await ellipticoin.post({
      contract_address: Buffer.concat([
        OWNER_ADDRESS,
        Buffer.from("EthereumBridge", "utf8"),
      ]),
      function: "burn_and_swap",
      arguments: [
        Math.floor(parseFloat(ellipticoinAmount) * 10000),
        Array.from(Buffer.from(ethereumAccount.substring(2), "hex")),
      ],
    });
    clearForm();
  };

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (!ethereumAccount) {
        return;
      }
      let newEthBalance = await window.web3.eth.getBalance(ethereumAccount);
      if (ethBalance !== newEthBalance) {
        setLoading(false);
        setEthBalance(newEthBalance);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ethereumAccount, ethBalance]);

  const buy = async () => {
    setLoading(true);
    let [ethereumAddress] = await window.web3.eth.getAccounts();
    const ECCBToken = new window.web3.eth.Contract(ECCBTokenABI, ECCB.address, {
      from: ethereumAddress,
    });
    const trade = new UniswapTrade(
      secondRoute,
      tokenAmount(WETH, etherAmount),
      TradeType.EXACT_INPUT
    );
    let deadline = Math.ceil(Date.now() / 1000) + 60 * 20;
    try {
      await ECCBToken.methods
        .swapAndBurn(
          trade.minimumAmountOut(SLIPPAGE).raw.toString(),
          trade.route.path.map((t) => t.address),
          "0x" + Buffer.from(publicKey).toString("hex"),
          deadline
        )
        .send({
          value: new window.web3.utils.BN(
            trade.maximumAmountIn(SLIPPAGE).raw.toString()
          ),
        });
      clearForm();
    } catch {
      setLoading(false);
      clearForm();
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
        {tradeType === "sell" ? "To" : "From"}
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
      <TableCell align="right">{etherAmount ? etherAmount : null}</TableCell>
    </TableRow>,
    <TableRow key="1">
      <TableCell component="th" scope="row" style={{ paddingLeft: 80 }}>
        {tradeType === "buy" ? "To" : "From"}
      </TableCell>
      <TableCell align="left">
        <img
          className={classes.currencyIcon}
          src="ellipticoin_logo.svg"
          alt="Ellipticoin Logo"
        />
        Ellipticoin
      </TableCell>
      <TableCell align="right" style={{ minWidth: 100 }}>
        {ellipticoinAmount}
      </TableCell>
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
                {loading ? (
                  <CircularProgress size="1.5rem" style={{ padding: 1 }} />
                ) : (
                  "Trade"
                )}
              </Button>
            </form>
            {balance ? (
              <div style={{ marginTop: 20 }}>
                EC Balance: {(balance / 10000).toFixed(2)}
              </div>
            ) : null}
            {ethBalance ? (
              <div>ETH Balance: {ethers.utils.formatEther(ethBalance)}</div>
            ) : null}
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
