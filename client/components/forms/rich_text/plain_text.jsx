import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  ContentState,
  Editor,
  EditorState
} from 'draft-js'

export class PlainText extends Component {
  state = { editorState: this.setEditorState() }
 
  setEditorState () {
    if (this.props.content) {
      return this.setStateWithContent()
    } else {
      return EditorState.createEmpty()
    }
  }

  setStateWithContent () {
    const content = ContentState.createFromText(this.props.content)
    return EditorState.createWithContent(content)
  }

  onChange = (editorState) => {
    const { forceUpdate } = this.props
    const currentContentState = this.state.editorState.getCurrentContent()
    const newContentState = editorState.getCurrentContent()
    let newContent = newContentState.getPlainText()

    if (currentContentState !== newContentState) {
      // There was a change in the content
      this.onContentChange(newContent)
    }
    this.setState({ editorState })
    forceUpdate && this.setEditorState()
  }

  onContentChange = (content) => {
    const { name, forceUpdate, onChange } = this.props

    if (name) {
      onChange(name, content)
    } else {
      onChange(content)
    }
  }

  focus = () => {
    this.refs.editor.focus()
  }

  render () {
    const {
      className,
      name,
      placeholder
    } = this.props

    return (
      <div
        className={'plain-text ' + className}
        name={name}
        onClick={this.focus}
      >
        <Editor
          editorState={this.state.editorState}
          handleReturn={() => 'handled'}
          onChange={this.onChange}
          placeholder={placeholder || 'Start Typing...'}
          ref='editor'
          spellcheck
        />
      </div>
    )
  }
}

PlainText.propTypes = {
  content: PropTypes.string,
  forceUpdate: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
