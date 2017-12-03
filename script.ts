let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh;
let manager: THREE.LoadingManager;
let bunnyGeometry;

const meshMaterials = {
    faces: new THREE.MeshBasicMaterial({color: 0x00ff00}),
    edges: new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true})
};

// Initialise the scene, and draw it for the first time.
init();
animate();

// Listen for keyboard events, to react to them.
// Note: there are also other event listeners, e.g. for mouse events.
document.addEventListener('keydown', handleKeyDown);

// Scene initialisation. This function is only run once, at the very beginning.
function init(): void {
    setupCamera();
    setupScene();

    drawCube();
    drawAxes();

    setupRenderer();

    manager = new THREE.LoadingManager();
    loadBunny();

    // Handle resizing of the browser window.
    window.addEventListener('resize', handleResize, false);
}

// Set up the camera, move it to (3, 4, 5) and look at the origin (0, 0, 0).
function setupCamera(): void {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 4, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

// Sets up the scene, adds a helper grid and basic lighting.
function setupScene(): void {
    scene = new THREE.Scene();

    // Draw a helper grid in the x-z plane (note: y is up).
    scene.add(new THREE.GridHelper(10, 20, 0xffffff));

    // Basic ambient lighting.
    scene.add(new THREE.AmbientLight(0xffffff));
    // TODO: add more complex lighting for 'face' rendering mode (requirement 4).
}

// Set up the Web GL renderer.
function setupRenderer(): void {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio); // HiDPI/retina rendering
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function drawObject(geometry: THREE.Geometry): void {
    const material = (mesh) ? mesh.material : meshMaterials.faces;
    mesh = new THREE.Mesh(geometry, material);
    mesh.name = geometry.name;
    scene.add(mesh);
}

// Draws a cube.
function drawCube(): void {
    drawObject(getCubeGeometry());
}

// Returns the geometry for a cube of unit length 2, centred in the origin.
function getCubeGeometry(): THREE.Geometry {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    geometry.name = "cube";
    return geometry;
}

// Loads the bunny object from file.
function loadBunny(): void {
    new THREE.OBJLoader(manager).load('bunny-5000.obj', object => {
        object.traverse(child => {
            if (child instanceof THREE.Mesh) {
                bunnyGeometry = child.geometry;
                bunnyGeometry.name = "bunny";
            }
        })
    });
}

// Draws a bunny.
function drawBunny() {
    drawObject(bunnyGeometry);
}

// Draw the x, y, z axes.
function drawAxes(): void {
    // Materials
    const redMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
    const greenMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
    const blueMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});

    // Vectors
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
function handleResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop function. This function is called whenever an update is required.
function animate(): void {
    requestAnimationFrame(animate);

    // TODO: This is a good place for code that rotates your cube (requirement 3).

    // Render the current scene to the screen.
    renderer.render(scene, camera);
}

// Handle keyboard presses.
function handleKeyDown(event): void {
    switch (event.keyCode) {
        // Render modes.
        case 70: // f = face
            changeMeshMaterial(meshMaterials.faces);
            break;

        case 69: // e = edge
            changeMeshMaterial(meshMaterials.edges);
            break;

        case 86: // v = vertex
            // TODO: add code for vertex render mode.
            alert('TODO: add code for vertex render mode (requirement 4).');
            break;

        case 66: //b = bunny
            removeObject(mesh);
            drawBunny();
            break;

        case 67: // c = cube
            removeObject(mesh);
            drawCube();
            break;

        // TODO: add code for starting/stopping rotations (requirement 3).
    }
}

// Change the material of the mesh.
function changeMeshMaterial(newMaterial): void {
    const geometry = mesh.geometry;
    removeObject(mesh);
    mesh = new THREE.Mesh(geometry, newMaterial);
    mesh.name = geometry.name;
    scene.add(mesh);
}

// Remove a 3D object from the scene.
function removeObject(object: THREE.Object3D): void {
    const selectedObject = scene.getObjectByName(object.name);
    scene.remove(selectedObject);
}