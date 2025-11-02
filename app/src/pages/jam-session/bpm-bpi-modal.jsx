import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Form, FormGroup, Col, FormControl, FormLabel, FormText } from 'react-bootstrap';
import storage from '../../storage/index.js';

export default class BpmBpiModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.props;

    // Prebind
    this.onEnter = this.onEnter.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }
  onEnter() {
    // Reset state
    this.setState(this.props);
  }
  onSubmit() {
    // Pass data to parent
    this.props.onResponse(this.state);
  }
  onCancel() {
    this.props.onResponse(false);
  }
  render() {
    let unchanged = (this.state.bpm == this.props.bpm && this.state.bpi == this.props.bpi);
    return (
      <Modal show={this.props.show} onEnter={this.onEnter} onHide={this.onCancel} className="agreement-modal">
        <Modal.Header closeButton>
          <Modal.Title>Change Tempo or Interval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vote for a new tempo or interval length using the form below:</p>
          <Form horizontal onSubmit={this.onSubmit}>
            <FormGroup controlId="bpm">
              <Col sm={2}>
                <FormLabel>Tempo (BPM)</FormLabel>
              </Col>
              <Col sm={10}>
                <FormControl type="number" required value={this.state.bpm} onChange={(e) => {this.setState({bpm: e.target.value})}} />
                <FormText muted>Tempo, in beats per minute.</FormText>
              </Col>
            </FormGroup>
            <FormGroup controlId="bpi">
              <Col sm={2}>
                <FormLabel>Interval Length (BPI)</FormLabel>
              </Col>
              <Col sm={10}>
                <FormControl type="number" required value={this.state.bpi} onChange={(e) => {this.setState({bpi: e.target.value})}} />
                <FormText muted>The number of beats per interval. Remember, your jam's chord progression needs to fit within this amount of beats!</FormText>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onCancel}>Cancel</Button>
          <Button onClick={this.onSubmit} variant="primary" disabled={unchanged}>Vote</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
