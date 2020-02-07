document.body.style.overflow = 'hidden'
document.body.style.width = '100vw'
document.body.style.height = '100vh'
document.body.style.margin = '0'
document.body.style.padding = '0'

const regl = require('regl')()
const mat4 = require('gl-mat4')
const sphere = require('primitive-icosphere')
const camera = require('lookat-camera')()

const mesh = sphere(1, { subdivisions: 5 })

const drawSphere = regl({
  vert: `
    #define PI 3.14159265359
    precision mediump float;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;
    uniform float time;
    attribute vec3 position;

    varying float vDisplacement;
    varying vec3 vPosition;
    varying vec3 vPositionPolar;

    float osc(float min, float max, float x) {
      return min + (max - min) * (1.0 + sin(x)) / 2.0;
    }

    float radius(vec3 v) {
      return length(v);
    }

    float phi(vec3 v) {
      return atan(v.y, v.x);
    }

    float theta(vec3 v) {
      return acos(v.z / radius(v));
    }

    void main () {
      float t = time / 10.0;

      float a = osc(3.0, -2.0, t + PI * 0.0);
      float b = osc(3.0, -1.0, t + PI * 1.0);
      float c = osc(0.0, 10.0, t + PI * 3.0);
      float d = osc(0.0, 10.0, t + PI * 4.0);

      float e = osc(2.0, 3.0, t / 10.0 + PI * 0.0);
      float f = osc(0.0, 3.0, t / 10.0 + PI * 1.0);
      float g = osc(0.0, 10.0, t / 10.0 + PI * 3.0);
      float h = osc(0.0, 10.0, t / 10.0 + PI * 4.0);

      vDisplacement = osc(a, b,
        + theta(position) * c
        + phi(position) * d
      ) + osc(e, f,
        + theta(position) * g
        + phi(position) * h
      );
      // vDisplacement = 2.; // <---- CUT HERE >8

      vPosition = normalize(position) * vec3(vDisplacement);
      gl_Position = projection * view * model * vec4(vPosition, 1.0);

      vPositionPolar = vec3(radius(vPosition), theta(vPosition), phi(vPosition));
    }
  `,
  frag: `
    #define PI 3.14159265359
    precision mediump float;

    uniform float time;

    varying float vDisplacement;
    varying vec3 vPosition;
    varying vec3 vPositionPolar;

    float hue2rgb(float f1, float f2, float hue) {
      if (hue < 0.0)
          hue += 1.0;
      else if (hue > 1.0)
          hue -= 1.0;
      float res;
      if ((6.0 * hue) < 1.0)
          res = f1 + (f2 - f1) * 6.0 * hue;
      else if ((2.0 * hue) < 1.0)
          res = f2;
      else if ((3.0 * hue) < 2.0)
          res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
      else
          res = f1;
      return res;
    }

    vec3 hsl2rgb(vec3 hsl) {
        vec3 rgb;

        if (hsl.y == 0.0) {
            rgb = vec3(hsl.z); // Luminance
        } else {
            float f2;

            if (hsl.z < 0.5)
                f2 = hsl.z * (1.0 + hsl.y);
            else
                f2 = hsl.z + hsl.y - hsl.y * hsl.z;

            float f1 = 2.0 * hsl.z - f2;

            rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
            rgb.g = hue2rgb(f1, f2, hsl.x);
            rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
        }
        return rgb;
    }

    vec3 hsl(float h, float s, float l) {
      return hsl2rgb(vec3(h, s, l));
    }

    float osc(float min, float max, float x) {
      return min + (max - min) * (1.0 + sin(x)) / 2.0;
    }

    vec3 color1;
    vec3 color2;

    void main() {
      float t = time / 10.0;
      color1 = hsl(osc(0.0, 1.0, t), 0.9, 0.6);
      color2 = hsl(osc(0.0, 1.0, t + PI * 2.0), 0.9, 0.4);

      vec3 color = mix(color1, color2, vPositionPolar.r / 2.0);
      gl_FragColor = vec4(color.rgb, 1.0);
      // gl_FragColor = vec4(vPosition.xyz, 1.0); // <---- CUT HERE >8
    }
  `,
  attributes: {
    position: regl.buffer(mesh.positions),
  },
  elements: regl.elements(mesh.cells),
  uniforms: {
    projection: mat4.perspective(
      [],
      Math.PI / 2,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    ),
    model: mat4.scale(mat4.identity([]), mat4.identity([]), [1, 1, 1]),
    view: camera.view(),
    time: regl.prop('time'),
  },
})

const t0 = Math.random() * 10

regl.frame((props, context) => {
  regl.clear({ color: [0, 0, 0, 1] })

  drawSphere({ time: t0 + props.time })
})
