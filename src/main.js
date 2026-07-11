import './style.css';
import * as THREE from 'three';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1d3a5b,_#050816_60%)] text-slate-100">
    <div id="scene" class="absolute inset-0"></div>
    <div class="relative z-10 flex min-h-screen flex-col justify-between p-4 sm:p-8">
      <header class="flex items-center justify-between rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-emerald-300">stoner.cat</p>
          <h1 class="text-lg font-semibold">A calm digital horizon</h1>
        </div>
        <div class="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">Live</div>
      </header>

      <main class="grid flex-1 items-end gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:gap-8">
        <section class="max-w-2xl rounded-[2rem] border border-white/15 bg-slate-900/45 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
          <p class="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-300">Experimental world</p>
          <h2 class="text-3xl font-semibold sm:text-5xl">A soft sky, rolling hills, and a breeze of neon calm.</h2>
          <p class="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">This landing experience pairs a three-dimensional environment with a polished floating menu and a minimal profile card.</p>
        </section>

        <aside class="rounded-[2rem] border border-white/15 bg-slate-900/45 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-6">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-lg font-semibold text-slate-950">SC</div>
            <div>
              <p class="text-sm font-semibold">Sage Canyon</p>
              <p class="text-sm text-slate-400">Digital curator</p>
            </div>
          </div>
          <div class="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <p class="font-medium text-slate-100">Status</p>
            <p class="mt-2">Building dreamy worlds with simple motion and thoughtful atmosphere.</p>
          </div>
        </aside>
      </main>
    </div>
  </div>
`;

const sceneContainer = document.getElementById('scene');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07111f, 0.035);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 3.2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
sceneContainer.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x9acaff, 0.6);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(4, 10, 6);
scene.add(sun);

const skyGeometry = new THREE.BoxGeometry(200, 200, 200);
const skyMaterial = new THREE.MeshBasicMaterial({
  color: 0x7cc7ff,
  side: THREE.BackSide
});
const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skybox);

const terrainGeometry = new THREE.PlaneGeometry(70, 70, 120, 120);
terrainGeometry.rotateX(-Math.PI / 2);
const terrainMaterial = new THREE.MeshStandardMaterial({
  color: 0x5bbd7c,
  roughness: 0.95,
  metalness: 0.02
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
scene.add(terrain);

const positions = terrainGeometry.attributes.position;
for (let i = 0; i < positions.count; i += 1) {
  const x = positions.getX(i);
  const z = positions.getZ(i);
  const n = sampleNoise(x * 0.08, z * 0.08);
  const h = (n + 0.5) * 2.1;
  positions.setY(i, h);
}
positions.needsUpdate = true;
terrainGeometry.computeVertexNormals();

const grassGroup = new THREE.Group();
for (let i = 0; i < 250; i += 1) {
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.18 + Math.random() * 0.25, 0.05),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(0x4bbf71).offsetHSL(0, 0, (Math.random() - 0.5) * 0.06) })
  );
  blade.position.set(
    (Math.random() - 0.5) * 60,
    0.1 + Math.random() * 0.15,
    (Math.random() - 0.5) * 60
  );
  blade.rotation.y = Math.random() * Math.PI;
  blade.rotation.z = (Math.random() - 0.5) * 0.15;
  grassGroup.add(blade);
}
scene.add(grassGroup);

function sampleNoise(x, z) {
  const sx = Math.sin(x * 2.1) * 0.5 + Math.cos(z * 1.3) * 0.5;
  const sy = Math.sin((x + z) * 0.9) * 0.35 + Math.cos(z * 1.7) * 0.35;
  return sx * 0.6 + sy * 0.4;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
