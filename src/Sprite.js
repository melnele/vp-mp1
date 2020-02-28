import React, { Component } from "react";
import scratch from "./scratch.png";

class Sprite extends Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0, rotation: 0 };
  }

  action = element => {
    // console.log(element);
    if (element) {
      if (element.type === "motion_turnright" || element.type === "motion_turnleft") {
        setTimeout(() => {
          this.setState({ rotation: this.state.rotation + parseInt(element.payload) });
        }, 1000);
      }
      if (element.type === "motion_movesteps") {
        setTimeout(() => {
          this.setState({ x: this.state.x + parseInt(element.payload) });
        }, 1000);
      }
      if (element.type === "control_repeat") {
        const g = element.payload; // remove 10 -- testing (removed)
        for (let i = 0; i < g; i++) {
          if (element.next) {
            element.next.map(act => {
              this.action(act);
            });
          }
        }
      }
      if (element.type === "control_if_else" || element.type === "control_if") {
        // for test
        if (element.cond.operation === undefined) {
          element.cond.operation = ">";
        }
        switch (element.cond.operation) {
          case ">":
            if (element.cond.left === "x") {
              if (this.state.x > parseInt(element.cond.right)) {
                this.action(element.if);
              } else {
                if (element.else) {
                  this.action(element.else);
                }
              }
            } else {
              if (this.state.y > parseInt(element.cond.right)) {
                this.action(element.if);
              } else {
                if (element.else) {
                  this.action(element.else);
                }
              }
            }
            break;

          case "<":
            if (element.cond.left === "x") {
              if (this.state.x < parseInt(element.cond.right)) {
                this.action(element.if);
              } else {
                if (element.else) {
                  this.action(element.else);
                }
              }
            } else {
              if (this.state.y < parseInt(element.cond.right)) {
                this.action(element.if);
              } else {
                if (element.else) {
                  this.action(element.else);
                }
              }
            }
            break;

          case "=":
            if (element.cond.left === "x") {
              if (this.state.x === parseInt(element.cond.right)) {
                this.action(element.if);
              } else {
                if (element.else) {
                  this.action(element.else);
                }
              }
            } else {
              if (this.state.y === parseInt(element.cond.right)) {
                this.action(element.if);
              } else {
                if (element.else) {
                  this.action(element.else);
                }
              }
            }
            break;

          default:
            break;
        }

        if (element.next) {
          element.next.map(act => {
            this.action(act);
          });
        }
      }
    }
  };

  componentDidMount() {
    // console.log(this.props);
    // console.log("inputs");
    // console.log(this.props.input.actions);
    // console.log("_________________________");
    this.setState({ x: this.props.input.x, y: this.props.input.y });
  }

  render() {
    // console.log(this.props.isClick);
    if (this.props.isClick) {
      this.props.input.actions.map(action => {
        this.action(action);
      });
    }
    return (
      <React.Fragment>
        <div className="number">
          <p>{"X: " + parseInt(this.state.x)}</p>
          <p>{"Y: " + parseInt(this.state.y)}</p>
          <p>{"R: " + parseInt(this.state.rotation)}</p>
        </div>
        <img
          src={scratch}
          alt="sprite"
          style={{
            height: 100,
            width: 100,
            position: "absolute",
            top: this.state.x,
            left: this.state.y,
            transform: `translateX(${this.state.x}px) rotate(${this.state.rotation}deg)`,
            transition: "all 3s"
          }}
        ></img>
      </React.Fragment>
    );
  }
}

export default Sprite;
