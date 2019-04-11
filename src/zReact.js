

export function render(element, parentDom) {
  const { type, props } = element

  const isTextNode = type === 'TEXT ELEMENT'
  const dom = isTextNode ? document.createTextNode('') : document.createElement(type)
  const children = props.children || []

  const isListener = name => name.startsWith('on')
  const isAttr = name => !isListener(name) && name !== 'children'
  
  Object.keys(props).filter(isListener).forEach(name => {
    let event = name.toLowerCase().substring(2)
    dom.addEventListener(event, props[name])
  })

  Object.keys(props).filter(isAttr).forEach(name => {
    dom[name] = props[name]
  })

  children.forEach(child => {
    render(child, dom)
  });

  parentDom.appendChild(dom)
}