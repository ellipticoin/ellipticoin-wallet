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
import Countdown from 'react-countdown';

import {
  WETH as WETH_MAP,
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
const WETH = WETH_MAP[ChainId.MAINNET];
const ECCB = new Token(
  ChainId.MAINNET,
  "0x33307f0F1029487e0a77Ba2A20794A5A047E3e92",
  4
);
const DAI = new Token(
  ChainId.MAINNET,
  "0x6b175474e89094c44da98b954eedeac495271d0f",
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

const renderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    return <div>Tada it&apos;s ready!</div>;
  } else {
    return <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>;
  }
};

export default function Wallet(props) {

  const [date, _] = React.useState(() => Date.parse('17 Jun 2020 11:00:00 EST'));
  return (<div>
    <p>Trading goes live on June 17th 2020 at 11am EST</p>
    Countdown: &nbsp;
     <Countdown
    precision={3}
    renderer={renderer}
    date={date}
    />
    </div>
  )
}
