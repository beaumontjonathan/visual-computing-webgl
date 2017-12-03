let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let cube: THREE.Mesh;
let mesh;

// Initialise the scene, and draw it for the first time.
init();
animate();

// Listen for keyboard events, to react to them.
// Note: there are also other event listeners, e.g. for mouse events.
document.addEventListener('keydown', handleKeyDown);

// Scene initialisation. This function is only run once, at the very beginning.
function init() {
    setupCamera();
    setupScene();

    drawCube();
    drawAxes();

    setupRenderer();

    // Handle resizing of the browser window.
    window.addEventListener('resize', handleResize, false);
}

// Set up the camera, move it to (3, 4, 5) and look at the origin (0, 0, 0).
function setupCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 4, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

// Sets up the scene, adds a helper grid and basic lighting.
function setupScene() {
    scene = new THREE.Scene();

    // Draw a helper grid in the x-z plane (note: y is up).
    scene.add(new THREE.GridHelper(10, 20, 0xffffff));

    // Basic ambient lighting.
    scene.add(new THREE.AmbientLight(0xffffff));
    // TODO: add more complex lighting for 'face' rendering mode (requirement 4).
}

// Set up the Web GL renderer.
function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio); // HiDPI/retina rendering
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

// Draws a cube.
function drawCube() {
    // TODO: Draw a cube (requirement 1).
    let geometry = new THREE.BoxGeometry(2, 2, 2);
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}

// Draw the x, y, z axes.
function drawAxes() {
    // TODO: Visualise the axes of the global coordinate system (requirment 2).
    // Materials
    const redMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
    const greenMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
    const blueMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});

    const origin = new THREE.Vector3(0, 0, 0);
    const xVector = new THREE.Vector3(100, 0, 0);
    const yVector = new THREE.Vector3(0, 100, 0);
    const zVector = new THREE.Vector3(0, 0, 100);

    const xGeometry = new THREE.Geometry();
    const yGeometry = new THREE.Geometry();
    const zGeometry = new THREE.Geometry();

    xGeometry.vertices.push(origin, xVector);
    yGeometry.vertices.push(origin, yVector);
    zGeometry.vertices.push(origin, zVector);

    const xAxisLine = new THREE.Line(xGeometry, redMaterial);
    const yAxisLine = new THREE.Line(yGeometry, greenMaterial);
    const zAxisLine = new THREE.Line(zGeometry, blueMaterial);

    scene.add(xAxisLine);
    scene.add(yAxisLine);
    scene.add(zAxisLine);
}

// Handle resizing of the browser window.
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop function. This function is called whenever an update is required.
function animate() {
    requestAnimationFrame(animate);

    // TODO: This is a good place for code that rotates your cube (requirement 3).

    // Render the current scene to the screen.
    renderer.render(scene, camera);
}

// Handle keyboard presses.
function handleKeyDown(event) {
    switch (event.keyCode) {
        // Render modes.
        case 70: // f = face
            // TODO: add code for face render mode.
            alert('TODO: add code for face render mode (requirement 4).');
            break;

        case 69: // e = edge
            // TODO: add code for edge render mode.
            alert('TODO: add code for edge render mode (requirement 4).');
            break;

        case 86: // v = vertex
            // TODO: add code for vertex render mode.
            alert('TODO: add code for vertex render mode (requirement 4).');
            break;

        // TODO: add code for starting/stopping rotations (requirement 3).
    }
}