import React, { Component } from 'react';


function ChallengeList(props) {
  const challenges = props.challenges;
  const t = challenges.map((challenge) =>
    <li key={challenge.id.toString()}>
      <a href="#/detail">{challenge.title}</a>
    </li>
  );
  return (
    <ul>{t}</ul>
  );
}

export default ChallengeList;