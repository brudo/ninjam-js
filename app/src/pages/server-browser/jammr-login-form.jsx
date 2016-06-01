import React from 'react';
import { Form, FormGroup, FormControl, Button, Col, ControlLabel } from 'react-bootstrap';
import JammrClient from '../../jammr/client.js';

export default class JammrLoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: localStorage['lastJammrUsername'] || "",
      password: "",
      busy: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Handles form submissions.
   * @param {Event} event
   */
  onSubmit(event) {
    event.preventDefault();

    // Disable login form
    this.setState({busy: true});

    // Save values for pre-loading next time
    localStorage['lastJammrUsername'] = this.state.username;

    // Contact Jammr API for token (TODO: Move to a JammrApi class)
    let jammr = new JammrClient();
    jammr.authenticate(this.state.username, this.state.password);
    // TODO: Stuff

    this.setState({busy: false, password: ""}); // TODO: Move this to POST finish callback
  }

  render() {
    return (
      <div style={{padding: '20px 20px'}}>
        <p>Connect to jammr servers by logging in below.</p>
        <p>If you don't have a jammr account, you can register for one at <a href="https://jammr.net" target="_blank">jammr.net</a>.</p>
        <br/>
        <Form horizontal onSubmit={this.onSubmit}>
          <FormGroup controlId="username">
            <Col componentClass={ControlLabel} sm={2}>Username</Col>
            <Col sm={10}>
              <FormControl type="text" placeholder="Username" required value={this.state.username} onChange={(e) => {this.setState({username: e.target.value})}} />
            </Col>
          </FormGroup>

          <FormGroup controlId="password">
            <Col componentClass={ControlLabel} sm={2}>Password</Col>
            <Col sm={10}>
              <FormControl type="password" placeholder="Password" onChange={(e) => {this.setState({password: e.target.value})}} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Button type="submit" bsStyle="primary" disabled={!(this.state.password && this.state.username) || this.state.busy}>Connect</Button>
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  }
}
