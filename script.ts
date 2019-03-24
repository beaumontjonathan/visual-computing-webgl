/**
 * Manages the cube, bunny and hanoi views and rotations.
 */
class ObjectManager {
    static readonly VIEW_MODES = {
        FACE: "face",
        EDGE: "edge",
        VERTEX: "vertex"
    };

    private bunnyGeometry: THREE.Geometry;
    private cubeGeometry: THREE.Geometry;
    private rotation: {x: number, y: number; z: number};
    private object: THREE.Object3D;
    private viewMode: string;
    private currentGeometry: THREE.Geometry;
    private currentMaterial: THREE.Material;
    private hanoi: Hanoi;
    a;
    private guideBoxShowing = false;
    private diceTextures: Array<THREE.MeshStandardMaterial>;

    constructor(private scene: THREE.Scene) {
        this.hanoi = new Hanoi();
        this.loadCubeTextures()
        this.a = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({wireframe: true}));
        this.resetRotation();
        this.cubeGeometry = this.getCubeGeometry();
        this.bunnyGeometry = this.getCubeGeometry();
        this.viewMode = ObjectManager.VIEW_MODES.EDGE;
        this.drawCube();
        this.loadBunny();
    }

    public drawHanoi() {
        this.currentGeometry = this.hanoi;
        this.drawObject();
    }

    private getCubeGeometry() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        geometry.name = "cube";
        return geometry;
    }

    public showGuideCube() {
        this.guideBoxShowing = true;
        if (this.currentGeometry instanceof Hanoi) {
            this.hanoi.showBox();
        } else {
            this.scene.add(this.a);
        }
    }

    public hideGuideCube() {
        this.guideBoxShowing = false;
        this.hanoi.hideBox();
        this.scene.remove(this.a);
    }

    private loadBunny() {
        const loadingManager = new THREE.LoadingManager();
        new THREE.OBJLoader(loadingManager).load('bunny-5000.obj', object => {
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    this.bunnyGeometry.name = "bunny";
                    if (child.geometry instanceof THREE.BufferGeometry) {
                        this.bunnyGeometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                    } else {
                        this.bunnyGeometry = child.geometry;
                    }
                    this.scaleBunnyInsideCube();
                }
            });
        });
    }

    private scaleBunnyInsideCube() {
        let minX, maxX, minY, maxY, minZ, maxZ;
        for (let i = 0; i < this.bunnyGeometry.vertices.length; i++) {
            let vertex = this.bunnyGeometry.vertices[i];
            minX = ObjectManager.returnSmallest(vertex.x, minX);
            maxX = ObjectManager.returnLargest(vertex.x, maxX);
            minY = ObjectManager.returnSmallest(vertex.y, minY);
            maxY = ObjectManager.returnLargest(vertex.y, maxY);
            minZ = ObjectManager.returnSmallest(vertex.z, minZ);
            maxZ = ObjectManager.returnLargest(vertex.z, maxZ);
        }
        const lengthOfCubeSide = 2;
        let scaleX = lengthOfCubeSide / -(minX - maxX);
        let scaleY = lengthOfCubeSide / -(minY - maxY);
        let scaleZ = lengthOfCubeSide / -(minZ - maxZ);
        const scale = Math.min(scaleX, scaleY, scaleZ);
        let translationVector = new THREE.Vector3(
            (minX + maxX) * scale / lengthOfCubeSide,
            (minY + maxY) * scale / lengthOfCubeSide,
            (minZ + maxZ) * scale / lengthOfCubeSide,
        );
        this.bunnyGeometry.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
        this.bunnyGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(-translationVector.x, -translationVector.y, -translationVector.z));
    }

    private static returnLargest(a, b): number {
        if (!a) return b;
        if (!b) return a;
        return Math.max(a, b);
    }

    private static returnSmallest(a, b): number {
        if (!a) return b;
        if (!b) return a;
        return Math.min(a, b);

    }

    public drawBunny() {
        this.currentGeometry = this.bunnyGeometry;
        this.drawObject();
    }

    public drawCube() {
        this.currentGeometry = this.cubeGeometry;
        this.drawObject();
    }

    public drawObject() {
        this.removeObject();
        this.updateObject();
        this.rotateObject();
        this.scene.add(this.object);
    }

    private removeObject() {
        if (this.object) {
            this.scene.remove(this.object);
        }
    }

    public rotateX(x) {
        this.rotation.x += x;
        this.rotateObject();
    }

    public rotateY(y) {
        this.rotation.y += y;
        this.rotateObject();
    }

    public rotateZ(z) {
        this.rotation.z += z;
        this.rotateObject();
    }

    public resetRotation() {
        if (this.currentGeometry instanceof Hanoi) {
            this.hanoi.resetGame();
        }

        this.rotation = {x: 0, y: 0, z: 0};
        this.rotateObject();
    }

    private rotateObject() {
        if (!this.object) return;
        this.object.rotation.x = this.rotation.x;
        this.object.rotation.y = this.rotation.y;
        this.object.rotation.z = this.rotation.z;
        this.a.rotation.x = this.rotation.x;
        this.a.rotation.y = this.rotation.y;
        this.a.rotation.z = this.rotation.z;
    }

    private updateObject() {
        this.hanoi.disable();
        if (this.guideBoxShowing) {
            if (this.currentGeometry instanceof Hanoi) {
                this.scene.remove(this.a);
                this.hanoi.showBox();
            } else {
                this.hanoi.hideBox();
                this.scene.add(this.a);
            }
        }
        if (this.currentGeometry instanceof Hanoi) {
            this.object = this.hanoi.getObject();
            this.hanoi.enable();
            return;
        }
        if (this.viewMode === ObjectManager.VIEW_MODES.FACE) {
            if (this.currentGeometry.name === this.cubeGeometry.name) {
                this.object = new THREE.Mesh(this.currentGeometry, this.diceTextures);
            } else {
                this.currentMaterial = new THREE.MeshPhongMaterial({color: 0x2194ce, emissive: 0x0, specular: 0x000000, vertexColors: THREE.NoColors});
                this.object = new THREE.Mesh(this.currentGeometry, this.currentMaterial);
            }
        } else if (this.viewMode === ObjectManager.VIEW_MODES.EDGE) {
            this.currentMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
            this.object = new THREE.Mesh(this.currentGeometry, this.currentMaterial);
        } else if (this.viewMode === ObjectManager.VIEW_MODES.VERTEX) {
            this.currentMaterial = new THREE.PointsMaterial({size: 0.02});
            this.object = new THREE.Points(this.currentGeometry, this.currentMaterial);
        }
    }

    private loadCubeTextures() {
        const diceNumbers = [1, 6, 2, 5, 3, 4];
        const textureLoader = new THREE.TextureLoader();
        this.diceTextures = [];
        diceNumbers.forEach(n => {
            this.diceTextures.push(new THREE.MeshStandardMaterial({
                map: textureLoader.load(`images/side${n}.png`),
                roughness: 0.4
            }));
        });
    }

    public showFaceTexture() {
        this.viewMode = ObjectManager.VIEW_MODES.FACE;
        this.drawObject();
    }

    public showEdgeTexture() {
        this.viewMode = ObjectManager.VIEW_MODES.EDGE;
        this.drawObject();
    }

    public showVertexTexture() {
        this.viewMode = ObjectManager.VIEW_MODES.VERTEX;
        this.drawObject();
    }
}

