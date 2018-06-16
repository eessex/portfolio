import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  Editor,
  EditorState,
  Entity,
  RichUtils
} from 'draft-js'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import { decorator } from './util.js'
import UrlInput from './url_input.jsx'

export class RichText extends Component {
  static propTypes = {
    html: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      html: props.html || null,
      showUrlInput: false,
      showMenu: false,
      urlValue: ''
    }

    this.focus = () => this.refs.editor.focus()
  }

  componentDidMount () {
    const { html } = this.props

    if (html) {
      this.setState({
        editorState: this.inputFromHTML(html)
      })
    }
  }

  inputToHtml = editorState => {
    const html = convertToHTML({
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return (
            <a href={entity.data.url}>
              {originalText}
            </a>
          )
        }
        return originalText
      }
    })(editorState.getCurrentContent())

    return html
  }

  inputFromHTML = html => {
    const blocksFromHTML = convertFromHTML({
      htmlToEntity: (nodeName, node) => {
        if (nodeName === 'a') {
          return Entity.create(
            'LINK',
            'MUTABLE',
            {url: node.href}
          )
        }
      }
    })(html)
    const editorState = EditorState.createWithContent(blocksFromHTML, decorator)
    return editorState
  }

  onChange = (editorState) => {
    const currentContentState = this.state.editorState.getCurrentContent()
    const newContentState = editorState.getCurrentContent()
    const html = this.inputToHtml(editorState)

    if (currentContentState !== newContentState) {
      // There was a change in the content
      this.onContentChange(html)
    }
    this.setState({
      editorState,
      html
    })
  }

  onContentChange = (html) => {
    const { name, onChange } = this.props

    if (name) {
      onChange(name, html)
    } else {
      onChange(html)
    }
  }

  handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(
      this.state.editorState,
      command
    )

    if (newState) {
      this.onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  promptForLink = () => {
    const { editorState } = this.state
    const selection = editorState.getSelection()

    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent()
      const startKey = selection.getStartKey()
      const startOffset = selection.getStartOffset()
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
      let urlValue = ''

      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey)
        urlValue = linkInstance.getData().url
      }

      this.setState({
        showUrlInput: true,
        urlValue
      })
    }
  }

  confirmLink = (url) => {
    const { editorState } = this.state
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      { url }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity }
    )

    this.setState({
      editorState: RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      ),
      showUrlInput: false,
      urlValue: ''
    }, () => {
      setTimeout(() => this.refs.editor.focus(), 0)
    })
  }

  renderLinkInput () {
    const { showUrlInput, urlValue } = this.state

    if (showUrlInput) {
      return (
        <UrlInput
          confirmLink={this.confirmLink}
          url={urlValue}
        />
      )
    }
  }

  renderMenu () {
    if (this.state.showMenu) {
      return (
        <button onClick={this.promptForLink}>
          Link
        </button>
      )
    }
  }

  checkSelection = () => {
    const { editorState } = this.state
    let showMenu = false

    if (!editorState.getSelection().isCollapsed()) {
      showMenu = true
    }
    this.setState({ showMenu })
  }

  render () {
    const { placeholder } = this.props
    const { editorState } = this.state

    return (
      <RichTextContainer>
        {this.renderMenu()}
        {this.renderLinkInput()}

        <div
          onClick={this.focus}
          onKeyUp={this.checkSelection}
          onMouseUp={this.checkSelection}>
          <Editor
            ref='editor'
            placeholder={placeholder}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
          />
        </div>
      </RichTextContainer>
    )
  }
}

const RichTextContainer = styled.div`
  position: relative;
  .public-DraftEditorPlaceholder-root {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    color: gray;
  }
`
