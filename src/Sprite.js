import React from 'react';
import scratch from './scratch.png';

class Sprite extends React.Component {
  state = { x: 0, y: 0, rotation: 0 };
  componentDidMount() {
    console.log(this.props.input);
    for (let index = 0; index < this.props.input.length; index++) {
      const element = this.props.input[index];
      if (element.rotation) {
        setTimeout(() => {
          this.setState({ rotation: element.rotation });
        }, 2000);
      }
      if (element.moves) {
        setTimeout(() => {
          this.setState({ x: this.state.x + element.moves * 5 });
        }, 2000);
      } if (element.repeat) {
        const g = element.repeat.times;
        for (let i = 0; i < g; i++) {
          if (element.repeat.repeated[0].rotation) {
            setTimeout(() => {
              this.setState({
                rotation: this.state.rotation + +element.repeat.repeated[0].rotation,
              }, () => { console.log(this.state); });
            }, 1000);
          }
          else {
            setTimeout(() => {
              this.setState({
                x: this.state.x + element.repeat.repeated[0].moves * 5,
              });
            }, 1000);
          }
        }
      }
    }
  }
  render() {
    return (
      <img src={scratch} alt="sprite"
        style={{
          height: 100,
          width: 100,
          position: 'absolute',
          top: this.state.x,
          left: this.state.y,
          transform: `translateX(${this.state.x}px) rotate(${this.state.rotation}deg)`,
          transition: 'all 3s',
        }}
      ></img>
    );
  }
}

export default Sprite;
