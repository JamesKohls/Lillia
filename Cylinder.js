class Cylinder {
  constructor() {
    this.type = "cylinder";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 12;
    this.size = 50;
    // Allows for angled Cylinders
    this.frontTaper = 1;
    this.backTaper = 1;
    this.length = 1;
    this.drawTops = 1;
    this.noShade = 0;

    this.buffer = gl.createBuffer();
    this.vertices = { top: null, mid: null, bottom: null };

    this.generated = false;
  }

  generateVertices() {
    var ft = this.frontTaper;
    var bt = this.backTaper;
    var len = this.length;
    let xy = [0.0, 0.0];
    var v = { top: [], mid: [], bottom: [] };

    // Draw
    var d = this.size / 200;
    //let angleStep=360/segments;
    let angleStep = 360 / this.segments;
    //console.log(angleStep);
    for (var angle = 0; angle < 360; angle = angle + angleStep) {
      let centerPt = [xy[0], xy[1]];
      let angle1 = angle;
      let angle2 = angle + angleStep;
      // Top Circle of Cylinder
      let vec1 = [
        Math.cos((angle1 * Math.PI) / 180) * d * ft,
        Math.sin((angle1 * Math.PI) / 180) * d * ft
      ];
      let vec2 = [
        Math.cos((angle2 * Math.PI) / 180) * d * ft,
        Math.sin((angle2 * Math.PI) / 180) * d * ft
      ];
      // Bottom Circle of Cylinder
      let vec3 = [
        Math.cos((angle1 * Math.PI) / 180) * d * bt,
        Math.sin((angle1 * Math.PI) / 180) * d * bt
      ];
      let vec4 = [
        Math.cos((angle2 * Math.PI) / 180) * d * bt,
        Math.sin((angle2 * Math.PI) / 180) * d * bt
      ];
      // Adjustments to top cylinder
      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
      // Adjustments to bottom cylinder
      let pt3 = [centerPt[0] + vec3[0], centerPt[1] + vec3[1]];
      let pt4 = [centerPt[0] + vec4[0], centerPt[1] + vec4[1]];

      if (this.drawTops == 1) {
        v.top.push(xy[0], xy[1], 0, pt1[0], pt1[1], 0, pt2[0], pt2[1], 0);
      }
      // Middle of cylinder

      v.mid.push(pt1[0], pt1[1], 0, pt4[0], pt4[1], len, pt3[0], pt3[1], len);
      v.mid.push(pt1[0], pt1[1], 0, pt2[0], pt2[1], 0, pt4[0], pt4[1], len);

      // Bottom of cylinder
      if (this.drawTops == 1) {
        v.bottom.push(
          xy[0],
          xy[1],
          len,
          pt3[0],
          pt3[1],
          len,
          pt4[0],
          pt4[1],
          len
        );
      }
    }
    this.vertices.top = new Float32Array(v.top);
    this.vertices.mid = new Float32Array(v.mid);
    this.vertices.bottom = new Float32Array(v.bottom);
  }

  render() {
    var rgba = this.color;

    if (!this.generated) {
      this.generateVertices();
    }

    //ft = 1.2;
    //bt = 0.4;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //Top of Ciyinder
    if (this.drawTops == 1) {
      drawTriangle3D(this.vertices.top, this.buffer);
    }
    // Middle of cylinder

    //console.log(this.vertices.mid.length);
    let mid = this.vertices.mid.length / 2;
    drawTriangle3D(this.vertices.mid.slice(0, mid), this.buffer);
    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3]
    );
    drawTriangle3D(this.vertices.mid.slice(mid), this.buffer);


    // Bottom of cylinder
    if (this.drawTops == 1) {
      drawTriangle3D(this.vertices.bottom, this.buffer);
    }
  }
}
