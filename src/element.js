export function createElement(type, config, ...args) {
  const props = Object.assign({}, config)
  const hasChildren = args.length > 0
  const rawChildren = hasChildren ? [].concat(...args) : []
  const children = rawChildren.filter(ele => {
    return ele != null && ele !== false
  }).map(ele => ele instanceof Object ? ele : createTextElement(ele))

  props['children'] = children
  return {
    type,
    props,
  }
}

export const TEXT_ELEMENT = 'TEXT_ELEMENT'

function createTextElement(value) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: value,
    }
  }
}