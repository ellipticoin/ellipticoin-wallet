import Logo from "./logo.svg";
import React from "react";
import { animated, useTransition } from "react-spring";

export default function Loader(props) {
  const { loading } = props;
  const loader = useTransition(loading, null, {
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  return loader.map(({ item, key, props }) =>
    item ? (
      <animated.div key={item} style={props} id="loader">
        <img src={Logo} alt="icon" className="loading-icon" />
      </animated.div>
    ) : (
      <animated.div key={item} style={props}></animated.div>
    )
  );
}
