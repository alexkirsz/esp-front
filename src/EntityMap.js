import React, { PureComponent } from "react";
import cx from "classnames";

import Coords from "./Coords";
import "./EntityMap.css";

export default class EntityMap extends PureComponent {
  render() {
    const { entities, follow, onFollow } = this.props;

    return (
      <div className="entity-map">
        {entities.map((entity, i) => (
          <div
            key={entity.id}
            className={cx(
              "entity-entry",
              follow === entity.id && "entity-entry-follow"
            )}
            onClick={() => onFollow(entity.id)}
          >
            <div className="entity-name">
              {entity.name} ({i + 1})
            </div>
            <div className="entity-attrs">
              <div className="entity-attr">
                <div className="entity-attr-name">Position</div>
                <div className="entity-coords">
                  <Coords x={entity.position[0]} y={entity.position[1]} />
                </div>
              </div>
              <div className="entity-attr">
                <div className="entity-attr-name">Velocity</div>
                <div className="entity-coords">
                  <Coords x={entity.velocity[0]} y={entity.velocity[1]} norm />
                </div>
              </div>
              <div className="entity-attr">
                <div className="entity-attr-name">Acceleration</div>
                <div className="entity-coords">
                  <Coords
                    x={entity.acceleration[0]}
                    y={entity.acceleration[1]}
                    norm
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
