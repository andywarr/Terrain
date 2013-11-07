attribute vec3 position;
attribute vec3 normal;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

varying vec3 vLightWeighting;

#pragma glslify: lighting = require(./simple_light)

void main() {
  vLightWeighting = uAmbientColor +
    lighting(uDirectionalColor, normal, uLightingDirection);

  gl_Position = projection * view * model * vec4(position, 1.0);
}
