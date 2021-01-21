import { useMemo } from "react";
import { Button, Alert, ProgressBar } from "react-bootstrap";
import { ChevronLeft } from "react-feather";
import { actions as msActions } from "ellipticoin";
import { usePostTransaction } from "../mutations";
import { value } from "../helpers";
import { votePercentage } from "./index.js";
import Address from "./Address";
import { ethers } from "ethers";
import Action from "./Action";

const { arrayify, hexlify, getAddress } = ethers.utils;

export default function Proposal(props) {
  const {
    address,
    onHide,
    moonshineTotalSupply,
    proposal: { actions, id, title, subtitle, content, votes, result },
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
      (vote) => Buffer.compare(vote.voter, Buffer.from(arrayify(address))) == 0
    )
  );
  const status = {
    null: "In Progress",
    For: "Passed",
    Against: "Failed",
  }[result];

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
      <div id="appCapsule" className="px-4 mt-1">
        <h2 className="mt-4 text-center">{subtitle}</h2>
        {content}

        <h2 className="mt-4">Actions</h2>
        {actions.map((action) => (
          <Action action={action} />
        ))}
        <h2 className="mt-4">Status: {status}</h2>
        <ProgressBar>
          <ProgressBar
            key={1}
            variant="success"
            now={votePercentage(votes, moonshineTotalSupply, "For")}
            label={`${votePercentage(votes, moonshineTotalSupply, "For")} %`}
          />
          <ProgressBar
            key={2}
            variant="danger"
            now={votePercentage(votes, moonshineTotalSupply, "Against")}
            label={`${votePercentage(
              votes,
              moonshineTotalSupply,
              "Against"
            )} %`}
          />
        </ProgressBar>
        {userVote ? (
          <h1 className="text-center mt-4">
            You Voted:{" "}
            {userVote.choice == "For" ? (
              <Alert
                variant="success"
                style={{ display: "inline-block", verticalAlign: "middle" }}
              >
                <Alert.Heading>For</Alert.Heading>
              </Alert>
            ) : (
              <Alert
                variant="danger"
                style={{ display: "inline-block", verticalAlign: "middle" }}
              >
                <Alert.Heading>Against</Alert.Heading>
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
              Vote Against
            </Button>
            <Button
              type="submit"
              className="btn mt-2 btn-lg btn-success"
              onClick={(event) => handleVote(event, id, true)}
            >
              Vote For
            </Button>
          </div>
        )}
        <div className="row">
          <div className="col-md-6">
            <table className="table rounded w-100">
              <thead>
                <tr>
                  <th scope="col" className="text-center" colSpan="2">
                    Votes For
                  </th>
                </tr>
              </thead>
              <tbody>
                {votes
                  .filter(({ choice }) => choice === "For")
                  .map((vote) => (
                    <tr key={vote.voter}>
                      <td>
                        <Address address={address}>{vote.voter}</Address>
                      </td>
                      <td>{value(vote.weight)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <table className="table rounded w100">
              <thead>
                <tr>
                  <th scope="col" className="text-center" colSpan="2">
                    Votes Against
                  </th>
                </tr>
              </thead>
              <tbody>
                {votes
                  .filter(({ choice }) => choice === "Against")
                  .map((vote) => (
                    <tr key={vote.voter}>
                      <td>
                        <Address address={address}>{vote.voter}</Address>
                      </td>
                      <td>{value(vote.weight)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
