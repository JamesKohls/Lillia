class Cube{
    constructor(){
        this.type='cube';
        this.color=[1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3D([ 0,0,0,  1,1,0,  1,0,0 ]);
        drawTriangle3D([ 0,0,0,  0,1,0,  1,1,0 ]);
        // Back of cube
        drawTriangle3D([ 0,0,1,  1,1,1,  1,0,1 ]);
        drawTriangle3D([ 0,0,1,  0,1,1,  1,1,1 ]);

        // pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Top of Cube
        drawTriangle3D([ 0,1,0,  0,1,1,  1,1,1 ]);
        drawTriangle3D([ 0,1,0,  1,1,1,  1,1,0 ]);
        // Bottom of cube
        drawTriangle3D([ 0,0,0,  0,0,1,  1,0,1 ]);
        drawTriangle3D([ 0,0,0,  1,0,1,  1,0,0 ]);

        // fake lighting on the front of the cube
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);

        // Draw Right Side of Cube
        drawTriangle3D([ 1,0,0,  1,1,0,  1,1,1 ]);
        drawTriangle3D([ 1,0,0,  1,1,1,  1,0,1 ]);
        // Draw Left Side of Cube
        drawTriangle3D([ 0,0,0,  0,1,0,  0,1,1 ]);
        drawTriangle3D([ 0,0,0,  0,1,1,  0,0,1 ]);

    }
}