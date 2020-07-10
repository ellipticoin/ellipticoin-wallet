import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import { setupWeb3 } from "./ethereum-utils.js";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import nacl from "tweetnacl";
import Long from "long";
import { Buffer } from "buffer/";
import Wallet from "./Wallet";
import Trade from "./Trade";
import UnlockEllipticoin from "./UnlockEllipticoin";
import Alert from "@material-ui/lab/Alert";
import { Client as ECClient } from "ec-client";

function TabPanel(props) {
  const { children, tab, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={tab !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {tab === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  tab: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({}));

export default function App() {
  const classes = useStyles();
  const [tab, setValue] = React.useState(() => {
    return JSON.parse(localStorage.getItem("tab")) || 0;
  });
  const [balance, setBalance] = React.useState(0);
  const [sendAmount, setSendAmount] = React.useState(
    // "1"
    ""
  );
  const [toAddress, setToAddress] = React.useState(
    // "jLs9_OvUYqOzGiTzVcRLB3laE3Hp8CZIpdRB5lqrSew"
    // "JZoYzwPNn_k82INoA-auebXqRvZwBWiqYUKLMWUpXCQ"
    ""
  );
  const [publicKey, setPublicKey] = React.useState();
  const [secretKey, setSecretKey] = React.useState(() => {
    if (localStorage.getItem("secretKey")) {
      return Buffer.from(JSON.parse(localStorage.getItem("secretKey")));
    }
  });
  const [ellipticoin, setEllipticoin] = React.useState();
  const [ethereumAccount, setEthereumAccount] = React.useState();
  React.useEffect(() => {
    if (secretKey) {
      setEllipticoin(
        process.env.NODE_ENV === "production"
          ? new ECClient({
              privateKey: Uint8Array.from(secretKey),
            })
          : new ECClient({
              networkId: 3750925312,
              privateKey: Uint8Array.from(secretKey),
              // bootnodes: ["http://localhost:8080"],
            })
      );
    }
  }, [secretKey]);
  React.useEffect(() => {
    if (secretKey) {
      let keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
      setPublicKey(keyPair.publicKey);
    }
  }, [secretKey]);

  React.useEffect(() => {
    (async () => {
      if (!secretKey || !ellipticoin) {
        return;
      }
      const interval = setInterval(async () => {
        const keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
        setBalance(await getBalance(ellipticoin, keyPair.publicKey));
      }, 1000);

      const keyPair = nacl.sign.keyPair.fromSecretKey(
        Buffer.from(ellipticoin.privateKey)
      );
      setBalance(await getBalance(ellipticoin, keyPair.publicKey));

      return () => {
        clearInterval(interval);
      };
    })();
  }, [secretKey, ellipticoin]);
  React.useEffect(() => {
    (async () => {
      await setupWeb3();
      if (!window.web3) {
        return;
      }
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

  const getBalance = async (ellipticoin, address) => {
    Buffer.concat([
      new Buffer(32),
      Buffer.from("Ellipticoin", "utf8"),
      Buffer.concat([new Buffer([1]), Buffer.from(address)]),
    ]);
    const balanceBytes = await ellipticoin.getMemory(
      new Buffer(32),
      "Ellipticoin",
      Buffer.concat([new Buffer([1]), Buffer.from(address)])
    );
    return bytesToNumber(balanceBytes);
  };
  React.useEffect(() => {
    localStorage.setItem("tab", JSON.stringify(tab));
  }, [tab]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const createWallet = () => {
    const keyPair = nacl.sign.keyPair();
    localStorage.setItem(
      "secretKey",
      JSON.stringify(Array.from(keyPair.secretKey))
    );
    setSecretKey(keyPair.secretKey);
    setPublicKey(keyPair.publicKey);
  };

  return (
    <div className={classes.root}>
      {!window.localStorage.getItem("hideWarning") ? (
        <Alert severity="error">
          WARNING The Ellipticoin network has not been audited. Please
          don&apos;t buy more tokens then you'd be happy to loose.
        </Alert>
      ) : null}
      <AppBar position="static">
        <Tabs
          value={tab}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Wallet" {...a11yProps(0)} />
          <Tab label="Trade" {...a11yProps(1)} />
          <Tab label="Unlock Ether" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel tab={tab} index={0}>
        <Wallet
          {...{
            secretKey,
            toAddress,
            sendAmount,
            setBalance,
            setToAddress,
            setSendAmount,
            ellipticoin,
            balance,
            publicKey,
            createWallet,
            setSecretKey,
          }}
        />
      </TabPanel>
      <TabPanel tab={tab} index={1}>
        <Trade
          {...{
            secretKey,
            toAddress,
            ellipticoin,
            sendAmount,
            setToAddress,
            setSendAmount,
            balance,
            publicKey,
            createWallet,
          }}
        />
      </TabPanel>
      <TabPanel tab={tab} index={2}>
        <UnlockEllipticoin
          {...{
            ethereumAccount,
            balance,
            createWallet,
            ellipticoin,
            publicKey,
            secretKey,
            sendAmount,
            setSendAmount,
            setToAddress,
            toAddress,
          }}
        />
      </TabPanel>
    </div>
  );
}
function bytesToNumber(bytes) {
  return Long.fromBytesLE(Buffer.from(bytes)).toNumber();
}
