var shaderUtils = '\
uniform sampler2D gradientTex;\
uniform float theta;\
\
const float nSizef = float(NOISE_SIZE);\
const vec2 texelDim = vec2(1.0 / nSizef);\
\
vec2 noiseGradient(vec2 coord) {\n\
	float cosTheta = cos(theta);\n\
	float sinTheta = sin(theta);\n\
	mat2 rMat = mat2(cosTheta, sinTheta, -sinTheta, cosTheta);\n\
	return rMat * texture2D(gradientTex, coord).rg;\n\
}\
\
float dotGridGradient(vec2 noisePos, vec2 p) {\
  vec2 dVector = p - noisePos;\
  return dot(dVector, noiseGradient(noisePos));\
}\
\
float perlin(vec2 pos) {\
	vec2 pos0 = floor(pos * nSizef) / nSizef;\
	vec2 pos1 = pos0 + texelDim;\
\
	vec2 d = pos - pos0;\
	float n00 = dotGridGradient(pos0, pos);\
	float n01 = dotGridGradient(vec2(pos1.x, pos0.y), pos);\
	float n10 = dotGridGradient(vec2(pos0.x, pos1.y), pos);\
	float n11 = dotGridGradient(pos1, pos);\
	\
\
	float ix0 = mix(n01, n00, d.x);\
	float ix1 = mix(n11, n10, d.x);\
	return mix(ix1, ix0, d.y);\
}';

var shaderVertexTransform = '\
	transformed.z = (perlin(uv) - 0.5) * 2.0;\
';