class Ring {
    object: THREE.Object3D;
    geometry;
    distanceAboveBase: number;
    static normalMaterial = new THREE.MeshStandardMaterial({color: 0x2194ce, roughness: 0});
    static selectedMaterial = new THREE.MeshPhysicalMaterial({color: '#00f'});
    private currentMaterial;
    constructor(public number, private radius, private height, private initialY, private initialX, private scene) {
        this.currentMaterial = Ring.normalMaterial;
        this.initialY += this.height / 2;
        this.drawObject();
    }
    public translateX(x) {
        this.initialX += x;
        this.object.translateX(x);
    }
    public translateY(y) {
        this.initialY += y;
        this.distanceAboveBase += y;
        this.object.translateY(y);
    }
    public translateZ(z) {
        this.object.translateZ(z);
    }

    private drawObject() {
        if (this.object) this.scene.remove(this.object);
        this.geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 128);
        this.object = new THREE.Mesh(this.geometry, this.currentMaterial);
        this.object.translateX(this.initialX);
        this.object.translateY(this.initialY);
        this.object.castShadow = true;
        this.scene.add(this.object);
    }

    public toggleMaterial() {
        if (this.currentMaterial === Ring.normalMaterial) {
            this.currentMaterial = Ring.selectedMaterial;
        } else {
            this.currentMaterial = Ring.normalMaterial;
        }
        this.drawObject();
    }

    public setNormalMaterial() {
        this.currentMaterial = Ring.normalMaterial;
        this.drawObject();
    }

    public setSelectedMaterial() {
        this.currentMaterial = Ring.selectedMaterial;
        this.drawObject();
    }

    static move(obj: Ring, direction, value, time) {
        const framesPerSecond = 60;
        let frames = time * framesPerSecond;
        let timer = time * 1000 / frames;
        let func;
        if (direction === 'x') {
            func = "translateX";
        } else if (direction === 'y') {
            func = "translateY";
        } else if (direction === 'z') {
            func = "translateX";
        }
        let i = setInterval(() => {
            obj[func](value / frames);
        }, timer);
        setTimeout(() => {
            clearInterval(i);
        }, time * 1000);
    }
}

