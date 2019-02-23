import React from 'react'
import FontAwesome from 'react-fontawesome'
import { capitalize } from 'lodash'
import styled from 'styled-components'
import { H6 } from 'client/styles/text'

export const ItemsListToggleHeader = props => {
  const { label, isTable, model, onToggle } = props
  const renderedLabel = label && label.length ? label : capitalize(model)
  const toggleText = isTable ? (model === 'releases' ? 'Covers' : 'Posters') : 'List'

  return (
    <ItemsListHeader hasToggle={Boolean(onToggle)}>
      {renderedLabel}
      {onToggle && 
        <LayoutToggle onClick={() => onToggle(isTable ? 'grid' : 'table')}>
          {toggleText}
          <FontAwesome name={isTable ? 'expand' : 'bars'} />
        </LayoutToggle>
        }
    </ItemsListHeader>
  )
}


const ItemsListHeader = styled.div`
  font-weight: 600;
  padding: 0 20px 5px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${props => props.hasToggle && `
    border-bottom: 1px solid;
  `}

  @media (max-width: 76rem) {
    padding: 0 20px 10px;
  }
`

const LayoutToggle = H6.extend`
  &:hover {
    color: ${({ theme }) => theme.colors.gray};
    cursor: pointer;
  }
  .fa {
    margin-left: 10px;
  }
`
