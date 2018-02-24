import React, { Component } from 'react';
import './App.css';
import AppBar from './components/AppBar';
import { Row, Col } from 'reactstrap';
import CreateNewSession from './components/CreateNewSession';
import { HashRouter, Route } from 'react-router-dom';
import PlanningSession from './components/PlanningSession';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <div className="App">
          <AppBar />
          <Row style={{ padding: '1rem' }}>
            <Col>
              <Route exact path="/" component={CreateNewSession} />
              <Route path="/planning/:session" component={PlanningSession} />
            </Col>
          </Row>
        </div>
      </HashRouter>
    );
  }
}

export default App;