class Tower {
    rings: Array<Ring>;
    object: THREE.Object3D;
    geometry;
    static normalMaterial = new THREE.MeshStandardMaterial({color: '#aaa', roughness: 0});
    static selectedMaterial = new THREE.MeshBasicMaterial({color: '#0f0'});//THREE.MeshPhongMaterial({color: 0x00ff00, emissive: 0x0, specular: 0x111111, vertexColors: THREE.NoColors});
    private currentMaterial;
    private isSelected = false;
    constructor(private radius, private height, private initialX, private initialY, private scene) {
        this.rings = [];
        this.currentMaterial = Tower.normalMaterial;
        this.drawObject();
    }

    public translateX(x) {
        this.object.translateX(x);
    }
    public translateY(y) {
        this.object.translateY(y);
    }
    public translateZ(z) {
        this.object.translateZ(z);
    }

    public push(ring: Ring) {
        this.rings.push(ring);
    }

    public pop(): Ring {
        return this.rings.pop();
    }

    public peak(): Ring {
        if (this.rings.length >= 0)
            return this.rings[this.rings.length - 1];
        return undefined;
    }

    public length(): number {
        return this.rings.length;
    }

    private drawObject() {
        if (this.object) this.scene.remove(this.object);
        this.geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 128);
        this.object = new THREE.Mesh(this.geometry, this.currentMaterial);
        this.object.castShadow = true;
        this.scene.add(this.object);
        this.object.translateY(this.initialY);
        this.object.translateY(this.height / 2);
        this.object.translateX(this.initialX);
    }

    public toggleMaterial() {
        if (this.isSelected) {
            this.currentMaterial = Tower.normalMaterial;
        } else {
            this.currentMaterial = Tower.selectedMaterial;
        }
        this.isSelected = ! this.isSelected;
        this.drawObject();
    }

    public setNormalMaterial() {
        this.currentMaterial = Tower.normalMaterial;
        this.drawObject();
    }

    public setSelectedMaterial() {
        this.currentMaterial = Tower.selectedMaterial;
        this.drawObject();
    }

    public selectTopRing() {
        if (this.peak()) this.peak().setSelectedMaterial();
    }

    public deselectTopRing() {
        if (this.peak()) this.peak().setNormalMaterial();
    }
}

