import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Form, FormGroup, Col, FormControl, FormLabel, FormText } from 'react-bootstrap';
import storage from '../../storage/index.js';

export default class LoginModal extends React.Component {
  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      username: '',
      password: '',
    };

    // Load default state from storage
    storage.getItem('lastUsername')
    .then(username => {
      this.setState({username})
    })
    .catch(e => {});

    // Prebind
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }
  onSubmit() {
    // Gather form data
    let username = this.state.username;
    let password = this.state.password;

    storage.setItem('lastUsername', username);
    this.props.onResponse(true, this.props.server.host, username, password);
  }
  onCancel() {
    this.props.onResponse(false);
  }
  render() {
    if (!this.props.server) return null;
    return (
      <Modal show={this.props.show} onHide={this.onCancel} className="agreement-modal">
        <Modal.Header closeButton>
          <Modal.Title>Join Server</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>To join this server ({this.props.server.host}), provide the following information:</p>
          <Form horizontal onSubmit={this.onSubmit}>
            <FormGroup controlId="username">
              <Col sm={2}>
                <FormLabel>Username</FormLabel>
              </Col>
              <Col sm={10}>
                <FormControl type="text" placeholder="e.g. HeroOfGuitars" required value={this.state.username} onChange={(e) => {this.setState({username: e.target.value})}} />
                <FormText muted>Choose a nickname to identify yourself.</FormText>
              </Col>
            </FormGroup>

            <FormGroup controlId="password" style={this.props.public ? {display: "none"} : {}}>
              <Col sm={2}>
                <FormLabel>Password</FormLabel>
              </Col>
              <Col sm={10}>
                <FormControl type="password" placeholder="Leave blank in most cases" onChange={(e) => {this.setState({password: e.target.value})}} />
                <FormText muted>If this server requires a password, provide it here. If you're unsure, leave this blank.</FormText>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onCancel}>Cancel</Button>
          <Button onClick={this.onSubmit} variant="primary" disabled={this.state.username.length < 1}>Join</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
