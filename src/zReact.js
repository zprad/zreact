
let rootInstance = null

export function render(element, container) {
  let preInstance = rootInstance
  let nextInstance = reconcile(container, preInstance, element)
  rootInstance = nextInstance
}

function reconcile(parentDom, instance, element) {
  if (instance == null) {
    let newInstance = instantiate(element)
    parentDom.appendChild(newInstance.dom)
    return newInstance
  } else if (element == null) {
    parentDom.removeChild(instance.dom)
    return null
  } else if (instance.element.type === element.type) {
    updateDomProps(instance.dom, instance.element.props, element.props)
    instance.childInstances = reconcileChildren(instance, element)
    instance.element = element
    return instance
  } else {
    let newInstance = instantiate(element)
    parentDom.replaceChild(newInstance.dom, instance.dom)
    return newInstance
  }
}

function reconcileChildren(instance, element) {
  const children = element.props.children || []
  const childInstances = instance.childInstances
  const count = Math.max(children.length, childInstances.length)
  const dom = instance.dom
  const newChildInstances = []

  // 目前是以子元素在数组中的位置进行对应，后续要更改为以key来对应
  for (let index = 0; index < count; index++) {
    const childElement = children[index]
    const childInstance = childInstances[index]
    const newInstance = reconcile(dom, childInstance, childElement)
    newChildInstances.push(newInstance)
  }

  return newChildInstances
}

function updateDomProps(dom, preProps, nextProps) {
  const isListener = name => name.startsWith('on')
  const isAttr = name => !isListener(name) && name !== 'children'

  Object.keys(preProps).filter(isListener).forEach(name => {
    let event = name.toLowerCase().substring(2)
    dom.removeEventListenr(event, preProps[name])
  })

  Object.keys(nextProps).filter(isListener).forEach(name => {
    let event = name.toLowerCase().substring(2)
    dom.addEventListener(event, nextProps[name])
  })

  Object.keys(preProps).filter(isAttr).forEach(name => {
    dom[name] = null
  })

  Object.keys(nextProps).filter(isAttr).forEach(name => {
    dom[name] = nextProps[name]
  })
}

export function instantiate(element) {
  const { type, props } = element
  const isTextNode = type === 'TEXT ELEMENT'
  const dom = isTextNode ? document.createTextNode('') : document.createElement(type)

  updateDomProps(dom, {}, props)

  const childElements = props.children || []
  const childInstances = childElements.map(instantiate)

  const childDoms = childInstances(childInstance => childInstance.dom)

  childDoms.forEach(childDom => dom.appendChild(childDom))

  return { element, dom, childInstances, }
}