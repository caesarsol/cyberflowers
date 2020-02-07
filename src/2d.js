import buildRegl from 'regl'
import mouseChange from 'mouse-change'
import fragmentShaderCode from './2d.fragment.glsl'

const regl = buildRegl()

const draw = regl({
  frag: fragmentShaderCode,

  vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }
  `,

  attributes: {
    position: [
      [-2, 0],
      [0, -2],
      [2, 2],
    ],
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => [viewportWidth, viewportHeight],
    mouse: regl.prop('mouse'),
    time: regl.context('time'),
  },

  count: 3,
})

const mouse = [0, 0]

mouseChange(regl._gl.canvas, function(buttons, x, y) {
  mouse[0] = x / regl._gl.canvas.width
  mouse[1] = 1 - y / regl._gl.canvas.height
})

regl.frame(() => {
  draw({ mouse })
})
