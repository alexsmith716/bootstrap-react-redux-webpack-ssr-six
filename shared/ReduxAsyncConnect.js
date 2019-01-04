import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Route } from 'react-router';
import NProgress from 'nprogress';
import asyncMatchRoutes from '../server/utils/asyncMatchRoutes';

// --------------------------------------------------------------------------
// update component when the location changes
// render data which is dynamically loaded from API into a component on both server and client renders
// passing required data component via props
// rendering 'NProgress' loader if props are empty

// --------------------------------------------------------------------------
// HOC 'withRouter': get access to the history object's properties and the closest <Route>'s match
// 'withRouter' will pass updated match, location, and history props to the wrapped component whenever it renders
// Create a new component that is "connected" (redux terminology) to the router
// <Route> render methods are passed the same three route props: ('match', 'location', 'history')
@withRouter

// 'withRouter' does not subscribe to location changes like React Redux's connect does for state changes
// Instead, re-renders after location changes propagate out from the <Router> component
// This means that 'withRouter' does not re-render on route transitions unless its parent component re-renders
// --------------------------------------------------------------------------

export default class ReduxAsyncConnect extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    history: PropTypes.objectOf(PropTypes.any).isRequired,
    location: PropTypes.objectOf(PropTypes.any).isRequired
  };

  state = {
    previousLocation: null
  };

  componentWillMount() {
    NProgress.configure({ trickleSpeed: 222200 });
  }

  async componentWillReceiveProps(nextProps) {

    // current props
    const { history, location, routes } = this.props;

    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > componentWillReceiveProps() > __CLIENT__ ?: ', __CLIENT__);
    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > componentWillReceiveProps() > __SERVER__ ?: ', __SERVER__);

    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > componentWillReceiveProps() > location:', location);
    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > componentWillReceiveProps() > nextProps.location:', nextProps.location);

    // test if location has changed
    // if location changed, update the state in response to location prop changes
    // a page refresh has both 'locations' returning false (same key values)
    // (key prop to prevent remounting component when transition was made from route with the same component and same key prop)

    const {location: { pathname, search }} = nextProps;
    const navigated = `${pathname}${search}` !== `${location.pathname}${location.search}`;

    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > componentWillReceiveProps() > navigated?:', navigated);

    if (navigated) {

      NProgress.start();

      // location has changed, perform state transition
      // set state 'previousLocation' with the current location which is to become the previous location
      this.setState({ previousLocation: location });

      // load data while the old screen remains
      const { components, match, params } = await asyncMatchRoutes(routes, nextProps.location.pathname);

      // clear previousLocation so the next screen renders
      this.setState({ previousLocation: null });

      NProgress.done();
    }
  }

  // ----------------------------------------------------------------------------------------------------------

  render() {
    const { children, location } = this.props;
    const { previousLocation } = this.state;

    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > render() > children:', children);
    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > render() > location:', location);
    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > render() > previousLocation:', previousLocation);

    const theRoute = <Route location={previousLocation || location} render={() => children} />;
    console.log('>>>>>>>>>>>>>>>> ReduxAsyncConnect > render() > <Route>:', theRoute);

    return <Route location={previousLocation || location} render={() => children} />;
  }
}
