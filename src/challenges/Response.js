import React from 'react';
import _ from "lodash";

import { ChevronDownIcon, ChevronUpIcon, BookmarkIcon, PersonIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import { StarRatings } from "../StarRatings";


class Response  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: props.open}
  }

  render() {
    const r = this.props.response;
    if(!r)
      return null;


    const featureStyle = {width: "150px", height: "36px"};
    const ProfFeature = ()=> {
      if(!this.props.profChoice)
        return null;

      return (
        <div className="d-flex align-items-center justify-content-between badge-primary pl-1 pr-2 rounded mb-1" style={featureStyle}>
          <div className="icon-light"><FlagIcon /></div>
          <div>Expert's Choice</div>
        </div>
      )
    }

    const OwnerFeature = ()=> {
      if(!this.props.ownerChoice)
        return null;

      const style= {
        height: "20px", 
        width: "20px",
        fill: "white",
        marginTop: "3px",
        marginLeft: "3px"
      };
      return (
        <div className="d-flex align-items-center badge-primary justify-content-between pl-1 pr-2 rounded mb-1" style={featureStyle}>
          <div className="icon-light"><PersonIcon style={style} /></div>
          <div>Owner's Choice</div>
        </div>
      )  
    }


    const TopRated = ()=> {
      if(!r.topRated)
        return null;

      return (
        <div className="d-flex align-items-center badge-primary justify-content-between pl-1 pr-2 rounded mb-1" style={featureStyle}>
          <div className="icon-light"><CircleStarIcon /></div>
          <div>Top Ranked</div>
        </div>
      )  
    }


    const AuthorInfo = ()=> {
      if(!this.props.profChoice && !this.props.ownerChoice && !r.topRated)
        return null;
      return (
        <p><small>Submitted by: {r.user.firstName} {r.user.lastName}</small></p>
      )
    }

    const SetOwnerChoice = ()=>{
      if((!this.props.isOwner && !this.props.user.admin) || !this.props.editable || this.props.ownerChoice)
        return null;

      return (
        <button 
          className="btn btn-sm btn-secondary mb-2" 
          type="button"
          onClick={()=>{this.props.setOwnerChoice(r)}}>
          Make owner's choice
        </button>
      )
    };

    const SetProfChoice = ()=>{
      if((!this.props.isProfessor && !this.props.user.admin) || !this.props.editable || this.props.profChoice)
        return null;

      return (
        <button 
          className="btn btn-sm btn-secondary mb-2 ml-2" 
          type="button"
          onClick={()=>{this.props.setProfChoice(r)}}>
          Make expert's choice
        </button>
      )
    };

    const targetCss = (this.props.targetResponseId === r.id)?"highlight":"";
    const collapseCss = (this.props.open)?"":"collapsed";
    const showCss = (this.props.open)?"show":"";
    const toggleId = _.uniqueId("resp_");

    return (
      <div id={r.id} className={`Response border-bottom border-light mt-2 pt-2 pb-2 text-gray ${targetCss}`}>
        <div className="ResponseTitle d-flex justify-content-between align-items-start">
          <div className={`clickable d-flex flex-column ${collapseCss}`}
            data-toggle="collapse" 
            data-target={`#${toggleId}`}
            aria-controls={toggleId}
            aria-expanded={this.props.open}
            aria-label="toggle response"
            >
            <div className="d-flex align-items-start">
              <div className="toggle-icons icon-secondary">
                <ChevronUpIcon />
                <ChevronDownIcon />
              </div>
              <h5 className="ResponseTitle text-gray">{r.title}</h5>
            </div>
            <AuthorInfo />
          </div>
          <div>
            <div className={`d-flex justify-content-end align-items-start`}>
              <StarRatings rating={r.avgRating} />
              <Bookmark {...this.props} />
            </div>
            <OwnerFeature />
            <ProfFeature />
            <TopRated />
          </div>
        </div>

        <div id={toggleId} className={`collapse pt-2 ${showCss}`}>
          <div className="d-flex justify-content-end">
            <SetOwnerChoice />
            <SetProfChoice />
          </div>
          <Video video={r.video} />
          {r.text}      
        </div>
      </div>
    )
  }
}

const Bookmark = (props) => {

  if(!props.bookmarkable)
    return null;

  const fillClass = (props.bookmarked)?"icon-primary":"icon-secondary";

  return(
    <div className={`ml-2 clickable ${fillClass}`} onClick={props.toggleBookmark}>
      <BookmarkIcon className="icon-lg" />
    </div>
  );
}

const CircleStarIcon = (props)=> {
  return (
    <svg width="30px" height="30px" viewBox="0 0 30 30">
      <g id="ic_stars_circle" transform="translate(4, 9)" fill="#FFFFFF">
        <path d="M8.991,0 C4.023,0 0,4.032 0,9 C0,13.968 4.023,18 8.991,18 C13.968,18 18,13.968 18,9 C18,4.032 13.968,0 8.991,0 L8.991,0 Z M12.807,14.4 L9,12.105 L5.193,14.4 L6.201,10.071 L2.844,7.164 L7.272,6.786 L9,2.7 L10.728,6.777 L15.156,7.155 L11.799,10.062 L12.807,14.4 L12.807,14.4 Z" id="Icon"></path>
      </g>
    </svg>
  )
}

const FlagIcon = (props)=> {
  return (
    <svg width="30px" height="30px" viewBox="0 0 30 30">
      <g id="ic_flag" transform="translate(4, 9)" fill="#FFFFFF">
        <polygon id="Icon" points="9.4 2 9 0 0 0 0 17 2 17 2 10 7.6 10 8 12 15 12 15 2"></polygon>
      </g>
    </svg>
  )
}

export default Response;