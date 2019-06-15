import styled from 'styled-components'
import React, { Component } from 'react'
import { ContentState, Editor, EditorState } from 'draft-js'

interface PlainTextProps {
  content?: string
  forceUpdate?: boolean
  name?: string
  onChange: (key: string, val?: string) => void
  placeholder?: string
}

interface PlainTextState {
  editorState: EditorState
}

export class PlainText extends Component<PlainTextProps, PlainTextState> {
  public editor
  state = {
    editorState: this.setEditorState()
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

  onChange = editorState => {
    const { forceUpdate } = this.props
    const currentContentState = this.state.editorState.getCurrentContent()
    const newContentState = editorState.getCurrentContent()
    let newContent = newContentState.getPlainText()

    if (currentContentState !== newContentState) {
      // There was a change in the content
      this.onContentChange(newContent)
    }

    if (forceUpdate) {
      this.setState({ editorState: this.setEditorState() })
    } else {
      this.setState({ editorState })
    }
  }

  onContentChange = content => {
    const { name, onChange } = this.props

    if (name) {
      onChange(name, content)
    } else {
      onChange(content)
    }
  }

  focus = () => {
    this.editor.focus()
  }

  render () {
    const { placeholder } = this.props

    return (
      <PlainTextContainer
        onClick={this.focus}
      >
        <Editor
          editorState={this.state.editorState}
          handleReturn={() => 'handled'}
          onChange={this.onChange}
          placeholder={placeholder || 'Start Typing...'}
          ref={ref => {
            this.editor = ref
          }}
          spellcheck
        />
      </PlainTextContainer>
    )
  }
}

const PlainTextContainer = styled.div`
  position: relative;

  .public-DraftEditorPlaceholder-root {
    position: absolute;
    color: ${({ theme }) => theme.colors.gray};
  }
`
