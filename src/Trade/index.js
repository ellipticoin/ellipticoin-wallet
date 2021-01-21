import SettingsContext from "../SettingsContext";
import { TokenAmountInput, TokenSelect } from "../Inputs";
import {
  TOKEN_METADATA,
  BASE_FACTOR,
  ELC,
  LIQUIDITY_FEE,
  TOKENS,
  USD,
  ZERO,
} from "../constants";
import Select from "react-select";
import {
  encodeToken,
  formatTokenBalance,
  tokenTicker,
  value,
  formatCurrency,
} from "../helpers";
import { usePostTransaction } from "../mutations";
import { find, get } from "lodash";
import { ExchangeCalculator } from "ellipticoin";
import { useMemo, useState, useEffect, useRef, useContext } from "react";
import { Button, Form, Collapse } from "react-bootstrap";
import { ArrowDown } from "react-feather";
import { ChevronLeft } from "react-feather";
import { actions } from "ellipticoin";
import AMM from "./AMM";

export default function Trade(props) {
  const { onHide, liquidityTokens, tokens, address } = props;

  return (
    <div className="section">
      <div className="appHeader no-border transparent position-absolute">
        <div className="left">
          <ChevronLeft onClick={() => onHide()} />
        </div>
        <div className="pageTitle"></div>
        <div className="right"></div>
      </div>
      <div id="appCapsule" className="">
        <div className="section text-center">
          <h1>Trade</h1>
        </div>
        <div className="row justify-content-md-center">
          <div className="card col col-8">
            <div className="card-body">
              <AMM
                tokens={tokens}
                liquidityTokens={liquidityTokens}
                address={address}
                onHide={onHide}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
