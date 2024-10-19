/*

License

(The MIT License)

Copyright (c) 2015-2024 Simon Coffee-Cube

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE

*/


// In this script file you'll find all the game play logic. Everything from collision detection to sprite control
// This code's quite rough as I am constantly tweaking things in the game. Therefore it is quite rough and not optimised

var which_level = 0;
var player_speed = 0.75;
var player_rotation_speed = 0.5;
var camera_rotation_direction = 1;
var camera_angle = 90;
var y_camera_angle = 0;
var rotate_direction = 3;
var movement_direction = 0;
var x_location = -100;
var z_location = -900;
var x_your_character = x_location;
var y_your_character = -100;
var z_your_character = z_location;
var y_location = -20;
var timing_loop_count = 0;
var spin_count = 0;
var spin_direction = 2;
var health = 100;
var shoot_projectile = false;
var projectile_collected_count = 100;
var projectile_distance = [];
var your_projectile_x = [];
var your_projectile_y = [];
var your_projectile_z = [];
var your_projectile_active = [];
var your_projectile_angle = [];
var your_projectile_health = [];
var projectile_spin = 0;
var projectiles_fired = 0;
var phase_of_game = "game";
var difficulty_delay = 10;
var difficulty_speed = 3;
var how_much_ammo = 2000;
var delay_til_next_sprite = difficulty_delay;
var difficulty_delay_powerup = 5;
var powerup_spin = 0;
var delay_til_next_powerup = difficulty_delay_powerup;
var score = 0;

var mousePos = new Float32Array(2);

// Second the Controls
window.addEventListener("keydown", checkKeyPressed, false);
window.addEventListener("keyup", checkKeyUnPressed, false);
window.addEventListener("mousemove",moveMousePosition, false);
window.addEventListener("mousedown",clickMouse, false);
//el.addEventListener("touchstart",touchhandler);
//el.addEventListener("touchmove",touchhandler);

function touchhandler(e) {
    if (e.touches) {
      alert(e.touches[0].pageX," ",e.touches[0].pageY);
    }
  }
  
function clickMouse(e){
    shoot_projectile = true;
}
  
function moveMousePosition(e){
  
    // When the left or right key is pressed then lock out the mouse left and right for better control response
  
    if (e.pageX > mousePos[0] ) {
      var adjustment = (e.pageX - mousePos[0]);
      if (adjustment > 3)
        adjustment = 3;
      camera_angle += (adjustment);
      //console.log(adjustment);
      if (camera_angle > 360)
        camera_angle = 0;
      
    }
    else if (e.pageX < mousePos[0] ) { 
      var adjustment = (mousePos[0] - e.pageX);
      if (adjustment > 3)
        adjustment = 3;
      camera_angle -= (adjustment);
      if (camera_angle < 0)
        camera_angle = 360;
 
    }
    else {
      rotate_direction = 0;
    }
  
    if (e.pageY > mousePos[1])
      y_camera_angle += (e.pageY - mousePos[1]) / 20;
    else
    y_camera_angle -= (mousePos[1] - e.pageY) / 20;
  
    if (y_camera_angle > 5)
    y_camera_angle = 5;
  
    if (y_camera_angle < -5)
    y_camera_angle = -5;
  
    mousePos[0] = e.pageX;
    mousePos[1] = e.pageY;

}
  
  
function checkKeyPressed(e) {
  
    if (e.keyCode == "37") {
        rotate_direction = 1;
    }
    if (e.keyCode == "38") {
        movement_direction = 1;
    }
    if (e.keyCode == "40") {
        movement_direction = 2;
    }
    if (e.keyCode == "39") {
        rotate_direction = 2;
        
    }
      if (e.keyCode == "32") {
          shoot_projectile = true;
    }
  }
  
  function checkButtonPressed(name) {
  
    if (name == "left_arrow") {
      rotate_direction = 1;
    }
    if (name == "up_arrow") {
      movement_direction = 1;
    }
    if (name == "down_arrow") {
      movement_direction = 2;
    }
    if (name == "right_arrow") {
      rotate_direction = 2;
    }
  }
  
  function checkKeyUnPressed(e) {
  
    if (e.keyCode == "37") {
      rotate_direction = 0;
    }
    if (e.keyCode == "38") {
      movement_direction = 0;
    }
    if (e.keyCode == "40") {
      movement_direction = 0;
    }
    if (e.keyCode == "39") {
      rotate_direction = 0;
    } 
  } 
  
