import React from 'react';
import _ from "lodash";
import {Link} from "react-router-dom";
import { ChevronLeftIcon } from "react-octicons";

import LoadingModal from "../LoadingModal"

import df from "../DateUtil";

import {ChallengeDB} from "../challenges/Challenge";
import {StarRatings} from "../StarRatings";
import {snack, SnackMaker} from "../Snackbar";



class MyResponsesScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "loadingResponses": true

    };

    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }

  componentWillMount() {

    ChallengeDB.findResponsesByOwner(this.props.user.uid).then((t)=>{
      this.setState({ responses: t, loadingResponses: false });
    });

  }


  render() {

    if(this.state.loadingResponses)
      return <LoadingModal show msg="Loading responses..." />
    const ResponseList = _.map(this.state.responses, Response);

    return (
      <div className="MyResponses screen">
        <h4 className="border-light border-bottom">
          <button className="btn btn-link mr-2 p-0" onClick={this.props.history.goBack}><ChevronLeftIcon /></button>
          My Responses
        </h4>
        {ResponseList}
        <this.Snackbar />

      </div>
    );
  }
}

const Response = (r)=> {
  return (
    <div className="border-bottom border-light pb-1 mb-3" key={_.uniqueId("response_")}>
      <div className="font-weight-bold d-flex align-items-baseline justify-content-between">
        <Link className="d-block" to={`/challenge/${r.challengeId}/review#${r.id}`}>{r.challengeTitle}</Link>
        <small className="d-block">{df.df(r.created)}</small>
      </div>
      <div className="d-flex align-content-start">
        <StarRatings className="pt-1 pr-2" rating={r.avgRating} />
        {r.title}
      </div>
    </div>
  )
}

export default MyResponsesScreen;
