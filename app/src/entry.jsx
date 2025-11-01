import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, Switch } from 'react-router';
import { createMemoryHistory } from 'history';
import Application from './application.jsx';
import ServerBrowser from './pages/server-browser/index.jsx';
import JamSession from './pages/jam-session/index.jsx';

const history = createMemoryHistory();

// Render top-level component to page
const container = document.getElementById('container');
const root = createRoot(container);
root.render(
  <Router history={history}>
    <Application>
      <Switch>
        <Route exact path="/" component={ServerBrowser} />
        <Route path="/jam" component={JamSession}/>
        <Route path="*" component={ServerBrowser}/>
      </Switch>
    </Application>
  </Router>
);
