import styled from 'styled-components'
import React from 'react'
import { Button } from 'client/components/Button'
import { Format } from 'client/components/format/format'
import { Format as FormatType } from 'client/typings'

export interface FormatsProps {
  formats?: FormatType[]
  isShort?: boolean
  onClick?: () => void
}

export const Formats: React.SFC<FormatsProps> = ({ formats, isShort, onClick }) => {
  return (
    <FormatsContainer
      isShort={isShort}
      onClick={onClick && onClick}
    >
      {formats && formats.length
        ? formats.map((item, index) =>
          <Format
            key={index}
            item={item}
            isShort={isShort}
          />
        )
        : onClick && <Button text='Add Format' />
      }
    </FormatsContainer>
  )
}

export const FormatsContainer = styled.div<FormatsProps>`
  ${({ isShort }) => isShort && `
    display: flex;
    div:first-child {
      margin-right: 20px;
    }
  `}
`
