import { default as React, useState, useRef } from "react";
import { Overlay, Tooltip } from "react-bootstrap";

export default function CopyButton(props) {
  const { children } = props;
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const handleClick = () => {
    setCopied(true);
    setShowTooltip(false);
    setTimeout(() => setCopied(false), 1000);
  };
  const target = useRef(null);
  return (
    <>
      <Overlay target={target.current} show={showTooltip} placement="top">
        {(props) => <Tooltip {...props}>Click To Copy</Tooltip>}
      </Overlay>
      <Overlay target={target.current} show={copied} placement="top">
        {(props) => <Tooltip {...props}>Copied</Tooltip>}
      </Overlay>
      <div
        ref={target}
        onClick={() => handleClick()}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="copy-button"
      >
        {children}
      </div>
    </>
  );
}
