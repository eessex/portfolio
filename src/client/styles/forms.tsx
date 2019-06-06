import styled from 'styled-components'

export const Input = styled.input`
  font-size: 1em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray};
  border-left: 0;
  border-right: 0;
  border-top: 0;
  padding-left: 0;

  &:focus {
    outline: none;
  }
  &::placeholder,
  .public-DraftEditorPlaceholder-inner {
    color: ${({ theme }) => theme.colors.gray};
  }
`

export const ErrorContainer = styled.div`
  color: red;
`

export const ColumnForm = styled.form`
  display: flex;
  flex-direction: column;
  ${Input} {
    margin-bottom: 0.5em;
  }
  button {
    margin-top: 10px;
  }
`

export const Placeholder = styled.span`
  color: ${({ theme }) => theme.colors.gray};
`
