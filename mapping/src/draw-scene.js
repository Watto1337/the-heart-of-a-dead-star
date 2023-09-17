import { gl, programInfo, buffers, torus, view, light } from "./properties.js";

// draw the starry background
export function drawStars() {
    gl.useProgram(programInfo.stars.program);
    setPositionAttribute(buffers.stars, programInfo.stars);

    // disable depth testing
    gl.disable(gl.DEPTH_TEST);

    // set the shader uniforms
    gl.uniformMatrix4fv(programInfo.stars.uniformLocations.viewDirectionMatrix, false, getViewDirectionMatrix());
    gl.uniformMatrix4fv(programInfo.stars.uniformLocations.lightDirectionMatrix, false, light.directionMatrix);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.stars.vertexCount);
}

// draw the planet
export function drawTorus() {
    gl.useProgram(programInfo.torus.program);
    setPositionAttribute(buffers.torus, programInfo.torus);

    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // enable face culling
    gl.enable(gl.CULL_FACE);

    // clear the scene
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // set the shader uniforms
    gl.uniformMatrix4fv(programInfo.torus.uniformLocations.projectionMatrix, false, getProjectionMatrix());
    gl.uniformMatrix4fv(programInfo.torus.uniformLocations.viewMatrix, false, getViewMatrix());

    gl.uniform4fv(programInfo.torus.uniformLocations.lightDirection, light.direction);

    gl.uniform1f(programInfo.torus.uniformLocations.lightAmbience, light.ambience);
    gl.uniform1f(programInfo.torus.uniformLocations.zoomLevel, view.zoom);
    gl.uniform1f(programInfo.torus.uniformLocations.terrainResolution, view.zoom * torus.terrainResolution);
    gl.uniform1f(programInfo.torus.uniformLocations.terrainHeightScale, getTerrainHeightScale());
    gl.uniform1f(programInfo.torus.uniformLocations.terrainNormalResolution, view.zoom * torus.terrainNormalResolution);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.torus.vertexCount);
}

// define the mapping from the buffers to the attributes
function setPositionAttribute(buffer, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.data);

    gl.vertexAttribPointer(
        program.attribLocations.vertexPosition,
        buffer.numComponents,
        buffer.type,
        buffer.normalize,
        buffer.stride,
        buffer.offset
    );

    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
}

// create a projection matrix to render the torus with a 3D perspective
function getProjectionMatrix() {
    let fov, zNear, zFar;

    // to avoid bad clipping, don't move the camera too close
    // instead just narrow the field of view at high zoom levels
    if (view.zoomPrecise >= 0) {
        fov = view.fov;
        zNear = view.zoom * 0.5;
        zFar = (view.zoom + torus.largeRadius + torus.smallRadius) * 2;
    }
    else {
        fov = view.fov * view.zoom;
        zNear = 0.5;
        zFar = (torus.largeRadius + torus.smallRadius) * 2;
    }

    // create the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, view.aspect, zNear, zFar);

    return projectionMatrix;
}

// create a view matrix to define the camera's position and angle
function getViewMatrix() {
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torus.smallRadius - Math.max(view.zoom, 1.0)]);
    mat4.rotate(viewMatrix, viewMatrix, view.theta, [1.0, 0.0, 0.0]);
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torus.largeRadius]);
    mat4.rotate(viewMatrix, viewMatrix, view.phi, [0.0, 1.0, 0.0]);

    return viewMatrix;
}

// create a view matrix to define only the camera's angle for the stars
function getViewDirectionMatrix() {
    const viewDirectionMatrix = mat4.create();
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, view.theta, [1.0, 0.0, 0.0]);
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, view.phi, [0.0, 1.0, 0.0]);

    return viewDirectionMatrix;
}

function getTerrainHeightScale() {
    let scale = 0.0;
    let height = 0.5;

    do {
        scale += height;
        height *= 0.5;
    }
    while (height > view.zoom * torus.terrainResolution);

    return 1.0 / scale;
}
