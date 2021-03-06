import React from "react";

interface IProps {
  answer: any;
}

export default class ExternalLinkAnswer extends React.PureComponent <IProps>{
  render() {
    const { answer } = this.props;
    const linkAnswer = answer && answer.get('answer');
    return (
      <div><a href={linkAnswer} target="_blank" rel="noopener">View work</a></div>
    );
  }
}