class Hanoi {
    private towers: Array<Tower>;
    private group;
    static readonly minRingWidth = 0.1;
    static readonly maxRingWidth = 0.2;
    static readonly towerHeight = 1.2;
    static readonly baseMaterial = new THREE.MeshPhongMaterial({color: '#fff'});//new THREE.MeshPhongMaterial({color: 0x2194ce, emissive: 0x0, specular: 0x333333, vertexColors: THREE.NoColors});
    static readonly baseWidth = 2;
    static readonly baseHeight = 0.1;
    static readonly baseDepth = 1;
    private selectedTower = 0;
    private ringHeight: number;
    private enabled = false;
    private nMoves: number;
    private movesText;
    public nRings;
    private textBox;
    private gameWon;
    private ringSelected = false;
    private hanoiBox;
    constructor() {
        this.hanoiBox = new THREE.Mesh(new THREE.BoxGeometry(Hanoi.baseWidth, Hanoi.baseHeight + Hanoi.towerHeight, Hanoi.baseDepth), new THREE.MeshBasicMaterial({wireframe: true}));
        this.hanoiBox.translateY((Hanoi.baseHeight + Hanoi.towerHeight) / 2);
        this.nRings = 5;
        this.setupTextBox();

        this.group = new THREE.Object3D();
        this.group.castShadow = true;
        this.group.receiveShadow = true;
        this.setupBase();
        this.startGame();


        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    public showBox() {
        this.group.add(this.hanoiBox);
    }

    public hideBox() {
        this.group.remove(this.hanoiBox);
    }

    private setupTextBox() {
        this.textBox = document.createElement('div');
        this.textBox.style.position = 'absolute';
        //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        this.textBox.style.width = 100;
        this.textBox.style.height = 120;
        this.textBox.style.display = "none";
        this.textBox.style.backgroundColor = "blue";
        this.textBox.style.top = 0 + 'px';
        this.textBox.style.left = 0 + 'px';
        this.textBox.style.fontFamily = "helvetica";
        this.textBox.style.textAlign = "center";

        this.movesText = document.createElement('p');
        this.movesText.innerHTML = 'hello world';
        this.textBox.appendChild(this.movesText);

        const ringsBox = document.createElement('p');
        this.textBox.appendChild(ringsBox);
        ringsBox.innerHTML = 'Rings: ';

        //Create and append select list
        const selectList: HTMLSelectElement = document.createElement("select");
        selectList.id = "mySelect";
        ringsBox.appendChild(selectList);

        //Create and append the options
        for (let i = 2; i <= 9; i++) {
            const option: HTMLOptionElement = document.createElement("option");
            if (i === 5) option.selected = true;
            option.value = i.toString();
            option.text = i.toString();
            selectList.appendChild(option);
        }

        selectList.onchange = function() {
            a.nRings = parseInt(this.options[this.selectedIndex].text);
            this.blur();
            a.resetGame();
        };


        let button = document.createElement("input");
        button.type = "button";
        button.value = "Reset";
        let a = this;
        button.onclick = function() {
            a.resetGame();
            this.blur();
        };

        this.textBox.appendChild(button);

        document.body.appendChild(this.textBox);
    }

    public resetGame() {
        this.clearGame();
        this.startGame();
    }

    private clearGame() {
        for (let i = 0; i < this.towers.length; i++) {
            let tower = this.towers[i];
            while (tower.peak()) {
                this.group.remove(tower.pop().object);
            }
        }
    }

    private startGame() {
        this.gameWon = false;
        this.resetMoveCounter();
        this.ringHeight = (Hanoi.towerHeight - 0.2) / this.nRings;

        for (let i = this.nRings; i > 0; i--) {
            let step = (Hanoi.maxRingWidth - Hanoi.minRingWidth) / (this.nRings - 1);
            let radius = Hanoi.minRingWidth + (step * (i - 1));
            let initialY = (this.nRings - i) * this.ringHeight + Hanoi.baseHeight;
            let initialX = -0.75;
            let ring = new Ring(i, radius, this.ringHeight, initialY, initialX, this.group);
            this.towers[0].push(ring);
        }

        this.towers[this.selectedTower].setSelectedMaterial();
    }

    private setupBase() {
        let base = new THREE.Mesh(new THREE.BoxGeometry(Hanoi.baseWidth, Hanoi.baseHeight, Hanoi.baseDepth), Hanoi.baseMaterial);
        base.translateY(Hanoi.baseHeight / 2);
        this.group.add(base);
        base.receiveShadow = true;
        this.towers = [];

        for (let i = 0; i < 3; i++) {
            let tower = new Tower(0.05, Hanoi.towerHeight, 0.75 * (i-1), Hanoi.baseHeight, this.group);
            this.towers.push(tower);
        }
    }

    public enable() {
        this.enabled = true;
        this.textBox.style.display = "block";
    }

    public disable() {
        this.enabled = false;
        this.textBox.style.display = "none";
    }

    private handleKeyDown(event) {
        switch(event.keyCode) {
            case 32:
                this.spacePressed();
                break;

            case 49:
                this.numPressed(0);
                break;

            case 50:
                this.numPressed(1);
                break;

            case 51:
                this.numPressed(2);
                break;


        }
    }

    private spacePressed() {
        if (!this.enabled) return;
        if (this.ringSelected) {
            this.ringSelected = false;
            this.towers[this.selectedTower].deselectTopRing();
            this.towers[this.selectedTower].setSelectedMaterial();
        } else if (this.towers[this.selectedTower].peak()) {
            this.ringSelected = true;
            this.towers[this.selectedTower].setNormalMaterial();
            this.towers[this.selectedTower].selectTopRing();
        }
    }

    private numPressed(n) {
        if (!this.enabled) return;
        if (this.ringSelected) {
            if (this.move(this.selectedTower, n)) {
                this.selectedTower = n;
            } else {
            }
        } else {
            if (n !== this.selectedTower) {
                this.towers[this.selectedTower].setNormalMaterial();
                this.towers[n].setSelectedMaterial();
                this.selectedTower = n;
            }
        }
    }

    private resetMoveCounter() {
        this.nMoves = 0;
        this.updateMovesText();
    }

    public move(fromN, toN) {
        return this.moveRing(this.towers[fromN], this.towers[toN]);
    }

    private moveRing(from: Tower, to: Tower): boolean {
        if (!this.isValidMove(from, to)) return false;
        this.nMoves++;
        this.updateMovesText();
        let ring = from.peak();
        ring.translateX((this.towers.indexOf(to) - this.towers.indexOf(from)) * 0.75);
        ring.translateY((-from.length() + 1 + to.length()) * this.ringHeight);
        to.push(from.pop());
        if (!this.gameWon && to.rings.length == this.nRings && this.towers.indexOf(to) !== 0) {
            this.gameWon = true;
            let message;
            if (this.nMoves === (Math.pow(2, this.nRings) - 1)) {
                message = 'Congratulations! You won in the minimum number of moves!'
            } else {
                message = 'Congratulations! You have won, but not in the minimum number of moves.. try again?';
            }
            setTimeout(() => {
                alert(message);
            }, 100);
        }
        return true;
    }

    private updateMovesText() {
        this.movesText.innerHTML = `Moves: ${this.nMoves}`;
    }

    private isValidMove(from: Tower, to: Tower): boolean {
        if (from === to) return false;
        if (!from.peak()) return false;
        if (to.peak() && to.peak().number < from.peak().number) return false;
        return true;
    }

    private complete(n, from, to, via) {
        if (n == 0) return;
        let a = this;
        setTimeout(() => {
            this.complete(n-1, from, via, to);
        }, 500);
        setTimeout(() => {
            a.move(from, to);
        }, 1000);
        setTimeout(() => {
            this.complete(n-1, via, to, from);
        }, 1500);
    }

    public completeMe() {
        this.complete(5, 0, 2, 1);
    }

    public getObject() {
        return this.group;
    }
}

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let objectManager: ObjectManager;
let positionSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 128, 128), new THREE.MeshPhongMaterial({color: 0x2194ce, emissive: 0x0, specular: 0x000000, vertexColors: THREE.NoColors}));//new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1));

