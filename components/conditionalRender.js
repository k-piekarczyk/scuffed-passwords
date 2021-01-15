import { useEffect, useState } from 'react'

function ConditionalRender (props) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted && props.client) return null
  if (isMounted && props.server) return null

  return props.children
}

export default ConditionalRender
