import styled from 'styled-components'
import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'
import React from 'react'

export const Button = props => {
  const {
    borderless,
    children,
    color,
    icon,
    onClick,
    text
  } = props
  const child = text || children

  return (
    <ButtonContainer
      borderless={borderless}
      color={color}
      onClick={onClick}
      icon={icon}
    >
      {icon &&
        <FontAwesome name={icon} />
      }
      {child &&
        <ButtonText icon={icon}>{child}</ButtonText>
      }
      {text && children && children}
    </ButtonContainer>
  )
}

export const ButtonContainer = styled.button`
  font-size: .85em;
  border: 1px solid;
  background: white;
  padding: 6px 12px;
  color: inherit;
  cursor: pointer;
  position: relative;
  border-radius: 0;
  transition: color 0.25s;
  color: ${props => props.color || 'black'};
  border-width: ${props => props.borderless ? '0' : '1px'};
`

const ButtonText = styled.span`
  ${props => props.icon && `
    margin-left: 8px;
  `}
`

Button.propTypes = {
  borderless: PropTypes.bool,
  children: PropTypes.any,
  color: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  text: PropTypes.string
}
