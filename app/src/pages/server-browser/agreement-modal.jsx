import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Card } from 'react-bootstrap';

export default class AgreementModal extends React.Component {
  constructor(props) {
    super(props);

    // Prebind
    this.onAccept = this.onAccept.bind(this);
    this.onReject = this.onReject.bind(this);
    this.onEntering = this.onEntering.bind(this);
  }
  onAccept() {
    this.props.onResponse(true);
  }
  onReject() {
    this.props.onResponse(false);
  }
  onEntering() {
    document.getElementById('agreement-accept-btn').focus();
  }
  render() {
    if (typeof this.props.terms != "string") return null;
    let terms = this.props.terms.trim();
    let show = (terms.length > 0);
    return (
      <Modal show={show} onHide={this.onReject} className="agreement-modal">
        <Modal.Header closeButton>
          <Modal.Title>Server License Agreement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>To connect to this server, you must accept the following terms:</p>
          <Card bg="light">
            <Card.Body>{terms}</Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onReject}>Cancel</Button>
          <Button onClick={this.onAccept} variant="primary" id="agreement-accept-btn">Accept</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
AgreementModal.propTypes = {
  terms: PropTypes.string.isRequired,
  onResponse: PropTypes.func.isRequired,
};
