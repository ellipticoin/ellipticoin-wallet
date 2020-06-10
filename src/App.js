import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
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
import Alert from '@material-ui/lab/Alert';
import { Client as ECClient } from "ec-client";

// const WEBSOCKET_HOST =
//   process.env.NODE_ENV === "production"||true
//     ? "wss://davenport.ellipticoin.org"
//     : "ws://localhost:4462";
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
    // "0.01"
    ""
  );
  const [toAddress, setToAddress] = React.useState(
    // "jLs9_OvUYqOzGiTzVcRLB3laE3Hp8CZIpdRB5lqrSew"
    ""
  );
  const [publicKey, setPublicKey] = React.useState();
  const [secretKey] = React.useState(() => {
    if (localStorage.getItem("secretKey")) {
      return Buffer.from(JSON.parse(localStorage.getItem("secretKey")));
    }
  });
  const [ellipticoin] = React.useState(() => {
    if (secretKey) {
      return new ECClient({
        privateKey: Uint8Array.from(secretKey),
        // bootnodes: ["http://localhost:4461"],
      });
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
      if (!secretKey) {
        return;
      }
    const interval = setInterval(async () => {
      const keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
      setBalance(await getBalance(ellipticoin, keyPair.publicKey));
    }, 1000);

    const keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(ellipticoin.privateKey));
    setBalance(await getBalance(ellipticoin, keyPair.publicKey));

    return () => {
      clearInterval(interval);
    };
    })();
  }, [secretKey, ellipticoin]);

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
      return bytesToNumber(balanceBytes)
  }
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
    setPublicKey(keyPair.publicKey);
  };

  return (
    <div className={classes.root}>
    {!window.localStorage.getItem("hideWarning") ?
    <Alert severity="error">
      WARNING The Ellipticoin network is not yet live. Balances here will be erased. The Network is sceduled to be launched June 17th. Please check back then!
    </Alert>: null}
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
            setToAddress,
            setSendAmount,
            balance,
            publicKey,
            createWallet,
          }}
        />
      </TabPanel>
      <TabPanel tab={tab} index={1}>
        <Trade
          {...{
            secretKey,
            toAddress,
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
