"use strict";

function vec2(x, y) {
    return[x, y];
}

function mix(a, b, t) {
    // linear interpolation: a*(1-t) + b*t
    return [ (1 - t) * a[0], (1 - t) * a[1] + t * b[1] ];
}

function flatten(arr) {
    // flattens [[x,y], [x,y], ...] -> Float3Array
    const out = new Float32Array(arr.length * 2);
    let k = 0;
    for (let i = 0; i < arr.length; i++) {
        out[k++] = arr[i][0];
        out[k++] = arr[i][1];
    }
    return out;
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

let gl;
let points = [];

window.onload = function init() {
    const canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    // Define vertices for a triangle
    const vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)

    ];

    // Subdivide the triangle (higher numbers = more detail)
    divideTriangle(vertices[0], vertices[1], vertices[2], 5);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Get shader sources from HTML
    const vertexSource = document.getElementById("vertex-shader").textContent.trim();
    const fragmentSource = document.getElementById("fragment-shader").textContent.trim();

    // Compile and link manually
    const program = createProgram(gl, vertexSource, fragmentSource);
    gl.useProgram(program);

    // Load data into GPU
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate shader variable with buffer data
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

// Recursive trianglke subdivision
function divideTriangle(a, b, c, count) {
    if (count === 0) {
        points.push(a, b, c);
    } else {
        const ab = mix (a, b, 0.5);
        const ac = mix(a, c, 0.5);
        const bc = mix(b, c, 0.5);
        --count;

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}