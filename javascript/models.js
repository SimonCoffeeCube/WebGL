var sprite_vertices = [

    // Front face
    -6, -2,  6,
     6, -2,  6,
     6,  24,  6,
    -6,  24,  6,
    // Back face
    -6, -2, -6,
    -6,  24, -6,
     6,  24, -6,
     6, -2, -6,
    // Right face
     6, -2, -6,
     6,  24, -6,
     6,  24,  6,
     6, -2,  6,
    // Left face
    -6, -2, -6,
    -6, -2,  6,
    -6,  24,  6,
    -6,  24, -6,
    // Top face
    -6, 24, -6,
    6, 24, -6,
    6, 24,  6,
    -6, 24,  6,
];

var projectile_vertices = [

    // Front face
    -3, -1.0,  3,
    3, -1.0,  3,
    3,  1.0,  3,
    -3,  1.0,  3,
    // Back face
    -3, -1.0, -3,
    -3,  1.0, -3,
    3,  1.0, -3,
    3, -1.0, -3,
    // Right face
    3, -1.0, -3,
    3,  1.0, -3,
    3,  1.0,  3,
    3, -1.0,  3,
    // Left face
    -3, -1.0, -3,
    -3, -1.0,  3,
    -3,  1.0,  3,
    -3,  1.0, -3,
    // Top face
    -3, 1.0, -3,
    3, 1.0, -3,
    3, 1.0,  3,
    -3, 1.0,  3     
];

var powerup_vertices = [

    // Front face
    -4, -2,  4,
    4, -2,  4,
    4,  30,  4,
   -4,  30,  4,
   // Back face
   -4, -2, -4,
   -4,  30, -4,
    4,  30, -4,
    4, -2, -4,
   // Right face
    4, -2, -4,
    4,  30, -4,
    4,  30,  4,
    4, -2,  4,
   // Left face
   -4, -2, -4,
   -4, -2,  4,
   -4,  30,  4,
   -4,  30, -4,
   // Top face
   -4, 30, -4,
   4, 30, -4,
   4, 30,  4,
   -4, 30,  4
];
 
var sprite_texture_coordinates = [

    0.0,  1.0,
    0.5,  1.0,
    0.5,  0.0,
    0.0,  0.0,
    
    0.5,  1.0,
    0.5,  0.0,
    1.0,  0.0,
    1.0,  1.0,
	
    0.5,  1.0,
    0.5,  0.0,
    1.0,  0.0,
    1.0,  1.0,
	
    0.5,  1.0,
    1.0,  1.0,
    1.0,  0.0,
    0.5,  0.0,
	
    0.0,  0.0,
    0.1,  0.0,
    0.1,  0.1,
    0.0,  0.1,
 ];
 
 var sprite_vertex_indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,    // left
];

var floor_vertices = [
    // first part of floor
    0, 0, 0,
    600, 0, 0,
    600, 0, 400,
    0, 0,  400,

    // second part of floor
    0,0,401,
    600,0,401,
    600,0,800,
    0,0,800,

    // third part of floor
    0,0,801,
    600,0,801,
    600,0,1200,
    0,0,1200,
];

var ceiling_vertices = [

    // first part of floor
    0, 60, 0,
    600, 60, 0,
    600, 60, 400,
    0, 60,  400,

    // second part of floor
    0,60,401,
    600,60,401,
    600,60,800,
    0,60,800,

    // third part of floor
    0,60,801,
    600,60,801,
    600,60,1200,
    0,60,1200,
    ];


var ceiling_vertex_indices = [
    0,  1,  2,      
    0,  2,  3,  

    4,5,6,
    4,6,7,

    8,9,10,
    8,10,11,
];

var ceiling_texture_coordinates = [
	0.0,  0.0,
    0.5,  0.0,
    0.5,  0.5,
    0.0,  0.5,

    0.5,  0.0,
    1.0,  0.0,
    1.0,  0.5,
    0.5,  0.5,

    0.0,  0.5,
    0.5,  0.5,
    0.5,  1.0,
    0.0,  1.0,

 ];
	
var floor_vertex_indices = [
    0,  1,  2,      
    0,  2,  3,  

    4,5,6,
    4,6,7,

    8,9,10,
    8,10,11,
];
	
var floor_texture_coordinates = [
	0.0,  0.0,
    0.5,  0.0,
    0.5,  0.5,
    0.0,  0.5,

    0.5,  0.0,
    1.0,  0.0,
    1.0,  0.5,
    0.5,  0.5,

    0.0,  0.5,
    0.5,  0.5,
    0.5,  1.0,
    0.0,  1.0,
 ];


 var boundary_vertices = [

    // Front face
    0, 0,  1200,
    0, 100,  1200,
    600,  100,  1200,
    600,  0,  1200,
    // Back face
    0, 0,  0,
    0, 100,  0,
    600,  100,  0,
    600,  0,  0,
    // Right face
     0, 0, 0,
     0,  100, 0,
     0,  100, 1200,
     0, 0,  1200,
    // Left face
     600, 0, 0,
     600,  100, 0,
     600,  100, 1200,
     600, 0,  1200,
    // Top face
    0, 100, 0,
     600, 100, 0,
     600, 100, 1200,
    0, 100,  1200,
 ];

 var boundary_texture_coordinates = [
	0.0,  0.0,
    0.5,  0.0,
    0.5,  0.5,
    0.0,  0.5,

    0.5,  0.0,
    1.0,  0.0,
    1.0,  0.5,
    0.5,  0.5,

    0.0,  0.5,
    0.5,  0.5,
    0.5,  1.0,
    0.0,  1.0,

    0.0,  0.5,
    0.5,  0.5,
    0.5,  1.0,
    0.0,  1.0,

    0.0,  0.5,
    0.5,  0.5,
    0.5,  1.0,
    0.0,  1.0,
 ];

 var boundary_vertex_indices = [
    0,  1,  2,      0,  2,  3,    
    4,  5,  6,      4,  6,  7,    
    8,  9,  10,     8,  10, 11,   
    12, 13, 14,     12, 14, 15,   
    16, 17, 18,     16, 18, 19,   
    20, 21, 22,     20, 22, 23,    
];