let previousMouse = {
    x: undefined,
    y: undefined
};
let cameraRotation = {
    elevation: Math.PI/3,
    azimuth: Math.PI/3
};
const keyDown = {
    x: false,
    y: false,
    z: false,
    minus: false,
    up: false,
    down: false,
    left: false,
    right: false,
    pgup: false,
    pgdown: false,
    w: false,
    s: false,
    d: false,
    a: false
};
let mouseDown = false;
let scrollDown = false;

let lookAtPosition = new THREE.Vector3(0, 0, 0);
let previousCameraPosition: THREE.Vector3;




// Initialise the scene, and draw it for the first time.
init();
animate();

let grid;

// Listen for keyboard events, to react to them.
// Note: there are also other event listeners, e.g. for mouse events.
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('mousewheel', handleMouseWheel, false);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);


// Scene initialisation. This function is only run once, at the very beginning.
function init(): void {
    setup();

    drawAxes();
    objectManager = new ObjectManager(scene);
    objectManager.drawObject();

    // Handle resizing of the browser window.
    window.addEventListener('resize', handleResize, false);
}

// Sets up the camera, scene, and renderer.
function setup() {
    // Set up the camera, move it to (3, 4, 5) and look at the origin (0, 0, 0).
    function setupCamera(): void {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(3, 4, 5);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        angleCamera();
    }

    // Sets up the scene, adds a helper grid and basic lighting.
    function setupScene(): void {
        scene = new THREE.Scene();

        scene.add(positionSphere);

        // Draw a helper grid in the x-z plane (note: y is up).
        grid = new THREE.GridHelper(10, 10, 0xffffff);
        grid.name = "my grid";
        scene.add(grid);

        // Basic ambient lighting.
        scene.add(new THREE.AmbientLight(0x222222));
        // TODO: add more complex lighting for 'face' rendering mode (requirement 4).

        const lights = [];
        //lights[ 0 ] = new THREE.PointLight( 0xffffff, 0.5, 0 );
        lights[0] = new THREE.PointLight( 0xffffff, 0.7, 0 );
        lights[1] = new THREE.PointLight( 0xffffff, 0.7, 0 );
        lights[2] = new THREE.PointLight( 0xffffff, 0.3, 0 );

        //lights[ 0 ].position.set( 0, 2, 0 );
        lights[0].position.set( 1, 2, 1 );
        lights[1].position.set( - 1, - 2, - 1 );
        lights[2].position.set(0, 0.5, 2);

        for (let i = 0; i < lights.length; i++) {
            lights[i].castShadow = true;
            lights[i].shadowDarkness = 0.5;
            scene.add(lights[i]);
        }
    }

    // Set up the Web GL renderer.
    function setupRenderer(): void {
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;

        renderer.setPixelRatio(window.devicePixelRatio); // HiDPI/retina rendering
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    }

    setupCamera();
    setupScene();
    setupRenderer();
}

