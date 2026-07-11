import './style.css';
import * as THREE from 'three';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div id="scene" class="absolute inset-0"></div>
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute right-2 top-2 text-[8px] uppercase tracking-[0.3em] text-slate-200/80 sm:right-3 sm:top-3 sm:text-[9px]">stoner.cat</div>
      <div class="absolute bottom-3 left-3 right-3 rounded-[1.5rem] border border-white/20 bg-slate-900/65 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[20rem] sm:p-4 md:max-w-[22rem] lg:max-w-[24rem]">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 text-sm font-semibold text-slate-950">SC</div>
          <div class="min-w-0">
            <p class="text-[10px] uppercase tracking-[0.3em] text-cyan-300">stoner.cat</p>
            <p class="truncate text-sm font-semibold text-white">Sage Canyon</p>
            <p class="truncate text-sm text-slate-400">Liminal profile</p>
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-300">Standing in the glow of a quiet horizon, looking out across a warm, rolling plain.</p>
      </div>
    </div>
  </div>
`;

const sceneContainer = document.getElementById('scene');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x8bbad2, 35, 140);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 1.72, 0);
const lookTarget = new THREE.Vector3(0, 1.7, -24);
camera.lookAt(lookTarget);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x88c8ff, 1);
sceneContainer.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xb9e0ff, 0x32411e, 0.8);
scene.add(hemiLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
sunLight.position.set(10, 18, 6);
scene.add(sunLight);
const fillLight = new THREE.DirectionalLight(0x7ec4ff, 0.35);
fillLight.position.set(-8, 7, -8);
scene.add(fillLight);
const rimLight = new THREE.PointLight(0xfff2c8, 8, 100, 2);
rimLight.position.set(0, 20, -30);
scene.add(rimLight);

const mist = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 60),
  new THREE.MeshBasicMaterial({
    color: 0xecefe9,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  })
);
mist.position.set(0, 12, -70);
mist.rotation.x = -Math.PI / 2;
scene.add(mist);

const skyMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    topColor: { value: new THREE.Color(0x8fd9ff) },
    bottomColor: { value: new THREE.Color(0x42667d) }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition).y;
      vec3 col = mix(bottomColor, topColor, max(pow(max(h, 0.0), 0.35), 0.0));
      gl_FragColor = vec4(col, 1.0);
    }
  `
});
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), skyMaterial);
scene.add(skyDome);

const terrainSize = 160;
const terrainSegments = 180;
const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
terrainGeometry.rotateX(-Math.PI / 2);

const horizon = new THREE.Mesh(
  new THREE.PlaneGeometry(terrainSize * 1.2, 30, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x7a9d84, transparent: true, opacity: 0.65 })
);
horizon.position.set(0, 0.5, -terrainSize * 0.45);
horizon.rotation.x = -Math.PI / 2;
scene.add(horizon);
const positions = terrainGeometry.attributes.position;
const colors = [];
for (let i = 0; i < positions.count; i += 1) {
  const x = positions.getX(i);
  const z = positions.getZ(i);
  const height = getTerrainHeight(x, z);
  positions.setY(i, height);
  const color = new THREE.Color();
  const shade = 0.18 + Math.max(0, height) * 0.07 + Math.sin((x + z) * 0.025) * 0.03;
  color.setHSL(0.28 + height * 0.01, 0.42, shade);
  colors.push(color.r, color.g, color.b);
}
terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
positions.needsUpdate = true;
terrainGeometry.computeVertexNormals();

const terrainMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.95,
  metalness: 0.01
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
scene.add(terrain);

const grassGroup = new THREE.Group();
const grassRows = 24;
const grassCols = 24;
for (let row = 0; row < grassRows; row += 1) {
  for (let col = 0; col < grassCols; col += 1) {
    const x = (col - (grassCols - 1) / 2) * 5.4;
    const z = (row - (grassRows - 1) / 2) * 5.4;
    if (Math.abs(x) > terrainSize * 0.38 || Math.abs(z) > terrainSize * 0.38) continue;

    const y = getTerrainHeight(x, z) + 0.06;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.11 + ((row + col) % 5) * 0.018, 0.035),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4fb36d).offsetHSL(0, 0, ((row + col) % 7) * 0.007)
      })
    );
    blade.position.set(x, y, z);
    blade.rotation.y = (row % 3) * 0.35;
    blade.rotation.z = ((col % 2) === 0 ? -1 : 1) * 0.08;
    blade.scale.setScalar(0.95 + ((row + col) % 4) * 0.05);
    grassGroup.add(blade);
  }
}
scene.add(grassGroup);

function getTerrainHeight(x, z) {
  const base = samplePerlin(x * 0.017, z * 0.017);
  const ridge = Math.sin((x + z) * 0.03) * 0.18 + Math.cos(x * 0.02 - z * 0.015) * 0.1;
  const glow = Math.max(0, 1 - Math.abs(z) / (terrainSize * 0.55)) * 0.25;
  return Math.max(0.1, base * 2.2 + ridge + Math.sin(x * 0.04) * 0.12 + Math.cos(z * 0.03) * 0.1 + glow * 0.35);
}

function samplePerlin(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const xf = x - x0;
  const zf = z - z0;
  const u = fade(xf);
  const v = fade(zf);

  const n00 = hash(x0, z0);
  const n10 = hash(x0 + 1, z0);
  const n01 = hash(x0, z0 + 1);
  const n11 = hash(x0 + 1, z0 + 1);

  const x1 = lerp(n00, n10, u);
  const x2 = lerp(n01, n11, u);
  return lerp(x1, x2, v);
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hash(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function animate(time) {
  requestAnimationFrame(animate);
  const sway = Math.sin(time * 0.0006) * 0.008;
  const wind = Math.sin(time * 0.0012) * 0.015;
  camera.position.y = 1.72 + sway;
  camera.lookAt(lookTarget);

  grassGroup.children.forEach((blade, index) => {
    const base = Math.sin(time * 0.001 + index * 0.08) * 0.008;
    blade.rotation.z = (index % 2 === 0 ? -1 : 1) * 0.08 + wind + base;
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
