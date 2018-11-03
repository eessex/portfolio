import React from 'react'
import { renderToString } from 'react-dom/server'
import serialize from 'serialize-javascript'
import { Helmet } from 'react-helmet'
import { Provider } from 'react-redux'
import { ServerStyleSheet } from 'styled-components'
import { StaticRouter } from 'react-router-dom'
import { App } from 'client/App'

const { GOOGLE_ANALYTICS_ID, GOOGLE_FONTS_FAMILY } = process.env

export const ServerRender = (path, store, context) => {
  const sheet = new ServerStyleSheet()
  const markup = renderToString(
    sheet.collectStyles(
      <Provider store={store}>
        <StaticRouter location={path} context={context}>
          <App settings={context.settings} />
        </StaticRouter>
      </Provider>
    )
  )

  const styles = sheet.getStyleTags()
  const head = Helmet.rewind()

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${head.title}
        ${head.meta}
        ${styles}
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
        <link href="https://fonts.googleapis.com/css?family=${GOOGLE_FONTS_FAMILY}" rel="stylesheet">
        <script src="/bundle.js" defer></script>
        <script>window.__INITIAL_DATA__ = ${serialize(store.getState())}</script>
      </head>

      <body style="margin:0">
        <div id="app">${markup}</div>
      </body>
    </html>
  `
}
