var gradient = [];

// Compute Perlin noise at coordinates x, y
var NOISE_MAX = 32;
function perlin(x, y) {
  // linear interpolation
  function lerp(a0, a1, w) {
    return (1.0 - w)*a0 + w*a1;
  }

  // Gradient
  function dotGridGradient(ix, iy, x, y) {
    var dx = x - ix;
    var dy = y - iy;
    return (dx * gradient[iy][ix][0] + dy * gradient[iy][ix][1]);
  }

  var x0 = Math.floor(x);
  var x1 = x0 + 1;
  var y0 = Math.floor(y);
  var y1 = y0 + 1;
  
  var sx = x - x0;
  var sy = y - y0;
  
  var n0 = dotGridGradient(x0, y0, x, y);
  var n1 = dotGridGradient(x1, y0, x, y);
  var ix0 = lerp(n0, n1, sx);
  var n0 = dotGridGradient(x0, y1, x, y);
  var n1 = dotGridGradient(x1, y1, x, y);
  var ix1 = lerp(n0, n1, sx);
  var value = lerp(ix0, ix1, sy);
  return value;
}


// Perturb gradient
function perturbGradient() {
  for (var i = 0; i < NOISE_MAX; ++i) {
    for (var j = 0; j < NOISE_MAX; ++j) {
      var x0 = gradient[i][j][0];
      var y0 = gradient[i][j][1];
      var oldAngle = Math.atan2(y0, x0);
      if (oldAngle < 0) {
        oldAngle += Math.PI * 2;
      }

       // Add a bit of randomness
       var angle = oldAngle + 0.01;

       var sin = Math.sin(angle);
       var cos = Math.cos(angle);
       var x = cos;
       var y = sin;

       gradient[i][j] = [x/l, y/l];
     }
   }
 }

// Init gradient
for (var i = 0; i < NOISE_MAX; ++i) {
  gradient[i] = [];
  for (var j = 0; j < NOISE_MAX; ++j) {
    var x = Math.random();
    var y = Math.random();
    var l = Math.sqrt((x * x) + (y * y));
    gradient[i][j] = [x / l, y / l];
  }
}
