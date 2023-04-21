import React, { useCallback, useEffect } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import '../../App.css'
import cyStyle from '../../cy-style.json'
import cola from 'cytoscape-cola'
import { triggerGraphEvent } from '../utilities/graph-events'
import layouts from '../../data/layouts.json'
import { setLabelPos, setLabelPosBipartite, setLabelPosCircle } from '../utilities/label-positioning'

cytoscape.use(cola)

function Graph ({ myKey, settings, user_settings, data }) {
  // Do not modify these after initialisation!
  // It will trigger a rerender of the component and, in the worst case, an infinite loop.
  let cy = null
  let layoutOptions = null

  function getNodeSpacing (node) {
    // Iterate over each node to find the closest node that is not in the same component
    let closestDistance = Infinity
    cy.nodes().forEach(n => {
      if (n.id() !== node.id() && n.isNode() && n.connectedEdges().length > 0 && node.connectedEdges().intersection(n.connectedEdges()).length === 0) {
        const pos1 = node.position()
        const pos2 = n.position()
        const dx = pos1.x - pos2.x
        const dy = pos1.y - pos2.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < closestDistance) {
          closestDistance = distance
        }
      }
    })

    // Check if the closest node is within the desired distance
    if (closestDistance === Infinity) return 5
    else return Math.max(50 - closestDistance, 5)
  }

  // Set the graph layout options (if bipartite, we also need to determine which column each node belongs in).
  function setLayoutOptions () {
    if (user_settings.layout === 'bipartite') {
      layoutOptions = {
        ...layouts[user_settings.layout],
        position: (node) => {
          return { col: node.data('bipartite') }
        }
      }
    } else if (user_settings.layout === 'force-directed') {
      layoutOptions = {
        ...layouts[user_settings.layout],
        nodeSpacing: (node) => getNodeSpacing(node)
      }
    } else {
      layoutOptions = layouts[user_settings.layout]
    }
  }

  // Set graph style for edges of directed and weighted graphs.
  function setEdgeClasses () {
    let edgeClasses = []
    if (data.elements.edges.length > 0 && 'weight' in data.elements.edges[0].data) {
      edgeClasses.push('weighted')
    }
    if (data.directed) edgeClasses.push('directed')
    edgeClasses = edgeClasses.join(' ')
    for (const edge of cy.edges()) {
      edge.addClass(edgeClasses)
    }
  }

  function initialiseLabels () {
    const n_nodes = cy.nodes().length
    for (const node of cy.nodes()) {
      // Add a label to the node
      const label = user_settings.node_prefix + node.data('id')
      node.data('label', label)
      if (user_settings.label_style === 'math') {
        node.addClass('styled-label')
      }
      // Position the node according to the graph layout
      switch (user_settings.layout) {
        case 'circle':
          setLabelPosCircle(node, n_nodes)
          break
        case 'bipartite':
          setLabelPosBipartite(node)
          break
        default:
          setLabelPos(node)
      }
    }
  }

  const memoizedInitialiseLabels = useCallback(initialiseLabels, [cy, user_settings])

  // Initial graph setup (order matters!).
  function initialise (data) {
    // Import data.
    setLayoutOptions()
    cy.remove(cy.nodes())
    cy.json(data)

    // Set initial node positions.
    // TODO: for force-directed layouts,
    //  initialise separate components far away from each other
    if (data.elements.nodes.length > 0 &&
      'x' in data.elements.nodes[0].data &&
      'y' in data.elements.nodes[0].data) {
      for (const node of cy.nodes()) {
        node.position('x', node.data('x'))
        node.position('y', node.data('y'))
      }
    } else {
      const components = cy.elements().components()
      if (components.length > 1) {
        for (let i = 0; i < components.length; i++) {
          for (const ele of components[i]) {
            if (ele.isNode()) {
              const proportion = i / components.length
              const angle = proportion * 2 * Math.PI
              const x = 150 * Math.cos(angle)
              const y = 150 * Math.sin(angle)
              ele.position({ x, y })
            }
          }
        }
      }
    }

    // Start the layout algorithm.
    const layout = cy.layout(layoutOptions)
    layout.start()

    // Apply interactive settings.
    cy.autoungrabify(true)
    cy.userPanningEnabled(false)
    cy.boxSelectionEnabled(settings.boxSelection)
    settings.selectNodes ? cy.nodes()?.selectify() : cy.nodes()?.unselectify()
    settings.selectEdges ? cy.edges()?.selectify() : cy.edges()?.unselectify()
    const eoo = settings.selectEdges ? 0.2 : 0
    const noo = settings.selectNodes ? 0.2 : 0
    cy.style()
      .selector('edge:active')
      .style({ 'overlay-opacity': eoo })
      .selector('node:active')
      .style({ 'overlay-opacity': noo })
      .selector('core')
      .style({ 'active-bg-size': 0 })
      .update()

    // Apply styling to nodes and edges.
    initialiseLabels()
    setEdgeClasses()
  }

  // Events and listeners for graph manipulation.
  useEffect(() => {
    const parseSource = (e) => {
      const sourceId = e.data('source')
      const sourceNode = cy.nodes(`[id='${sourceId}']`)[0]
      return sourceNode.data('value')
    }

    const parseTarget = (e) => {
      const targetId = e.data('target')
      const targetNode = cy.nodes(`[id='${targetId}']`)[0]
      return targetNode.data('value')
    }

    const parseEdge = (e) => [parseSource(e), parseTarget(e)]

    cy.on('tap', (event) => {
      if (event.target === cy) {
        const params = {
          x: event.position.x,
          y: event.position.y
        }
        triggerGraphEvent('tap_bg', params, myKey)
      }
    })

    cy.on('tap', 'node', (event) => {
      const params = { vertex: event.target.data('value') }
      triggerGraphEvent('tap_node', params, myKey)
    })

    cy.on('tap', 'edge', (event) => {
      const params = {
        source: parseSource(event.target),
        target: parseTarget(event.target)
      }
      triggerGraphEvent('tap_edge', params, myKey)
    })

    cy.on('cxttap', (event) => {
      if (event.target === cy) {
        const params = {
          x: event.position.x,
          y: event.position.y
        }
        triggerGraphEvent('cxttap_bg', params, myKey)
      }
    })

    cy.on('cxttap', 'node', (event) => {
      const params = { vertex: event.target.data('value') }
      triggerGraphEvent('cxttap_node', params, myKey)
    })

    cy.on('cxttap', 'edge', (event) => {
      const params = {
        source: parseSource(event.target),
        target: parseTarget(event.target)
      }
      triggerGraphEvent('cxttap_edge', params, myKey)
    })

    const broadcastSelected = () => {
      const selectedNodes = cy.nodes(':selected')
      const selectedEdges = cy.edges(':selected')
      selectedNodes.unselect()
      selectedEdges.unselect()
      const params = {
        nodes: selectedNodes.map(n => n.data('value')),
        edges: selectedEdges.map(e => parseEdge(e))
      }
      triggerGraphEvent('box_end', params, myKey)
    }

    cy.on('boxend', () => {
      clearTimeout(cy.selectionTimeout)
      cy.selectionTimeout = setTimeout(broadcastSelected, 300)
    })

    function highlightVertex (event) {
      if (event.detail.graphKey !== myKey) return
      const vertex = cy.nodes('[id = "' + event.detail.vertex + '"]')[0]
      if (event.detail.highlight) vertex.addClass('highlight')
      else vertex.removeClass('highlight')
    }

    function highlightEdge (event) {
      if (event.detail.graphKey !== myKey) return
      let edge
      if (data.directed) {
        edge = cy.edges('[source = "' + event.detail.v1 + '"][target = "' + event.detail.v2 + '"]')[0]
      } else {
        edge = cy.edges('[source = "' + event.detail.v1 + '"][target = "' + event.detail.v2 + '"], [source = "' + event.detail.v2 + '"][target = "' + event.detail.v1 + '"]')[0]
      }
      if (!(edge === undefined)) {
        if (event.detail.highlight) edge.addClass('highlight')
        else edge.removeClass('highlight')
      }
    }

    function handleResize () {
      const width = window.innerWidth
      let padding
      if (width < 768) padding = 150
      else padding = 30
      cy.fit({ padding })
    }

    function handleLayoutStop () {
      memoizedInitialiseLabels()
    }

    cy.on('layoutstop', handleLayoutStop)

    // Subscribe to action events
    document.addEventListener('highlightVertex', highlightVertex)
    document.addEventListener('highlightEdge', highlightEdge)
    window.addEventListener('resize', handleResize)

    return () => {
      // Cleanup is very important
      cy.removeAllListeners()
      document.removeEventListener('highlightVertex', highlightVertex)
      document.removeEventListener('highlightEdge', highlightEdge)
      window.removeEventListener('resize', handleResize)
    }
  }, [cy, data.directed, myKey, settings, memoizedInitialiseLabels])

  return (
    <>
      <CytoscapeComponent
        id='cy'
        layout={layoutOptions}
        stylesheet={cyStyle}
        cy={(c) => {
          cy = c
          initialise(data)
          // setListeners()
        }}
      />
    </>
  )
}

export default Graph
