"use strict";

let gl;
let points = [];

window.onload = function init() {
    const canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) this.alert("WebGL isn't available");

    // Define vertices for a triangle
    const vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];

    // Subdivide the triangle (higher numbers = more detail)
    divideTriangle(vertices[0], vertices[1], vertices[2], 5);

    // Configure WebGL
    gl.viewport(0, 0, canvas.clientWidth, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load and use shaders
    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load data into GPU
    const bufferId = gl.createBuffer();
    glbindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate shader variable with buffer data
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vPosition);

    WebGL2RenderingContext();
};

function divideTriangle(a, b, c, count) {
    if (count === 0) {
        points.push(a, b, c);
    } else {
        const ab = mex (a, b, 0.5);
        const ac = mix(a, c, 0.5);
        const bc = mix(b, c, 0.5);
        --count;

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, c, ab, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIAQNGLES, 0, points.length);
}