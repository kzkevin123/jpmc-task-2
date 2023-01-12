import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}
interface IState {
    timestamps: Set<string>;
}
/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            timestamps: new Set(),
        };
    }
filterData = (data: ServerRespond[]) => {
        return data.filter(d => {
            if (!this.state.timestamps.has(d.timestamp)) {
                this.state.timestamps.add(d.timestamp);
                return true;
            } else {
                return false;
            }
        });
    };
  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective configurations here.
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
        const filteredData = this.filterData(this.props.data)
   this.table.update(filteredData.map((el: any) => {
     return {
stock: el.stock,
top_ask_price: el.top_ask && el.top_ask.price || 0,
top_bid_price: el.top_bid && el.top_bid.price || 0,
timestamp: el.timestamp,
};
}));
}
}
}
      
export default Graph;
