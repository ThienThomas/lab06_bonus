import React, { Component, Fragment } from "react";
import TinderCard from "react-tinder-card";
import LoadingScreen from "components/AppScreens/LoadingScreen";
import jokerimg from "contents/images/game/joker.png";
import jokerimgUp from "contents/images/game/joker-up.png";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";
import axios from "axios";
export default class GameScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxPoint: 0,
      qLength: 0,
      gameSession: null,
      answers: null,
      yourPoint: 0,
      dialogText: "",
      questionText: "",
      infoText: "",
      isFinish: false,
      isLoading: true,
      isPaneOpen: false,
      isPaneOpenBottom: false,
      handleHeightChange: false,
      userName: "",
      submitting: false,
    };
  }
  async componentDidMount() {
    // const response = await fetch("https://lab06nhom02.herokuapp.com/getquestion");
    // const data = await response.json();
    const data = await axios({
      method: 'get',
      url: "https://lab06nhom02.herokuapp.com/getquestion",
    }).then((response) =>{
      return response.data
    }).catch((err) =>{
      console.log(err)
      return []
    })
    if (data != null && data.characters != null) {
      var length = data.characters.length;
      var nextQuestion = length > 0 ? data.characters[0] : null;
      let _dialogText = "";
      let _questionText = "";
      let _infoText = "";
      //console.log(data);
      if (nextQuestion != null) {
        console.log(1)
        _dialogText = nextQuestion.dialog;
        _questionText = nextQuestion.question;
        _infoText = nextQuestion.info;
        console.log(_dialogText)
      }
      //console.log(data);
      //console.log(data);
      this.setState({
        maxPoint: data.qMaxPoint,
        qLength: data.qLength,
        gameSession: data.characters,
        answers: null,
        yourPoint: 0,
        dialogText: _dialogText,
        questionText: _questionText,
        infoText: _infoText,
        isLoading: false,
      });
      //console.log(data);
    }
  }
  onShowHelpText = () => {
    this.setState({
      isPaneOpenBottom: !this.state.isPaneOpenBottom,
    });
  };
  handleGameSubmit = async () => {
    if (this.state.submitting == false) {
      this.setState({ isLoading: true, submitting: true });
      var name = this.state.userName;
      if (name != null && name != "") {
        var data = {
          user: name,
          score: this.state.yourPoint,
        };
        //const stringify = JSON.stringify(data)
        // const result = await fetch("/submit", {
        //   method: "POST",
        //   //headers: { "Content-Type": "application/json" },
        //   body: {
        //     ...data
        //   }
        // });
        var result = await axios({
          method: "post",
          url: 'https://lab06nhom02.herokuapp.com/submit',
          data: {
            data: JSON.stringify(data)
          }
        }).then((response) =>{
          return response.data
        }).catch((err) =>{
          return null
        })
        //alert(result)
      }
      this.setState({ isLoading: false, submitting: false });
      if (result) {this.props.history.push("/score");}
    }
  };
  render() {
    const onSwipe = (direction, question, nextQuestion) => {
      //console.log('You swiped: ' + direction);
      switch (direction) {
        case "right": {
          //yes
          onAnswer(true, question, nextQuestion);
          break;
        }
        case "left": {
          //no
          onAnswer(false, question, nextQuestion);
          break;
        }
        // case 'up': {
        //   onShowExtendInfo(nextQuestion.info);
        //   break;
        // }
      }
    };
    const onAnswer = (selection, question, nextQuestion) => {
      var _answers = this.state.answers != null ? this.state.answers : [];
      var existIndex = _answers.findIndex((f) => f.questionId === question.id);
      if (existIndex >= 0) {
        _answers[existIndex].selection = selection;
      } else {
        _answers.push({
          questionId: question.id,
          selection: selection,
        });
        console.log('_answer', _answers)
      }
      var myPoint = 0;
      var questions = this.state.gameSession;
      console.log('questions', questions)
      //console.log("questions", questions)
      _answers.map((answer, index) => {
        var index = questions.findIndex(
          (f) => f.id === answer.questionId
        );
        questions.forEach((e) => {
          console.log(e)
        })
        //console.log("1sda", index)
        if (index >= 0) {
          var qInfo = questions[index];
          console.log(answer.selection)
          myPoint +=
             answer.selection
              ? qInfo.yes
              : qInfo.no;
              console.log("=>", qInfo)
          console.log(myPoint)
        }
        
      });
      let _dialogText = "";
      let _questionText = "";
      let _infoText = "";
      if (nextQuestion != null) {
        _dialogText = nextQuestion.dialog;
        _questionText = nextQuestion.question;
        _infoText = nextQuestion.info;
      }
      let isFinish = _answers.length == this.state.qLength;
      this.setState({
        answers: _answers,
        yourPoint: Number(myPoint.toFixed(0)),
        dialogText: _dialogText,
        questionText: _questionText,
        infoText: _infoText,
        isFinish: isFinish,
        isPaneOpenBottom: false,
      });
      //console.log(this.state.answers);
      //console.log('yourPoint', this.state.yourPoint);
    };
    var currentPercent = (this.state.yourPoint * 100) / this.state.maxPoint;
    //console.log(currentPercent)
    const onShowExtendInfo = (info) => {
      //todo show extend info

      //
      //console.log(info);
      this.setState({
        infoText: info,
      });
    };

    return (
      <div
        className="sas__game"
        //style={{height: window.innerWidth <= 767 ? `${window.innerHeight-56}px` : '100vh'}}
        style={{ height: window.innerHeight }}
      >
        <div className="game__navbar">
          <Progress percent={currentPercent} />
        </div>
        {this.state.isFinish != true ? (
          <Fragment>
            {this.state.isLoading == true ? (
              <LoadingScreen />
            ) : (
              <div className="sas__gamewrapper">
                {this.state.gameSession != null ? (
                  this.state.gameSession.map((item, index) => {
                    var _src = require(`contents/images/characters/${item.contentUrl}`);
                    var length = this.state.gameSession.length;
                    var nextQuestion =
                      index + 1 <= length - 1
                        ? this.state.gameSession[index + 1]
                        : null;
                    return (
                      <TinderCard
                        key={index}
                        onSwipe={(direction) =>
                          onSwipe(direction, item, nextQuestion)
                        }
                        preventSwipe={["up", "down"]}
                        className="sas__gameitem"
                        //style={{height: window.innerWidth <= 767 ? `${window.innerHeight}px` : '100vh'}}
                      >
                        <img src={_src} />

                        <div className="gameitem__dialog">
                          {this.state.dialogText}
                        </div>
                        <div className="gameitem__charactername">
                          {item.name}
                        </div>
                        <div
                          className={`gameitem__help ${
                            this.state.isPaneOpenBottom
                              ? "height-translate"
                              : ""
                          }`}
                        >
                          <div
                            onClick={() => this.onShowHelpText()}
                            onTouchStart={this.onShowHelpText}
                            className="help__togglebtn"
                          >
                            <span>{this.state.questionText}</span>
                            <span className="help__joker">
                              {this.state.isPaneOpenBottom ? (
                                <img src={jokerimg} />
                              ) : (
                                <img src={jokerimgUp} />
                              )}
                            </span>
                          </div>
                          <div>{this.state.infoText}</div>
                        </div>
                      </TinderCard>
                    );
                  })
                ) : (
                  <div></div>
                )}
              </div>
            )}
          </Fragment>
        ) : (
          <div
            className="sas__gamesubmit"
            style={{ height: window.innerHeight }}
          >
            <div className="gamesubmit__gameform">
              <div className="gameform__header">Congratulations!</div>
              <div className="gameform__info">
                Your're a good and gracious king.
              </div>
              <div className="gameform__score">
                Your score: {Math.floor(this.state.yourPoint)}
              </div>
              <input
                type="email"
                id="gameformEmail"
                onChange={(evt) =>
                  this.setState({ userName: evt.target.value })
                }
                placeholder="Name"
              />
              {this.state.submitting == false ? (
                <div
                  className="gameform__submitbtn"
                  onClick={() => this.handleGameSubmit()}
                  onTouchStart={() => this.handleGameSubmit()}
                >
                  submit
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}