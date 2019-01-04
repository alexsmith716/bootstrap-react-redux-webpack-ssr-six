import fs from 'fs';
import config from '../config/config';
import path from 'path';

import React from 'react';

// ----------------------------------
import asyncMatchRoutes from '../server/utils/asyncMatchRoutes';
// ----------------------------------

// ----------------------------------
import { StaticRouter } from 'react-router';
// ----------------------------------

// ----------------------------------
import { ReduxAsyncConnect } from '../shared';
// ----------------------------------

// ----------------------------------
import { renderRoutes } from 'react-router-config';
// ----------------------------------

// ----------------------------------
import ReactDOM from 'react-dom/server';
// ----------------------------------

import createMemoryHistory from 'history/createMemoryHistory';

import routes from '../shared/routes';

import { trigger } from 'redial';

// holds a global cache of all the universal components that are rendered and makes them available via flushChunkNames
import { flushChunkNames } from 'react-universal-component/server';
import flushChunks from 'webpack-flush-chunks';
import { flushFiles } from 'webpack-flush-chunks';

import Html from '../server/utils/Html';

// ------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

export default ({ clientStats }) => async (req, res) => {

  console.log('>>>>>>>>>>>>>>>>> SERVER > __CLIENT__ ?: ', __CLIENT__);
  console.log('>>>>>>>>>>>>>>>>> SERVER > __SERVER__ ?: ', __SERVER__);

  // progressive app manifest
  // https://www.w3.org/TR/appmanifest/
  if (req.url == '/manifest.json') {
    console.log('>>>>>>>>>>>>>>>>> SERVER > manifest.json <<<<<<<<<<<<<<<<<<<<<<<');
    return res.sendFile(path.join(__dirname, '..', 'build', 'static', 'manifest.json'));
  }

  // if (req.url == '/dist/service-worker.js') {
  //   console.log('>>>>>>>>>>>>>>>>> SERVER > service-worker <<<<<<<<<<<<<<<<<<<<<<<');
  //   res.setHeader('Service-Worker-Allowed', '/');
  //   res.setHeader('Cache-Control', 'no-store');
  //   return;
  // }

  if (req.url == '/dlls/:dllName.js') {
    console.log('>>>>>>>>>>>>>>>>> SERVER > /dlls/:dllName.js <<<<<<<<<<<<<<<<<<<<<<<');
    return fs.access(
      path.join(__dirname, '..', 'build', 'static', 'dist', 'dlls', `${req.params.dllName}.js`),
      fs.constants.R_OK,
      err => (err ? res.send(`console.log('No dll file found (${req.originalUrl})')`) : null)
    );
  };

  console.log('>>>>>>>>>>>>>>>>> SERVER > IN > <<<<<<<<<<<<<<<<<<<<<<<');
  // console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.ip +++++++++++++: ', req.ip);
  console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.method +++++++++++++++: ', req.method);
  console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.url ++++++++++++++++++: ', req.url);
  console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.path ++++++++++++++++++: ', req.path);
  // console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.headers ++++++++++++++: ', req.headers);
  // console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.cookies ++++++++++++++: ', req.cookies);
  // console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.session ++++++++: ', req.session);
  // console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.params +++++++++: ', req.params);
  console.log('>>>>>>>>>>>>>>>>> SERVER > REQ.originalUrl ++++: ', req.originalUrl);
  console.log('>>>>>>>>>>>>>>>>> SERVER > IN < <<<<<<<<<<<<<<<<<<<<<<<');

  // #########################################################################

  console.log('>>>>>>>>>>>>>>>> SERVER > APP LOADER > SetUpComponent !! START !! <<<<<<<<<<<<<<<<<<<<<<<');

  const history = createMemoryHistory({ initialEntries: [req.originalUrl] });

  console.log('>>>>>>>>>>>>>>>>>>> SERVER.JS > APP LOADER > history: ', history)

  try {

    const { components, match, params } = await asyncMatchRoutes(routes, req.path);

    console.log('>>>>>>>>>>>>>>>> SERVER > await asyncMatchRoutes > components: ', components);
    console.log('>>>>>>>>>>>>>>>> SERVER > await asyncMatchRoutes > match: ', match);
    console.log('>>>>>>>>>>>>>>>> SERVER > await asyncMatchRoutes > params: ', params);

    const locals = {
      match,
      params,
      history,
      location: history.location
    };

    await trigger( 'fetch', components, locals);

    // const chunkNames = [];
    const context = {};

    // build step and render step ARE separate
    // const component = (
    //   <ReportChunks report={chunkName => chunkNames.push(chunkName)}>
    //    ...
    //   </ReportChunks>
    // );

    // build step and render step NOT separate
    const component = (
      <StaticRouter location={req.originalUrl} context={context}>
        <ReduxAsyncConnect routes={routes} >
          {renderRoutes(routes)}
        </ReduxAsyncConnect>
      </StaticRouter>
    );
  
    const content = ReactDOM.renderToString(component);

    // ------------------------------------------------------------------------------------------------------

    // array of chunks flushed from react-universal-component
    const chunkNames = flushChunkNames();

    console.log('>>>>>>>>>>>>>>>>> SERVER > chunkNames: ', chunkNames);

    // flushChunks and flushFiles: called immediately after ReactDOMServer.renderToString. 
    // They are used in server-rendering to extract the minimal amount of chunks to send to the client, 
    // thereby solving a missing piece for code-splitting: server-side rendering

    // ------------------------------------------------------------------------------------------------------

    const flushedFiles = flushFiles(clientStats, { chunkNames });
    // const flushedFilesFilter = flushedFiles.filter(file => file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.map'));

    console.log('>>>>>>>>>>>>>>>>> SERVER > flushFiles > flushedFiles: ', flushedFiles);
    // console.log('>>>>>>>>>>>>>>>>> SERVER > flushFiles > flushedFilesFilter: ', flushedFilesFilter);

    // -----------------------------------------------------------------------------

    const assets = flushChunks(clientStats, { chunkNames });

    // const assets = {
    //   // react components:
    //   Js,                // javascript chunks
    //   Styles,            // external stylesheets
    //   Css,               // raw css
    // 
    //   // strings:
    //   js,                // javascript chunks
    //   styles,            // external stylesheets
    //   css,               // raw css
    // 
    //   // arrays of file names:
    //   scripts,
    //   stylesheets,
    // 
    //   // cssHash for use with babel-plugin-dual-import:
    //   cssHashRaw,        // hash object of chunk names to css file paths
    //   cssHash,           // string: <script>window.__CSS_CHUNKS__ = ${JSON.stringify(cssHashRaw)}</script>
    //   CssHash,           // react component of above
    // 
    //   // important paths:
    //   publicPath,
    //   outputPath
    // } = flushChunks( clientStats, { chunkNames } )

    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > JS: ', assets.Js);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > STYLES: ', assets.Styles);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > CSS: ', assets.Css);

    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > .js: ', assets.js);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > styles: ', assets.styles);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > .css: ', assets.css);

    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > scripts: ', assets.scripts);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > stylesheets: ', assets.stylesheets);

    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > cssHashRaw: ', assets.cssHashRaw);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > cssHash: ', assets.cssHash);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > CssHash: ', assets.CssHash);

    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > publicPath: ', assets.publicPath);
    console.log('>>>>>>>>>>>>>>>>> SERVER > flushChunks > outputPath: ', assets.outputPath);

    // ------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------

    function hydrate() {
      res.write('<!doctype html>');
      ReactDOM.renderToNodeStream(<Html assets={assets} />).pipe(res);
    }

    console.log('>>>>>>>>>>>>>>>>> SERVER > __DISABLE_SSR__:', __DISABLE_SSR__);
    if (__DISABLE_SSR__) {
      return hydrate();
    }

    // ------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------

    // console.log('>>>>>>>>>>>>>>>> SERVER > APP LOADER > context: ', context);

    if (context.url) {
      return res.redirect(301, context.url);
    }

    // ------------------------------------------------------------------------------------------------------

    console.log('>>>>>>>>>>>>>>>> SERVER > ==================== content: ', content);

    const html = <Html assets={assets} content={content} />;
    const ssrHtml = `<!doctype html>${ReactDOM.renderToString(html)}`;
    console.log('>>>>>>>>>>>>>>>> SERVER > APP LOADER > RESPOND TO CLIENT !! > ReactDOM.renderToString(html):', ssrHtml);

    res.status(200).send(ssrHtml);
    // res.status(200).send('SERVER > Response Ended For Testing!!!!!!! Status 200!!!!!!!!!');

  } catch (error) {
    console.log('>>>>>>>>>>>>>>>> SERVER > APP LOADER > TRY > ERROR > error: ', error);
    res.status(500);
    hydrate();
  }
};
