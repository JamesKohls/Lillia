class Sphere {
  constructor() {
    this.type = "Sphere";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 12;
    this.size = 50;
    this.shade = 0.8;
    this.fill = 1;
    this.verticies = null;
    this.buffer = gl.createBuffer();
  }

  generateVertices() {
    var xy = [0, 0];

    // Draw
    var d = this.size / 200;

    let angleStep = 360 / this.segments;

    let storeVert = new Array(this.segments / 2);
    for (var i = 0; i < storeVert.length; i++) {
      storeVert[i] = new Array(this.segments);
    }

    // Generates the half circle that is the framework of the sphere, this is why circles must
    // be constructed out of even numbers, so that 180 degrees leaves a perfect half circle
    let cirCount = 0;
    for (var angle = 0; angle < 180; angle = angle + angleStep) {
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

      let partCount = 0;
      for (var smangle = 0; smangle < 360; smangle = smangle + angleStep) {
        // Generates the rotation of that half circle, in bits, so that it's rotated
        // around the X-axis 360 degrees, forming a complete sphere

        let mod2y = pt1[1] * Math.cos((smangle * Math.PI) / 180);
        let mod2z = pt1[1] * Math.sin((smangle * Math.PI) / 180);

        let mod3y = pt2[1] * Math.cos((smangle * Math.PI) / 180);
        let mod3z = pt2[1] * Math.sin((smangle * Math.PI) / 180);

        storeVert[cirCount][partCount] = [
          pt1[0],
          mod2y,
          mod2z,
          pt2[0],
          mod3y,
          mod3z
        ];

        partCount++;
      }
      cirCount++;
    }

    // Area where circle is drawn!
    // All the verts have been stored in a 2d array named storeVert, with the outside
    // layer being this.segments/2, and the inside layer being this.segments in lenght

    let v = [];

    for (var i = 0; i < this.segments / 2; i++) {
      //if (shade >= 0.9) {
      // shade = 0.8; // Dictates how the colors of the spehre change,
      //} else {
      // shade += 0.025;
      //} // Makes seeing the dimentions possible

      for (var j = 0; j < this.segments; j++) {
        // Changes colors so the circle can be visible
        // gl.uniform4f(
        //   u_FragColor,
        //   rgba[0] * shade,
        //   rgba[1] * shade,
        //   rgba[2] * shade,
        //   rgba[3]
        // );

        if (i == 0) {
          // Generates the front of the circle as they all share one point,
          if (j < this.segments - 1) {
            // it is drawn out of one rather then two triangles
            v.push(
              storeVert[i][j][0],
              storeVert[i][j][1],
              storeVert[i][j][2], // CASE i == 0
              storeVert[i][j][3],
              storeVert[i][j][4],
              storeVert[i][j][5],
              storeVert[i][j + 1][3],
              storeVert[i][j + 1][4],
              storeVert[i][j + 1][5]
            );
          } else {
            v.push(
              storeVert[i][j][0],
              storeVert[i][j][1],
              storeVert[i][j][2],
              storeVert[i][j][3],
              storeVert[i][j][4],
              storeVert[i][j][5],
              storeVert[i][0][3],
              storeVert[i][0][4],
              storeVert[i][0][5]
            );
          }
        } else if (i == this.segments / 2 - 1) {
          // Back of Circle, Rendered much like the front of the circle, with one
          if (j < this.segments - 1) {
            // shared point, there is no need to create a square
            v.push(
              storeVert[i][j][0],
              storeVert[i][j][1],
              storeVert[i][j][2],
              storeVert[i][j + 1][3],
              storeVert[i][j + 1][4],
              storeVert[i][j + 1][5],
              storeVert[i][j + 1][0],
              storeVert[i][j + 1][1],
              storeVert[i][j + 1][2]
            );
          } else {
            v.push(
              storeVert[i][j][0],
              storeVert[i][j][1],
              storeVert[i][j][2],
              storeVert[i][0][3],
              storeVert[i][0][4],
              storeVert[i][0][5],
              storeVert[i][0][0],
              storeVert[i][0][1],
              storeVert[i][0][2]
            );
          }
        } else {
          // Body of the circle, because there are four points that need to be connected,
          if (j < this.segments - 1) {
            // The walls here are constricted from two triangles,
            v.push(
              storeVert[i][j][0],
              storeVert[i][j][1],
              storeVert[i][j][2],
              storeVert[i][j + 1][3],
              storeVert[i][j + 1][4],
              storeVert[i][j + 1][5],
              storeVert[i][j + 1][0],
              storeVert[i][j + 1][1],
              storeVert[i][j + 1][2]
            );
          } else {
            v.push(
              storeVert[i][j][0],
              storeVert[i][j][1],
              storeVert[i][j][2],
              storeVert[i][0][3],
              storeVert[i][0][4],
              storeVert[i][0][5],
              storeVert[i][0][0],
              storeVert[i][0][1],
              storeVert[i][0][2]
            );
          }
          if (j < this.segments - 1) {
            if (this.fill == 1) {
              v.push(
                storeVert[i][j][0],
                storeVert[i][j][1],
                storeVert[i][j][2],
                storeVert[i][j][3],
                storeVert[i][j][4],
                storeVert[i][j][5],
                storeVert[i][j + 1][3],
                storeVert[i][j + 1][4],
                storeVert[i][j + 1][5]
              );
            }
          } else {
            if (this.fill == 1) {
              v.push(
                storeVert[i][j][0],
                storeVert[i][j][1],
                storeVert[i][j][2],
                storeVert[i][j][3],
                storeVert[i][j][4],
                storeVert[i][j][5],
                storeVert[i][0][3],
                storeVert[i][0][4],
                storeVert[i][0][5]
              );
            }
          }
        }
      }
    }
    this.verticies = new Float32Array(v);
  }

  render() {
    var shade = this.shade;
    var rgba = this.color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    if (this.verticies === null) {
      this.generateVertices();
    }

    let mid = this.verticies.length / 2;
    drawTriangle3D(this.verticies.slice(0, mid), this.buffer);
    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3]
    );
    drawTriangle3D(this.verticies.slice(mid), this.buffer);
  }
}
