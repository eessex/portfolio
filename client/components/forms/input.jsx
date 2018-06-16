import styled from 'styled-components'

export const Input = styled.input`
  font-size: 1em;
  border-bottom: 1px solid #ddd;
  border-left: 0;
  border-right: 0;
  border-top: 0;
  padding-left: 0;

  &:focus {
    outline: none;
  }
  &::placeholder,
  .public-DraftEditorPlaceholder-inner {
    color: #ddd;
  }
`

export const TextArea = styled.textarea`
  &:focus {
    outline: none;
  }
  &::placeholder,
  .public-DraftEditorPlaceholder-inner {
    color: #ddd;
  }
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