// Animation loop function. This function is called whenever an update is required.
function animate(): void {
    function translateCamera() {
        if (keyDown.up) {
            let x = camera.position.x, y = camera.position.y, z = camera.position.z;
            camera.translateY(moveIncrement);
            let dif = new THREE.Vector3(camera.position.x - x, camera.position.y - y, camera.position.z - z);
            lookAtPosition.x += dif.x;
            lookAtPosition.y += dif.y;
            lookAtPosition.z += dif.z;
        }
        if (keyDown.down) {
            let x = camera.position.x, y = camera.position.y, z = camera.position.z;
            camera.translateY(-moveIncrement);
            let dif = new THREE.Vector3(camera.position.x - x, camera.position.y - y, camera.position.z - z);
            lookAtPosition.x += dif.x;
            lookAtPosition.y += dif.y;
            lookAtPosition.z += dif.z;
        }
        if (keyDown.left) {
            let x = camera.position.x, y = camera.position.y, z = camera.position.z;
            camera.translateX(-moveIncrement);
            let dif = new THREE.Vector3(camera.position.x - x, camera.position.y - y, camera.position.z - z);
            lookAtPosition.x += dif.x;
            lookAtPosition.y += dif.y;
            lookAtPosition.z += dif.z;

        }
        if (keyDown.right) {
            let x = camera.position.x, y = camera.position.y, z = camera.position.z;
            camera.translateX(moveIncrement);
            let dif = new THREE.Vector3(camera.position.x - x, camera.position.y - y, camera.position.z - z);
            lookAtPosition.x += dif.x;
            lookAtPosition.y += dif.y;
            lookAtPosition.z += dif.z;
        }
        if (keyDown.pgup) {
            camera.translateZ(-moveIncrement * 2);
        }
        if (keyDown.pgdown) {
            camera.translateZ(moveIncrement * 2);
        }
    }
    function rotateCamera() {
        if (keyDown.w) {
            increaseElevation(-0.01);
        }
        if (keyDown.s) {
            increaseElevation(0.01);

        }
        if (keyDown.d) {
            increaseAzimuth(-0.01);

        }
        if (keyDown.a) {
            increaseAzimuth(0.01);
        }
    }
    function rotateObject() {
        if (keyDown.x) {
            objectManager.rotateX(rotateIncrement)
        }
        if (keyDown.y) {
            objectManager.rotateY(rotateIncrement);
        }
        if (keyDown.z) {
            objectManager.rotateZ(rotateIncrement);
        }
    }
    //console.log(cameraRotation.elevation);
    requestAnimationFrame(animate);

    // TODO: This is a good place for code that rotates your cube (requirement 3).
    const rotateIncrement = keyDown.minus ? -0.01 : 0.01;
    const moveIncrement = keyDown.minus ? -0.04 : 0.04;

    translateCamera();
    rotateCamera();
    rotateObject();


    //updateCameraPosition();
    angleCamera();

    // Render the current scene to the screen.
    render();
}

