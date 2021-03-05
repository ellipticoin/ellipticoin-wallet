import { useMemo } from "react";
import { Button, Alert, ProgressBar } from "react-bootstrap";
import { ChevronLeft } from "react-feather";
import { actions as msActions } from "ellipticoin";
import { usePostTransaction } from "../mutations";
import { votePercentage } from "./index.js";
import { ethers } from "ethers";
import Action from "./Action";

const { arrayify } = ethers.utils;

export default function Proposal(props) {
  const {
    address,
    onHide,
    moonshineTotalSupply,
    proposal: { actions, id, title, subtitle, content, votes },
  } = props;
  const [vote] = usePostTransaction(msActions.Vote, address);
  const handleVote = async (event, proposalId, affirmative) => {
    event.preventDefault();
    const result = await vote(proposalId, affirmative);
    if (result == null) {
    } else {
      alert(result);
    }
  };
  const userVote = useMemo(() =>
    votes.find(
      (vote) =>
        vote.address === Buffer.from(arrayify(address)).toString("base64")
    )
  );
  return (
    <div style={{ backgroundColor: "white", height: "100%" }}>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 text-center">{title}</h2>
      </div>
      <div id="appCapsule">
        <div
          className="section mt-2"
          style={{ maxWidth: "640px", margin: "auto" }}
        >
          <h2 className="mt-4 text-center">{subtitle}</h2>
          {content}

          <h2 className="mt-4">Actions</h2>
          {actions.map((action) => (
            <Action action={action} />
          ))}
          <h2 className="mt-4">Status: In Progress</h2>
          <ProgressBar>
            <ProgressBar
              key={1}
              variant="success"
              now={votePercentage(votes, moonshineTotalSupply, true)}
              label={`${votePercentage(votes, moonshineTotalSupply, true)} %`}
            />
            <ProgressBar
              key={2}
              variant="danger"
              now={votePercentage(votes, moonshineTotalSupply, false)}
              label={`${votePercentage(votes, moonshineTotalSupply, false)} %`}
            />
          </ProgressBar>
          {userVote ? (
            <h1 className="text-center mt-4">
              You Voted:{" "}
              {userVote.yes ? (
                <Alert
                  variant="success"
                  style={{ display: "inline-block", verticalAlign: "middle" }}
                >
                  <Alert.Heading>Yes</Alert.Heading>
                </Alert>
              ) : (
                <Alert
                  variant="danger"
                  style={{ display: "inline-block", verticalAlign: "middle" }}
                >
                  <Alert.Heading>No</Alert.Heading>
                </Alert>
              )}
            </h1>
          ) : (
            <div className="d-flex row justify-content-between">
              <Button
                type="submit"
                className="btn mt-2 btn-lg btn-danger"
                onClick={(event) => handleVote(event, id, false)}
              >
                Vote No
              </Button>
              <Button
                type="submit"
                className="btn mt-2 btn-lg btn-success"
                onClick={(event) => handleVote(event, id, true)}
              >
                Vote Yes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
