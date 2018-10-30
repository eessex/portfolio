import React from 'react'
import { NavLink } from 'react-router-dom'
const appTitle = process.env.PAGE_TITLE

export const Nav = () => {
  const links = [{
    name: 'Events',
    param: 'events'
  }]

  return (
    <div>
      <NavLink activeStyle={{fontWeight: 'bold'}} to={``}>
        {appTitle}
      </NavLink>

      <ul>
        {links.map(({ name, param }) => (
          <li key={param}>
            <NavLink activeStyle={{fontWeight: 'bold'}} to={`/${param}`}>
              {name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
