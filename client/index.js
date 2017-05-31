import React from 'react';
import {render} from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';

console.log('App loaded.');

render(
      <Router>
        <Routes />
      </Router>
      , document.getElementById('app')
    );