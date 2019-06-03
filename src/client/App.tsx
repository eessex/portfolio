import styled, { ThemeProvider } from 'styled-components'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch } from 'react-router-dom'

import { theme } from 'client/styles/theme'
import { routes } from 'client/routes'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import Nav from 'client/components/Nav/Nav'
import { NotFound } from 'client/components/NotFound'

const { PAGE_TITLE } = process.env
const GOOGLE_FONTS_FAMILY = process.env.GOOGLE_FONTS_FAMILY

export class App extends Component {
  render () {
    return (
      <ThemeProvider theme={theme}>
        <Content>
          <Nav />
          <ErrorBoundary>
            <Main>
              <Switch>
                {
                  // @ts-ignore
                  routes.map(({ path, exact, component: Component, title, ...rest }) => (
                  <Route key={path} path={path} exact={exact} render={
                    props => {
                      return (
                        <React.Fragment>
                          <Helmet
                            titleTemplate={`%s | ${title || PAGE_TITLE}`}
                            defaultTitle={PAGE_TITLE}
                            title={PAGE_TITLE}
                          />
                          <Component {...props} {...rest} />
                        </React.Fragment>
                      )
                    }
                  } />
                ))}
                <Route render={_props => <NotFound />} />
              </Switch>
            </Main>
          </ErrorBoundary>
        </Content>
      </ThemeProvider>
    )
  }
}

const Main = styled.main`
  padding-top: 2.5em;
  height: calc(100vh - 2.5em - 65px);

  @media (max-width: 46rem) {
    height: calc(100vh - 2.5em - 100px);
  }
`

const Content = styled.div`
  font-family: ${GOOGLE_FONTS_FAMILY}, 'helvetica neue', 'helvetica', 'arial', 'sans-serif';
  font-size: 16px;
  line-height: 1.2em;
  letter-spacing: .015em;
  a {
    color: black;
    &:hover {
      color: #ddd;
    }
    &:hover, &:active, &:focus {
      outline: none;
      border: 0;
    }
  }
`