function checkButtonUnPressed() {
  
      rotate_direction = 0;
      movement_direction = 0;
} 

for (var i = 0; i < how_much_ammo; i++) {
  your_projectile_angle[i] = 0;
  your_projectile_health[i] = 1;
  projectile_distance[i] = 0;
  your_projectile_x[i] = 0;
  your_projectile_y[i] = 0;
  your_projectile_z[i] = 0;
  your_projectile_active[i] = false;
}


// Thirdly the actual gameplay loop that synchronises everything happening in the game

setInterval(function() { HandleTimer() }, 5);
	
function HandleTimer() {

  if (phase_of_game == "game") {

    ControlPlayerMovement();
    ControlSprites();
    AreYouOrSpriteStandingOnACube();
    

    if (timing_loop_count >= 5 ) {
      
      MoveProjectiles();
      ControlPowerups();
      IsLevelComplete();
      DropPowerups();
      timing_loop_count = 0;
    }

    timing_loop_count++;
  }
  else {
  
  }
}

function IsLevelComplete() {
}

function GameOver(which_ending) {
  //if (which_ending == 1)
  //  document.getElementById("gameover").style.visibility = "visible";
  //else
   // document.getElementById("youwin").style.visibility = "visible";
}

function PlaySound ( soundname ) {
    var thissound = document.getElementById( soundname );
    thissound.play();
}


function MoveProjectiles() {

  projectile_spin+=60;
  if (projectile_spin > 360)
    projectile_spin = 0;

  for (var projectile = 0; projectile < your_projectile_x.length; projectile++) { 

    if (your_projectile_active && projectile_distance[projectile] <= 500) {

      your_projectile_x[projectile] += Math.sin( your_projectile_angle[projectile] ) * 20.0;
      your_projectile_z[projectile] -= Math.cos( your_projectile_angle[projectile] ) * 20.0;
      projectile_distance[projectile] += 20;

      for (var sprite_no = 0; sprite_no < sprites_x.length; sprite_no++) {
        if (your_projectile_x[projectile] > sprites_x[sprite_no] - 15 && 
          your_projectile_x[projectile] < sprites_x[sprite_no] + 15 &&
          your_projectile_z[projectile] > sprites_z[sprite_no] - 15 && 
          your_projectile_z[projectile] < sprites_z[sprite_no] + 15 ) {
            sprites_health[sprite_no] = 0;
            your_projectile_active[projectile] = false;
            your_projectile_health[projectile] = 0;
            score += 1000;
            break;
        }
      }  
    }
    else if (projectile_distance[projectile] > 500)
      your_projectile_active[projectile] = false;
  }
}

