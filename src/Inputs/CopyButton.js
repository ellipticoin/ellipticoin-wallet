import { default as React, useState, useRef } from "react";
import { Overlay, Tooltip } from "react-bootstrap";
import copy from "copy-to-clipboard";

export default function CopyButton(props) {
  const { children, content } = props;
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const handleClick = () => {
    setCopied(true);
    copy(content)
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
