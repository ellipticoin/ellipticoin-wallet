export default function InstallMetamask(props) {
  const isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  const isFirefox = typeof InstallTrigger !== "undefined";

  let button;
  if (isChrome) {
    button = (
      <a
        href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        className="btn btn-primary align-self-center"
        style={{ margin: "auto" }}
      >
        Install MetaMask
      </a>
    );
  } else if (isFirefox) {
    button = (
      <a
        href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
        target="_blank"
        style={{ margin: "auto" }}
        className="btn btn-primary align-self-center"
      >
        Install MetaMask
      </a>
    );
  } else if (navigator.userAgent.match(/Android/i)) {
    button = (
      <a
        href="https://play.google.com/store/apps/details?id=io.metamask"
        target="_blank"
        style={{ margin: "auto" }}
        className="btn btn-primary align-self-center"
      >
        Install MetaMask
      </a>
    );
  } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    button = (
      <a
        href="https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202"
        target="_blank"
        style={{ margin: "auto" }}
        className="btn btn-primary align-self-center"
      >
        Install MetaMask
      </a>
    );
  } else {
    button = (
      <div className="align-self-center" style={{ margin: "auto" }}>
        Please install{" "}
        <a target="_blank" href="https://www.google.com/chrome/">
          Chrome
        </a>{" "}
        or <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-content-center flex-wrap"
      style={{ height: "100%", width: "100%" }}
    >
      {button}
    </div>
  );
}
