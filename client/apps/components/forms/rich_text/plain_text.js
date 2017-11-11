// import PropTypes from 'prop-types'
import React from 'react'
import { ContentState, Editor, EditorState } from 'draft-js'

export class PlainText extends React.Component {
  constructor (props) {
    super(props)

    const editorState = this.setEditorState()
    this.state = { editorState }
  }

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
    this.setState({ editorState })
    const content = editorState.getCurrentContent().getPlainText()
    if (this.props.name) {
      this.props.onChange(this.props.name, content)
    } else {
      this.props.onChange(content)
    }
  }

  focus = () => {
    this.refs.editor.focus()
  }

  handleReturn = (e) => {
    return 'handled'
  }

  render () {
    const { className, name, placeholder } = this.props
    return (
      <div
        className={'plain-text ' + className}
        name={name}
        onClick={this.focus}>
        <Editor
          ref='editor'
          editorState={this.state.editorState}
          placeholder={placeholder || 'Start Typing...'}
          handleReturn={() => 'handled'}
          onChange={this.onChange}
          spellcheck />
      </div>
    )
  }
}

// PlainText.propTypes = {
//   content: PropTypes.string,
//   name: PropTypes.string,
//   onChange: PropTypes.func.isRequired,
//   placeholder: PropTypes.string
// }
