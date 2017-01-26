// @flow
import React from 'react'
import { MemoryRouter } from 'react-router'

type Props = {
  children?: mixed,
}

const StyleGuideWrapper = ({ children }: Props) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

export default StyleGuideWrapper