// Renders the scene.
function render(): void {
    renderer.render(scene, camera);
}

function increaseElevation(x) {
    cameraRotation.elevation += x;
    if (cameraRotation.elevation < 0) {
        cameraRotation.elevation = 0.00000000000001;
    }
    if (cameraRotation.elevation > Math.PI) {
        cameraRotation.elevation = Math.PI;
    }

}

function increaseAzimuth(x) {
    cameraRotation.azimuth += x;
}

function angleCamera() {
    const relative = new THREE.Vector3(camera.position.x - lookAtPosition.x, camera.position.y - lookAtPosition.y, camera.position.z - lookAtPosition.z);
    const r = Math.sqrt(Math.pow(relative.x, 2) + Math.pow(relative.y, 2) + Math.pow(relative.z, 2));
    const x = r * Math.cos(cameraRotation.azimuth) * (Math.sin(cameraRotation.elevation));
    const z = r * Math.sin(cameraRotation.azimuth) * (Math.sin(cameraRotation.elevation));
    const y = r * Math.cos(cameraRotation.elevation);
    camera.position.set(x + lookAtPosition.x, y + lookAtPosition.y, z + lookAtPosition.z);
    camera.lookAt(lookAtPosition);


    positionSphere.position.setX(lookAtPosition.x);
    positionSphere.position.setY(lookAtPosition.y);
    positionSphere.position.setZ(lookAtPosition.z);
}

// Resets the location of the camera and rotation of the object.
function reset() {
    cameraRotation = {
        elevation: Math.PI/3,
        azimuth: Math.PI/3
    };
    camera.position.set(3, 4, 5);
    lookAtPosition = new THREE.Vector3(0, 0, 0);
    objectManager.resetRotation();
}

/* HANDLERS */

