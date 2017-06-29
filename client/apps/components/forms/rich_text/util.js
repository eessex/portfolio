import React from 'react';
import { ContentState,
         Editor,
         EditorState } from 'draft-js'

const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url} = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} style={styles.link}>
      {props.children}
    </a>
  );
};

const styles = {
  link: {
    textDecoration: 'underline',
    color: 'blue'
  }
}

module.exports = {
  Link: Link,
  findLinkEntities: findLinkEntities
}