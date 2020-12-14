import ApolloWrapper from "./ApolloWrapper";
import "./App.css";
import "./styles/style.scss";
import React from "react";
import ReactDOM from "react-dom";

if (
  localStorage.getItem("secretKey") &&
  localStorage.getItem("secretKey").startsWith("[")
) {
  localStorage.clear();
}
ReactDOM.render(<ApolloWrapper />, document.getElementById("root"));
