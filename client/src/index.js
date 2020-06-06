import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch, Route
} from 'react-router-dom';
import './index.scss';
import ListContainer from './components/ListContainer/ListContainer';
import Print from './components/Print/Print'
import Rooms from './components/Rooms/Rooms';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Login from './components/Login/Login';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
          <Route path="/login">
            <Login/>
          </Route>
          <PrivateRoute path="/print" component={Print}></PrivateRoute>
          <PrivateRoute path="/rooms/:roomCode" component={Rooms}></PrivateRoute>
          <PrivateRoute path="/rooms" component={Rooms}></PrivateRoute>
          <PrivateRoute path="/" component={ListContainer}></PrivateRoute>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
