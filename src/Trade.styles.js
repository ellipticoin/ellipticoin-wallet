import { makeStyles } from "@material-ui/core/styles";
export default makeStyles((theme) => ({
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
