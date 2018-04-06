import chroma from 'chroma-js'

export default function colorScale (size) {
  return chroma.scale(['hsl(150, 50%, 90%)', 'hsl(200, 100%, 20%)']).colors(size)
}
