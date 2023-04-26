// Blocky Animal Lab
// James Kohls, 1720315
// CSE160 Winter 2022

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const CUBE = 3;
const CYLINDER = 4;
const SPHERE = 5;
// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
// Global variables related to UI elements
let g_globalAngle = 300;
let g_globalSlider = 0;
let g_globalAngleVert = 0;
let g_torsoAngle = 0;
let g_wholeBodyAngle = 0;
// Globals for moving the entire body
let g_lillia_x = 0;
let g_lillia_y = 0;
let g_lillia_z = 0;
// Horse Body Back
let g_backBodyAngle = 0;
let g_backLeftHip = 32;
let g_backLeftLeg = 0;
let g_backRightHip = 32;
let g_backRightLeg = 0;
// Horse Body Front
let g_frontBodyAngle = 0;
let g_frontLeftHip = -5;
let g_frontLeftLeg = 0;
let g_frontRightHip = -5;
let g_frontRightLeg = 0;
// Right Arm
let g_rightArmSideways = 0;
let g_rightArmForwards = 0;
let g_rightElbowSideways = 0;
let g_rightElbowForwards = 0;
// Left Arm
let g_leftArmSideways = 0;
let g_leftArmForwards = 0;
let g_leftElbowSideways = 0;
let g_leftElbowForwards = 0;
// Head
let g_headSideways = -90;
let g_headForwards = 0;
let g_leftEar = 45;
let g_rightEar = -45;
let g_hair = 25;
// Idle Animation values
let idleWait_torso = 0;
let idleWait_head = 0;
let idleWait_arms = 0;
let idleWait_hair = 0;
// Walk animations
let walk_butt = 0;
let walk_front = 0;
let walk_torso = 0;
// Back Left Leg
let walk_BackLeftHip = 0;
let walk_BackLeftLeg = 0;
// Back Right Leg
let walk_BackRightHip = 0;
let walk_BackRightLeg = 0;
// Front Left Leg
let walk_FrontLeftHip = 0;
let walk_FrontLeftLeg = 0;
// Back Right Leg
let walk_FrontRightHip = 0;
let walk_FrontRightLeg = 0;
// Left Arm
let walk_RightShoulder = 0;
let walk_LeftArm = 0;
let walk_LeftElbow = 0;
// Right Arm
let walk_LeftShoulder = 0;
let walk_RightArm = 0;
let walk_RightElbow = 0;

// animation buttons

// WALKING
let walkEnabled = 0;
let walkTimeStart = 0;
let walkTimePause = 0;
let walkTimetotal = 0;
// STANDING
let standEnabled = 0;
let wave_RightElbow = 0;
// WAVING
let waveEnabled = 0;
let moveToPos = 0;
// STAFF
let holdingStaff = 0;
let staff_rightShoulderForwards = 0;
let staff_rightShoulderSideways= 0;
let staff_rightElbowForwards = 0;
let staff_rightElbowSideways= 0;
let staff_leftShoulderForwards = 0;
let staff_leftShoulderSideways= 0;
let staff_leftElbowForwards = 0;
let staff_leftElbowSideways= 0;
// STAFF ROTATION
let staff_x= 0;
let staff_y= 0;
let staff_z= 0;
// PERK EARS ROTATION
let perk_ears = 0;
let ear_left = 0;
let ear_right = 0;


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  //gl.fillStyle='green';
  //gl.fillRect(0,0,canvas.width,canvas.height);
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders, compiling and installing them
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionForHtmlUI() {
  document
    .getElementById("angleSlider")
    .addEventListener("mousemove", function () {
      g_globalSlider = this.value;
    });
  document
    .getElementById("heightSlider")
    .addEventListener("mousemove", function () {
      g_lillia_y = this.value/50;
    });
  document
    .getElementById("torsoSlider")
    .addEventListener("mousemove", function () {
      g_torsoAngle = this.value;
    });
  document
    .getElementById("wholeSlider")
    .addEventListener("mousemove", function () {
      g_wholeBodyAngle = this.value;
    });
  // Back sliders
  document
    .getElementById("buttSlider")
    .addEventListener("mousemove", function () {
      g_backBodyAngle = this.value;
    });
  document
    .getElementById("backLeftHipSlider")
    .addEventListener("mousemove", function () {
      g_backLeftHip = this.value;
    });
  document
    .getElementById("backLeftLegSlider")
    .addEventListener("mousemove", function () {
      g_backLeftLeg = this.value;
    });
  document
    .getElementById("backRightHipSlider")
    .addEventListener("mousemove", function () {
      g_backRightHip = this.value;
    });
  document
    .getElementById("backRightLegSlider")
    .addEventListener("mousemove", function () {
      g_backRightLeg = this.value;
    });
  // Front Sliders
  document
    .getElementById("frontSlider")
    .addEventListener("mousemove", function () {
      g_frontBodyAngle = this.value;
    });
  document
    .getElementById("frontLeftHipSlider")
    .addEventListener("mousemove", function () {
      g_frontLeftHip = this.value;
    });
  document
    .getElementById("frontLeftLegSlider")
    .addEventListener("mousemove", function () {
      g_frontLeftLeg = this.value;
    });
  document
    .getElementById("frontRightHipSlider")
    .addEventListener("mousemove", function () {
      g_frontRightHip = this.value;
    });
  document
    .getElementById("frontRightLegSlider")
    .addEventListener("mousemove", function () {
      g_frontRightLeg = this.value;
    });
  // Right Arm
  document
    .getElementById("rightArmForSlider")
    .addEventListener("mousemove", function () {
      g_rightArmSideways = this.value;
    });
  document
    .getElementById("rightArmSidSlider")
    .addEventListener("mousemove", function () {
      g_rightArmForwards = this.value;
    });
  document
    .getElementById("rightElbowForSlider")
    .addEventListener("mousemove", function () {
      g_rightElbowSideways = this.value;
    });
  document
    .getElementById("rightArmElbowSlider")
    .addEventListener("mousemove", function () {
      g_rightElbowForwards = this.value;
    });
  // Left Arm
  document
    .getElementById("leftArmForSlider")
    .addEventListener("mousemove", function () {
      g_leftArmSideways = this.value;
    });
  document
    .getElementById("leftArmSidSlider")
    .addEventListener("mousemove", function () {
      g_leftArmForwards = this.value;
    });
  document
    .getElementById("leftElbowForSlider")
    .addEventListener("mousemove", function () {
      g_leftElbowSideways = this.value;
    });
  document
    .getElementById("leftArmElbowSlider")
    .addEventListener("mousemove", function () {
      g_leftElbowForwards = this.value;
    });
  // Head
  document
    .getElementById("headSideSlider")
    .addEventListener("mousemove", function () {
      g_headSideways = this.value;
    });
  document
    .getElementById("headUpSlider")
    .addEventListener("mousemove", function () {
      g_headForwards = this.value;
    });
  document
    .getElementById("leftEarSlider")
    .addEventListener("mousemove", function () {
      g_leftEar = this.value;
    });
  document
    .getElementById("rightEarSlider")
    .addEventListener("mousemove", function () {
      g_rightEar = this.value;
    });
  document
    .getElementById("hairSlider")
    .addEventListener("mousemove", function () {
      g_hair = this.value;
    });
  document.getElementById('walkButton').onclick = function () {
    standEnabled = 0;
    if (walkEnabled == 0) {
      walkTimeStart = (performance.now() / 1000);
      walkTimetotal = walkTimetotal + (walkTimeStart - walkTimePause);
      walkEnabled = 1;
    } else {
      walkTimePause = (performance.now() / 1000);
      walkEnabled = 0;
    }
  };
  document.getElementById('standButton').onclick = function () {
    if (walkEnabled == 1){
      walkTimePause = 0;
      walkTimetotal = 0;
      walkEnabled = 0;
    }
    standEnabled = 1;
    waveEnabled = 0;
  };
  document.getElementById('waveButton').onclick = function () {
    holdingStaff = 0;
    if (waveEnabled == 0){
      waveEnabled = 1;
      moveToPos = 0;
      //wave_RightElbow = wave_RightElbow + (-20);
    } else {
      waveEnabled = 0;
      //wave_RightElbow = wave_RightElbow + (20);
    }
  };
  document.getElementById('staffButton').onclick = function () {
    waveEnabled = 0;
    if (holdingStaff == 0){
      holdingStaff = 1;
      //moveToPos = 0;
      //wave_RightElbow = wave_RightElbow + (-20);
    } else {
      holdingStaff = 0;
      //wave_RightElbow = wave_RightElbow + (20);
    }
  };

}

