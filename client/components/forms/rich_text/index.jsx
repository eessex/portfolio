import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Draft, {
  Editor,
  EditorState,
  Entity,
  ContentState,
  RichUtils
} from 'draft-js';
import { convertFromHTML, convertToHTML } from 'draft-convert'
import {
  blockRenderMap,
  decorator,
  findLinkEntities,
  Link
} from './util'
import UrlInput from './url_input'

export class RichText extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      html: this.props.html || null,
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

  inputToHtml = (editorState) => {
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

  inputFromHTML = (html) => {
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
    let newContent = newContentState.getPlainText()
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
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command)

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
      const startKey = editorState.getSelection().getStartKey()
      const startOffset = editorState.getSelection().getStartOffset()
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
      let urlValue = ''

      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);
        urlValue = linkInstance.getData().url
      }

      this.setState({
        showUrlInput: true,
        urlValue
      })
    }
  }

  confirmLink = (url) => {
    const {editorState, urlValue} = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      { url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

    this.setState({
      editorState: RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      ),
      showUrlInput: false,
      urlValue: '',
    }, () => {
      setTimeout(() => this.refs.editor.focus(), 0)
    });
  }

  renderLinkInput () {
    if (this.state.showUrlInput) {
      return (
        <UrlInput
          confirmLink={this.confirmLink}
          url={this.state.urlValue}
        />
      )
    }
  }

  renderMenu () {
    if (this.state.showMenu) {
      return (
        <div>
          <button onClick={this.promptForLink}>Link</button>
        </div>
      )
    }
  }

  checkSelection = () => {
    let showMenu = false
    if (!this.state.editorState.getSelection().isCollapsed()) {
      showMenu = true
    }
    this.setState({ showMenu })
  }

  render () {
    const { className, placeholder } = this.props
    const { editorState } = this.state

    return (
      <div className={'rich-text ' + className}>
        {this.renderMenu()}
        {this.renderLinkInput()}

        <div className='rich-text--editor'
          onClick={this.focus}
          onKeyUp={this.checkSelection}
          onMouseUp={this.checkSelection}>
          <Editor
            ref='editor'
            blockRenderMap={blockRenderMap()}
            placeholder={placeholder}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange} />
        </div>
      </div>
    )
  }
}
