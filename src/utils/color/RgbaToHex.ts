function getHexColor(color: string) {
  const values = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',')

  const a = parseFloat(values[3] ?? '1')
  const r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255)
  const g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255)
  const b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255)

  return '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
}

export {
  getHexColor
}
