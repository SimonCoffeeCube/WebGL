/*

License

(The MIT License)

Copyright (c) 2015-2024 Simon Coffee-Cube

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE

*/

// Linear Math Functions and Matrix Functions

function distanceBetweenPoints(x1,x2,z1,z2) {

  var x = x1 - x2;
  var z = z1 - z2;

  return Math.sqrt((x*x)+(z*z));
}

function AngleToTarget( sourceX, sourceZ, targetX, targetZ ) {

  var radiansToDegrees = 57.295779513082320876798154814105;
  // Calculate the angle ( in radians ) that source object would need to travel in to get to target object
  var radians = 0;
  var xLength = sourceX - targetX;
  var zLength = sourceZ - targetZ;
  
  if ( xLength > 0 && zLength > 0 ) {
    radians = Math.atan( xLength / zLength );
  }
  else if ( xLength > 0 && zLength < 0 ) {
    zLength *= -1;
    radians = Math.atan( zLength / xLength ) + 1.57079633;
  }
  else if ( xLength < 0 && zLength < 0 )
{
xLength *= -1;
zLength *= -1;
radians = Math.atan( xLength / zLength ) + 3.14159265;
}
else if ( xLength < 0 && zLength > 0 )
{
xLength *= -1;
radians = Math.atan( zLength / xLength ) + 4.71238898;
}
else if ( xLength == 0 && zLength > 0 )
{
radians = 0;
}
else if ( xLength > 0 && zLength == 0 )
{
radians = 1.57079633;
}
else if ( xLength == 0 && zLength < 0 )
{
radians = 3.14159265;
}
else if ( xLength < 0 && zLength == 0 )
{
radians = 4.71238898;
}
return ( radians * radiansToDegrees );
}

function angleBetweenPoints(x1,x2,z1,z2) {

  var z = z2-z1;
  var x = x2-x1;

  if (x == 0)
    x = 0.001;
  if (z == 0) 
    z = 0.001; 

  var m = z/x;
  var radians = Math.atan(m);
  var degrees = radians / 0.0174532925;

  if (degrees < 0)
    degrees *= -1;

  return degrees;  
}

Matrix.Translation = function (v)
{
  if (v.elements.length == 2) {
    var r = Matrix.I(3);
    r.elements[2][0] = v.elements[0];
    r.elements[2][1] = v.elements[1];
    return r;
  }
  if (v.elements.length == 3) {
    var r = Matrix.I(4);
    r.elements[0][3] = v.elements[0];
    r.elements[1][3] = v.elements[1];
    r.elements[2][3] = v.elements[2];
    return r;
  }
  throw "Error wrong length";
}

Matrix.prototype.flatten = function ()
{
    var result = [];
    if (this.elements.length == 0)
        return [];
    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
}

Matrix.prototype.ensure4x4 = function()
{
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;
    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;
    for (var i = 0; i < this.elements.length; i++) {
        for (var j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (var i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
            this.elements.push([0, 0, 1, 0]);
        else if (i == 3)
            this.elements.push([0, 0, 0, 1]);
    }

    return this;
};

function createPerspective(fovy, aspect, znear, zfar)
{
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return createFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

function createFrustum(left, right,
                     bottom, top,
                     znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return $M([[X, 0, A, 0],
               [0, Y, B, 0],
               [0, 0, C, D],
               [0, 0, -1, 0]]);
}


