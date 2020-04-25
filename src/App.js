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
  const updateBalance = async () => {
    if(!secretKey) {
      return
    }
    const keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
    const ellipticoin = new ECClient({ privateKey: keyPair.secretKey });
    Buffer.concat(
    [
      new Buffer(32),
      Buffer.from("Ellipticoin", "utf8"),
      Buffer.concat([new Buffer([1]), Buffer.from(keyPair.publicKey)])
    ]
    )
    const balanceBytes = await ellipticoin.getMemory(
      new Buffer(32),
      "Ellipticoin",
      Buffer.concat([new Buffer([1]), Buffer.from(keyPair.publicKey)])
    );
    setBalance(bytesToNumber(balanceBytes));
  }
  React.useEffect(() => {
    if (secretKey) {
      let keyPair = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey));
      setPublicKey(keyPair.publicKey);
    }
  }, [secretKey]);
  React.useEffect(() => {
    updateBalance()
  // var blocksSocket = new WebSocket(`${WEBSOCKET_HOST}/websocket`);
  // blocksSocket.binaryType = "arraybuffer";
  // blocksSocket.onerror = console.log;
  // blocksSocket.onmessage = async ({ data }) => {
  //   console.log("updating balance")
    setInterval(updateBalance, 1000)
  // };
  }, [balance]);
  // React.useEffect(() => {
  //   (async function anyNameFunction() {
  //     if (secretKey) {
  //       await updateBalance();
  //     }
  //   })();
  // }, [secretKey]);
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
        Coming soon...
      </TabPanel>
      <TabPanel tab={tab} index={2}>
        Coming soon...
      </TabPanel>
    </div>
  );
}
function bytesToNumber(bytes) {
  return Long.fromBytesLE(Buffer.from(bytes)).toNumber();
}
