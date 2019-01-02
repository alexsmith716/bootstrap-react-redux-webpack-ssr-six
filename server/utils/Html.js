import React from 'react';
import serialize from 'serialize-javascript';
import Helmet from 'react-helmet';
import config from '../../config/config';

const Html = ({ assets, content }) => {

  console.log('>>>>>> HTML.JS > assets: ', assets);
  // console.log('>>>>>> HTML.JS > assets.styles length: ', Object.keys(assets.styles).length);
  // console.log('>>>>>> HTML.JS > content: ', content);

  const head = Helmet.renderStatic();

  return (
    <html lang="en-US">
      <head>
        {head.base.toComponent()}
        {head.title.toComponent()}
        {head.meta.toComponent()}
        {head.link.toComponent()}
        {head.script.toComponent()}

        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Election App 2018!" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Election App 2018!" />
        <meta name="theme-color" content="#1E90FF" />

        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* (>>>>>>> STYLES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<) */}
        {assets.stylesheets 
          && Object.keys(assets.stylesheets).map(key => (
            <link
              href={`${assets.publicPath}/${assets.stylesheets[key]}`}
              key={key}
              media="screen, projection"
              rel="stylesheet"
              type="text/css"
              charSet="UTF-8"
            />
          ))}

      </head>

      <body>

        {/* (>>>>>>> CONTENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<) */}
        <div id="content" dangerouslySetInnerHTML={{ __html: content }} />

        {/* (will be present only in development mode) */}
        { __DLLS__ && <script key="dlls__vendor" src="/dlls/dll__vendor.js" charSet="UTF-8" /> }

        {/* (>>>>>>> SCRIPTS  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<) */}
        {assets.scripts 
          && Object.keys(assets.scripts).map(key => (
            <script key={key} src={`${assets.publicPath}/${assets.scripts[key]}`} charSet="UTF-8" />
          ))}

      </body>
    </html>
  );
};

export default Html;
