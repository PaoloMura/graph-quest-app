// Zone proportions (T=top, B=bottom, L=left, R=right), clockwise round the circle.
const TR = 1 / 16
const RT = 3 / 16
const RB = 5 / 16
const BR = 7 / 16
const BL = 9 / 16
const LB = 11 / 16
const LT = 13 / 16
const TL = 15 / 16

export function setLabelPosCircle (node, n_nodes) {
  const v = node.data('value')
  const pos = v / n_nodes
  if (BL <= pos && pos < TL) {
    node.style('text-halign', 'left')
    node.style('text-margin-x', -10)
  } else if (TL <= pos || pos < TR || (BR <= pos && pos < BL)) {
    node.style('text-halign', 'center')
  } else if (TR <= pos && pos < BR) {
    node.style('text-halign', 'right')
    node.style('text-margin-x', 10)
  } else {
    console.log('Invalid x position for node', v)
  }
  if (LT <= pos || pos < RT) {
    node.style('text-valign', 'top')
    node.style('text-margin-y', -10)
  } else if ((RT <= pos && pos < RB) || (LB <= pos && pos < LT)) {
    node.style('text-valign', 'center')
  } else if (RB <= pos && pos < LB) {
    node.style('text-valign', 'bottom')
    node.style('text-margin-y', 10)
  } else {
    console.log('Invalid y position for node', v)
  }
}

export function setLabelPosBipartite (node) {
  const partition = node.data('bipartite')
  if (partition === 0) {
    node.style('text-halign', 'left')
    node.style('text-margin-x', -5)
  } else {
    node.style('text-halign', 'right')
    node.style('text-margin-x', 5)
  }
  node.style('text-valign', 'center')
}

export function setLabelPos (node) {
  // Define 8 zones for the circle region around the node.
  let zones = [
    { x: 'center', y: 'top', mx: 0, my: -5, 'occupied': false },
    { x: 'right', y: 'top', mx: 5, my: -5, 'occupied': false },
    { x: 'right', y: 'center', mx: 5, my: 0, 'occupied': false },
    { x: 'right', y: 'bottom', mx: 5, my: 5, 'occupied': false },
    { x: 'center', y: 'bottom', mx: 0, my: 5, 'occupied': false },
    { x: 'left', y: 'bottom', mx: -5, my: 5, 'occupied': false },
    { x: 'left', y: 'center', mx: -5, my: 0, 'occupied': false },
    { x: 'left', y: 'top', mx: -5, my: -5, 'occupied': false },
  ]
  // Determine which zones are occupied by the neighbouring edges.
  const u = node.position('x'), v = node.position('y')
  const neighbours = node.neighbourhood().filter('node')
  for (let n of neighbours) {
    const a = n.position('x'), b = n.position('y')
    const x = u - a
    // Avoid division by zero
    const y = b - v === 0 ? 0.0001 : b - v
    // Add an offset of π to the angle to map it to the range 0..2π
    const angle = Math.atan2(x, y) + Math.PI
    // + π/8 shifts the zone lines round the circle by half a segment;
    // floor(_ / (π/4)) maps to an integer zone (8 zones take up π/4 radians each);
    // % 8 keeps it in range 0..7
    const zone_id = Math.floor((angle + (Math.PI / 8)) / (Math.PI / 4)) % 8
    zones[zone_id].occupied = true
  }
  // Count the adjacent unoccupied zones forwards and backwards.
  let xs = []
  let xs_max = 0
  for (let i = 0; i < 8; i++) {
    if (!zones[i].occupied) {
      i === 0 ? xs.push(1) : xs.push(xs[i - 1] + 1)
      if (xs[i] > xs[xs_max]) xs_max = i
    } else xs.push(0)
  }
  let ys = []
  for (let i = 7; i >= 0; i--) {
    if (!zones[i].occupied) {
      i === 7 ? ys.push(1) : ys.push(ys[7 - i - 1] + 1)
    } else ys.push(0)
  }
  // Find the midpoint of the largest contiguous region of unoccupied zones.
  let s, e, mid
  const wrap_max = xs[7] + ys[7]
  if (wrap_max > xs[xs_max]) {
    s = 7 - xs[7] + 1
    e = 7 + ys[7]
  } else {
    s = xs_max - xs[xs_max] + 1
    e = xs_max
  }
  mid = Math.floor(0.5 * (s + e)) % 8
  // Set the label to be in this zone.
  let zone = zones[mid]
  node.style('text-halign', zone.x)
  node.style('text-valign', zone.y)
  node.style('text-margin-x', zone.mx)
  node.style('text-margin-y', zone.my)
}