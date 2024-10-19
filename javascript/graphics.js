/*

License

(The MIT License)

Copyright (c) 2015-2024 Simon Coffee-Cube

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE

*/

// This script file contains all of the WebGL and associated functions I have written for rending the graphics to the screen
// It could do with some tidying up, but the key for me was to keep everything that draws to the screen in one place
// even if that meant mixing the WebGL "primatives" with the higher level funtions that decide where and how to place the models

var canvas;
var gl;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var textureCoordAttribute;
var perspectiveMatrix;

// Buffers ( verteces are in the arrays.js file and the scenery_*.js files )
var sceneryVerticesBuffer;
var sceneryVerticesTextureCoordBuffer;
var sceneryVerticesIndexBuffer;

var floorVerticesBuffer;
var floorVerticesTextureCoordBuffer;
var floorVerticesIndexBuffer;

var ceilingVerticesBuffer;
var ceilingVerticesTextureCoordBuffer;
var ceilingVerticesIndexBuffer;

var boundaryVerticesBuffer;
var boundaryVerticesTextureCoordBuffer;
var boundaryVerticesIndexBuffer;

var spriteVerticesBuffer;
var spriteVerticesTextureCoordBuffer;
var spriteVerticesIndexBuffer;

var projectileVerticesBuffer;
var powerupVerticesBuffer;


// Images - stored in an array for each level
var floorImage = [];
var cubeImage = [];
var powerupImage = [];
var ceilingImage = [];
var boundaryImage = [];
var spriteImage = [];

// Textures
var floorTexture;
var powerupTexture;
var cubeTexture;
var spriteTexture = []; // there are multiple sprite textures per level
var ceilingTexture;
var boundaryTexture;


// start - called when the canvas is created
function start() {

  canvas = document.getElementById("glcanvas");

  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 10;
  
  initWebGL(canvas);      // Initialize the GL context
 
  // Only continue if WebGL is available and working
  
  if (gl) {
	  
    gl.clearColor(0.5, 0.8, 0.9, 1.0);  // Clear to blue sky, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    
    initShaders();
    
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    
    initBuffers();
    
    // Next, load and set up the textures we'll be using.
    
    initTextures();
	
    // Set up to draw the scene periodically.
    
    setInterval(drawScene, 1); 
  }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
  gl = null;
  
  try {
    gl = canvas.getContext("webgl");
  }
  catch(e) {
  }
  
  // If we don't have a GL context, give up now
  
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

// Initialize the shaders, so WebGL knows how to light our scene.
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  
  textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(textureCoordAttribute);
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}

// initBuffers
function initBuffers() {

  // Load scenery data ( from models.js and level_*.js files ) into the various buffers to make the 3D models
  
  sceneryVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, sceneryVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scenery_vertices), gl.STATIC_DRAW);
  
  sceneryVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sceneryVerticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scenery_texture_coordinates), gl.STATIC_DRAW);
    
  sceneryVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sceneryVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scenery_vertex_indices), gl.STATIC_DRAW);
    
  spriteVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, spriteVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sprite_vertices), gl.STATIC_DRAW);

  spriteVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spriteVerticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sprite_texture_coordinates), gl.STATIC_DRAW);
  
  spriteVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spriteVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sprite_vertex_indices), gl.STATIC_DRAW);

  powerupVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, powerupVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(powerup_vertices), gl.STATIC_DRAW);

  projectileVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, projectileVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(projectile_vertices), gl.STATIC_DRAW);
  
  floorVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floor_vertices), gl.STATIC_DRAW);
  
  floorVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVerticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floor_texture_coordinates), gl.STATIC_DRAW);
  
  floorVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floor_vertex_indices), gl.STATIC_DRAW);  

  ceilingVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceiling_vertices), gl.STATIC_DRAW);

  ceilingVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVerticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceiling_texture_coordinates), gl.STATIC_DRAW);
  
  ceilingVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ceilingVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ceiling_vertex_indices), gl.STATIC_DRAW);  

  boundaryVerticesBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, boundaryVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boundary_vertices), gl.STATIC_DRAW);

  boundaryVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boundaryVerticesTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boundary_texture_coordinates), gl.STATIC_DRAW);
  
  boundaryVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boundaryVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boundary_vertex_indices), gl.STATIC_DRAW); 
}

//
// initTextures
//
// Initialize the textures we'll be using, then initiate a load of
// the texture images. The handleTextureLoaded() callback will finish
// the job; it gets called each time a texture finishes loading.
//
function initTextures() {
  
  spriteTexture[0] = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, spriteTexture[0]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  spriteImage[0] = new Image();
  spriteImage[0].src = character_image[0];
  spriteImage[0].onload = function() { handleTextureLoaded(spriteImage[0], spriteTexture[0]); }
  
  spriteTexture[1] = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, spriteTexture[1]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  spriteImage[1] = new Image();
  spriteImage[1].src = character_image[1];
  spriteImage[1].onload = function() { handleTextureLoaded(spriteImage[1], spriteTexture[1]); }
  
  spriteTexture[2] = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, spriteTexture[2]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  spriteImage[2] = new Image();
  spriteImage[2].src = character_image[2];
  spriteImage[2].onload = function() { handleTextureLoaded(spriteImage[2], spriteTexture[2]); }

  spriteTexture[3] = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, spriteTexture[3]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  spriteImage[3] = new Image();
  spriteImage[3].src = character_image[3];
  spriteImage[3].onload = function() { handleTextureLoaded(spriteImage[3], spriteTexture[3]); }
  
  spriteTexture[4] = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, spriteTexture[4]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  spriteImage[4] = new Image();
  spriteImage[4].src = character_image[4];
  spriteImage[4].onload = function() { handleTextureLoaded(spriteImage[4], spriteTexture[4]); }

  // Textures for the cubes - we can apply any one of these to a mesh
  cubeTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  cubeImage = new Image();
  cubeImage.src = cube_texture_image[which_level];
  cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }

  floorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, floorTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  floorImage = new Image();
  floorImage.src = floor_texture_image[which_level];
  floorImage.onload = function() { handleTextureLoaded(floorImage, floorTexture); }

  powerupTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, powerupTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  powerupImage = new Image();
  powerupImage.src = powerup_texture_image[which_level];
  powerupImage.onload = function() { handleTextureLoaded(powerupImage, powerupTexture); }

  ceilingTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, ceilingTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  ceilingImage = new Image();
  ceilingImage.src = ceiling_texture_image[which_level];
  ceilingImage.onload = function() { handleTextureLoaded(ceilingImage, ceilingTexture); }

  boundaryTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boundaryTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])); // red
  boundaryImage = new Image();
  boundaryImage.src = boundary_texture_image[which_level];
  boundaryImage.onload = function() { handleTextureLoaded(boundaryImage, boundaryTexture); }
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

