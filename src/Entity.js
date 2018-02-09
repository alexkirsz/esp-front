import React, { Component, PureComponent } from "react";

import getPath from "./getPath";
import { MAX_TRACE, TRACE_CHUNKS } from "./constants";

class EntityArrow extends PureComponent {
  render() {
    const { x, y, dx, dy, color, name } = this.props;

    const arrowSize = Math.sqrt(dx * dx + dy * dy) / 4;

    return [
      <defs key="defs">
        <marker
          id={name}
          markerWidth={1 + arrowSize}
          markerHeight={2 + arrowSize}
          orient="auto"
          refX={arrowSize}
          refY={arrowSize / 2 + 1}
        >
          <path
            d={`M0,1 L${arrowSize},${arrowSize / 2 + 1} 0,${1 + arrowSize}`}
            stroke={color}
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </marker>
      </defs>,
      <line
        key="line"
        x1={x}
        y1={y}
        x2={x + dx}
        y2={y + dy}
        stroke={color}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        markerEnd={`url(#${name})`}
      />
    ];
  }
}

class TraceChunk extends Component {
  constructor(props) {
    super(props);

    this.state = { path: getPath(props.chunk, props.scale) };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chunk.length !== this.props.chunk.length) {
      const n = this.props.chunk.length;
      this.setState(state => {
        return {
          path: state.path + getPath(nextProps.chunk, nextProps.scale, n)
        };
      });
    }
  }

  render() {
    return (
      <path
        d={this.state.path}
        stroke={`rgba(158, 172, 179, ${this.props.opacity})`}
        fill="transparent"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    );
  }
}

class Trace extends Component {
  render() {
    const { scale, trace } = this.props;

    const chunks = [];
    const chunkSize = Math.ceil(MAX_TRACE / TRACE_CHUNKS);
    const chunksLength = Math.ceil(trace.length / chunkSize);
    for (let i = 0; i < chunksLength; i++) {
      const chunk = trace.slice(i * chunkSize, (i + 1) * chunkSize + 1);
      const t0 = chunk[0][2];
      const opacity =
        0.3 * (TRACE_CHUNKS - chunksLength + i + 1) / TRACE_CHUNKS;
      if (opacity !== 0) {
        chunks.push(
          <TraceChunk
            key={`chunk-${t0}`}
            chunk={chunk}
            scale={scale}
            opacity={opacity}
          />
        );
      }
    }

    return chunks;
  }
}

class EntityArrows extends Component {
  render() {
    const { scale, speed, entity } = this.props;

    const velocityX = entity.velocity[0] * speed;
    const velocityY = entity.velocity[1] * speed;
    const accelerationX = entity.acceleration[0] * speed * speed;
    const accelerationY = entity.acceleration[1] * speed * speed;

    return [
      <EntityArrow
        key="velocity"
        name={`velocity-${entity.id}`}
        x={entity.position[0] * scale}
        y={entity.position[1] * scale}
        dx={velocityX * scale}
        dy={velocityY * scale}
        color="#4972e8"
      />,
      <EntityArrow
        key="acceleration"
        name={`acceleration-${entity.id}`}
        x={entity.position[0] * scale}
        y={entity.position[1] * scale}
        dx={accelerationX * scale}
        dy={accelerationY * scale}
        color="#e84949"
      />
    ];
  }
}

class Entity extends Component {
  static defaultProps = {
    showTrace: false,
    showArrows: false
  };

  renderArrows() {}

  render() {
    const { entity, scale, speed, trace, showTrace, showArrows } = this.props;

    return [
      showTrace && <Trace key="trace" scale={scale} trace={trace} />,
      <text
        // The opacity prop doesn't work properly on Firefox when panning.
        key="0"
        textAnchor="middle"
        x={entity.position[0] * scale}
        y={(entity.position[1] - entity.radius * 1.6) * scale}
        fill="rgba(158, 172, 179, 0.8)"
        fontSize={entity.radius * 0.8 * scale}
      >
        {entity.name}
      </text>,
      <circle
        key="1"
        fill="rgba(158, 172, 179, 1)"
        r={entity.radius * scale}
        cx={entity.position[0] * scale}
        cy={entity.position[1] * scale}
      />,
      showArrows && (
        <EntityArrows
          key="arrows"
          scale={scale}
          speed={speed}
          entity={entity}
        />
      )
    ];
  }
}

export default Entity;
