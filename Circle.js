class Circle {
  constructor() {
    this.type = "circle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segments = 10;
    this.matrix = new Matrix4();
    this.verticies = null;
    this.buffer = gl.createBuffer();
  }

  generateVertices() {
    var xy = this.position;
    // Draw
    var d = this.size / 200;

    //let angleStep=360/segments;
    let angleStep = 360 / this.segments;
    //console.log(angleStep);
    var v = [];
    var count = 0;

    for (var angle = 0; angle < 360; angle = angle + angleStep) {
      count++;
      let centerPt = [xy[0], xy[1]];
      let angle1 = angle;
      let angle2 = angle + angleStep;
      let vec1 = [
        Math.cos((angle1 * Math.PI) / 180) * d,
        Math.sin((angle1 * Math.PI) / 180) * d
      ];
      let vec2 = [
        Math.cos((angle2 * Math.PI) / 180) * d,
        Math.sin((angle2 * Math.PI) / 180) * d
      ];
      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

      //if (count % 2 == 0){
      //  gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
      //} else {
      //  gl.uniform4f(u_FragColor, rgba[0] * 0.86, rgba[1] * 0.86, rgba[2] * 0.86, rgba[3]);
      //}
      v.push(xy[0], xy[1], 0, pt1[0], pt1[1], 0, pt2[0], pt2[1], 0);
      //drawTriangle3D([ xy[0], xy[1], 0, pt1[0], pt1[1], 0, pt2[0], pt2[1], 0]);
    }

    this.verticies = new Float32Array(v);
  }

  render() {
    var rgba = this.color;
    if (this.verticies === null) {
      this.generateVertices();
    }

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    drawTriangle3D(this.verticies, this.buffer);
  }
}
