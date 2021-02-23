import AppWrapper from "./AppWrapper";
import "./styles/style.scss";
import React from "react";
import ReactDOM from "react-dom";

console.log("before render");
ReactDOM.render(<AppWrapper />, document.getElementById("root"));
