import { TEXT_ELEMENT } from './element'


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
  } else if (instance.element.type !== element.type) {
    let newInstance = instantiate(element)
    parentDom.replaceChild(newInstance.dom, instance.dom)
    return newInstance
  } else if (typeof element.type === 'string') {
    
    updateDomProps(instance.dom, instance.element.props, element.props)
    instance.childInstances = reconcileChildren(instance, element)
    instance.element = element
    return instance
  } else {
    // update component instance
    instance.publicInstance.props = element.props
    const newChildElement = instance.publicInstance.render()
    const oldChildInstance = instance.childInstance
    const newChildInstance = reconcile(parentDom, oldChildInstance, newChildElement)

    instance.dom = newChildInstance.dom
    instance.childInstance = newChildInstance
    instance.element = element
    return instance
  }
}

function reconcileChildren(instance, element) {
  const children = element.props.children || []
  const childInstances = instance.childInstances
  const count = Math.max(children.length, childInstances.length)
  const dom = instance.dom
  const newChildInstances = []

  // todo: 目前是以子元素在数组中的位置进行对应，后续要更改为以key来对应
  for (let index = 0; index < count; index++) {
    const childElement = children[index]
    const childInstance = childInstances[index]
    const newInstance = reconcile(dom, childInstance, childElement)
    newChildInstances.push(newInstance)
  }

  return newChildInstances.filter(instance => instance != null)
}

function updateDomProps(dom, preProps, nextProps) {
  const isListener = name => name.startsWith('on')
  const isAttr = name => !isListener(name) && name !== 'children'

  Object.keys(preProps).filter(isListener).forEach(name => {
    let event = name.toLowerCase().substring(2)
    dom.removeEventListener(event, preProps[name])
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

function instantiate(element) {
  const { type, props } = element
  const isDomElement = typeof type === 'string'
  
  if (isDomElement) {
    const isTextNode = type === TEXT_ELEMENT
    const dom = isTextNode ? document.createTextNode('') : document.createElement(type)

    updateDomProps(dom, {}, props)

    const childElements = props.children || []
    const childInstances = childElements.map(instantiate)

    const childDoms = childInstances.map(childInstance => childInstance.dom)

    childDoms.forEach(childDom => dom.appendChild(childDom))

    return { element, dom, childInstances, }
  } else {
    // 初始化组件
    const instance = {}

    const publicInstance = createPublicInstance(element, instance)
    const childElemnt = publicInstance.render()
    const childInstance = instantiate(childElemnt)
    const dom = childInstance.dom

    // todo: 这里是不是循环引用了，instance上的pubilcInstance中__internalInstance又指向了instance
    Object.assign(instance, { dom, element, childInstance, publicInstance })
    return instance
  }
  
  
}

// 组件实例化
function createPublicInstance(element, internalInstance) {
  const { type, props } = element
  const publicInstance = new type(props)
  publicInstance.__internalInstance = internalInstance
  return publicInstance
}

class Component {
  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }

  setState(nextState) {
    // todo: 异步更新怎么实现
    this.state = Object.assign({}, this.state, nextState)
    updateInstance(this.__internalInstance)
  }
}

function updateInstance(internalInstance) {
  const parentDom = internalInstance.dom.parentNode
  const element = internalInstance.element
  reconcile(parentDom, internalInstance, element)
}

