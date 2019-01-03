import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router';

import renderRoutes from 'react-router-config/renderRoutes';

import { provideHooks } from 'redial';

import Helmet from 'react-helmet';
import qs from 'qs';

import { Link } from 'react-router-dom';

import config from '../../../config/config';

// --------------------------------------------------------------------------
// HOC: apply HOCs outside the component definition so that the resulting component is created only once. 
// Then, it's identity will be consistent across renders
// Decorators are applied in the order that you declare them
// '@provideHooks' && '@connect' are being applied to class 'App'
// Decorators are functions that return another function
// class decorators evaluated on runtime && decorated code is replaced with the return value

// HOC to access the imperative API
// You can get access to the history object's properties and the closest <Route>'s 
//   match via the withRouter higher-order component.
// withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
@withRouter 

// --------------------------------------------------------------------------

// ES6 does not support creating properties with 'static'
// Stage 3 proposal >>> "@babel/plugin-proposal-class-properties"

class App extends Component {

  static propTypes = {
    route: PropTypes.objectOf(PropTypes.any).isRequired,
    location: PropTypes.objectOf(PropTypes.any).isRequired
  };

  // getDerivedStateFromProps(): enables component to update internal state as the result of changes in props
  // lifecycle is invoked after a component is instantiated as well as before it is re-rendered
  // returns an object to update state, or null to indicate that the new props do not require any state updates
  // called every time a component is rendered
  static getDerivedStateFromProps(props, state) {
    const { prevProps } = state;
    // Compare the incoming prop to previous prop

    return {
      // Store the previous props in state
      prevProps: props,
    };
  }

  state = {
    prevProps: this.props
  };

  // executed after the render() method is done
  // and the new changes to the underlying DOM have been applied

  // invoked immediately after updating occurs
  // opportunity to operate on the DOM when the component has been updated
  // && network requests as long as you compare the current props to previous props 
  // (e.g. a network request may not be necessary if the props have not changed)
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {

    const { route } = this.props;

    const styles = require('./styles/App.scss');
    const stylesCss = require('./css/AppCss1.css');

    return (

      <div className={styles.app}>

        <Helmet {...config.app.head} />

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">

          <div className="container">

            <Link to='/' className={`navbar-brand js-scroll-trigger ${styles.brand}`}>Election App</Link>

            <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarResponsive">

              <ul className="navbar-nav mr-auto">

                <li className="nav-item">
                  <Link to='/about' className="nav-link js-scroll-trigger">About</Link>
                </li>

                <li className="nav-item">
                  <Link to='/sticky-footer' className="nav-link js-scroll-trigger">StickyFooter</Link>
                </li>

                <li className="nav-item">
                  <Link to='/login' className="nav-link js-scroll-trigger">
                    <span className={`fas fa-fw fa-sign-in-alt ${styles.sharedVarColorRutgersScarletXX}`}></span>Login</Link>
                </li>

                <li className="nav-item">
                  <Link to='/register' className="nav-link js-scroll-trigger">Register</Link>
                </li>

                <li className="nav-item">
                  <a className="nav-link font-old-english" data-toggle="modal" href="#appModal1">Modal</a>
                </li>

                <li className="nav-item">
                  <a className="nav-link font-norwester" href="#">
                    <span className={`fas fa-fw fa-headphones ${styles.colorGoldLocal}`}></span><span className={styles.testColorFont}>Headphones!</span></a>
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Links</a>
                  <div className="dropdown-menu" aria-labelledby="dropdown01">
                    <Link to='/about-one' className="dropdown-item js-scroll-trigger">AboutOne</Link>
                    <Link to='/about-two' className="dropdown-item js-scroll-trigger">AboutTwo</Link>
                    <Link to='/about-three' className="dropdown-item js-scroll-trigger">AboutThree</Link>
                    <Link to='/about-four' className="dropdown-item js-scroll-trigger">AboutFour</Link>
                    <Link to='/tic-tac-toe' className="dropdown-item js-scroll-trigger">Tic-Tac-Toe</Link>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className={styles.appContent}>

          {renderRoutes(route.routes)}

        </div>

        <div className={styles.footer}>
          <div className="container h-100">
            <div className={`h-100 d-flex flex-column justify-content-center align-items-center ${styles.flexContainer}`}>
              <div>Copyright &copy; 2018 · Election App 2018</div>
              <div><span className={`fas fa-headphones fa-padding ${styles.colorGoldLocal}`}></span><span className={`font-norwester ${styles.colorGoldLocal}`}>Footer Headphones!</span></div>
            </div>
          </div>
        </div>

        <div className="app-modal modal fade" id="appModal1" tabIndex="-1" role="dialog" aria-labelledby="appModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="appModalLabel">Modal Test</h5>
                <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">

                <p className={styles.sharedVarColorRutgersScarletXX}>Modal is working. This paragraph's font and the above modal-title's font is using Bootstrap's default font. It is the default 'global' font for this app. It is overriding Bootstrap's default font 'font-family-sans-serif'. It's a hard to read font but easily recognizable for development purposes.</p>

                <p className={styles.specialAppFontColor}>This paragraph's '@font-face' is 'Old English'.</p>

                <p className="font-roboto-mono-V4-latin-regular">This paragraph's '@font-face' is 'roboto-mono-v4-latin-regular'.</p>

                <p className="font-montserratlight color-salmon">This paragraph's '@font-face' is 'font-montserratlight'.</p>

                <p className="font-lobster-v20-latin-regular">This paragraph's '@font-face' is 'lobster-v20-latin-regular'.</p>

                <p className="font-norwester">This paragraph's '@font-face' is 'norwester'.</p>

                <p className="color-crimson open-sans-italic-webfont">This paragraph's '@font-face' is 'OpenSans-Italic-webfont'.</p>

                <p className="font-philosopher-bold-webfont">This paragraph's '@font-face' is 'font-philosopher-bold-webfont'.</p>

                <p className="font-sourcesanspro-regular-webfont">This paragraph's '@font-face' is 'sourcesanspro-regular-webfont'.</p>

                <p className={`color-springgreen ${styles.montserratLightFontGlobalToLocal}`}>This paragraph's '@font-face' is 'MontserratLight'. It is scoped Global to Local.</p>

                <p className="color-orangered font-opensans-bold-webfont">This paragraph's '@font-face' is 'OpenSans-Bold-webfont' It is scoped Global.</p>

                <p className={stylesCss.colorCrimsonCssLocal}>This paragraph's color is 'colorCrimsonCssLocal'. It is scoped Local fom 'AppCss1.css'.</p>

                <p className={styles.coloredText2Local}>This paragraph's color is 'coloredText2Local'. It is scoped Local fom 'AppScss2.scss'.</p>

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                <a className="btn btn-primary" href="#">Button Somewhere</a>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
