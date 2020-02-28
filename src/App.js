import React from "react";
import "./App.css";
import project from "./project";
import Sprite from "./Sprite";
import flag from "./flag.svg";

let inputs = {};
var sprites = [];

class SpriteClass {
  constructor(name, x = 0, y = 0, actions) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.actions = actions;
  }
}

class Action {
  constructor(type, payload = 0) {
    this.type = type;
    this.payload = payload;
  }
}

function getOperation(element) {
  switch (element.opcode) {
    case "operator_gt":
      return ">";
    case "operator_lt":
      return "<";
    case "operator_eq":
      return "=";
    default:
      break;
  }
}

function getAction(x, id) {
  if (x.blocks[id].inputs.SUBSTACK) {
    let act;
    if (x.blocks[id].inputs.TIMES)
      act = new Action(x.blocks[id].opcode, x.blocks[id].inputs.TIMES[1][1]);
    else
      act = new Action(x.blocks[id].opcode);
    {
      let actions1 = [];
      let elemid1 = x.blocks[id].inputs.SUBSTACK[1];
      let elem1 = x.blocks[elemid1];

      while (true) {
        let ac = getAction(x, elemid1);
        if (elem1.inputs.SUBSTACK) {
          ac.next = [getAction(x, elem1.inputs.SUBSTACK[1])];
        }

        actions1.push(ac);
        if (!elem1.next)
          break;
        elemid1 = elem1.next;
        elem1 = x.blocks[elemid1];
      }
      act.next = actions1;

    }
    if (x.blocks[id].inputs.CONDITION) {
      let cond = x.blocks[x.blocks[id].inputs.CONDITION[1]];
      let op1, op2;
      if (Array.isArray(cond.inputs.OPERAND1[1]))
        op1 = cond.inputs.OPERAND1[1][1];
      else
        op1 =
          x.blocks[cond.inputs.OPERAND1[1]].opcode === "motion_xposition"
            ? "x"
            : "y";
      if (Array.isArray(cond.inputs.OPERAND2[1]))
        op2 = cond.inputs.OPERAND2[1][1];
      else
        op2 = x.blocks[cond.inputs.OPERAND2[1]].opcode === "motion_xposition" ? "x" : "y";
      act.cond = { operation: getOperation(cond), left: op1, right: op2 }
    }
    if (x.blocks[id].inputs.SUBSTACK2) {
      var actions = [];
      let elemid = x.blocks[id].inputs.SUBSTACK2[1];
      let elem = x.blocks[elemid];

      while (true) {
        let ac = getAction(x, elemid);
        if (elem.inputs.SUBSTACK) {
          ac.next = [getAction(x, elem.inputs.SUBSTACK[1])];
        }
        actions.push(ac);
        if (!elem.next)
          break;
        elemid = elem.next;
        elem = x.blocks[elemid];
      }
      act.else = actions;

    }
    return act;
  }
  else if (x.blocks[id].inputs.STEPS)
    return new Action(x.blocks[id].opcode, x.blocks[id].inputs.STEPS[1][1]);
  else if (x.blocks[id].inputs.DEGREES) {
    if (x.blocks[id].opcode === "motion_turnright")
      return new Action(x.blocks[id].opcode, x.blocks[id].inputs.DEGREES[1][1]);
    if (x.blocks[id].opcode === "motion_turnleft")
      return new Action(
        x.blocks[id].opcode,
        -x.blocks[id].inputs.DEGREES[1][1]
      );
  } else return new Action(x.blocks[id].opcode);
}

class App extends React.Component {
  state = {
    isFlagClicked: false
  };

