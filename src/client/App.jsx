import React, { Component } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme.jsx'
import { Helmet } from 'react-helmet'
import { Route, Switch } from 'react-router-dom'
import { routes } from 'client/routes2'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import Nav from 'client/components/Nav'
import { NotFound } from 'client/components/NotFound'
const appTitle = process.env.PAGE_TITLE

export class App extends Component {
  render () {
    return (
      <ThemeProvider theme={theme}>
        <Content>
          <Nav />
          <ErrorBoundary>
            <Main>
              <Switch>
                {routes.map(({ path, exact, component: Component, title, ...rest }) => (
                  <Route key={path} path={path} exact={exact} render={
                    props => {
                      const pageTitle = `${appTitle}${title ? ` | ${title}` : ''}`
                      return (
                        <div>
                          <Helmet>
                            <title>{pageTitle}</title>
                          </Helmet>
                          <Component {...props} {...rest} title={title} />
                        </div>
                      )
                    }
                  } />
                ))}
                <Route render={props => <NotFound {...props} />} />
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
`

const Content = styled.div`
  font-family: 'Roboto', 'helvetica neue', 'helvetica', 'arial', 'sans-serif';
  font-size: 16px;
  line-height: 1.2em;
  letter-spacing: .015em;
  a {
    color: black;
    &:hover {
      color: #ddd;
    }
  }
`
