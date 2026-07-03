const WIDTH = 480
const HEIGHT = 140
const PADDING = 32

export function buildLineChartPath(data, { autoScale = false, maxWeightFloor = 50 } = {}) {
  if (!data.length) return ''

  const weights = data.map((item) => item.weight)
  const minWeight = autoScale ? Math.min(...weights) : 0
  const maxWeight = autoScale ? Math.max(...weights) : Math.max(...weights, maxWeightFloor)
  const range = maxWeight - minWeight || 1

  return data
    .map((point, index) => {
      const x = PADDING + (index * (WIDTH - PADDING * 2)) / Math.max(data.length - 1, 1)
      const y = HEIGHT - ((point.weight - minWeight) / range) * (HEIGHT - PADDING) + PADDING / 2
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}
