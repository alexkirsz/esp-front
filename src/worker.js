import { SERVER, RECONNECT_INTERVAL, MAX_TRACE, CHUNK_SIZE } from "./constants";

let connectTimeout = null;
let socket = null;
let scenes = null;
let scene = null;
let currentSceneName = null;
let traces = {};

export function connect() {
  connectTimeout = null;
  socket = new WebSocket(SERVER);
  socket.onopen = handleOpen;
  socket.onmessage = handleMessage;
  socket.onclose = handleClose;
  socket.onerror = handleClose;
}

function handleOpen() {
  if (currentSceneName !== null) {
    startScene(currentSceneName);
  }
}

function handleClose() {
  if (connectTimeout !== null) return;
  connectTimeout = setTimeout(connect, RECONNECT_INTERVAL);
}

function handleMessage(e) {
  const message = JSON.parse(e.data);
  switch (message.type) {
    case "scenes":
      scenes = message.data;
      break;
    case "scene": {
      scene = message.data;

      traces = { ...traces };
      const newIds = new Set();
      const prevIds = new Set(Object.keys(traces));
      for (const entity of scene.entities) {
        newIds.add(entity.id);
        if (prevIds.has(entity.id)) {
          traces[entity.id].push([...entity.position, scene.t]);
          if (traces[entity.id].length === MAX_TRACE + CHUNK_SIZE) {
            traces[entity.id].splice(0, CHUNK_SIZE);
          }
        } else {
          traces[entity.id] = [[...entity.position, scene.t]];
        }
      }

      const toRemove = [...prevIds].filter(id => !newIds.has(id));
      for (const id of toRemove) {
        delete traces[id];
      }
      break;
    }
    default:
      break;
  }
}

export function startScene(sceneName) {
  if (socket.readyState !== WebSocket.OPEN) return;
  currentSceneName = sceneName;
  socket.send(`scene ${sceneName}`);
}

export function resetScene() {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send("reset");
}

export function getData() {
  return {
    scenes,
    traces,
    scene,
    connected: socket.readyState === WebSocket.OPEN
  };
}
