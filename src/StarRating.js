import React from 'react';
import {StarIcon} from 'react-octicons';

class Star extends React.Component {
  render() {
    console.log(this.props.val, this.props.rating);
    const filled = (this.props.val <= this.props.rating) ? "filled" : "";
    console.log('filled', filled);
    return (
      <span className={`Star ${filled}`}>
          <StarIcon />
      </span>
    );
  }
}

export default class StarRating extends React.Component {
  render() {
    let stars = [];
    for (let val = 1; val <= 5; val++) {
      stars.push(
        <Star key={`star_${this.props.responseId}_${val}`}
              val={val}
              rating={this.props.rating} />);
    }

    return (
      <div className="rating-stars">{stars}</div>
    );

  }
}