// High-Level Functions ( Game Level Functions )

// Now use all the lower level items defined above to actually start rendering the scene
//
function drawScene() {

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio of 640:480, and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  
  perspectiveMatrix = createPerspective(45, 640.0/480.0, 0.1, 1000.0);
 
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  
  loadIdentity();
	mvRotate(0, [1, 0, 0]);
  mvRotate(y_camera_angle, [1, 0, 0]);
  mvRotate(camera_angle, [0, 1, 0]);
  mvTranslate([x_location, y_location, z_location]);

  DrawScenery();
  DrawZombies();
  //DrawFood();
  DrawProjectiles();
  DrawPowerups();
  DisplayFloorCeiling();
}

function DrawZombies() {

  count_visible_sprites = 0;
  for (var sprite_no = 0; sprite_no < sprites_x.length; sprite_no++) { 

    if (sprites_health[sprite_no] > 0 ){

	    DrawModel(sprites_x[sprite_no],
                 sprites_y[sprite_no], 
                 sprites_z[sprite_no],
                 sprites_texture[sprite_no],
                 "sprite",
                 sprites_direction[sprite_no]);

    }
  }
}

function DrawProjectiles() {

  for (var your_projectile_count = 0; your_projectile_count <= your_projectile_x.length; your_projectile_count++ ) {
    if (your_projectile_active[your_projectile_count])
      DrawModel(your_projectile_x[your_projectile_count],
        your_projectile_y[your_projectile_count],
        your_projectile_z[your_projectile_count],
        powerup_texture[which_level],"projectile",0);
  }
}

function DrawPowerups() {

  for (var powerup_count = 0; powerup_count < powerup_x.length; powerup_count++ ) {
    if (powerup_active[powerup_count] && powerup_collected[powerup_count] == false)
      DrawModel(powerup_x[powerup_count],powerup_y[powerup_count],
              powerup_z[powerup_count],powerup_texture[which_level],"powerup",0);
  }
}

/*function DrawFood() {

  for (var food_no = 0; food_no < food_x.length; food_no++) { 

    if (food_alive[food_no]) {
	    DrawSprite(food_x[food_no],
                  food_y[food_no], 
                  food_z[food_no],
                  1,2,1,1);
    }
  }
}*/

function DrawScenery() {

  mvPushMatrix();
  
  var x = 0;
  var z = 0;
  
  mvTranslate([x,0,z]);

  gl.bindBuffer(gl.ARRAY_BUFFER, sceneryVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, sceneryVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sceneryVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 30 * num_cubes, gl.UNSIGNED_SHORT, 0);

  mvPopMatrix();
}

function DisplayFloorCeiling() {

  mvPushMatrix();
  
  mvTranslate([0,0,0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, floorVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, floorTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, floorVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, floorVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, ceilingTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

 
  gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, ceilingTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ceilingVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, ceilingTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, boundaryVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, boundaryTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, boundaryVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boundaryVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, boundaryVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, boundaryTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  mvPopMatrix();
}

function DrawModel(x,y,z,texture,model_type,direction) { 

  mvPushMatrix();
  mvTranslate([x, y, z]);

  if (model_type == "sprite") {
    mvRotate(direction, [0, 1, 0]); 
  }

  if (model_type == "projectile") { // make projectile spin
    mvRotate(projectile_spin,[0,1,0]);
  }

  if (model_type == "powerup") { // make powerup look more fun
    mvRotate(powerup_spin,[0,1,0]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, spriteVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);

  if (model_type == "powerup")
    gl.bindTexture(gl.TEXTURE_2D, powerupTexture);
  else if (model_type == "projectile")
    gl.bindTexture(gl.TEXTURE_2D, powerupTexture);
  else
    gl.bindTexture(gl.TEXTURE_2D, spriteTexture[texture]);

  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  if (model_type == "sprite")
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteVerticesBuffer);
  else if (model_type == "powerup")
    gl.bindBuffer(gl.ARRAY_BUFFER, powerupVerticesBuffer);
  else if (model_type == "projectile")
    gl.bindBuffer(gl.ARRAY_BUFFER, projectileVerticesBuffer);

  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spriteVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_SHORT, 0);
 
  mvPopMatrix();
}


function PlaySound ( soundname ) {
    var thissound = document.getElementById( soundname );
    thissound.play();
}



