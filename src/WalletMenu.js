import React from "react";
import { saveAs } from "file-saver";

export default function WalletMenu(props) {
  const { secretKey } = props;
  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const open = Boolean(anchorEl);
  //
  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  //
  // const handleClose = (option) => {
  //   if (option === "Download Private Key") {
  //     var blob = new Blob([Buffer.from(secretKey).toString("base64")], {
  //       type: "text/plain;charset=utf-8",
  //     });
  //     saveAs(blob, "ellipticoin-private-key.txt");
  //   } else if (option === "Load Private Key") {
  //     inputEl.current.click();
  //   }
  //   setAnchorEl(null);
  // };
  // const handleFileUpload = (event) => {
  //   let input = event.target;
  //   if (!input.files[0]) return undefined;
  //   let file = input.files[0];
  //   let fr = new FileReader();
  //   fr.onload = (event) => {
  //     localStorage.setItem(
  //       "secretKey",
  //       JSON.stringify(Buffer.from(event.target.result, "base64"))
  //     );
  //     window.location.reload();
  //   };
  //   fr.readAsText(file);
  // };
  // const options = ["Download Private Key", "Load Private Key"];
  // const inputEl = React.useRef(null);
}
