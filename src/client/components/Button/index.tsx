import styled from 'styled-components'
import FontAwesome from 'react-fontawesome'
import React from 'react'

interface ButtonContainerProps {
  borderless?: boolean
  className?: string
  color?: string
  onClick?: () => void
}

interface ButtonProps extends ButtonContainerProps {
  children?: any
  onClick?: () => void
  icon?: string
  text?: string
}


export const Button: React.SFC<ButtonProps> = props => {
  const {
    borderless,
    children,
    className,
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
      className={className}
      onClick={onClick}
    >
      {icon &&
        <FontAwesome name={icon} />
      }
      {child &&
        <ButtonText icon={Boolean(icon)}>{child}</ButtonText>
      }
      {text && children && children}
    </ButtonContainer>
  )
}

export const ButtonContainer = styled.button<ButtonContainerProps>`
  font-size: .85em;
  border: 1px solid;
  background: white;
  padding: 6px 12px;
  color: inherit;
  cursor: pointer;
  position: relative;
  border-radius: 0;
  transition: color 0.25s;
  color: ${({ color }) => color || 'black'};
  border-width: ${({ borderless }) => borderless ? '0' : '1px'};
`

const ButtonText = styled.span<{ icon?: boolean}>`
  ${({ icon }) => icon && `
    margin-left: 8px;
  `}
`