var firstCoords = [2,2];

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;

  //canvas.onclick  = console.log("click");
  //canvas.onmouseup = console.log("test");
  canvas.onmousedown = click;
  
  canvas.onmousemove = function (ev) { 
    if (ev.buttons == 1) { 
      click(ev, 1) 
    } else {
      if (firstCoords[0] != 2){
        firstCoords = [2,2];
      }
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(tick);
  //renderAllShapes();
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000 - g_startTime;
  // Update animation angles
  updateAnimationAngles();
  // Draw everything
  renderAllShapes();
  // Tell browser to update once it has time
  requestAnimationFrame(tick);
}



function click(ev, check){
  if(ev.shiftKey){
      perk_ears = 1;
  } 
  let [x, y] = covertCoordiantesEventToGL(ev);
  if (firstCoords[0] == 2){
    firstCoords = [x, y];
  }

  g_globalAngle += firstCoords[0]-x;
  g_globalAngleVert += firstCoords[1]-y;

  if (Math.abs(g_globalAngle / 360) > 1){
    g_globalAngle = 0;
  }
  if (Math.abs(g_globalAngleVert / 360) > 1){
    g_globalAngleVert = 0;
  }
  //console.log(g_globalAngle,g_globalAngleVert);
}

// lets front left leg know if it's increasing/decreasing
let val1 = 0;
let val2 = 0;
// lets front right leg know if it's increasing/decreasing
let val3 = 0;
let val4 = 0;
// lets front left leg know if it's increasing/decreasing
let val5 = 0;
let val6 = 0;
// lets front right leg know if it's increasing/decreasing
let val7 = 0;
let val8 = 0;
// speed of the walk animation
let speed = 5;



function updateAnimationAngles() {
  // IDLE ANIMATIONS
  idleWait_torso = Math.sin(g_seconds) * 2;
  idleWait_head = idleWait_torso;
  idleWait_arms = idleWait_torso;
  idleWait_hair = (idleWait_torso) - 10;
 
  // WALK ANIMATIONS
  if (walkEnabled == 1) {
    // STEP ONE
    // Bring Arms down to comfortable position
    if (walk_RightShoulder < 15) {
      walk_RightShoulder += 0.4 ; 
    }
    if (walk_LeftShoulder > -15) {
      walk_LeftShoulder -= 0.4 ; 
    }
    // STEP TWO
    // Animate front left and back right arms/legs
    val2 = walk_FrontLeftHip;
    walk_FrontLeftHip = (speed + 20) * Math.sin((g_seconds - walkTimetotal) * speed);
    val1 = walk_FrontLeftHip;
    if (val1 > val2) {
      // when leg moving back
      if (walk_FrontLeftHip > walk_FrontLeftLeg) {
        walk_FrontLeftLeg = walk_FrontLeftHip;
      } else {
        walk_FrontLeftLeg -= 0.4 * speed;
        if (walk_BackRightLeg < walk_FrontLeftHip) {
          walk_BackRightLeg += 0.4 * speed;
        }
      }
      // Logic For arm swaying at elbows
      if (walk_LeftElbow < walk_LeftArm && holdingStaff == 0) {
        walk_LeftElbow += 0.4 * speed;     // added
      }
    } else {
      // when leg moving forwards
      if (walk_FrontLeftHip > 0) {
        if (holdingStaff == 0){
          walk_LeftElbow -= 0.4 * speed;     // added
        }
        walk_FrontLeftLeg += 0.4 * speed;
        walk_BackRightLeg -= 0.3 * speed;
      }
    }
  //}
    // STEP THREE
    // Animate front right and back left arms/legs
    val4 = walk_FrontRightHip;
    walk_FrontRightHip = (speed + 20) * Math.sin(((g_seconds - walkTimetotal) * speed) + 3.14);
    val3 = walk_FrontRightHip;

    if (val3 > val4) {
      // when leg moving back
      if (walk_FrontRightHip > walk_FrontRightLeg) {
        walk_FrontRightLeg = walk_FrontRightHip;
      } else {
        walk_FrontRightLeg -= 0.4 * speed;
        if (walk_BackLeftLeg < walk_FrontLeftHip) {
          walk_BackLeftLeg += 0.4 * speed;
        }
      }
      // Logic For arm swaying at elbows
      if (walk_RightElbow < walk_RightArm && holdingStaff == 0) {
        walk_RightElbow += 0.4 * speed;     // added
      }
    } else {
      // when leg moving forwards
      if (walk_FrontRightHip > 0 ) {
        if (holdingStaff == 0){
          walk_RightElbow -= 0.4 * speed;     // added
        }
        walk_FrontRightLeg += 0.4 * speed;
        walk_BackLeftLeg -= 0.3 * speed;
      } else {
        // Modification so the front right leg did not stick out on initial start
        if (walk_FrontRightLeg < 60){
          walk_FrontRightLeg += 0.6 * speed;
        }
      }
    }
    // STEP FOUR
    // Animate simple arm/hip sway
    walk_BackLeftHip = walk_FrontRightHip / 2;
    walk_BackRightHip = walk_FrontLeftHip / 2;

    if (holdingStaff == 0) {
      walk_RightArm = walk_FrontRightHip / 2;
      walk_LeftArm = walk_FrontLeftHip / 2;
    } else {
      walk_RightArm = walk_FrontRightHip / 4;
      walk_LeftArm = walk_RightArm;
    }
    

    // STEP FIVE
    // Animate bounce 
    walk_torso = Math.abs(walk_FrontRightHip / 1000);
    walk_front = (walk_torso * 200);
    walk_butt = -(walk_torso * 200);

  // STAND ANIMATIONS

  } else if (standEnabled == 1){
    
    walk_FrontRightHip /= 1.2;
    walk_FrontRightLeg /= 1.2;

    walk_FrontLeftHip /= 1.2;
    walk_FrontLeftLeg /= 1.2;

    walk_BackLeftHip /= 1.2;
    walk_BackLeftLeg /= 1.2;

    walk_BackRightHip /= 1.2;
    walk_BackRightLeg /= 1.2;

    walk_RightArm /= 1.2;
    walk_RightElbow /= 1.2;

    walk_LeftArm /= 1.2;
    walk_LeftElbow /= 1.2;

    walk_torso /= 1.2;
    walk_front /= 1.2;
    walk_butt /= 1.2;

    wave_RightElbow /= 1.2;

    if (Math.abs(walk_FrontRightHip + walk_FrontRightLeg +
    walk_FrontLeftHip + walk_FrontLeftLeg +
    walk_BackLeftHip + walk_BackLeftLeg +
    walk_BackLeftHip + walk_BackLeftLeg +
    walk_BackRightHip + walk_BackRightLeg +
    walk_RightArm + walk_RightElbow +
    walk_LeftArm + walk_LeftArm + 
    wave_RightElbow + walk_torso + walk_front +
    walk_butt)
    < 0.1 ){
      standEnabled = 0;
    }
  }

  if (waveEnabled == 1){
    if (walk_LeftShoulder > -15) {
      walk_LeftShoulder -= 0.4 ; 
    }
    if (moveToPos == 0){
      wave_RightElbow -= 2;
      if (wave_RightElbow < -110){
        moveToPos = 1;
      }
    }
    wave_RightElbow -= (Math.sin(g_seconds*8));
  }

  if (holdingStaff == 1){
    // Set Shoulders to 0
    walk_RightShoulder = 0;
    walk_LeftShoulder = 0;
    // Set Elbows to 0
    wave_RightElbow = 0;
    walk_LeftElbow = 0;
    // Set Wave to 0
    walk_RightElbow = 0;

    staff_rightShoulderForwards = -30;
    staff_rightShoulderSideways = 20;
    staff_rightElbowForwards = -100;
    staff_rightElbowSideways = 80;

    staff_leftShoulderForwards = -30;
    staff_leftShoulderSideways= -20;
    staff_leftElbowForwards = -160;
    staff_leftElbowSideways= -40;

    staff_x= 180;
    staff_z= -90;
    staff_y= 45;

  } else {
    staff_rightShoulderForwards = 0;
    staff_rightShoulderSideways= 0;
    staff_rightElbowForwards = 0
    staff_rightElbowSideways = 0;

    staff_leftShoulderForwards = 0;
    staff_leftShoulderSideways= 0;
    staff_leftElbowForwards = 0;
    staff_leftElbowSideways= 0;

    staff_x= 0;
    staff_y= 0;
    staff_z= 0;
  }

  if (perk_ears == 1){
    if (ear_left > -30){
      ear_left -= 2;
    } else {
      perk_ears = 0;
    }
    if (ear_right < 30){
      ear_right += 2;
    }
  } else {
    if (ear_left < 0){
      ear_left += 2;
    }
    if (ear_right > 0){
      ear_right -= 2;
    }
  }

}

function returnToZero(input){
  if (Math.abs(input) - 1 < 0) {
    input = 0;
  }

  if (input > 0){
    input -= 1;
  } else if (input < 0) {
    input += 1;
  }
  
  console.log(input);
  return input;
}

function covertCoordiantesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  // check the time at the start of the program
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalSlider, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleVert, 0, 0, 1);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clearColor(0.44, 0.59, 0.79, 1);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // LILLA BODY RENDERING
  //      const M = humanTorso
  //      const F = Front Deer Body
  //      const B = Back Deer Body
  //      const S = Staff
  // Each of these are core matrixes that are independent from eachother
  // Allowing for independent rotation and movement, while still acting as
  // one unit

  const M = new Matrix4();

  var frontTorso = new Sphere();
  frontTorso.color = [0.93, 0.913, 0.768, 1.0];
  frontTorso.matrix.setTranslate(-0.13, 0.08, 0.1);
  frontTorso.matrix.translate(g_lillia_x, g_lillia_y, g_lillia_z);
  frontTorso.matrix.translate(0, walk_torso, 0);
  frontTorso.matrix.rotate(idleWait_torso, 0, 0, 1);
  frontTorso.matrix.rotate(g_torsoAngle, 0, 0, 1);
  frontTorso.matrix.rotate(g_wholeBodyAngle, 0, 0, 1);
  M.set(frontTorso.matrix);
  frontTorso.matrix.scale(0.525, 0.675, 0.625);
  frontTorso.render();

  var LowerWaist = new Cylinder();
  LowerWaist.drawTops = 0;
  LowerWaist.segments = 6;
  LowerWaist.length = 0.2;
  LowerWaist.frontTaper = 0.35;
  LowerWaist.backTaper = 0.8;
  LowerWaist.matrix.set(M);
  LowerWaist.matrix.translate(-0.06, 0.21, 0);
  LowerWaist.matrix.rotate(90, 1, 0.37, 0);
  M.set(LowerWaist.matrix);
  LowerWaist.matrix.scale(0.9, 0.93, 1);
  LowerWaist.render();

  var MidWaist = new Cylinder(); // Want to add a joint here
  MidWaist.drawTops = 0;
  MidWaist.segments = 6;
  MidWaist.length = 0.1;
  MidWaist.frontTaper = 0.4;
  MidWaist.backTaper = 0.35;
  MidWaist.matrix.set(M);
  MidWaist.matrix.rotate(-90, 1, 0.37, 0);
  MidWaist.matrix.translate(-0.01, 0.08, 0);
  // (-0.2, 0.37, 0.1)
  MidWaist.matrix.rotate(90, 1, 0.2, 0);
  M.set(MidWaist.matrix);
  MidWaist.matrix.scale(0.9, 0.93, 1);
  MidWaist.render();

  var brest = new Cylinder();
  brest.drawTops = 0;
  brest.segments = 8;
  brest.length = 0.07;
  brest.frontTaper = 0.49;
  brest.backTaper = 0.3;
  brest.matrix.set(M); // added
  brest.matrix.rotate(-90, 1, 0.2, 0); // added
  brest.matrix.translate(-0.005, 0.02, 0);
  //brest.matrix.setTranslate(-0.205, 0.39, 0.1);
  brest.matrix.rotate(90, 1, -0.3, 0);
  M.set(brest.matrix); // added
  brest.matrix.scale(0.9, 0.95, 1);
  brest.render();

  var chest = new Cylinder();
  chest.drawTops = 0;
  chest.segments = 8;
  chest.length = 0.09;
  chest.frontTaper = 0.435;
  chest.backTaper = 0.5;
  chest.matrix.set(M);
  chest.matrix.rotate(-90, 1, -0.3, 0);
  chest.matrix.translate(0.03, 0.085, 0);
  //chest.matrix.setTranslate(-0.175, 0.475, 0.1);
  chest.matrix.rotate(90, 1, -0.3, 0);
  M.set(chest.matrix);
  chest.matrix.scale(0.9, 0.95, 1);
  chest.render();

  var upperChest = new Cylinder();
  upperChest.drawTops = 0;
  upperChest.segments = 8;
  upperChest.length = 0.09;
  upperChest.frontTaper = 0.4;
  upperChest.backTaper = 0.38;
  upperChest.color = [0.93, 0.76, 0.74, 1.0];
  upperChest.matrix.set(M);
  upperChest.matrix.rotate(-90, 1, -0.3, 0);
  upperChest.matrix.translate(0.01, 0.027, 0);
  //upperChest.matrix.setTranslate(-0.17, 0.5, 0.1);
  upperChest.matrix.rotate(90, 1, -0.15, 0);
  M.set(upperChest.matrix);
  upperChest.matrix.scale(0.9, 1.2, 1);
  upperChest.render();

  var neckBase = new Cylinder();
  neckBase.drawTops = 0;
  neckBase.segments = 8;
  neckBase.length = 0.04;
  neckBase.frontTaper = 0.2;
  neckBase.backTaper = 0.4;
  neckBase.color = [0.93, 0.76, 0.74, 1.0];
  neckBase.matrix.set(M);
  neckBase.matrix.rotate(-90, 1, -0.15, 0);
  neckBase.matrix.translate(0, 0.03, 0);
  //neckBase.matrix.setTranslate(-0.17, 0.53, 0.1);
  neckBase.matrix.rotate(90, 1, -0.15, 0);
  M.set(neckBase.matrix);
  neckBase.matrix.scale(0.9, 1.2, 1);
  neckBase.render();

  var neck = new Cylinder();
  neck.drawTops = 0;
  neck.segments = 6;
  neck.length = 0.2;
  neck.frontTaper = 0.13;
  neck.backTaper = 0.23;
  neck.color = [0.93, 0.76, 0.74, 1.0];
  neck.matrix.set(M);
  neck.matrix.rotate(-90, 1, -0.15, 0);
  neck.matrix.translate(0, 0.1, 0);
  //neck.matrix.setTranslate(-0.159, 0.68, 0.1);
  neck.matrix.rotate(90, 1, 0, 0);
  M.set(neck.matrix);
  neck.matrix.scale(0.9, 1.2, 1);
  neck.render();

  // RIGHT ARM

  const RA = new Matrix4(); // New Joint

  var frontRightShoulder = new Sphere();
  frontRightShoulder.drawTops = 0;
  frontRightShoulder.segments = 6;
  frontRightShoulder.color = [0.93, 0.76, 0.74, 1.0];
  frontRightShoulder.matrix.set(M);
  frontRightShoulder.matrix.rotate(-90, 1, -0.15, 0);
  frontRightShoulder.matrix.translate(0, -0.145, 0.1);
  frontRightShoulder.matrix.rotate(walk_RightShoulder, 1, 0, 0); // idle sideways
  frontRightShoulder.matrix.rotate(idleWait_arms, 1, 0, 0); // idle sideways
  frontRightShoulder.matrix.rotate(g_rightArmSideways, 1, 0, 0); // rotation sideways
  frontRightShoulder.matrix.rotate(walk_RightArm, 0, 0, 1); // walk Sway
  frontRightShoulder.matrix.rotate(idleWait_arms, 0, 0, 1); // idle forwards
  frontRightShoulder.matrix.rotate(g_rightArmForwards, 0, 0, 1); // Rotation forward
  frontRightShoulder.matrix.rotate(staff_rightShoulderForwards, 0, 0, 1); // Staff Rotation
  frontRightShoulder.matrix.rotate(staff_rightShoulderSideways, 1, 0, 0); // Staff Rotation

  //frontRightShoulder.matrix.setTranslate(-0.13, 0.49, 0.2);
  RA.set(frontRightShoulder.matrix);
  frontRightShoulder.matrix.scale(0.2, 0.2, 0.35);
  frontRightShoulder.render();

  var frontRightArm = new Cylinder();
  frontRightArm.drawTops = 0;
  frontRightArm.segments = 6;
  frontRightArm.length = 0.25;
  frontRightArm.frontTaper = 0.13;
  frontRightArm.backTaper = 0.11;
  frontRightArm.color = [0.93, 0.76, 0.74, 1.0];
  frontRightArm.matrix.set(RA);
  frontRightArm.matrix.translate(0, 0.008, 0.02);
  //frontRightArm.matrix.setTranslate(-0.13, 0.5, 0.22);
  frontRightArm.matrix.rotate(60, 1, 0, 0);
  RA.set(frontRightArm.matrix);
  frontRightArm.matrix.scale(0.9, 1.2, 1);
  frontRightArm.render();

  const RAE = new Matrix4(); // New Joint

  var frontRightElbow = new Sphere();
  frontRightElbow.segments = 6;
  frontRightElbow.color = [0.93, 0.76, 0.74, 1.0];
  frontRightElbow.matrix.set(RA);
  frontRightElbow.matrix.rotate(-60, 1, 0, 0);
  frontRightElbow.matrix.translate(0, -0.22, 0.12);
  //frontRightElbow.matrix.setTranslate(-0.13, 0.275, 0.35);
  frontRightElbow.matrix.rotate(wave_RightElbow, 1, 0, 0); // walking sway
  frontRightElbow.matrix.rotate(g_rightElbowSideways, 1, 0, 0); // modify for rotation (sideways)
  frontRightElbow.matrix.rotate(walk_RightElbow, 0, 0, 1); // walking sway
  frontRightElbow.matrix.rotate(g_rightElbowForwards, 0, 0, 1); // modify for rotation (back and fourth)
  frontRightElbow.matrix.rotate(staff_rightElbowForwards, 0, 0, 1); // modify for staff
  frontRightElbow.matrix.rotate(staff_rightElbowSideways, 1, 0, 0); // modify for staff
  RAE.set(frontRightElbow.matrix);
  //frontRightElbow.matrix.scale(0.65, 0.65, 0.35);
  frontRightElbow.matrix.scale(0.12, 0.12, 0.12);
  frontRightElbow.render();

  var frontRightForarm = new Cylinder();
  frontRightForarm.drawTops = 0;
  frontRightForarm.segments = 6;
  frontRightForarm.length = 0.27;
  frontRightForarm.frontTaper = 0.1;
  frontRightForarm.backTaper = 0.08;
  frontRightForarm.color = [0.93, 0.76, 0.74, 1.0];
  frontRightForarm.matrix.set(RAE);
  frontRightForarm.matrix.translate(0, 0, 0.01);
  //frontRightForarm.matrix.setTranslate(-0.13, 0.265, 0.355);
  frontRightForarm.matrix.rotate(60, 1, 0, 0);
  RAE.set(frontRightForarm.matrix);
  //frontRightForarm.matrix.scale(4, 4.1, 4.7);
  frontRightForarm.matrix.scale(0.9, 1.2, 1);
  frontRightForarm.render();

  var frontRighthand = new Sphere();
  frontRighthand.drawTops = 0;
  frontRighthand.segments = 6;
  frontRighthand.color = [0.93, 0.76, 0.74, 1.0];
  frontRighthand.matrix.set(RAE);
  frontRighthand.matrix.rotate(-60, 1, 0, 0);
  frontRighthand.matrix.translate(0, -0.25, 0.12);
  //frontRighthand.matrix.setTranslate(-0.13, 0.015, 0.48);
  RAE.set(frontRighthand.matrix);
  frontRighthand.matrix.scale(0.12, 0.18, 0.16);
  frontRighthand.render();

  // LEFT ARM

  const LA = new Matrix4(); // New Joint

  var frontLeftShoulder = new Sphere();
  frontLeftShoulder.drawTops = 0;
  frontLeftShoulder.segments = 6;
  frontLeftShoulder.color = [0.93, 0.76, 0.74, 1.0];
  frontLeftShoulder.matrix.set(M);
  frontLeftShoulder.matrix.rotate(-90, 1, -0.15, 0);
  frontLeftShoulder.matrix.translate(0, -0.14, -0.1);
  frontLeftShoulder.matrix.rotate(walk_LeftShoulder, 1, 0, 0); // idle sideways
  frontLeftShoulder.matrix.rotate(idleWait_arms, 1, 0, 0); // idle sideways
  frontLeftShoulder.matrix.rotate(g_leftArmSideways, 1, 0, 0); // rotation sideways
  frontLeftShoulder.matrix.rotate(walk_LeftArm, 0, 0, 1); // walk Sway
  frontLeftShoulder.matrix.rotate(idleWait_arms, 0, 0, 1); // idle sideways
  frontLeftShoulder.matrix.rotate(g_leftArmForwards, 0, 0, 1); // Rotation forward
  frontLeftShoulder.matrix.rotate(staff_leftShoulderForwards, 0, 0, 1); // Staff Rotation
  frontLeftShoulder.matrix.rotate(staff_leftShoulderSideways, 1, 0, 0); // Staff Rotation
  //frontLeftShoulder.matrix.setTranslate(-0.13, 0.49, 0.0);
  //frontLeftShoulder.matrix.rotate(-60, 0, 0, 1);    // modify for more position
  LA.set(frontLeftShoulder.matrix);
  frontLeftShoulder.matrix.scale(0.2, 0.2, 0.35);
  frontLeftShoulder.render();

  var frontLeftArm = new Cylinder();
  frontLeftArm.drawTops = 0;
  frontLeftArm.segments = 6;
  frontLeftArm.length = 0.25;
  frontLeftArm.frontTaper = 0.11;
  frontLeftArm.backTaper = 0.13;
  frontLeftArm.color = [0.93, 0.76, 0.74, 1.0];
  frontLeftArm.matrix.set(LA);
  frontLeftArm.matrix.translate(0, -0.22, -0.15);
  //frontLeftArm.matrix.setTranslate(-0.13, 0.27, -0.15);
  frontLeftArm.matrix.rotate(60, -1, 0, 0);
  LA.set(frontLeftArm.matrix);
  frontLeftArm.matrix.scale(0.9, 1.2, 1);
  frontLeftArm.render();

  const LAE = new Matrix4(); // New Joint

  var frontLeftElbow = new Sphere();
  frontLeftElbow.drawTops = 0;
  frontLeftElbow.segments = 6;
  frontLeftElbow.color = [0.93, 0.76, 0.74, 1.0];
  frontLeftElbow.matrix.set(LA);
  frontLeftElbow.matrix.rotate(-60, -1, 0, 0);
  frontLeftElbow.matrix.translate(0, 0, 0);
  //frontLeftElbow.matrix.setTranslate(-0.13, 0.27, -0.15);
  frontLeftElbow.matrix.rotate(g_leftElbowSideways, 1, 0, 0); // modify for rotation (sideways)
  frontLeftElbow.matrix.rotate(walk_LeftElbow, 0, 0, 1); // walking modification
  frontLeftElbow.matrix.rotate(g_leftElbowForwards, 0, 0, 1); // modify for rotation (back and fourth)
  frontLeftElbow.matrix.rotate(staff_leftElbowForwards, 0, 0, 1); // modify for staff
  frontLeftElbow.matrix.rotate(staff_leftElbowSideways, 1, 0, 0); // modify for staff
  LAE.set(frontLeftElbow.matrix);
  frontLeftElbow.matrix.scale(0.12, 0.12, 0.12);
  frontLeftElbow.render();

  var frontLeftForarm = new Cylinder();
  frontLeftForarm.drawTops = 0;
  frontLeftForarm.segments = 6;
  frontLeftForarm.length = 0.27;
  frontLeftForarm.frontTaper = 0.08;
  frontLeftForarm.backTaper = 0.1;
  frontLeftForarm.color = [0.93, 0.76, 0.74, 1.0];
  frontLeftForarm.matrix.set(LAE);
  frontLeftForarm.matrix.translate(0, -0.245, -0.14);
  //frontLeftForarm.matrix.setTranslate(-0.13, 0.03, -0.29);
  frontLeftForarm.matrix.rotate(60, -1, 0, 0);
  LAE.set(frontLeftForarm.matrix);
  frontLeftForarm.matrix.scale(0.9, 1.2, 1);
  frontLeftForarm.render();

  var frontLefthand = new Sphere();
  frontLefthand.drawTops = 0;
  frontLefthand.segments = 6;
  frontLefthand.color = [0.93, 0.76, 0.74, 1.0];
  frontLefthand.matrix.set(LAE);
  frontLefthand.matrix.rotate(-60, -1, 0, 0);
  frontLefthand.matrix.translate(0, 0, 0.015);
  //frontLefthand.matrix.setTranslate(-0.13, 0.015, -0.28);
  LAE.set(frontLefthand.matrix);
  frontLefthand.matrix.scale(0.12, 0.18, 0.16);
  frontLefthand.render();

  // HORSE BODY

  const B = new Matrix4(); // New Joint

  var backTorso = new Cylinder();
  backTorso.drawTops = 0;
  backTorso.segments = 8;
  backTorso.length = 0.3;
  backTorso.color = [0.93, 0.913, 0.768, 1.0];
  backTorso.frontTaper = 0.6;
  backTorso.backTaper = 0.9;
  backTorso.matrix.setTranslate(0.0, 0.037, 0.1);
  backTorso.matrix.translate(g_lillia_x, g_lillia_y, g_lillia_z);
  backTorso.matrix.rotate(90, -0.1, 1, 0);
  backTorso.matrix.rotate(walk_butt, 1, 0, 0); // number to move back up and down
  backTorso.matrix.rotate(-g_backBodyAngle, 1, 0, 0); // number to move back up and down
  backTorso.matrix.rotate(-g_wholeBodyAngle, 1, 0, 0);
  B.set(backTorso.matrix);
  backTorso.matrix.scale(0.9, 0.8, 1);
  backTorso.render();

  var butt = new Sphere();
  butt.segments = 12;
  butt.color = [0.93, 0.913, 0.768, 1.0];
  butt.matrix.set(B);
  butt.matrix.translate(0, -0.002, 0.32);
  butt.matrix.rotate(-90, -0.1, 1, 0);
  //butt.matrix.setTranslate(0.31, 0.06, 0.1);
  butt.matrix.rotate(55, 0, 0, 1);
  B.set(butt.matrix);
  butt.matrix.scale(0.9, 0.7, 0.97);
  butt.render();

  var tail = new Sphere();
  tail.drawTops = 0;
  tail.segments = 8;
  tail.color = [0.93, 0.913, 0.768, 1.0]; // Color differnt just to see joint
  tail.matrix.set(B);
  tail.matrix.rotate(-55, 0, 0, 1);
  tail.matrix.translate(0.15, 0.26, 0);
  //tail.matrix.setTranslate(0.47, 0.32, 0.1);
  tail.matrix.scale(0.4, 0.4, 0.4);
  tail.render();

  const BLL = new Matrix4();

  var backLeftHip = new Cylinder();
  backLeftHip.drawTops = 0;
  backLeftHip.segments = 8;
  backLeftHip.length = 0.5;
  backLeftHip.color = [0.93, 0.913, 0.768, 1.0];
  backLeftHip.backTaper = 0.45;
  backLeftHip.matrix.set(B);
  backLeftHip.matrix.rotate(-55, 0, 0, 1);
  backLeftHip.matrix.translate(-0.02, -0.06, -0.1);
  //backLeftHip.matrix.setTranslate(0.3, 0, 0);
  backLeftHip.matrix.rotate(90, 1, 0, 0);
  backLeftHip.matrix.rotate(walk_BackLeftHip, 0, 1, 0); // walk thing
  backLeftHip.matrix.rotate(g_backLeftHip, 0, 1, 0); // Change to rotate hip
  //backLeftHip.matrix.rotate(45, 1, 0.2, 0);
  //backLeftHip.matrix.rotate(10, 0, 2, 0);
  BLL.set(backLeftHip.matrix);
  backLeftHip.matrix.scale(0.55, 0.55, 0.55);
  backLeftHip.render();

  var backLeftThigh = new Cylinder();
  backLeftThigh.drawTops = 0;
  backLeftThigh.segments = 6;
  backLeftThigh.length = 0.15;
  backLeftThigh.color = [0.93, 0.913, 0.768, 1.0];
  backLeftThigh.frontTaper = 0.25;
  backLeftThigh.backTaper = 0.15;
  backLeftThigh.matrix.set(BLL);
  backLeftThigh.matrix.rotate(-32, 0, 1, 0);
  backLeftThigh.matrix.rotate(-90, 1.6, 0, 0);
  backLeftThigh.matrix.translate(0.14, -0.22, 0);
  //backLeftThigh.matrix.setTranslate(0.44, -0.22, 0);
  backLeftThigh.matrix.rotate(90, 1, 1, 0);
  BLL.set(backLeftThigh.matrix);
  backLeftThigh.render();

  const BLLK = new Matrix4();

  var backLeftKnee = new Sphere();
  backLeftKnee.drawTops = 0;
  backLeftKnee.segments = 6;
  backLeftKnee.color = [0.93, 0.913, 0.768, 1.0];
  backLeftKnee.matrix.set(BLL);
  backLeftKnee.matrix.rotate(-90, 1, 1, 0);
  backLeftKnee.matrix.translate(0.1, -0.11, 0);
  //backLeftKnee.matrix.setTranslate(0.55, -0.33, 0);
  backLeftKnee.matrix.rotate(walk_BackLeftLeg, 0, 0, 1); // walk thing
  backLeftKnee.matrix.rotate(g_backLeftLeg, 0, 0, 1); // Rotate leg here
  BLLK.set(backLeftKnee.matrix);
  backLeftKnee.matrix.scale(0.21, 0.21, 0.21);
  backLeftKnee.render();

  var backLeftCalf = new Cylinder();
  backLeftCalf.drawTops = 0;
  backLeftCalf.segments = 6;
  backLeftCalf.length = 0.18;
  backLeftCalf.color = [0.93, 0.913, 0.768, 1.0];
  backLeftCalf.frontTaper = 0.18;
  backLeftCalf.backTaper = 0.1;
  backLeftCalf.matrix.set(BLLK);
  backLeftCalf.matrix.translate(0, -0.02, 0);
  //backLeftCalf.matrix.setTranslate(0.55, -0.35, 0);
  backLeftCalf.matrix.rotate(90, 1, -0.2, 0);
  BLLK.set(backLeftCalf.matrix);
  backLeftCalf.render();

  var backLeftShin = new Cylinder();
  backLeftShin.drawTops = 0;
  backLeftShin.segments = 6;
  backLeftShin.length = 0.3;
  backLeftShin.color = [0.54, 0.23, 0.16, 1.0];
  backLeftShin.frontTaper = 0.1;
  backLeftShin.backTaper = 0.11;
  backLeftShin.matrix.set(BLLK);
  backLeftShin.matrix.rotate(-90, 1, -0.2, 0);
  backLeftShin.matrix.translate(-0.035, -0.18, 0);
  //backLeftShin.matrix.setTranslate(0.515, -0.525, 0);
  backLeftShin.matrix.rotate(90, 1, -0.2, 0);
  BLLK.set(backLeftShin.matrix);
  backLeftShin.render();

  var backLeftHoof = new Cylinder();
  backLeftHoof.drawTops = 0;
  backLeftHoof.segments = 6;
  backLeftHoof.length = 0.05;
  backLeftHoof.color = [0.18, 0.1, 0.1, 1.0];
  backLeftHoof.frontTaper = 0.11;
  backLeftHoof.backTaper = 0.17;
  backLeftHoof.matrix.set(BLLK);
  backLeftHoof.matrix.rotate(-90, 1, -0.2, 0);
  backLeftHoof.matrix.translate(-0.055, -0.278, 0);
  //backLeftHoof.matrix.setTranslate(0.46, -0.8, 0);
  backLeftHoof.matrix.rotate(90, 1, 0, 0);
  backLeftHoof.render();

  const BRL = new Matrix4(); // New Joint

  var backRightHip = new Cylinder();
  backRightHip.drawTops = 0;
  backRightHip.segments = 8;
  backRightHip.length = 0.5;
  backRightHip.color = [0.93, 0.913, 0.768, 1.0];
  backRightHip.backTaper = 0.45;
  backRightHip.matrix.set(B);
  backRightHip.matrix.rotate(-55, 0, 0, 1);
  backRightHip.matrix.translate(-0.02, -0.06, 0.1);
  //backRightHip.matrix.setTranslate(0.3, 0, 0.2);
  backRightHip.matrix.rotate(90, 1, 0, 0);
  backRightHip.matrix.rotate(walk_BackRightHip, 0, 1, 0); // walk thing
  backRightHip.matrix.rotate(g_backRightHip, 0, 1, 0); // Change to rotate hip
  BRL.set(backRightHip.matrix);
  backRightHip.matrix.scale(0.55, 0.55, 0.55);
  backRightHip.render();

  var backRightThigh = new Cylinder();
  backRightThigh.drawTops = 0;
  backRightThigh.segments = 6;
  backRightThigh.length = 0.15;
  backRightThigh.color = [0.93, 0.913, 0.768, 1.0];
  backRightThigh.frontTaper = 0.25;
  backRightThigh.backTaper = 0.15;
  backRightThigh.matrix.set(BRL);
  backRightThigh.matrix.rotate(-32, 0, 1, 0);
  backRightThigh.matrix.rotate(-90, 1.6, 0, 0);
  backRightThigh.matrix.translate(0.14, -0.22, 0);
  //backRightThigh.matrix.setTranslate(0.44, -0.22, 0.2);
  backRightThigh.matrix.rotate(90, 1, 1, 0);
  BRL.set(backRightThigh.matrix);
  backRightThigh.render();

  const BRLK = new Matrix4();

  var backRightKnee = new Sphere();
  backRightKnee.drawTops = 0;
  backRightKnee.segments = 6;
  backRightKnee.color = [0.93, 0.913, 0.768, 1.0]; // Color differnt just to see joint
  backRightKnee.matrix.set(BRL);
  backRightKnee.matrix.rotate(-90, 1, 1, 0);
  backRightKnee.matrix.translate(0.1, -0.11, 0);
  //backRightKnee.matrix.setTranslate(0.55, -0.33, 0.2);
  backRightKnee.matrix.rotate(walk_BackRightLeg, 0, 0, 1); // walk thing
  backRightKnee.matrix.rotate(g_backRightLeg, 0, 0, 1); // Rotate leg here
  BRLK.set(backRightKnee.matrix);
  backRightKnee.matrix.scale(0.21, 0.21, 0.21);
  backRightKnee.render();

  var backRightCalf = new Cylinder();
  backRightCalf.drawTops = 0;
  backRightCalf.segments = 6;
  backRightCalf.length = 0.18;
  backRightCalf.color = [0.93, 0.913, 0.768, 1.0];
  backRightCalf.frontTaper = 0.18;
  backRightCalf.backTaper = 0.1;
  backRightCalf.matrix.set(BRLK);
  backRightCalf.matrix.translate(0, -0.02, 0);
  //backRightCalf.matrix.setTranslate(0.55, -0.35, 0.2);
  backRightCalf.matrix.rotate(90, 1, -0.2, 0);
  BRLK.set(backRightCalf.matrix);
  backRightCalf.render();

  var backRightShin = new Cylinder();
  backRightShin.drawTops = 0;
  backRightShin.segments = 6;
  backRightShin.length = 0.3;
  backRightShin.color = [0.54, 0.23, 0.16, 1.0];
  backRightShin.frontTaper = 0.1;
  backRightShin.backTaper = 0.11;
  backRightShin.matrix.set(BRLK);
  backRightShin.matrix.rotate(-90, 1, -0.2, 0);
  backRightShin.matrix.translate(-0.035, -0.18, 0);
  //backRightShin.matrix.setTranslate(0.515, -0.525, 0.2);
  backRightShin.matrix.rotate(90, 1, -0.2, 0);
  BRLK.set(backRightShin.matrix);
  backRightShin.render();

  var backRightHoof = new Cylinder();
  backRightHoof.drawTops = 0;
  backRightHoof.segments = 6;
  backRightHoof.length = 0.05;
  backRightHoof.color = [0.18, 0.1, 0.1, 1.0];
  backRightHoof.frontTaper = 0.11;
  backRightHoof.backTaper = 0.17;
  backRightHoof.matrix.set(BRLK);
  backRightHoof.matrix.rotate(-90, 1, -0.2, 0);
  backRightHoof.matrix.translate(-0.055, -0.278, 0);
  //backRightHoof.matrix.setTranslate(0.46, -0.8, 0.2);
  backRightHoof.matrix.rotate(90, 1, 0, 0);
  backRightHoof.render();

  const F = new Matrix4(); // New Joint

  var midTorso = new Cylinder();
  midTorso.drawTops = 0;
  midTorso.segments = 8;
  midTorso.length = 0.15;
  midTorso.color = [0.93, 0.913, 0.768, 1.0];
  midTorso.frontTaper = 0.8;
  midTorso.backTaper = 0.6;
  midTorso.matrix.setTranslate(-0.1, 0.065, 0.1);
  midTorso.matrix.translate(g_lillia_x, g_lillia_y, g_lillia_z);
  midTorso.matrix.rotate(90, 0.25, 1, 0);
  midTorso.matrix.rotate(walk_front, 1, 0, 0); // rotate front here
  midTorso.matrix.rotate(g_frontBodyAngle, 1, 0, 0); // rotate front here
  midTorso.matrix.rotate(-g_wholeBodyAngle, 1, 0, 0); // rotate front here
  F.set(midTorso.matrix);
  midTorso.matrix.scale(0.8, 0.8, 1);
  midTorso.render();

  const FLL = new Matrix4(); // New Joint

  var FrontLeftFemur = new Cylinder();
  FrontLeftFemur.drawTops = 0;
  FrontLeftFemur.segments = 6;
  FrontLeftFemur.length = 0.45;
  FrontLeftFemur.color = [0.93, 0.913, 0.768, 1.0];
  FrontLeftFemur.frontTaper = 0.27;
  FrontLeftFemur.backTaper = 0.1;
  FrontLeftFemur.matrix.set(F);
  FrontLeftFemur.matrix.rotate(-90, 0.25, 1, 0);
  FrontLeftFemur.matrix.translate(-0.05, 0, -0.08);
  //FrontLeftFemur.matrix.setTranslate(-0.15, 0.1, 0.02);
  FrontLeftFemur.matrix.rotate(90, 1, 0, 0);
  FrontLeftFemur.matrix.rotate(walk_FrontLeftHip, 0, 1, 0); // walk
  FrontLeftFemur.matrix.rotate(g_frontLeftHip, 0, 1, 0); // rotate from here
  FLL.set(FrontLeftFemur.matrix);
  FrontLeftFemur.render();

  const FLLK = new Matrix4(); // New Joint

  var frontLefttKnee = new Sphere();
  frontLefttKnee.drawTops = 0;
  frontLefttKnee.segments = 6;
  frontLefttKnee.color = [0.93, 0.913, 0.768, 1.0];
  frontLefttKnee.matrix.set(FLL);
  FrontLeftFemur.matrix.rotate(5, 0, 1, 0);
  frontLefttKnee.matrix.rotate(-90, 1, 0, 0);
  frontLefttKnee.matrix.translate(0, -0.43, 0);
  //frontLefttKnee.matrix.setTranslate(-0.19, -0.365, 0.02);
  frontLefttKnee.matrix.rotate(walk_FrontLeftLeg, 0, 0, 1); // walk
  frontLefttKnee.matrix.rotate(g_frontLeftLeg, 0, 0, 1); // rotate from here
  FLLK.set(frontLefttKnee.matrix);
  frontLefttKnee.matrix.scale(0.14, 0.2, 0.14);
  frontLefttKnee.render();

  var frontLefttShin = new Cylinder();
  frontLefttShin.drawTops = 0;
  frontLefttShin.segments = 6;
  frontLefttShin.length = 0.45;
  frontLefttShin.color = [0.54, 0.23, 0.16, 1.0];
  frontLefttShin.frontTaper = 0.065;
  frontLefttShin.backTaper = 0.11;
  frontLefttShin.matrix.set(FLLK);
  frontLefttShin.matrix.translate(0, -0.01, 0);
  //frontLefttShin.matrix.setTranslate(-0.19, -0.4, 0.02);
  frontLefttShin.matrix.rotate(90, 1, -0.1, 0);
  FLLK.set(frontLefttShin.matrix);
  frontLefttShin.render();

  var frontLefttHoof = new Cylinder();
  frontLefttHoof.drawTops = 0;
  frontLefttHoof.segments = 6;
  frontLefttHoof.length = 0.05;
  frontLefttHoof.color = [0.18, 0.1, 0.1, 1.0];
  frontLefttHoof.frontTaper = 0.11;
  frontLefttHoof.backTaper = 0.17;
  frontLefttHoof.matrix.set(FLLK);
  frontLefttHoof.matrix.rotate(-90, 1, -0.1, 0);
  frontLefttHoof.matrix.translate(-0.045, -0.43, 0);
  //frontLefttHoof.matrix.setTranslate(-0.27, -0.8, 0.02);
  frontLefttHoof.matrix.rotate(90, 1, 0.1, 0);
  frontLefttHoof.render();

  const FRL = new Matrix4(); // New Joint

  var FrontRightFemur = new Cylinder();
  FrontRightFemur.drawTops = 0;
  FrontRightFemur.segments = 6;
  FrontRightFemur.length = 0.45;
  FrontRightFemur.color = [0.93, 0.913, 0.768, 1.0];
  FrontRightFemur.frontTaper = 0.27;
  FrontRightFemur.backTaper = 0.1;
  FrontRightFemur.matrix.set(F);
  FrontRightFemur.matrix.rotate(-90, 0.25, 1, 0);
  FrontRightFemur.matrix.translate(-0.05, 0, 0.08);
  //FrontRightFemur.matrix.setTranslate(-0.15, 0.1, 0.18);
  FrontRightFemur.matrix.rotate(90, 1, 0, 0);
  FrontRightFemur.matrix.rotate(walk_FrontRightHip, 0, 1, 0); // walk
  FrontRightFemur.matrix.rotate(g_frontRightHip, 0, 1, 0); // rotate from here
  FRL.set(FrontRightFemur.matrix);
  FrontRightFemur.render();

  const FRLK = new Matrix4(); // New Joint

  var frontRighttKnee = new Sphere();
  frontRighttKnee.drawTops = 0;
  frontRighttKnee.segments = 6;
  frontRighttKnee.color = [0.93, 0.913, 0.768, 1.0];
  frontRighttKnee.matrix.set(FRL);
  frontRighttKnee.matrix.rotate(5, 0, 1, 0);
  frontRighttKnee.matrix.rotate(-90, 1, 0, 0);
  frontRighttKnee.matrix.translate(-0.04, -0.43, 0);
  //frontRighttKnee.matrix.setTranslate(-0.19, -0.365, 0.18);
  frontRighttKnee.matrix.rotate(walk_FrontRightLeg, 0, 0, 1); // walk
  frontRighttKnee.matrix.rotate(g_frontRightLeg, 0, 0, 1); // rotate from here
  FRLK.set(frontRighttKnee.matrix);
  frontRighttKnee.matrix.scale(0.14, 0.2, 0.14);
  frontRighttKnee.render();

  var frontRightShin = new Cylinder();
  frontRightShin.drawTops = 0;
  frontRightShin.segments = 6;
  frontRightShin.length = 0.45;
  frontRightShin.color = [0.54, 0.23, 0.16, 1.0];
  frontRightShin.frontTaper = 0.065;
  frontRightShin.backTaper = 0.11;
  frontRightShin.matrix.set(FRLK);
  frontRightShin.matrix.translate(0, -0.01, 0);
  //frontRightShin.matrix.setTranslate(-0.19, -0.4, 0.18);
  frontRightShin.matrix.rotate(90, 1, -0.2, 0);
  FRLK.set(frontRightShin.matrix);
  frontRightShin.render();

  var frontRightHoof = new Cylinder();
  frontRightHoof.drawTops = 0;
  frontRightHoof.segments = 6;
  frontRightHoof.length = 0.05;
  frontRightHoof.color = [0.18, 0.1, 0.1, 1.0];
  frontRightHoof.frontTaper = 0.11;
  frontRightHoof.backTaper = 0.17;
  frontRightHoof.matrix.set(FRLK);
  frontRightHoof.matrix.rotate(-90, 1, -0.2, 0);
  frontRightHoof.matrix.translate(-0.085, -0.422, 0);
  //frontRightHoof.matrix.setTranslate(-0.27, -0.8, 0.18);
  frontRightHoof.matrix.rotate(90, 1, 0, 0);
  frontRightHoof.render();

  // HEAD

  const HD = new Matrix4(); // New Joint

  var lowerJaw = new Cylinder();
  lowerJaw.noShade = 1;
  lowerJaw.drawTops = 0;
  lowerJaw.segments = 8;
  lowerJaw.length = 0.02;
  lowerJaw.frontTaper = 0.29;
  lowerJaw.backTaper = 0.15;
  lowerJaw.color = [0.93, 0.76, 0.74, 1.0];
  lowerJaw.matrix.set(M);
  lowerJaw.matrix.rotate(g_headSideways, 1, 0, 0); // Sideways
  lowerJaw.matrix.rotate(idleWait_head, 1, 0, 0);
  lowerJaw.matrix.rotate(g_headForwards, 0, 0, 1); // Up / Down
  lowerJaw.matrix.translate(-0.02, -0.01, 0);
  //lowerJaw.matrix.setTranslate(-0.185, 0.62, 0.1);
  lowerJaw.matrix.rotate(90, 1, 0, 0);
  HD.set(lowerJaw.matrix);
  lowerJaw.matrix.scale(1.25, 1.2, 1);
  lowerJaw.render();

  var Jaw = new Cylinder();
  Jaw.noShade = 1;
  Jaw.drawTops = 0;
  Jaw.segments = 8;
  Jaw.length = 0.05;
  Jaw.frontTaper = 0.35;
  Jaw.backTaper = 0.28;
  Jaw.color = [0.93, 0.76, 0.74, 1.0];
  Jaw.matrix.set(HD);
  Jaw.matrix.rotate(-90, 1, 0, 0);
  Jaw.matrix.translate(0, 0.05, 0);
  //Jaw.matrix.setTranslate(-0.185, 0.6701, 0.1);
  Jaw.matrix.rotate(90, 1, 0, 0);
  HD.set(Jaw.matrix);
  Jaw.matrix.scale(1.25, 1.2, 1);
  Jaw.render();

  var mouth = new Sphere();
  mouth.segments = 8;
  mouth.color = [0.73, 0.42, 0.44, 1.0];
  mouth.matrix.set(HD);
  mouth.matrix.rotate(-90, 1, 0, 0);
  mouth.matrix.translate(-0.1, -0.02, 0);
  //mouth.matrix.setTranslate(-0.283, 0.66, 0.1);
  mouth.matrix.scale(0.04, 0.04, 0.08);
  mouth.render();

  var lowerFace = new Cylinder();
  lowerFace.noShade = 1;
  lowerFace.drawTops = 0;
  lowerFace.segments = 8;
  lowerFace.length = 0.03;
  lowerFace.frontTaper = 0.26;
  lowerFace.backTaper = 0.24;
  lowerFace.color = [0.93, 0.76, 0.74, 1.0];
  lowerFace.matrix.set(HD);
  lowerFace.matrix.rotate(-90, 1, 0, 0);
  lowerFace.matrix.translate(0, 0.03, 0);
  //lowerFace.matrix.setTranslate(-0.185, 0.7, 0.1);
  lowerFace.matrix.rotate(90, 1, 0, 0);
  HD.set(lowerFace.matrix);
  lowerFace.matrix.scale(1.8, 1.7, 1);
  lowerFace.render();

  var nose = new Sphere();
  nose.segments = 8;
  nose.color = [0.95 * 1.05, 0.78 * 1.05, 0.76 * 1.05, 1.0];
  nose.matrix.set(HD);
  nose.matrix.rotate(-90, 1, 0, 0);
  nose.matrix.translate(-0.11, 0, 0);
  //nose.matrix.setTranslate(-0.295, 0.7, 0.1);
  nose.matrix.scale(0.06, 0.06, 0.06);
  nose.render();

  var midFace = new Cylinder();
  midFace.noShade = 1;
  midFace.drawTops = 0;
  midFace.segments = 8;
  midFace.length = 0.03;
  midFace.frontTaper = 0.22;
  midFace.backTaper = 0.26;
  midFace.color = [0.93, 0.76, 0.74, 1.0];
  midFace.matrix.set(HD);
  midFace.matrix.rotate(-90, 1, 0, 0);
  midFace.matrix.translate(0, 0.03, 0);
  //midFace.matrix.setTranslate(-0.185, 0.73, 0.1);
  midFace.matrix.rotate(90, 1, 0, 0);
  HD.set(midFace.matrix);
  midFace.matrix.scale(1.8, 1.7, 1);
  midFace.render();

  var eyeFace = new Cylinder();
  eyeFace.noShade = 1;
  eyeFace.drawTops = 0;
  eyeFace.segments = 8;
  eyeFace.length = 0.05;
  eyeFace.frontTaper = 0.23;
  eyeFace.backTaper = 0.28;
  eyeFace.color = [0.93, 0.76, 0.74, 1.0];
  eyeFace.matrix.set(HD);
  eyeFace.matrix.rotate(-90, 1, 0, 0);
  eyeFace.matrix.translate(0, 0.05, 0);
  //eyeFace.matrix.setTranslate(-0.185, 0.78, 0.1);
  eyeFace.matrix.rotate(90, 1, 0, 0);
  HD.set(eyeFace.matrix);
  eyeFace.matrix.scale(1.4, 1.4, 1);
  eyeFace.render();

  var topFace = new Cylinder();
  topFace.noShade = 1;
  topFace.segments = 8;
  topFace.length = 0.05;
  topFace.frontTaper = 0.18;
  topFace.backTaper = 0.23;
  topFace.color = [0.93, 0.76, 0.74, 1.0];
  topFace.matrix.set(HD);
  topFace.matrix.rotate(-90, 1, 0, 0);
  topFace.matrix.translate(0, 0.05, 0);
  //topFace.matrix.setTranslate(-0.185, 0.83, 0.1);
  topFace.matrix.rotate(90, 1, 0, 0);
  HD.set(topFace.matrix);
  topFace.matrix.scale(1.4, 1.4, 1);
  topFace.render();

  var LeftEye = new Sphere();
  LeftEye.segments = 8;
  LeftEye.color = [0.1, 0.1, 0.1, 1.0];
  LeftEye.matrix.set(HD);
  LeftEye.matrix.rotate(-90, 1, 0, 0);
  LeftEye.matrix.translate(-0.06, -0.09, 0.045);
  //LeftEye.matrix.setTranslate(-0.25, 0.735, 0.14);
  LeftEye.matrix.scale(0.1, 0.1, 0.1);
  LeftEye.render();

  var RightEye = new Sphere();
  RightEye.segments = 8;
  RightEye.color = [0.1, 0.1, 0.1, 1.0];
  RightEye.matrix.set(HD);
  RightEye.matrix.rotate(-90, 1, 0, 0);
  RightEye.matrix.translate(-0.06, -0.09, -0.045);
  //RightEye.matrix.setTranslate(-0.25, 0.735, 0.06);
  RightEye.matrix.scale(0.1, 0.1, 0.1);
  RightEye.render();

  // Ears

  const LE = new Matrix4(); // New Joint

  var leftEar = new Circle();
  leftEar.segments = 10;
  leftEar.size = 10;
  leftEar.color = [0.937, 0.923, 0.79, 1.0];
  leftEar.matrix.set(HD);
  leftEar.matrix.rotate(-90, 1, 0, 0);
  leftEar.matrix.translate(0.09, -0.14, 0.14);
  //leftEar.matrix.setTranslate(-0.095, 0.67, 0.25);
  leftEar.matrix.rotate(90, 0, 1, 0);
  leftEar.matrix.rotate(g_leftEar, 0, 0, 1); // rotation to use to wiggle ears (between 0-60)
  leftEar.matrix.rotate(ear_left, 0, 0, 1); // perk ears
  LE.set(leftEar.matrix);
  leftEar.matrix.scale(2.4, 0.72, 1.2);
  leftEar.render();

  var leftEarBack = new Circle();
  leftEarBack.segments = 10;
  leftEarBack.size = 12;
  leftEarBack.color = [0.65, 0.105, 0.101, 1.0];
  leftEarBack.matrix.set(LE);
  leftEarBack.matrix.rotate(-45, 0, 0, 1);
  leftEarBack.matrix.rotate(-90, 0, 1, 0);
  leftEarBack.matrix.translate(0.001, 0, 0);
  //leftEarBack.matrix.setTranslate(-0.085, 0.67, 0.25);
  leftEarBack.matrix.rotate(90, 0, 1, 0);
  leftEarBack.matrix.rotate(45, 0, 0, 1);
  leftEarBack.matrix.scale(2.4, 0.72, 1.2);
  leftEarBack.render();

  const RE = new Matrix4(); // New Joint

  var rightEar = new Circle();
  rightEar.segments = 10;
  rightEar.size = 10;
  rightEar.color = [0.937, 0.923, 0.79, 1.0];
  rightEar.matrix.set(HD);
  rightEar.matrix.rotate(-90, 1, 0, 0);
  rightEar.matrix.translate(0.09, -0.14, -0.14);
  //rightEar.matrix.setTranslate(-0.12, 0.67, -0.05);
  //rightEar.matrix.rotate(110, -0.5, 1, -0.4);
  rightEar.matrix.rotate(90, 0, 1, 0);
  rightEar.matrix.rotate(g_rightEar, 0, 0, 1); // Rotation to wiggle ears
  rightEar.matrix.rotate(ear_right, 0, 0, 1); // wiggle ears
  RE.set(rightEar.matrix);
  rightEar.matrix.scale(2.4, 0.72, 1.2);
  rightEar.render();

  var rightEarBack = new Circle();
  rightEarBack.segments = 10;
  rightEarBack.size = 12;
  rightEarBack.color = [0.65, 0.105, 0.101, 1.0];
  rightEarBack.matrix.set(RE);
  rightEarBack.matrix.rotate(45, 0, 0, 1);
  rightEarBack.matrix.rotate(-90, 0, 1, 0);
  rightEarBack.matrix.translate(0.001, 0, 0);
  //rightEarBack.matrix.setTranslate(-0.11, 0.67, -0.05);
  //rightEarBack.matrix.rotate(110, -0.5, 1, -0.4);
  rightEarBack.matrix.rotate(90, 0, 1, 0);
  rightEarBack.matrix.rotate(-45, 0, 0, 1);
  rightEarBack.matrix.scale(2.4, 0.72, 1.2);
  rightEarBack.render();

  // Jewlery

  var goldBallRight = new Sphere();
  goldBallRight.segments = 6;
  goldBallRight.color = [0.851, 0.741, 0.4, 1.0];
  goldBallRight.matrix.set(HD);
  goldBallRight.matrix.rotate(-90, 1, 0, 0);
  goldBallRight.matrix.translate(0.05, -0.08, 0.13);
  //goldBallRight.matrix.setTranslate(-0.12, 0.75, 0.23);
  goldBallRight.matrix.scale(0.13, 0.13, 0.13);
  goldBallRight.render();

  var goldBallLeft = new Sphere();
  goldBallLeft.segments = 6;
  goldBallLeft.color = [0.851, 0.741, 0.4, 1.0];
  goldBallLeft.matrix.set(HD);
  goldBallLeft.matrix.rotate(-90, 1, 0, 0);
  goldBallLeft.matrix.translate(0.05, -0.08, -0.13);
  //goldBallLeft.matrix.setTranslate(-0.12, 0.75, -0.025);
  goldBallLeft.matrix.scale(0.13, 0.13, 0.13);
  goldBallLeft.render();

  var headFlower = new Sphere();
  headFlower.segments = 6;
  headFlower.color = [0.851, 0.741, 0.4, 1.0];
  headFlower.matrix.set(HD);
  headFlower.matrix.rotate(-90, 1, 0, 0);
  headFlower.matrix.translate(-0.064, -0.01, 0);
  //headFlower.matrix.setTranslate(-0.255, 0.83, 0.1);
  headFlower.matrix.rotate(30, 0, 0, -1);
  headFlower.matrix.scale(0.15, 0.15, 0.2);
  headFlower.render();

  var leftAntler = new Circle();
  leftAntler.segments = 8;
  leftAntler.size = 12;
  leftAntler.color = [0.65, 0.105, 0.101, 1.0];
  leftAntler.matrix.set(HD);
  leftAntler.matrix.rotate(-90, 1, 0, 0);
  leftAntler.matrix.translate(-0.064, 0, -0.1);
  //leftAntler.matrix.setTranslate(-0.26, 0.83, -0.01);
  leftAntler.matrix.rotate(90, 0, 1, 0);
  leftAntler.matrix.scale(1.4, 0.3, 1);
  leftAntler.render();

  var leftAntlerInnerStub = new Circle();
  leftAntlerInnerStub.segments = 8;
  leftAntlerInnerStub.size = 12;
  leftAntlerInnerStub.color = [0.65, 0.105, 0.101, 1.0];
  leftAntlerInnerStub.matrix.set(HD);
  leftAntlerInnerStub.matrix.rotate(-90, 1, 0, 0);
  leftAntlerInnerStub.matrix.translate(-0.05, 0.02, -0.12);
  //leftAntlerInnerStub.matrix.setTranslate(-0.25, 0.85, -0.02);
  leftAntlerInnerStub.matrix.rotate(90, 1, 1, 0);
  leftAntlerInnerStub.matrix.scale(1.2, 0.3, 1);
  leftAntlerInnerStub.render();

  var leftAntlerOuterStub = new Circle();
  leftAntlerOuterStub.segments = 8;
  leftAntlerOuterStub.size = 12;
  leftAntlerOuterStub.color = [0.65, 0.105, 0.101, 1.0];
  leftAntlerOuterStub.matrix.set(HD);
  leftAntlerOuterStub.matrix.rotate(-90, 1, 0, 0);
  leftAntlerOuterStub.matrix.translate(-0.05, 0.02, -0.2);
  //leftAntlerOuterStub.matrix.setTranslate(-0.24, 0.86, -0.11);
  leftAntlerOuterStub.matrix.rotate(90, 1, 1, 0);
  leftAntlerOuterStub.matrix.scale(1.4, 0.3, 1);
  leftAntlerOuterStub.render();

  var rightAntler = new Circle();
  rightAntler.segments = 8;
  rightAntler.size = 12;
  rightAntler.color = [0.65, 0.105, 0.101, 1.0];
  rightAntler.matrix.set(HD);
  rightAntler.matrix.rotate(-90, 1, 0, 0);
  rightAntler.matrix.translate(-0.064, 0, 0.13);
  //rightAntler.matrix.setTranslate(-0.26, 0.83, 0.21);
  rightAntler.matrix.rotate(90, 0, 1, 0);
  rightAntler.matrix.scale(1.4, 0.3, 1);
  rightAntler.render();

  var rightAntlerInnerStub = new Circle();
  //leftEye.position(0.5,0.5,0.5);
  rightAntlerInnerStub.segments = 8;
  rightAntlerInnerStub.size = 12;
  rightAntlerInnerStub.color = [0.65, 0.105, 0.101, 1.0];
  rightAntlerInnerStub.matrix.set(HD);
  rightAntlerInnerStub.matrix.rotate(-90, 1, 0, 0);
  rightAntlerInnerStub.matrix.translate(-0.05, 0.02, 0.15);
  //rightAntlerInnerStub.matrix.setTranslate(-0.25, 0.85, 0.22);
  rightAntlerInnerStub.matrix.rotate(90, -1, -1, 0);
  rightAntlerInnerStub.matrix.scale(1.2, 0.3, 1);
  rightAntlerInnerStub.render();

  var RightAntlerOuterStub = new Circle();
  RightAntlerOuterStub.segments = 8;
  RightAntlerOuterStub.size = 12;
  RightAntlerOuterStub.color = [0.65, 0.105, 0.101, 1.0];
  RightAntlerOuterStub.matrix.set(HD);
  RightAntlerOuterStub.matrix.rotate(-90, 1, 0, 0);
  RightAntlerOuterStub.matrix.translate(-0.05, 0.02, 0.23);
  //RightAntlerOuterStub.matrix.setTranslate(-0.24, 0.86, 0.325);
  RightAntlerOuterStub.matrix.rotate(90, -1, -1, 0);
  RightAntlerOuterStub.matrix.scale(1.4, 0.3, 1);
  RightAntlerOuterStub.render();

  // Hair

  var lowerHair = new Cylinder();
  lowerHair.drawTops = 0;
  lowerHair.segments = 8;
  lowerHair.length = 0.055;
  lowerHair.frontTaper = 0.4;
  lowerHair.backTaper = 0.5;
  lowerHair.color = [0.309, 0.14, 0.094, 1.0];
  lowerHair.matrix.set(HD);
  lowerHair.matrix.rotate(-90, 1, 0, 0);
  lowerHair.matrix.translate(0.05, -0.02, 0);
  //lowerHair.matrix.setTranslate(-0.14, 0.81, 0.1);
  lowerHair.matrix.rotate(90, 1, -0.5, 0);
  lowerHair.matrix.scale(1.1, 1.2, 1);
  lowerHair.render();

  var upperHair = new Cylinder();
  upperHair.drawTops = 0;
  upperHair.segments = 8;
  upperHair.length = 0.05;
  upperHair.frontTaper = 0.15;
  upperHair.backTaper = 0.41;
  upperHair.color = [0.309, 0.14, 0.094, 1.0];
  upperHair.matrix.set(HD);
  upperHair.matrix.rotate(-90, 1, 0, 0);
  upperHair.matrix.translate(0.07, 0.02, 0);
  //upperHair.matrix.setTranslate(-0.115, 0.853, 0.1);
  upperHair.matrix.rotate(90, 1, -0.5, 0);
  upperHair.matrix.scale(1.1, 1.2, 1);
  upperHair.render();

  var bun = new Sphere();
  bun.drawTops = 0;
  bun.segments = 8;
  bun.color = [0.309, 0.14, 0.094, 1.0];
  bun.matrix.set(HD);
  bun.matrix.rotate(-90, 1, 0, 0);
  bun.matrix.translate(0.1, 0.04, 0);
  //bun.matrix.setTranslate(-0.09, 0.88, 0.1);
  bun.matrix.scale(0.23, 0.23, 0.23);
  bun.render();

  var leftBang = new Cylinder();
  leftBang.drawTops = 0;
  leftBang.segments = 4;
  leftBang.length = 0.1;
  leftBang.frontTaper = 0.11;
  leftBang.backTaper = 0.22;
  leftBang.color = [0.309, 0.14, 0.094, 1.0];
  leftBang.matrix.set(HD);
  leftBang.matrix.rotate(-90, 1, 0, 0);
  leftBang.matrix.translate(-0.02, -0.14, -0.1);
  //leftBang.matrix.setTranslate(-0.2, 0.7, -0.001);
  leftBang.matrix.rotate(270, 1, -0.3, 0);
  leftBang.matrix.scale(1.1, 0.4, 1);
  leftBang.render();

  var leftBangLower = new Cylinder();
  leftBangLower.drawTops = 0;
  leftBangLower.segments = 4;
  leftBangLower.length = 0.06;
  leftBangLower.frontTaper = 0.03;
  leftBangLower.backTaper = 0.138;
  leftBangLower.color = [0.309, 0.14, 0.094, 1.0];
  leftBangLower.matrix.set(HD);
  leftBangLower.matrix.rotate(-90, 1, 0, 0);
  leftBangLower.matrix.translate(-0.06, -0.17, -0.1);
  //leftBangLower.matrix.setTranslate(-0.233, 0.67, -0.002);
  leftBangLower.matrix.rotate(270, 1, -0.6, 0.2);
  leftBangLower.matrix.scale(1.1, 0.4, 1);
  leftBangLower.render();

  var rightBang = new Cylinder();
  rightBang.drawTops = 0;
  rightBang.segments = 4;
  rightBang.length = 0.1;
  rightBang.frontTaper = 0.11;
  rightBang.backTaper = 0.22;
  rightBang.color = [0.309, 0.14, 0.094, 1.0];
  rightBang.matrix.set(HD);
  rightBang.matrix.rotate(-90, 1, 0, 0);
  rightBang.matrix.translate(-0.02, -0.14, 0.105);
  //rightBang.matrix.setTranslate(-0.2, 0.7, 0.21);
  rightBang.matrix.rotate(270, 1, -0.3, 0);
  rightBang.matrix.scale(1.1, 0.4, 1);
  rightBang.render();

  var rightBangLower = new Cylinder();
  rightBangLower.drawTops = 0;
  rightBangLower.segments = 4;
  rightBangLower.length = 0.06;
  rightBangLower.frontTaper = 0.03;
  rightBangLower.backTaper = 0.138;
  rightBangLower.color = [0.309, 0.14, 0.094, 1.0];
  rightBangLower.matrix.set(HD);
  rightBangLower.matrix.rotate(-90, 1, 0, 0);
  rightBangLower.matrix.translate(-0.06, -0.17, 0.105);
  //rightBangLower.matrix.setTranslate(-0.233, 0.67, 0.21);
  rightBangLower.matrix.rotate(270, 1, -0.6, 0.2);
  rightBangLower.matrix.scale(1.1, 0.4, 1);
  rightBangLower.render();

  var backHair = new Cylinder();
  backHair.drawTops = 0;
  backHair.segments = 4;
  backHair.length = 0.15;
  backHair.frontTaper = 0.4;
  backHair.backTaper = 0.5;
  backHair.color = [0.309, 0.14, 0.094, 1.0];
  backHair.matrix.set(HD);
  backHair.matrix.rotate(-90, 1, 0, 0);
  backHair.matrix.translate(0.12, -0.08, 0);
  //backHair.matrix.setTranslate(-0.08, 0.76, 0.1);
  backHair.matrix.rotate(90, 1, 0, 0);
  backHair.matrix.scale(0.35, 1, 1);
  backHair.render();

  const HR = new Matrix4(); // New Joint

  var backHairLower = new Cylinder();
  backHairLower.drawTops = 0;
  backHairLower.segments = 4;
  backHairLower.length = 0.15;
  backHairLower.frontTaper = 0.5;
  backHairLower.backTaper = 0.6;
  backHairLower.color = [0.309, 0.14, 0.094, 1.0];
  backHairLower.matrix.set(HD);
  backHairLower.matrix.rotate(-90, 1, 0, 0);
  backHairLower.matrix.translate(0.12, -0.2, 0);
  //backHairLower.matrix.setTranslate(-0.08, 0.65, 0.1);
  backHairLower.matrix.rotate(90, 1, 0, 0);
  backHairLower.matrix.rotate(idleWait_hair, 0, 1, 0); // Rotation for idle
  backHairLower.matrix.rotate(g_hair, 0, 1, 0); // Rotation for the back and fourth
  HR.set(backHairLower.matrix);
  backHairLower.matrix.scale(0.3, 1, 1);
  backHairLower.render();

  var backHairLowest = new Cylinder();
  backHairLowest.drawTops = 0;
  backHairLowest.segments = 4;
  backHairLowest.length = 0.15;
  backHairLowest.frontTaper = 0.6;
  backHairLowest.backTaper = 0.7;
  backHairLowest.color = [0.309, 0.14, 0.094, 1.0];
  backHairLowest.matrix.set(HR);
  backHairLowest.matrix.rotate(-25, 0, 1, 0);
  backHairLowest.matrix.rotate(-90, 1, 0, 0);
  backHairLowest.matrix.translate(0.05, -0.12, 0);
  //backHairLowest.matrix.setTranslate(-0.025, 0.515, 0.1);
  backHairLowest.matrix.rotate(90, 1, 0, 0);
  backHairLowest.matrix.rotate(45, 0, 1, 0);
  HR.set(backHairLowest.matrix);
  backHairLowest.matrix.scale(0.25, 1, 1);
  backHairLowest.render();

  // Lillia staff
  // To be held in hands, maybe

  if (holdingStaff == 1) {
  const S = new Matrix4();

  var staffBase = new Cylinder();
  staffBase.drawTops = 0;
  staffBase.segments = 6;
  staffBase.length = 0.45;
  staffBase.color = [0.54,0.23,0.16,1.0];
  staffBase.frontTaper = 0.12;
  staffBase.backTaper = 0.12;
  staffBase.matrix.set(frontRighthand.matrix);
  staffBase.matrix.scale(8.33, 5.55, 6.25);
  staffBase.matrix.translate(0, -0.01, -0.07);
  //staffBase.matrix.setTranslate(-0.19, -0.40, -0.5);
  staffBase.matrix.rotate(90, 1, 0, 0);
  staffBase.matrix.rotate(18, 0, 0, 1);
  staffBase.matrix.rotate(staff_x, 1, 0, 0);
  staffBase.matrix.rotate(staff_y, 0, 1, 0);
  staffBase.matrix.rotate(staff_z, 0, 0, 1);
  
  
  S.set(staffBase.matrix);
  staffBase.render();

  var staffMid = new Cylinder();
  staffMid.drawTops = 0;
  staffMid.segments = 6;
  staffMid.length = 0.6;
  staffMid.color = [0.54,0.23,0.16,1.0];
  staffMid.frontTaper = 0.08;
  staffMid.backTaper = 0.12;
  staffMid.matrix.set(S);
  staffMid.matrix.rotate(-18, 0, 0, 1);
  staffMid.matrix.rotate(-90, 1, 0, 0);
  staffMid.matrix.translate(0.06, 0.59, -0.005);
  //staffMid.matrix.setTranslate(-0.125, 0.19, -0.505);
  staffMid.matrix.rotate(90, 1, 0, -0.1);
  S.set(staffMid.matrix);
  staffMid.render();

  var staffTop = new Cylinder();
  staffTop.drawTops = 0;
  staffTop.segments = 6;
  staffTop.length = 0.2;
  staffTop.color = [0.54,0.23,0.16,1.0];
  staffTop.frontTaper = 0.06;
  staffTop.backTaper = 0.08;
  staffTop.matrix.set(S);
  staffTop.matrix.rotate(-90, 1, 0, -0.1);
  staffTop.matrix.translate(-0.02, 0.19, 0);
  //staffTop.matrix.setTranslate(-0.145, 0.38, -0.505);
  staffTop.matrix.rotate(90, 1, 0, 0.1);
  S.set(staffTop.matrix);
  staffTop.render();

  var staffCurve = new Cylinder();
  staffCurve.drawTops = 0;
  staffCurve.segments = 6;
  staffCurve.length = 0.2;
  staffCurve.color = [0.54,0.23,0.16,1.0];
  staffCurve.frontTaper = 0.08;
  staffCurve.backTaper = 0.06;
  staffCurve.matrix.set(S);
  staffCurve.matrix.rotate(-90, 1, 0, 0.1);
  staffCurve.matrix.translate(0, 0.25, 0);
  //staffCurve.matrix.setTranslate(-0.13, 0.57, -0.505);
  staffCurve.matrix.rotate(90, 1, 0, -0.1);
  staffCurve.render();

  var staffCurve1 = new Cylinder();
  staffCurve1.drawTops = 0;
  staffCurve1.segments = 6;
  staffCurve1.length = 0.1;
  staffCurve1.color = [0.54,0.23,0.16,1.0];
  staffCurve1.frontTaper = 0.08;
  staffCurve1.backTaper = 0.06;
  staffCurve1.matrix.set(S);
  staffCurve1.matrix.rotate(-90, 1, 0, 0.1);
  staffCurve1.matrix.translate(-0.02, 0.06, 0);
  //staffCurve1.matrix.setTranslate(-0.17, 0.45, -0.505);
  staffCurve1.matrix.rotate(90, 1, 0, 0.3);
  S.set(staffCurve1.matrix);
  staffCurve1.render();

  var staffCurve2 = new Cylinder();
  staffCurve2.drawTops = 0;
  staffCurve2.segments = 6;
  staffCurve2.length = 0.1;
  staffCurve2.color = [0.54,0.23,0.16,1.0];
  staffCurve2.frontTaper = 0.08;
  staffCurve2.backTaper = 0.06;
  staffCurve2.matrix.set(S);
  staffCurve2.matrix.rotate(-90, 1, 0, 0.3);
  staffCurve2.matrix.translate(-0.06, 0.08, 0);
  //staffCurve2.matrix.setTranslate(-0.23, 0.52, -0.505);
  staffCurve2.matrix.rotate(90, 1, 0.7, 0);
  S.set(staffCurve2.matrix);
  staffCurve2.render();

  var staffCurve3 = new Cylinder();
  staffCurve3.drawTops = 0;
  staffCurve3.segments = 6;
  staffCurve3.length = 0.1;
  staffCurve3.color = [0.54,0.23,0.16,1.0];
  staffCurve3.frontTaper = 0.07;
  staffCurve3.backTaper = 0.07;
  staffCurve3.matrix.set(S);
  staffCurve3.matrix.rotate(-90, 1, 0.7, 0);
  staffCurve3.matrix.translate(-0.09, 0, 0);
  //staffCurve3.matrix.setTranslate(-0.31, 0.52, -0.505);
  staffCurve3.matrix.rotate(90, 0, 1, 0);
  S.set(staffCurve3.matrix);
  //staffCurve1.matrix.rotate(45, 0, 1, 0);
  staffCurve3.render();

  const SS = new Matrix4();

  var staffString = new Cylinder();
  staffString.drawTops = 0;
  staffString.segments = 6;
  staffString.length = 0.05;
  staffString.color = [0.1,0.1,0.1,1.0];
  staffString.frontTaper = 0.02;
  staffString.backTaper = 0.01;
  staffString.matrix.set(S);
  staffString.matrix.rotate(-90, 0, 1, 0);
  staffString.matrix.translate(0, 0, 0);
  //staffString.matrix.setTranslate(-0.31, 0.52, -0.505);
  staffString.matrix.rotate(90, 1, 0, 0);
  staffString.matrix.rotate(walk_FrontLeftHip, 1, 0, 0);
  //console.log(idleWait_torso);
  staffString.matrix.rotate(-idleWait_torso*10, 1, 0, 0);
  staffString.matrix.rotate(-staff_y, 0, 1, 0);
  SS.set(staffString.matrix);
  //staffCurve1.matrix.rotate(45, 0, 1, 0);
  staffString.render();

  var staffBall = new Sphere();
  staffBall.drawTops = 0;
  staffBall.segments = 8;
  staffBall.fill = 0;
  staffBall.color = [0.851,0.741,0.4,1.0]; 
  staffBall.matrix.set(SS);
  staffBall.matrix.rotate(-90, 1, 0, 0);
  staffBall.matrix.translate(0, -0.17, 0);
  //staffBall.matrix.setTranslate(-0.31, 0.35, -0.5);
  staffBall.matrix.rotate(90, 0, 0, 1);
  staffBall.matrix.scale(0.5, 0.5, 0.5);
  staffBall.render();
  }

  

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(
    "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration),
    "numdot"
  );

  //if (RENDERLOOP) {
  //  requestAnimationFrame(renderAllShapes);
  //}
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("failed to get" + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
