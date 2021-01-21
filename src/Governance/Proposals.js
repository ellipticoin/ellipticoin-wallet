import { ChevronRight } from "react-feather";
import { Button, ProgressBar } from "react-bootstrap";
import { votePercentage } from "./index.js";

export default function Proposals(props) {
  const { proposals, setShowProposal, moonshineTotalSupply } = props;
  return (
    <>
      <div className="listview-title">Proposals</div>
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
              <div className="muted mb-1 text-center">
                {proposal.result == null
                  ? "In Progress"
                  : proposal.result == "For"
                  ? "Passed"
                  : "Failed"}
              </div>
              <ProgressBar>
                <ProgressBar
                  key={1}
                  variant="success"
                  now={votePercentage(
                    proposal.votes,
                    moonshineTotalSupply,
                    "For"
                  )}
                  label={`${votePercentage(
                    proposal.votes,
                    moonshineTotalSupply,
                    "For"
                  )} %`}
                />
                <ProgressBar
                  key={2}
                  variant="danger"
                  now={votePercentage(
                    proposal.votes,
                    moonshineTotalSupply,
                    "Against"
                  )}
                  label={`${votePercentage(
                    proposal.votes,
                    moonshineTotalSupply,
                    "Against"
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
    </>
  );
}
