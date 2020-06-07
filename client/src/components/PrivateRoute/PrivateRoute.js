// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {isLoggedIn} from '../../utils/utils';

class PrivateRoute extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      isAuthenticated: false
    }
  }

  componentDidMount() {
    isLoggedIn().then((isAuthenticated) => {
      this.setState({
        loading: false,
        isAuthenticated
      })
    })
  }

  render() {
    const { component: Component, ...rest } = this.props
    return (
      <Route
        {...rest}
        render={props =>
          this.state.isAuthenticated ? (
            <Component {...props} />
          ) : (
              this.state.loading ? (
                <div>LOADING...</div>
              ) : (
                  <Redirect to={{ pathname: '/login', state: { from: this.props.location } }} />
                )
            )
        }
      />
    )
  }
}

export default PrivateRoute;