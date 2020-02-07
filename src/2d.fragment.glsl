#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

vec3 black = vec3(0.0, 0.0, 0.0);
vec3 white = vec3(1.0, 1.0, 1.0);
vec3 red = vec3(1.0, 0.0, 0.0);
vec3 blue = vec3(0.0, 0.0, 1.0);
vec3 green = vec3(0.0, 1.0, 0.0);

vec2 rotate(float a, vec2 v) {
  return vec2(
    v.x * cos(a) + v.y * sin(a),
    v.x * -sin(a) + v.y * cos(a)
  );
}

vec2 movement(float r, vec2 center, float phase, float angle) {
  return center + rotate(angle, vec2(0., r * sin(time * phase)));
}

// Nearness function
float nrn(vec2 a, vec2 b) {
  return pow(1. - distance(a, b) / sqrt(2.), 5.);
}

void main(void) {
  float scale = 4.;
  vec2 p =
    scale * gl_FragCoord.xy / min(resolution.x, resolution.y)
    + .5
    - scale * resolution.xy / 2. / min(resolution.x, resolution.y)
  ;
  vec2 pp = gl_FragCoord.xy / resolution.xy;


  gl_FragColor = vec4(black, 1.0);

  if (distance(p, vec2(.5, .5)) < 1.) {
    gl_FragColor = vec4(blue, 1.0);
  }
}
