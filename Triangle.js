class Triangle {
    constructor() {
      this.type = "triangle";
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 10;
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
  
      // Pass the position of a point to a_Position variable
      //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the color of a point to u_FragColor variable
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      gl.uniform1f(u_Size, size);
  
      // Draw
      //gl.drawArrays(gl.POINTS, 0, 1);
      //var d = this.size/200;
      //drawTriangle([ xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
      //drawTriangle([ 0/200, 0/200, 200/200, 0/200, 100/200, 100/200]);
  
      drawTriangle([
        xy[0],
        xy[1] + 5 * d,
        xy[0] - 4 * d,
        xy[1] - 3 * d,
        xy[0] + 4 * d,
        xy[1] - 3 * d
      ]);
    }
  }
  
  function drawTriangle(vertices) {
    var n = 3; // number of verticies
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log("failed to create the buffer object :(");
      return -1;
    }
  
    // bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data to buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  
  function drawTriangle3D(vertices, buffer = null) {
    //console.log(vertices);
  
    var n = vertices.length / 3; // number of verticies
  
    // Create a buffer object
    var vertexBuffer = buffer || gl.createBuffer();
    if (!vertexBuffer) {
      console.log("failed to create the buffer object :(");
      return -1;
    }
  
    // bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data to buffer
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  