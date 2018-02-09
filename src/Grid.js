import React, { PureComponent } from "react";

class GridDef extends PureComponent {
  render() {
    const { every, div } = this.props;
    return (
      <defs key="defs">
        <pattern
          key="bold-pattern"
          id="bold"
          x="0"
          y="0"
          width={every}
          height={every}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M0 0L0 ${every}M0 0L${every} 0`}
            stroke={`rgba(158, 172, 179, 0.15`}
            fill="transparent"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern
          key="thin-pattern"
          id="thin"
          x="0"
          y="0"
          width={div}
          height={div}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M0 0L0 ${div}M0 0L${div} 0`}
            stroke={`rgba(158, 172, 179, 0.1`}
            fill="transparent"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>
    );
  }
}

export default class Grid extends PureComponent {
  render() {
    const { every, divisions } = this.props;

    const div = every / divisions;

    return [
      <GridDef key="defs" every={every} div={div} />,
      <rect
        key="bold"
        fill="url(#bold)"
        x={-1000000}
        y={-1000000}
        width={2000000}
        height={2000000}
      />,
      <rect
        key="thin"
        fill="url(#thin)"
        x={-1000000}
        y={-1000000}
        width={2000000}
        height={2000000}
      />
    ];
  }
}
