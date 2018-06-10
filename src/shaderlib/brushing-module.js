function getUniforms() {
  return {};
}

const vs = `\
uniform vec2 brushing_uMousePosition;
uniform float brushing_uBrushRadius;
uniform float brushing_uBrushSource;
uniform float brushing_uBrushTarget;
uniform float brushing_uEnableBrushing;
uniform float brushing_uStrokeScale;

const float R_EARTH = 6371000.; // earth radius in meter
// const float PI = 3.1415926538;

// approximate distance between lng lat in meters
float distanceBetweenLatLng(vec2 source, vec2 target) {
  float PI = 3.1415926538;
  vec2 delta = (source - target) * PI / 180.;

  float a =
    sin(delta.y / 2.) * sin(delta.y / 2.) +
    cos(source.y * PI / 180.) * cos(target.y * PI / 180.) *
    sin(delta.x / 2.) * sin(delta.x / 2.);

  float c = 2. * atan(sqrt(a), sqrt(1. - a));

  return R_EARTH * c;
}

// range is km
float isPointInRange(vec2 ptLatLng, float enabled) {
  return float(enabled <= 0. || distanceBetweenLatLng(ptLatLng, brushing_uMousePosition) <= brushing_uBrushRadius);
}

vec2 getExtrusionOffset(vec2 line_clipspace, vec2 viewportSize, float offset_direction, float lineWidth) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * viewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  vec2 offset_screenspace = dir_screenspace * offset_direction * lineWidth / 2.0;
  vec2 offset_clipspace = offset_screenspace / viewportSize * 2.0;

  return offset_clipspace;
}

vec2 brushing_getExtrusionOffset(
  vec2 line_clipspace,
  float offset_direction,
  vec2 viewportSize,
  vec4 instancePositions, 
  float instanceStrokeWidth
) {
  float isSourceInBrush = isPointInRange(instancePositions.xy, brushing_uBrushSource);
  float isTargetInBrush = isPointInRange(instancePositions.zw, brushing_uBrushTarget);
  
  float isInBrush = float(brushing_uEnableBrushing <= 0. ||
  (brushing_uBrushSource * isSourceInBrush > 0. || brushing_uBrushTarget * isTargetInBrush > 0.));
  
  float strokeWidth = brushing_uStrokeScale * instanceStrokeWidth;

  float finalWidth = mix(0.0, strokeWidth, isInBrush);

  // extrude
  return getExtrusionOffset(line_clipspace, viewportSize, offset_direction, finalWidth);
}
`;

export default {
  name: 'brushing',
  vs,
  getUniforms
};