  UNSAFE_componentWillMount() {
    for (const x of project.targets) {
      if (!x.isStage) {
        // console.log(x.name);
        let actions = [];
        for (const id in x.blocks) {
          if (x.blocks[id].parent === null) {
            let elem = x.blocks[id];
            let elemid = id;
            while (true) {

              let action = getAction(x, elemid);
              if (elem.inputs.SUBSTACK) {
                action.next = [getAction(x, elem.inputs.SUBSTACK[1])];
              }
              actions.push(action);
              if (!elem.next)
                break;
              elemid = elem.next;
              elem = x.blocks[elemid];
            }
          }
        }
        var sp = new SpriteClass(x.name, x.x, x.y, actions);
        sprites.push(sp);
      }
    }
    console.log(sprites);

    // const a = project;
    // const array = [];
    var answer = [];

    // for (let index = 0; index < a.targets.length; index++) {
    //   const element = a.targets[index];
    //   if (
    //     !(
    //       Object.keys(element.blocks).length === 0 &&
    //       element.blocks.constructor === Object
    //     )
    //   ) {
    //     for (var v in element.blocks) {
    //       const x = element.blocks[v];
    //       array.push({ ...x, name: v });
    //     }
    //   }
    // }
    answer = sprites[0].actions;
    const steps = [];
    // looping over the blocks
    answer.forEach(el => {
      if (el.name === "motion_movesteps") {
        steps.push({ moves: el.inputs.STEPS[1][1] });
      }
      if (el.name === "motion_turnright") {
        steps.push({ rotation: el.inputs.DEGREES[1][1] });
      }
      if (el.name === "motion_turnleft") {
        steps.push({ rotation: -el.inputs.DEGREES[1][1] });
      }
      if (el.name === "control_repeat") {
        const repeated = [];
        // finding the repeated step
        answer.forEach((element, i) => {
          if (element.name === el.inputs.SUBSTACK[1]) {
            if (element.inputs.DEGREES) {
              var value =
                element.opcode === "motion_turnright"
                  ? element.inputs.DEGREES[1][1]
                  : -element.inputs.DEGREES[1][1];
              repeated.push({ rotation: value });
            } else {
              repeated.push({ moves: element.inputs.STEPS[1][1] });
            }
            answer.splice(i, 1);
          }
        });
        steps.push({ repeat: { repeated, times: el.inputs.TIMES[1][1] } });
        // answer.splice(j, 1);
      }
      if (el.name === "operator_gt") {
        var pos = el.inputs.OPERAND1[1][1];
        var value = el.inputs.OPERAND2[1][1];
        steps.push({
          operation: this.getOperation(el),
          left: pos,
          right: value
        });
      }
      if (el.name === "control_if_else") {
        var ifElse = {};
        // looping over the if else parts
        for (let ifPart in el.inputs) {
          // searching for the if block and the else block
          answer.forEach((element, j) => {
            var step = {};
            if (element.name === el.inputs[ifPart][1]) {
              var inputs = element.inputs;
              if (inputs.DEGREES) {
                var value =
                  element.opcode === "motion_turnright"
                    ? element.inputs.DEGREES[1][1]
                    : -element.inputs.DEGREES[1][1];
                step = { rotation: value };
              } else if (inputs.STEPS) {
                step = { moves: element.inputs.STEPS[1][1] };
              } else if (inputs.TIMES) {
                const repeated = [];
                answer.forEach((searchedForRepeatElem, i) => {
                  if (searchedForRepeatElem.name === inputs.SUBSTACK[1]) {
                    if (searchedForRepeatElem.inputs.DEGREES) {
                      var value =
                        searchedForRepeatElem.opcode === "motion_turnright"
                          ? searchedForRepeatElem.inputs.DEGREES[1][1]
                          : -searchedForRepeatElem.inputs.DEGREES[1][1];
                      repeated.push({ rotation: value });
                    } else {
                      repeated.push({
                        moves: searchedForRepeatElem.inputs.STEPS[1][1]
                      });
                    }
                    answer.splice(i, 1);
                  }
                });
                step = { repeat: { repeated, times: inputs.TIMES[1][1] } };
                answer.splice(j, 1);
              } else if (inputs.OPERAND1) {
                var pos = inputs.OPERAND1[2][1];
                value = inputs.OPERAND2[1][1];
                step = {
                  operation: this.getOperation(element),
                  left: pos,
                  right: value
                };
              }
              switch (ifPart) {
                case "SUBSTACK":
                  ifElse.if = step;
                  break;
                case "SUBSTACK2":
                  ifElse.else = step;
                  break;
                case "CONDITION":
                  ifElse.cond = step;
                  break;
                default:
                  break;
              }
            }
          });
        }
        console.log(ifElse);
        steps.push({ ifElse });
      }
    });
    inputs = steps;
  }

  getOperation(element) {
    switch (element.opcode) {
      case "operator_gt":
        return ">";
      case "operator_lt":
        return "<";
      case "operator_eq":
        return "=";
      default:
        break;
    }
  }

  render() {
    return (
      <div className="App">
        <button
          className="flag"
          onClick={() =>
            !this.state.isFlagClicked
              ? (this.setState({ isFlagClicked: true }),
                  setTimeout(() => {
                    this.setState({ isFlagClicked: false })
                  }, 1000)
                )
              : this.setState({ isFlagClicked: false })
          }
        >
          <img src={flag} alt="green flag" />
        </button>
        {sprites.map((sprite, inedx) => (
          <Sprite
            key={inedx}
            input={sprite}
            isClick={this.state.isFlagClicked}
          ></Sprite>
        ))}
        <header className="App-header"></header>
      </div>
    );
  }
}

export default App;
