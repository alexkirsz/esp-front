import React, { Component } from "react";

import Entity from "./Entity";
import Grid from "./Grid";
import Coords from "./Coords";
import EntityMap from "./EntityMap";
import "./App.css";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 200;
const ZOOM_FACTOR = 200;

class App extends Component {
  constructor() {
    super();

    this.state = {
      x: 0,
      y: 0,
      zoom: 1,
      width: 0,
      height: 0,
      sceneName: null,
      showArrows: false,
      showGrid: false,
      showTrace: true,
      follow: null,
      centered: false,
      clientX: null,
      clientY: null
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("keypress", this.handleKeyPress);
    this.setState(() => ({
      ...this.resize(),
      centered: true
    }));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("keypress", this.handleKeyPress);
  }

  componentWillReceiveProps({ scenes, scene }) {
    if (scenes === null) {
      return;
    }

    let changed = false;
    this.setState(
      state => {
        changed = state.sceneName === null || !scenes.includes(state.sceneName);
        return { sceneName: changed ? scenes[0] : state.sceneName, scenes };
      },
      () => {
        if (changed) {
          this.props.startScene(this.state.sceneName);
        }
      }
    );
  }

  handleSceneChange = e => {
    const { target: { value: sceneName } } = e;
    this.setState(
      () => ({ sceneName, centered: true, zoom: 1, follow: null }),
      () => this.props.startScene(this.state.sceneName)
    );
  };

  resetScene = () => {
    this.setState(
      () => ({ follow: null, centered: true, zoom: 1 }),
      () => this.props.resetScene()
    );
  };

  handleResize = () => {
    this.setState(this.resize);
  };

  resize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  });

  center = () => {
    this.setState(() => ({ follow: null, centered: true }));
  };

  toggleValue = (name, value = null) => {
    this.setState(state => ({
      [name]: value === null ? !state[name] : value
    }));
  };

  getCoords = state => {
    if (state.centered) {
      return {
        x: -window.innerWidth / state.zoom / 2,
        y: -window.innerHeight / state.zoom / 2
      };
    }

    if (state.follow !== null) {
      const following = this.props.scene.entities.find(
        entity => entity.id === state.follow
      );
      if (following !== undefined) {
        return {
          x:
            following.position[0] * this.props.scene.scale -
            state.width / state.zoom / 2,
          y:
            following.position[1] * this.props.scene.scale -
            state.height / state.zoom / 2
        };
      } else {
        return { follow: null, centered: true };
      }
    }

    return { x: state.x, y: state.y };
  };

  handleMouseDown = ({ clientX, clientY }) => {
    this.setState(() => ({
      dragging: true,
      dragStart: [clientX, clientY]
    }));
  };

  handleMouseLeave = () => {
    this.setState(() => ({
      dragging: false,
      dragStart: null,
      clientX: null,
      clientY: null
    }));
  };

  handleMouseUp = () => {
    this.setState(() => ({ dragging: false, dragStart: null }));
  };

  handleMouseMove = ({ clientX, clientY }) => {
    this.setState(state => {
      const { x, y } = this.getCoords(state);
      if (!state.dragging) return { clientX, clientY };
      return {
        dragStart: [clientX, clientY],
        x: x + (state.dragStart[0] - clientX) / state.zoom,
        y: y + (state.dragStart[1] - clientY) / state.zoom,
        follow: null,
        centered: false,
        clientX,
        clientY
      };
    });
  };

  handleWheel = ({ deltaX, deltaY, clientX, clientY }) => {
    this.setState(state => {
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, state.zoom - deltaY / ZOOM_FACTOR)
      );
      let { x, y } = this.getCoords(state);
      const beta = state.zoom / newZoom;
      const cx = clientX / state.zoom;
      const cy = clientY / state.zoom;
      x += cx - cx * beta;
      y += cy - cy * beta;
      return {
        x,
        y,
        zoom: newZoom,
        centered: false
      };
    });
  };

  handleFollow = entityId => {
    this.setState(state => {
      if (state.follow === entityId)
        return { follow: null, ...this.getCoords(state) };
      return { follow: entityId, centered: false };
    });
  };

  handleKeyPress = e => {
    if (!this.props.connected) return;

    switch (e.code) {
      case "KeyR":
        this.resetScene();
        break;
      case "KeyC":
        this.center();
        break;
      case "KeyA":
        this.toggleValue("showArrows");
        break;
      case "KeyG":
        this.toggleValue("showGrid");
        break;
      case "KeyT":
        this.toggleValue("showTrace");
        break;
      default:
        if (e.code.startsWith("Digit")) {
          const idx = parseInt(e.code.slice(5), 10) - 1;
          if (idx < this.props.scene.entities.length) {
            this.handleFollow(this.props.scene.entities[idx].id);
          }
        }
        break;
    }
  };

  render() {
    const { scene, connected, scenes, traces } = this.props;

    const {
      zoom,
      width,
      height,
      showArrows,
      showGrid,
      showTrace,
      follow,
      clientX,
      clientY
    } = this.state;

    const { x, y } = this.getCoords(this.state);

    return (
      <div className="app">
        {!connected && (
          <div className="connection-error">
            <div className="connection-error-title">
              Can't connect to the simulation :(
            </div>
            <div className="connection-error-description">
              <p>
                Please ensure the simulation is running properly. You should see
                a confirmation message in the Rider console.
              </p>
              <p>
                If you can see a confirmation message but the program stops
                without throwing an Exception, contact an assistant.
              </p>
              <p>
                No need to refresh this page. Once the simulation is up and
                running, it will automatically reconnect.
              </p>
            </div>
          </div>
        )}

        {scene !== null && (
          <div className="overlay">
            <div className="controls">
              <div className="controls-left">
                <div className="controls-left-row1">
                  <select
                    value={this.state.sceneName}
                    onChange={this.handleSceneChange}
                  >
                    {scenes.map(scene => (
                      <option key={scene} value={scene}>
                        {scene}
                      </option>
                    ))}
                  </select>

                  <button onClick={this.resetScene}>Reset (R)</button>
                  <button onClick={this.center}>Center (C)</button>
                </div>

                <div className="controls-left-row2">
                  <label className="label">
                    <input
                      className="label-input"
                      type="checkbox"
                      checked={showArrows}
                      onChange={({ target: { checked } }) =>
                        this.toggleValue("showArrows", checked)
                      }
                    />
                    Arrows (A)
                  </label>

                  <label className="label">
                    <input
                      className="label-input"
                      type="checkbox"
                      checked={showGrid}
                      onChange={({ target: { checked } }) =>
                        this.toggleValue("showGrid", checked)
                      }
                    />
                    Grid (G)
                  </label>

                  <label className="label">
                    <input
                      className="label-input"
                      type="checkbox"
                      checked={showTrace}
                      onChange={({ target: { checked } }) =>
                        this.toggleValue("showTrace", checked)
                      }
                    />
                    Trace (T)
                  </label>
                </div>
              </div>

              <div className="controls-right">
                <EntityMap
                  entities={scene.entities}
                  speed={scene.speed}
                  follow={follow}
                  onFollow={this.handleFollow}
                />
              </div>
            </div>

            {clientX !== null && (
              <div className="mouse-position">
                <Coords
                  x={(x + clientX / zoom) / scene.scale}
                  y={(y + clientY / zoom) / scene.scale}
                />
              </div>
            )}
          </div>
        )}

        {scene !== null && (
          <svg
            width={width}
            height={height}
            viewBox={`${x} ${y} ${width / zoom} ${height / zoom}`}
            onMouseDown={this.handleMouseDown}
            onMouseLeave={this.handleMouseLeave}
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
            onWheel={this.handleWheel}
          >
            {scene.entities.map(entity => (
              <Entity
                key={entity.id}
                trace={traces[entity.id]}
                entity={entity}
                scale={scene.scale}
                speed={scene.speed}
                showTrace={showTrace}
                showArrows={showArrows}
              />
            ))}
            {showGrid && <Grid every={100} divisions={10} />}
          </svg>
        )}
      </div>
    );
  }
}

export default App;
