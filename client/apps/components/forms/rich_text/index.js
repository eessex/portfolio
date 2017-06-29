import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Editor,
         EditorState,
         CompositeDecorator,
         ContentState,
         RichUtils } from 'draft-js';
import { findLinkEntities, Link } from './util'
import UrlInput from './url_input'

class RichText extends Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      showUrlInput: false,
      urlValue: ''
    };
    this.focus = () => this.refs.editor.focus()
    this.onChange = (editorState) => this.setState({editorState});
    this.promptForLink = this.promptForLink.bind(this);
    this.confirmLink = this.confirmLink.bind(this);
  }

  promptForLink() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
      let url = '';
      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);
        url = linkInstance.getData().url;
      }
      this.setState({
        showUrlInput: true,
        urlValue: url
      })
    }
  }

  confirmLink(url) {
    debugger
    const {editorState, urlValue} = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      {url: url}
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    this.setState({
      editorState: RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      ),
      showURLInput: false,
      urlValue: '',
    }, () => {
      setTimeout(() => this.refs.editor.focus(), 0);
    });
  }

  renderLinkInput() {
    if (this.state.showUrlInput) {
      return (
        <UrlInput
          confirmLink={this.confirmLink}
          url={this.state.urlValue}/>
      )
    }
  }

  renderMenu() {
    return <button onClick={this.promptForLink}>Link</button>
  }

  render() {
    return (
      <div className='rich-text'>
        {this.renderMenu()}
        {this.renderLinkInput()}
        <div className='rich-text--editor'
          onClick={this.focus}
          style={{border: '1px solid'}}>
          <Editor
            ref='editor'
            placeholder={this.props.placeholder}
            editorState={this.state.editorState}
            onChange={this.onChange} />
        </div>
      </div>
    );
  }
}

export default RichText;