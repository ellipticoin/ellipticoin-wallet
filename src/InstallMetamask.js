export default function InstallMetamask(props) {
  const isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  const isFirefox = typeof InstallTrigger !== "undefined";

  if (isChrome) {
    return (
      <a
        href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        className="btn btn-primary"
      >
        Install MetaMask
      </a>
    );
  } else if (isFirefox) {
    return (
      <a
        href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
        target="_blank"
        className="btn btn-primary"
      >
        Install MetaMask
      </a>
    );
  } else {
    return (
      <>
        Please install{" "}
        <a target="_blank" href="https://www.google.com/chrome/">
          Chrome
        </a>{" "}
        or <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
      </>
    );
  }
}
