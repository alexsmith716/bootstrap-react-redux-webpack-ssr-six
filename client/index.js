import "@babel/polyfill";
import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router } from 'react-router-dom';

import { renderRoutes } from 'react-router-config';
import { trigger } from 'redial';

import { ReduxAsyncConnect } from '../shared';

import asyncMatchRoutes from '../server/utils/asyncMatchRoutes';

import { AppContainer as HotEnabler } from 'react-hot-loader';
// import Loadable from 'react-loadable';

import routes from '../shared/routes';

import createBrowserHistory from 'history/createBrowserHistory';

import './assets/js/app';

// =====================================================================

const dest = document.getElementById('content');

// =====================================================================

// const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

(async () => {

  // ###########################################################################
  // ######## ----------- CREATE BROWSER HISTORY OBJECT ----------------- ######
  // ###########################################################################

  const history = createBrowserHistory();
  //console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > history: ', history);

  const hydrate = async _routes => {

    const { components, match, params } = await asyncMatchRoutes(_routes, history.location.pathname);

    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > hydrate > __CLIENT__ ?: ', __CLIENT__);
    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > hydrate > __SERVER__ ?: ', __SERVER__);

    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > hydrate > asyncMatchRoutes > components: ', components);
    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > hydrate > asyncMatchRoutes > match: ', match);
    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > hydrate > asyncMatchRoutes > params: ', params);

    // preserve SSR markup and attach needed event handlers
    // ensure all data for routes is prefetched on client before rendering
    // attach any needed event handlers to the existing server rendered markup
    // 'trigger' all '@provideHooks' decorated components
    // The `@provideHooks` decorator allows you to define hooks for your custom lifecycle events,
    // from matched routes, get all data from routes's components ('isAuthLoaded', 'isInfoLoaded'. etc.)
    // 'trigger' function ('server' && 'client') will initiate 'fetch' event for components with '@provideHooks' decorator
    // for initial load, components App && Home. only App - '@@redial-hooks': {fetch: [Function: fetch]}

    // Define locals to be provided to all lifecycle hooks (@provideHooks)
    // const triggerLocals = {
    //   match,
    //   params,
    //   history,
    //   location: history.location
    // };

    // Wait for async data fetching to complete, then continue to render
    // Don't fetch data for initial route, server has already done the work:
    // console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > window.__PRELOADED__ ??: ', window.__PRELOADED__)
    // if (window.__PRELOADED__) {
    //   // Delete initial data so that subsequent data fetches can occur:
    //   delete window.__PRELOADED__;
    // } else {
    //   // Fetch mandatory data dependencies for 2nd route change onwards:
    //   await trigger('fetch', components, triggerLocals);
    // }

    // await trigger('fetch', components, triggerLocals);
    // Fetch deferred, client-only data dependencies:
    // await trigger('defer', components, triggerLocals);

    // server-rendered markup ('ReactDOMServer.renderToString()') sent here
    // 'ReactDOM.hydrate()' preserves server-sent server-rendered markup
    // (allows for a very performant first-load experience)
    ReactDOM.hydrate(
      <HotEnabler>
        <Router>
          <ReduxAsyncConnect routes={_routes}>
            {renderRoutes(_routes)}
          </ReduxAsyncConnect>
        </Router>
      </HotEnabler>,
      dest
    );
  };

   // await Loadable.preloadReady();
  await hydrate(routes);

  // ==============================================================================================

  if (module.hot) {
    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > MODULE.HOT! <<<<<<<<<<<<<<<<<');
    module.hot.accept('../shared/routes', () => {
      const nextRoutes = require('../shared/routes').default;
      console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > MODULE.HOT! > nextRoutes: ', nextRoutes);
      hydrate(nextRoutes).catch(err => {
        console.error('>>>>>>>>>>>>>>>>>>> Error on routes reload:', err);
      });
    });
  } else {
    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > NO MODULE.HOT! <<<<<<<<<<<<<<');
  }

  // ==============================================================================================

  // Server-side rendering check
  if (process.env.NODE_ENV !== 'production') {
    window.React = React; // enable debugger
    console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > Server-side rendering check <<<<<<<<<<<<<<<<<<<<<<');

    if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-reactroot']) {
      console.error('Server-side React render WAS discarded! Make sure initial render does NOT contain any client-side code!');
    } else {
      console.log('Server-side React render NOT discarded! Initial render does NOT contain any client-side code!');
    }
  }

  // ==============================================================================================

  // if (__DEVTOOLS__ && !window.devToolsExtension) {
  //   console.log('>>>>>>>>>>>>>>>>>>> CLIENT.JS > __DEVTOOLS__ <<<<<<<<<<<<<<<<<<<<<<');
  //   const devToolsDest = document.createElement('div');
  //   window.document.body.insertBefore(devToolsDest, null);
  //   const DevTools = require('./containers/DevTools/DevTools').default;

  //   ReactDOM.hydrate(
  //     <Provider store={store} {...providers}>
  //       <DevTools />
  //     </Provider>,
  //     devToolsDest
  //   );
  // }

  if (!__DEVELOPMENT__) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> CLIENT.JS > !__DEVELOPMENT__ NO <<<<<<<<<<<<<');
  } else {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> CLIENT.JS > !__DEVELOPMENT__ YES <<<<<<<<<<<<<');
  }
  if ('serviceWorker' in navigator) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> CLIENT.JS > serviceWorker in navigator YES <<<<<<<<<<<<<');
  } else {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> CLIENT.JS > serviceWorker in navigator NO <<<<<<<<<<<<<');
  }

  if (!__DEVELOPMENT__ && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/dist/service-worker.js', { scope: '/' });
      console.log('>>>>>>>>>>>>>>>>>>>>>>>> CLIENT.JS > !__DEVELOPMENT__ && serviceWorker in navigator YES!! <<<<<<<<<<<<<');
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                console.log('New or updated content is available.');
              } else {
                console.log('Content is now available offline!');
              }
              break;
            case 'redundant':
              console.error('The installing service worker became redundant.');
              break;
            default:
          }
        };
      };
    } catch (error) {
      console.log('Error registering service worker: ', error);
    }
    await navigator.serviceWorker.ready;
    console.log('Service Worker Ready');
  } else {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> CLIENT.JS > !__DEVELOPMENT__ && serviceWorker in navigator NO!! <<<<<<<<<<<<<');
  }

})();
