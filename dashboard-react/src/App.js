import React, { Component } from 'react';
import logo from './logo.svg';
import style from './App.scss';
import { BrowserRouter } from 'react-router-dom'

import 'semantic-ui-css/semantic.min.css';

import LoginPage from './Components/LoginPage/LoginPage.jsx'

class App extends Component {
  render() {
    return (
      <LoginPage />
    );
  }
}

export default App;
