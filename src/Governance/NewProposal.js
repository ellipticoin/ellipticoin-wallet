import { useState, useMemo } from "react";
import { Form, Button } from "react-bootstrap";
import { ChevronLeft } from "react-feather";
import { actions as msActions, encodeActions } from "ellipticoin";
import { usePostTransaction } from "../mutations";

export default function NewProposal(props) {
  const { onHide, address } = props;
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [actions, setActions] = useState("");
  const [createProposal] = usePostTransaction(
    msActions.CreateProposal,
    address
  );
  const actionsValid = useMemo(() => encodeActions(actions) !== null);
  const handleCreateProposal = async (event) => {
    event.preventDefault();
    const result = await createProposal(title, subtitle, content, actions);
    if (result == null) {
      onHide();
    } else {
      alert(result);
    }
  };
  return (
    <>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">New Proposal</h2>
      </div>
      <div id="appCapsule">
        <div className="section pt-1 mb-2">
          <div className="section wallet-card d-flex flex-column justify-content-center">
            <Form
              noValidate
              className="mt-2"
              autoComplete="off"
              onSubmit={(event) => handleCreateProposal(event)}
            >
              <Form.Group className="basic">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="title"
                  placeholder="Title"
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Subtitle</Form.Label>
                <Form.Control
                  type="subtitle"
                  placeholder="Subtitle"
                  onChange={(event) => setSubtitle(event.target.value)}
                  value={subtitle}
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  onChange={(event) => setContent(event.target.value)}
                  value={content}
                />
              </Form.Group>
              <Form.Group className="basic">
                <Form.Label>Actions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  onChange={(event) => setActions(event.target.value)}
                  value={actions}
                  isInvalid={!actionsValid}
                  placeholder="Pay 0xAdfe2B5BeAc83382C047d977db1df977FD9a7e41 600,000.000000 ELC (one action per line)"
                />
              </Form.Group>
              <Form.Group className="basic">
                <Button type="submit" className="btn mt-2 btn-lg btn-primary">
                  Create Proposal
                </Button>
              </Form.Group>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