// Handle keyboard presses.
function handleKeyDown(event): void {
    switch (event.keyCode) {
        case 33: // page up arrow
            keyDown.pgup = true;
            break;

        case 34: // page down arrow
            keyDown.pgdown = true;
            break;

        case 37: // left arrow
            keyDown.left = true;
            break;

        case 38: // up arrow
            keyDown.up = true;
            break;

        case 39: // right arrow
            keyDown.right = true;
            break;

        case 40: // down arrow
            keyDown.down = true;
            break;

        // Render modes.
        case 70: // f = face
            objectManager.showFaceTexture();
            break;

        case 69: // e = edge
            objectManager.showEdgeTexture();
            break;

        case 86: // v = vertex
            objectManager.showVertexTexture();
            break;

        case 66: //b = bunny
            objectManager.drawBunny();
            break;

        case 67: // c = cube
            objectManager.drawCube();
            break;

        case 71: // g = toggle grid
            toggleGrid();
            break;

        case 72: // h = hanoi
            objectManager.drawHanoi();
            break;

        case 82: // r = reset rotation
            reset();
            break;

        case 88: // x = rotate x
            keyDown.x = true;
            break;

        case 89: // y = rotate y
            keyDown.y = true;
            break;

        case 90: // z = rotate z
            keyDown.z = true;
            break;

        case 189: // minus = reverse rotate direction
            keyDown.minus = true;
            break;

        case 87: // w = rotate up
            keyDown.w = true;
            break;

        case 83: // s = rotate down
            keyDown.s = true;
            break;

        case 65: // a = rotate left
            keyDown.a = true;
            break;

        case 68: // d = rotate right
            keyDown.d = true;
            break;

        // TODO: add code for starting/stopping rotations (requirement 3).
    }
}

// Toggles whether the grid is visible in the scene.
function toggleGrid() {
    if (scene.getObjectByName(grid.name)) {
        scene.remove(grid);
    } else {
        scene.add(grid);
    }
}


// Handle keyboard releases.
function handleKeyUp(event): void {
    switch (event.keyCode) {
        case 33: // page up arrow
            keyDown.pgup = false;
            break;

        case 34: // page down arrow
            keyDown.pgdown = false;
            break;

        case 37: // left arrow
            keyDown.left = false;
            break;

        case 38: // up arrow
            keyDown.up = false;
            break;

        case 39: // right arrow
            keyDown.right = false;
            break;

        case 40: // down arrow
            keyDown.down = false;
            break;

        case 88: // x = rotate x
            keyDown.x = false;
            break;

        case 89: // y = rotate y
            keyDown.y = false;
            break;

        case 90: // z = rotate z
            keyDown.z = false;
            break;

        case 189: // minus = reverse rotate direction
            keyDown.minus = false;
            break;

        case 87: // w = rotate up
            keyDown.w = false;
            break;

        case 83: // s = rotate down
            keyDown.s = false;
            break;

        case 65: // a = rotate left
            keyDown.a = false;
            break;

        case 68: // d = rotate right
            keyDown.d = false;
            break;
    }
}

// Handle resizing of the browser window.
function handleResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handles scrolling of the mouse wheel.
function handleMouseWheel(event): void {
    camera.translateZ(event.deltaY / 200);
}

// Handles mouse movements.
function handleMouseMove(event): void {
    let x = event.screenX;
    let y = event.screenY;

    if (mouseDown && previousMouse.x) {
        let xDiff = previousMouse.x - x;
        let yDiff = previousMouse.y - y;
        increaseAzimuth(-xDiff * (2 * Math.PI / window.innerWidth));
        increaseElevation(yDiff * (2 * Math.PI / window.innerHeight));
    }

    previousMouse.x = x;
    previousMouse.y = y;
}

// Handles mouse click downs.
function handleMouseDown(event): void {
    if (event.button === 0)
        mouseDown = true;
    else (event.button === 1)
        scrollDown = true;
    objectManager.showGuideCube();
}

// Handles mouse click ups.
function handleMouseUp(event): void {
    if (event.button === 0)
        mouseDown = false;
    else (event.button === 1)
        scrollDown = false;
    objectManager.hideGuideCube();
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

