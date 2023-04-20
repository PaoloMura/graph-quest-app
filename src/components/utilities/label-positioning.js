// Zone proportions (T=top, B=bottom, L=left, R=right), clockwise round the circle.

const TR = 1 / 16
const RT = 3 / 16
const RB = 5 / 16
const BR = 7 / 16
const BL = 9 / 16
const LB = 11 / 16
const LT = 13 / 16
const TL = 15 / 16

export function setLabelPosCircle (node, numNodes) {
  const v = node.data('value')
  const pos = v / numNodes
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
  // 1. Find the angle that each neighbouring edge makes to the vertical
  const angles = []
  const neighbours = node.neighbourhood().filter('node')
  const u = node.position('x'); const v = node.position('y')
  for (const n of neighbours) {
    const a = n.position('x'); const b = n.position('y')
    const x = u - a
    // Avoid division by zero
    const y = b - v === 0 ? 0.0001 : b - v
    // Add an offset of π to the angle to map it to the range 0..2π
    const angle = Math.atan2(x, y) + Math.PI
    angles.push(angle)
  }

  // 2. We want to determine the optimum angle for the node label...
  let myAngle
  const gaps = []

  // 3. If there are no neighbours, default to above
  if (angles.length === 0) myAngle = 0
  // 4. If there is only one neighbour, the ideal position is opposite
  else if (angles.length < 2) {
    myAngle = (angles[0] + Math.PI) % (2 * Math.PI)
  } else {
    // 5. Otherwise, find the size of the gaps between each angle
    angles.sort()
    for (let i = 0; i < angles.length; i++) {
      const j = (i + 1) % angles.length
      let gap
      if (i === angles.length - 1) gap = (2 * Math.PI - angles[i]) + angles[j]
      else gap = angles[j] - angles[i]
      gaps.push(gap)
    }

    // 6. Then, the ideal position is the midpoint of the largest gap
    const largest = Math.max(...gaps)
    const start = angles[gaps.indexOf(largest)]
    myAngle = (start + 0.5 * largest) % (2 * Math.PI)
  }

  // 7. Find the corresponding zone of this angle
  const zones = [
    { x: 'center', y: 'top', mx: 0, my: -5 },
    { x: 'right', y: 'top', mx: 5, my: -5 },
    { x: 'right', y: 'center', mx: 5, my: 0 },
    { x: 'right', y: 'bottom', mx: 5, my: 5 },
    { x: 'center', y: 'bottom', mx: 0, my: 5 },
    { x: 'left', y: 'bottom', mx: -5, my: 5 },
    { x: 'left', y: 'center', mx: -5, my: 0 },
    { x: 'left', y: 'top', mx: -5, my: -5 }
  ]
  // + π/8 shifts the zone lines round the circle by half a segment;
  // floor(_ / (π/4)) maps to an integer zone (8 zones take up π/4 radians each);
  // % 8 keeps it in range 0..7
  const zoneID = Math.floor((myAngle + (Math.PI / 8)) / (Math.PI / 4)) % 8

  // 8. Finally, set the label to be in this zone.
  const zone = zones[zoneID]
  node.style('text-halign', zone.x)
  node.style('text-valign', zone.y)
  node.style('text-margin-x', zone.mx)
  node.style('text-margin-y', zone.my)
}
