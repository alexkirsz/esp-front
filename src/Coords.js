import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import "./Coords.css";

export default class Coords extends PureComponent {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    precision: PropTypes.number,
    norm: PropTypes.bool
  };

  static defaultProps = {
    precision: 3,
    norm: false
  };

  constructor(props) {
    super(props);

    this.intl = new Intl.NumberFormat("en-EN", {
      minimumFractionDigits: props.precision,
      maximumFractionDigits: props.precision
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.precision !== nextProps.precision) {
      this.intl = new Intl.NumberFormat("en-EN", {
        minimumFractionDigits: nextProps.precision,
        maximumFractionDigits: nextProps.precision
      });
    }
  }

  render() {
    const { x, y, norm } = this.props;

    return [
      <div key="x" className="coords-x">
        {this.intl.format(x)}
      </div>,
      <div key="y" className="coords-y">
        {this.intl.format(y)}
      </div>,
      norm && (
        <div key="norm" className="coords-norm">
          {this.intl.format(Math.sqrt(x * x + y * y))}
        </div>
      )
    ];
  }
}
