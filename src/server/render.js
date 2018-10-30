import React from 'react'
import { renderToString } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import { App } from 'client/App'
import serialize from 'serialize-javascript'
const { GOOGLE_ANALYTICS_ID } = process.env

export const ServerRender = (path, store, context) => {
  const markup = renderToString(
    <Provider store={store}>
      <StaticRouter location={path} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  )
  const helmet = Helmet.renderStatic()

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${helmet.title}
        <link
          rel="stylesheet"
          type="text/css"
          href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          integrity='sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN'
          crossorigin='anonymous'
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
    
          gtag('config', ${serialize(GOOGLE_ANALYTICS_ID)});
        </script>
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
        <script src="/bundle.js" defer></script>
        <script>window.__INITIAL_DATA__ = ${serialize(store.getState())}</script>
      </head>
      <body style="margin:0">
        <div id="app">${markup}</div>
      </body>
    </html>
  `
}
