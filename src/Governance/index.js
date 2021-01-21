import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { animated, useTransition } from "react-spring";
import { Button, ProgressBar } from "react-bootstrap";
import { BASE_FACTOR } from "ellipticoin";
import { useGetProposals } from "../queries.js";
import { USD, TOKEN_METADATA } from "../constants";
import { MS } from "../constants.js";
import NewProposal from "./NewProposal";
import Proposal from "./Proposal";
import Proposals from "./Proposals";
import Treasury from "./Treasury";

export default function Governance(props) {
  const { onHide, address, tokens } = props;
  const [showProposal, setShowProposal] = useState(null);
  const proposals = useGetProposals();
  const moonshineTotalSupply = useMemo(() => {
    const moonshine = tokens.find(({ address }) => MS);
    if (moonshine) {
      return moonshine.totalSupply;
    }
  });

  const pageTransition = useTransition(showProposal, null, {
    enter: { transform: "translate3d(0,0,0)" },
    from: { transform: "translate3d(-100%,0,0)" },
    leave: { transform: "translate3d(-100%,0,0)" },
  });
  const totalBalance = 0n;
  return (
    <>
      {pageTransition.map(({ item, key, props }) =>
        item !== null ? (
          <animated.div
            style={{
              zIndex: 1002,
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "#EDEDF5",
              ...props,
            }}
            key={key}
          >
            {item === "new" ? (
              <NewProposal
                address={address}
                onHide={() => setShowProposal(null)}
              />
            ) : (
              <Proposal
                proposal={proposals.find(({ id }) => id === item)}
                address={address}
                moonshineTotalSupply={moonshineTotalSupply}
                onHide={() => setShowProposal(null)}
              />
            )}
          </animated.div>
        ) : null
      )}
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Governance</h2>
      </div>
      <div id="appCapsule">
        <Treasury tokens={tokens} totalBalance={totalBalance} />
        <Proposals
          proposals={proposals}
          setShowProposal={setShowProposal}
          moonshineTotalSupply={moonshineTotalSupply}
        />
      </div>
    </>
  );
}

export function votePercentage(votes, moonshineTotalSupply, choice) {
  if (!moonshineTotalSupply) return 0;
  return (
    Number(
      (votes
        .map((vote) => (vote.choice === choice ? vote.weight : 0n))
        .reduce((a, b) => a + b, 0n) *
        1000n) /
        moonshineTotalSupply
    ) / 10
  );
}