/*function ControlFood() {
    // Check if any of the food is eaten by the zombies - nasty zombies
    for (var i = 0; i < food_x.length; i++) {
      for (var sprite_no = 0; sprite_no < sprites_x.length; sprite_no++) {
        //if (sprites_active[sprite_no] ) {
          if (sprites_x[sprite_no] > food_x[i] - 40 && sprites_x[sprite_no] < food_x[i] + 40 &&
              sprites_z[sprite_no] > food_z[i] - 40 && sprites_z[sprite_no] < food_z[i] + 40 ) {
                food_alive[i] = false;
          }
        //}
      }
    }*/
  
    // Assess how much food is left. If that equals zero then the game is over
    /*var how_much_food_alive = 0;
    for (var i = 0; i < food_x.length; i++) {
      if (food_alive[i] ) { 
        how_much_food_alive++;
      }
    }
  
    if (how_much_food_alive <= 0) {
      GameOver(1);
    }
  }*/

  function ControlPowerups() {
    // Check if the player has picked up any of the active powerups
    powerup_spin++;
    if (powerup_spin > 360)
      powerup_spin = 0;

    for (var i = 0; i < powerup_x.length; i++) {
      if (powerup_active[i] && powerup_collected[i] == false ) {
        if (x_location*-1 > powerup_x[i] - 40 && x_location*-1 < powerup_x[i] + 40 &&
              z_location*-1 > powerup_z[i] - 40 && z_location*-1 < powerup_z[i] + 40 && 
              y_location > powerup_y[i] - 40 && y_location < powerup_y[i] + 40 ) {
                powerup_collected[i] = true;
                health+=10;
                powerup_active[i] = false;            
          }
        }
      }
  }
  
  function ControlSprites() {
  
    if (phase_of_game == "game" ) {
  
      for (var sprite_no = 0; sprite_no < sprites_x.length; sprite_no++) {

        // Once active move the sprite towards you
        var angle_to_move_in = AngleToTarget(sprites_x[sprite_no], sprites_z[sprite_no], x_location*-1, z_location*-1);
        
        sprites_direction[sprite_no] = angle_to_move_in - 180;

        proposed_x = sprites_x[sprite_no];
        proposed_x -= Math.cos( angle_to_move_in ) * 0.5;
        proposed_z = sprites_z[sprite_no];
        proposed_z += Math.sin( angle_to_move_in ) * 0.5;

        if ( distanceBetweenPoints(x_location*-1,proposed_x,z_location*-1,proposed_z) > 30 ) {

        //sprites_x[sprite_no] = proposed_x;
        //sprites_z[sprite_no] = proposed_z;
        }


  
        /*var direction = sprites_direction[sprite_no][sprites_movement_phase[sprite_no]];
       
        if (sprites_active[sprite_no]) {
  
          if (sprites_dropping[sprite_no] && sprites_y[sprite_no] > 0) {
            sprites_y[sprite_no]-=5;
            if (sprites_y[sprite_no] <= 0 ) {
              sprites_y[sprite_no] = 0;
              sprites_dropping[sprite_no] = false;
            }
          }
          else {
            if (direction == 0 ) {
              sprites_z[sprite_no]-=difficulty_speed;
            }
            else if (direction == 1 ) {
              sprites_x[sprite_no]+=difficulty_speed;
            }
            else if (direction == 2 ) {
              sprites_z[sprite_no]+=difficulty_speed;
            }
            else if (direction == 3 ) {
              sprites_x[sprite_no]-=difficulty_speed;
            }
  
            sprites_walk_distance[sprite_no][sprites_movement_phase[sprite_no]]--;
            
            if (sprites_walk_distance[sprite_no][sprites_movement_phase[sprite_no]] < 0) {
              sprites_movement_phase[sprite_no]++;
            }
          }
        }*/
      }    
    }
  }

  function AreYouOrSpriteStandingOnACube() {

    for (var sprite_no = 0; sprite_no < sprites_x.length; sprite_no++) {
      sprites_y[sprite_no] = 0;
      for (var cell = 0; cell < bump.length; cell+=4 ) {
        var cube_x = bump[cell];
        var cube_y = bump[cell+1]
        var cube_z = bump[cell+2];
        var kind_of_cube = bump[cell+3];
  
        if (kind_of_cube <= 8) { 
          if (sprites_x[sprite_no] > cube_x - 5 && sprites_x[sprite_no] < cube_x + 25 && 
            sprites_z[sprite_no] > cube_z - 5 && sprites_z[sprite_no] < cube_z + 25 ) {
            sprites_y[sprite_no] = (kind_of_cube * 8);
        }
      }
    }

    // Confusingly the player coordinates are inverted from the scenery because of the way movement is achieved
    var your_x = x_location * -1;
    var your_z = z_location * -1;
    y_location = -20;
    
    for (var cell = 0; cell < bump.length; cell+=4 ) {
      var cube_x = bump[cell];
      var cube_y = bump[cell+1]
      var cube_z = bump[cell+2];
      var kind_of_cube = bump[cell+3];

      if (kind_of_cube <= 8) { 
        if ( your_x >= cube_x - 5 && your_x <= cube_x + 25 && 
             your_z >= cube_z - 5 && your_z <= cube_z + 25 ) {
            y_location = (20 + (kind_of_cube * 10)) * -1;
          }
        }
      }
    }
  }
  
  function CollisionDetection(x,z) {

    // First check the player doesn't try and leave the game area ( this cuts down on the number of cubes we need to use )
    if (x >= 20 && x < 580 && z >= 20 && z <= 1180) {
  
      for (var cell = 0; cell < bump.length; cell+=4 ) {

        var cube_x = bump[cell];
        var cube_z = bump[cell+2];
        var kind_of_cube = bump[cell+3];
  
        if (kind_of_cube > 8) {
          if ( x >= cube_x - 5 && x <= cube_x + 25 && z >= cube_z - 5 && z <= cube_z + 25) {
            return true;
          }
        }
      }
    } else {
      return true;
    }

    return false;
  }
  
  function DropPowerups() {
  
    if (phase_of_game == "game" ) {
  
      if (delay_til_next_powerup > 0) {
        delay_til_next_powerup--;
      }
      else {
  
        for (var powerup_no = 0; powerup_no < powerup_x.length; powerup_no++) {
          if (powerup_active[powerup_no] == false ) {
            powerup_active[powerup_no] = true;
            delay_til_next_powerup = difficulty_delay_powerup;    
            break;
          }
        }
      }
      
      for (var powerup_no = 0; powerup_no < powerup_x.length; powerup_no++) {
        if (powerup_active[powerup_no]) {
          powerup_y[powerup_no]--;
  
          if (powerup_y[powerup_no] <= 0) {
              powerup_y[powerup_no] = 0;
          }
        }
      }
    }
  }
  

  function ControlPlayerMovement() {

        if (movement_direction == 2) {
    
          var camera_angle_in_radians = camera_angle * 0.0174532925;
    
          x_probable = x_location;
          z_probable = z_location;
    
          x_probable += Math.sin( camera_angle_in_radians ) * player_speed;
          z_probable -= Math.cos( camera_angle_in_radians ) * player_speed;
    
          if (CollisionDetection(x_probable*-1,z_location*-1) == false )
            x_location = x_probable;
            
          if (CollisionDetection(x_location*-1,z_probable*-1) == false )
            z_location = z_probable;
        }
    
        if (movement_direction == 1) {
    
          var camera_angle_in_radians = camera_angle * 0.0174532925;
    
          x_probable = x_location;
          z_probable = z_location;
    
          x_probable -= Math.sin( camera_angle_in_radians ) * player_speed;
          z_probable += Math.cos( camera_angle_in_radians ) * player_speed;
    
          if (CollisionDetection(x_probable*-1,z_location*-1) == false )
            x_location = x_probable;
            
          if (CollisionDetection(x_location*-1,z_probable*-1) == false )
            z_location = z_probable;
        } 
          
        if (rotate_direction == 1) {
          camera_angle-=player_rotation_speed;
          if (camera_angle < 0)
              camera_angle = 360;
        }
        else if (rotate_direction == 2) {
          camera_angle+=player_rotation_speed;
          if (camera_angle > 360)
              camera_angle = 0;
        }
      
        if (shoot_projectile) {
    
          // You only have a set number of projectiles and so check if any of them is unassigned
          for (var projectile = 0; projectile < your_projectile_x.length; projectile++) {
            if (your_projectile_active[projectile] == false &&
                your_projectile_health[projectile] > 0 &&
                projectile_collected_count > projectile ) {
              
              // Initialise projectile into its starting position and make it active
              var x_placement = x_location;
              var z_placement = z_location;
              var camera_angle_in_radians = camera_angle * 0.0174532925;
              x_placement -= (Math.sin( camera_angle_in_radians ) * 10.0 );
              z_placement += (Math.cos( camera_angle_in_radians ) * 10.0 );
              your_projectile_x[projectile] = x_placement * -1;
              your_projectile_y[projectile] = (y_location+10) * -1;
              your_projectile_z[projectile] = z_placement * -1;
              your_projectile_angle[projectile] = camera_angle_in_radians; // it will then follow this tragectory
              your_projectile_active[projectile] = true;
              shoot_projectile = false;
              projectile_distance[projectile] = 0;
              projectiles_fired++;
              break;
            }
          }
        }
      
  }