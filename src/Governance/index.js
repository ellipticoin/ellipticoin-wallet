import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { animated, useTransition } from "react-spring";
import { Button, ProgressBar } from "react-bootstrap";
import { BASE_FACTOR } from "ellipticoin";
import { useGetProposals } from "../queries.js";
import { MS } from "../constants.js";
import NewProposal from "./NewProposal";
import Proposal from "./Proposal";

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
        <div className="listview-title mt-2">Proposals</div>
        <ul className="listview simple-listview clickable inset">
          {proposals.map((proposal) => (
            <li key={proposal.id} onClick={() => setShowProposal(proposal.id)}>
              <div>
                <h3>
                  MS {proposal.id}: {proposal.title}
                </h3>
                <h4>{proposal.subtitle}</h4>
              </div>
              <div style={{ width: "200px", marginLeft: "auto" }}>
                <div className="muted mb-1 text-center">In Progress</div>
                <ProgressBar>
                  <ProgressBar
                    key={1}
                    variant="success"
                    now={votePercentage(
                      proposal.votes,
                      moonshineTotalSupply,
                      true
                    )}
                    label={`${votePercentage(
                      proposal.votes,
                      moonshineTotalSupply,
                      true
                    )} %`}
                  />
                  <ProgressBar
                    key={2}
                    variant="danger"
                    now={votePercentage(
                      proposal.votes,
                      moonshineTotalSupply,
                      false
                    )}
                    label={`${votePercentage(
                      proposal.votes,
                      moonshineTotalSupply,
                      false
                    )} %`}
                  />
                </ProgressBar>
              </div>
              <div>
                <ChevronRight className="ml-1" />
              </div>
            </li>
          ))}
        </ul>
        <div className="section">
          <Button
            type="submit"
            style={{ width: "100%" }}
            className="btn mt-2 btn-lg btn-primary"
            onClick={() => setShowProposal("new")}
          >
            Create New Proposal
          </Button>
        </div>
      </div>
    </>
  );
}

export function votePercentage(votes, moonshineTotalSupply, yes) {
  if (!moonshineTotalSupply) return 0;
  return (
    Number(
      (votes
        .map((vote) => (vote.yes == yes ? vote.balance : 0n))
        .reduce((a, b) => a + b, 0n) *
        1000n) /
        moonshineTotalSupply
    ) / 10
  );
}
