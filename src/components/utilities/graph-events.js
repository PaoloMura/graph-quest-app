/*
A graph event is an event that is triggered by the graph, usually in response to user input (e.g. selecting a vertex).
A graph action is an event that the graph listens and responds to (e.g. highlight a given vertex).

Supported Graph Evegnts:
tap_bg (x: int, y: int, graphKey: int)
tap_node (vertex: int, graphKey: int)
tap_edge (source: int, target: int, graphKey: int)
cxttap_bg (x: int, y: int, graphKey: int)
cxttap_node (vertex: int, graphKey: int)
cxttap_edge (source: int, target: int, graphKey: int)
box_end (vertices: [int], edges: [[int, int]], graphKey: int)

Supported Graph Actions:
highlightVertex (vertex: int,
                 type: 'colour' | 'underlay',
                 highlight: bool,
                 graphKey: int)
highlightEdge (v1: int,
               v2: int,
               type: 'colour' | 'underlay',
               highlight: bool,
               graphKey: int)
 */

export function triggerGraphEvent (name, value, graphKey) {
  const newValue = {
    ...value,
    graphKey
  }
  const newEvent = new CustomEvent(name, { detail: newValue })
  document.dispatchEvent(newEvent)
}

export function triggerGraphAction (name, value, graphKey) {
  const newValue = {
    ...value,
    graphKey
  }
  const newEvent = new CustomEvent(name, { detail: newValue })
  document.dispatchEvent(newEvent)
}
