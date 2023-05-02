export function equalSets (xs, ys) {
  return xs.size === ys.size && [...xs].every((x) => ys.has(x))
}

export function equalNestedSets (xs, ys) {
  if (xs.size !== ys.size) return false
  for (const x of xs) {
    for (const y of ys) {
      if (equalSets(x, y)) return true
    }
  }
  return false
}
