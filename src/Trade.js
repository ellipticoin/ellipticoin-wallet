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
  const { createWallet, sendAmount, setSendAmount, balance, publicKey } = props;
  const classes = useStyles();
  const [tradeType, setTradeType] = React.useState(null);

  const handleChangeTradeType = (value) => {
    setTradeType(value);
  };
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
            <form
              noValidate
              autoComplete="off"
              onSubmit={(evt) => console(evt)}
            >
              <TextField
                id="outlined-basic"
                label="Input"
                variant="outlined"
                style={{ width: "50ch" }}
                value={sendAmount}
                onChange={(event) => setSendAmount(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: "10px" }}>
                        <span>Balance: ${(balance / 10000).toFixed(2)} EC</span>
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
                style={{ width: "50ch" }}
                value={sendAmount}
                onChange={(event) => setSendAmount(event.target.value)}
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
