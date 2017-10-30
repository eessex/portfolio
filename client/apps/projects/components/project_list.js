import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export class ProjectList extends Component {
  static propTypes = {
    projects: PropTypes.array,
  }

  renderList = (projects) => {
    const listItems = projects.map((project, i) =>
    <div className='projects-list__item' key={i}>
      <Link to={"/projects/" + project._id}>
        <h4>{project.title}</h4>
      </Link>
    </div>
  )
  return listItems
  }

  render () {
    const { projects } = this.props
    return(
      <div className='projects-list'>
        <h5 className='projects-list__header'>Projects</h5>
        <div className='projects-list__list'>
          {this.renderList(projects)}
        </div>
      </div>
    )
  }
}
