// LumosMind App.js (Fully working with panel/modal logic re-added)
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(20, 30, 10);
scene.add(light);

function createStars(count = 400) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push((Math.random() - 0.5) * 1000);
    positions.push((Math.random() - 0.5) * 1000);
    positions.push((Math.random() - 0.5) * 1000);
  }
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
createStars();

const planets = [];

const pomodoroDisplay = document.createElement('div');
pomodoroDisplay.id = 'pomodoroTimer';
pomodoroDisplay.style.position = 'absolute';
pomodoroDisplay.style.top = '20px';
pomodoroDisplay.style.left = '50%';
pomodoroDisplay.style.transform = 'translateX(-50%)';
pomodoroDisplay.style.fontSize = '28px';
pomodoroDisplay.style.fontWeight = 'bold';
pomodoroDisplay.style.color = '#00ffe7';
pomodoroDisplay.style.background = 'rgba(0,0,0,0.8)';
pomodoroDisplay.style.padding = '10px 20px';
pomodoroDisplay.style.border = '2px solid #00ffe7';
pomodoroDisplay.style.borderRadius = '10px';
pomodoroDisplay.style.zIndex = '999';
pomodoroDisplay.style.fontFamily = 'monospace';
pomodoroDisplay.style.transition = 'opacity 0.5s ease';
pomodoroDisplay.style.opacity = '0';
document.body.appendChild(pomodoroDisplay);

const pomodoroSound = new Audio(
  'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'
);

function showPomodoro(text) {
  pomodoroDisplay.style.opacity = '1';
  pomodoroDisplay.textContent = text;
}
function hidePomodoro() {
  pomodoroDisplay.style.opacity = '0';
  setTimeout(() => (pomodoroDisplay.textContent = ''), 600);
}

function createPlanet(name = 'Untitled', type = 'category', taskNames = []) {
  const geo = new THREE.SphereGeometry(2, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00ffe7 });
  const planet = new THREE.Mesh(geo, mat);
  planet.position.set(
    Math.random() * 60 - 30,
    Math.random() * 20 - 10,
    Math.random() * 60 - 30
  );
  planet.userData = { name, note: '', type, moons: [] };
  scene.add(planet);
  taskNames.forEach((name) => createMoon(planet, name));
  planets.push(planet);
  return planet;
}

