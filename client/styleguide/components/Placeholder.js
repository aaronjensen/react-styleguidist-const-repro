// @flow
import React from 'react'
import { Flex } from 'reflexbox'
import { padding } from 'app/style'
import spacing from 'app/style/constants/spacing'
import type { SpacingSize } from 'app/style/constants/spacing'

type Props = {
  backgroundColor?: string,
  color?: string,
  border?: boolean,
  h?: string | number,
  m?: SpacingSize,
  w?: string | number,
  children?: mixed,
}

const Placeholder = ({
  backgroundColor = 'lightGray',
  children,
  color = 'darkGray',
  border = true,
  h,
  m = 0,
  w,
}: Props) => {
  const style = {
    ...padding(2),
    backgroundColor,
    border: border ? '1px dashed darkGray' : 0,
    color,
    height: h,
    margin: spacing(m),
    width: w,
  }

  const label = h && w ? `${w} x ${h}` : 'placeholder'
  const content = children || (<span>{label}</span>)

  return (
    <Flex style={style} justify="center" align="center">
      {content}
    </Flex>
  )
}

export default Placeholder
