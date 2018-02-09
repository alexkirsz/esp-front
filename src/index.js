import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";
import worker from "workerize-loader!./worker";

const root = document.getElementById("root");
const inst = worker();
async function update() {
  const { scene, scenes, connected, traces } = await inst.getData();
  ReactDOM.render(
    <App
      scenes={scenes}
      traces={{ ...traces }}
      scene={scene}
      connected={connected}
      startScene={inst.startScene}
      resetScene={inst.resetScene}
    />,
    root
  );
  requestAnimationFrame(update);
}

async function start() {
  await inst.connect();
  update();
}

start();