function createMoon(planet, taskName = '') {
  const geo = new THREE.SphereGeometry(0.4, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const moon = new THREE.Mesh(geo, mat);
  moon.userData.orbit = {
    parent: planet,
    angle: Math.random() * Math.PI * 2,
    radius: 3 + Math.random() * 2,
    speed: 0.01 + Math.random() * 0.01,
  };
  moon.userData.type = 'task';
  moon.userData.done = false;
  moon.userData.name = taskName;
  moon.userData.id = Date.now() + Math.random();
  moon.userData.subtasks = [];
  scene.add(moon);
  planet.userData.moons.push(moon);
  return moon;
}

function animate() {
  requestAnimationFrame(animate);
  planets.forEach((planet) => {
    planet.userData.moons.forEach((moon) => {
      const orbit = moon.userData.orbit;
      orbit.angle += orbit.speed;
      moon.position.x =
        orbit.parent.position.x + Math.cos(orbit.angle) * orbit.radius;
      moon.position.z =
        orbit.parent.position.z + Math.sin(orbit.angle) * orbit.radius;
      moon.position.y =
        orbit.parent.position.y + Math.sin(orbit.angle * 2) * 0.5;
      moon.material.color.set(moon.userData.done ? 0x00ff00 : 0xffffff);
    });
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();
// 🌍 Detect click on planet and toggle side panel
window.addEventListener('click', (e) => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    if (selectedPlanet === clicked) {
      // Re-click closes the panel
      sidePanel.style.display = 'none';
      selectedPlanet = null;
    } else {
      selectedPlanet = clicked;
      renderSidePanel(selectedPlanet);
    }
  }
});

const modal = document.getElementById('noteModal');
const titleInput = document.getElementById('noteTitle');
const textarea = document.getElementById('noteInput');
const typeInput = document.getElementById('ideaType');
const sidePanel = document.getElementById('sidePanel');
const sideTitle = document.getElementById('sideTitle');
const taskList = document.getElementById('taskList');

let selectedPlanet = null;

function renderSidePanel(planet) {
  sidePanel.style.display = 'block';
  sidePanel.style.opacity = '1';
  sideTitle.textContent = planet.userData.name || 'Untitled';
  taskList.innerHTML = '';

  planet.userData.moons.forEach((moon) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = moon.userData.done;
    checkbox.addEventListener('change', () => {
      moon.userData.done = checkbox.checked;
    });

    const span = document.createElement('span');
    span.textContent = moon.userData.name || `Task - ${moon.userData.id}`;

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start';
    startBtn.onclick = () => {
      const mode = confirm(
        'Start Pomodoro? Press Cancel to go at your own pace.'
      )
        ? 'pomodoro'
        : 'own pace';
      if (mode === 'pomodoro') {
        let timer = 25 * 60;
        clearInterval(window._pomodoroTimer);
        window._pomodoroTimer = setInterval(() => {
          if (timer <= 0) {
            clearInterval(window._pomodoroTimer);
            hidePomodoro();
            pomodoroSound.play();
            alert('Pomodoro complete! Take a break.');
          } else {
            showPomodoro(
              `Pomodoro: ${Math.floor(timer / 60)}:${(timer % 60)
                .toString()
                .padStart(2, '0')}`
            );
            timer--;
          }
        }, 1000);
      } else {
        alert('Task started (own pace mode).');
      }
    };

    const addSubtaskBtn = document.createElement('button');
    addSubtaskBtn.textContent = '➕ Subtask';
    addSubtaskBtn.onclick = () => {
      const sub = prompt('Enter subtask:');
      if (sub) {
        moon.userData.subtasks.push({ title: sub, done: false });
        renderSidePanel(planet);
      }
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(startBtn);
    li.appendChild(addSubtaskBtn);

    if (moon.userData.subtasks.length > 0) {
      const subUl = document.createElement('ul');
      moon.userData.subtasks.forEach((sub) => {
        const subLi = document.createElement('li');
        const subCheckbox = document.createElement('input');
        subCheckbox.type = 'checkbox';
        subCheckbox.checked = sub.done;
        subCheckbox.addEventListener(
          'change',
          () => (sub.done = subCheckbox.checked)
        );
        subLi.appendChild(subCheckbox);
        subLi.appendChild(document.createTextNode(sub.title));
        subUl.appendChild(subLi);
      });
      li.appendChild(subUl);
    }

    taskList.appendChild(li);
  });

  const addTaskBtn = document.createElement('button');
  addTaskBtn.textContent = 'Add Task';
  addTaskBtn.onclick = () => {
    const taskName = prompt('New Task Name:');
    if (taskName) {
      createMoon(planet, taskName);
      renderSidePanel(planet);
    }
  };
  taskList.appendChild(addTaskBtn);
}

document.getElementById('addNodeBtn')?.addEventListener('click', () => {
  const name = prompt('Name your planet:');
  const tasks = prompt('Add tasks for this planet (comma-separated):');
  const taskNames = tasks ? tasks.split(',').map((t) => t.trim()) : [];
  if (name) createPlanet(name, 'category', taskNames);
});

document.getElementById('saveNote').addEventListener('click', () => {
  if (selectedPlanet) {
    selectedPlanet.userData.name = titleInput.value;
    selectedPlanet.userData.note = textarea.value;
    selectedPlanet.userData.type = typeInput.value;
    renderSidePanel(selectedPlanet);
  }
  modal.style.display = 'none';
});

window.addEventListener('dblclick', (e) => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.userData?.type === 'task') {
      obj.userData.done = !obj.userData.done;
      renderSidePanel(selectedPlanet);
    }
  }
});
