import React from 'react';
import { Card } from 'react-bootstrap';

export default class UserPanel extends React.Component {
  render() {
    return (
      <Card bg={this.props.local ? "primary" : undefined} text={this.props.local ? "white" : undefined}>
        <Card.Header>
          <span>{this.props.name}</span>
          <span className="ip">{this.props.ip}</span>
        </Card.Header>
        <Card.Body>
          {this.props.children}
        </Card.Body>
      </Card>
    );
  }
}
