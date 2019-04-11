export function createElement(type, config, ...args) {
  const props = Object.assign({}, config)
  const hasChildren = args.length > 0
  const rawChildren = hasChildren ? [].concat(...args) : []
  const children = rawChildren.filter(ele => {
    return ele != null && ele !== false
  }).map(ele => ele instanceof Object ? ele : createTextElement(c))

  props['children'] = children
  return {
    type,
    props,
  }
}

const TEXT_ELEMENT = 'TEXT ELEMENT'

function createTextElement(value) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: value,
    }
  }
}