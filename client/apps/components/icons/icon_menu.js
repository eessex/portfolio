import React, { Component } from 'react';

export default class IconMenu extends Component {
  constructor(props) {
    super(props);
  }

  getSyles(type) {
    var style = styles.closed[type]
    if (this.props.open) {
      var style = styles.open[type]
    }
    return style
  }

  render() {
    return (
      <div
        style={{width: 30, height: 30, position: 'absolute', right: 10, zIndex: '5'}}
        onClick={this.props.onClick ? this.props.onClick : null}>
        <svg viewBox="0 0 100 100">
          <path style={this.getSyles('first')} d="M5 13h90v14H5z"/>
          <path style={this.getSyles('middle')} d="M5 43h90v14H5z"/>
          <path style={this.getSyles('last')} d="M5 73h90v14H5z"/>
       </svg>
     </div>
    );
  }
}

const styles= {
  closed: {
    first: {
      transition: 'all 500'
    },
    middle: {
      fill: 'black',
      transition: 'all 500'
    },
    last: {
      transition: 'all 500'
    }
  },
  open: {
    first: {
      transform: 'rotate(45deg)',
      transformOrigin: '15px 40px 0px',
      transition: 'all 500'
    },
    middle: {
      fill: 'white',
      transition: 'all 500',
      opacity: 0
    },
    last: {
      transform: 'rotate(-45deg)',
      transformOrigin: '15px 60px 0px',
      transition: 'all 500'
    }
  }
}