import React from 'react';
// import {Link} from 'react-router-dom';
// import _ from "lodash";

import LoadingModal from "../LoadingModal";

let markdown = require("markdown").markdown;


class PageScreen extends React.Component {
  constructor(props) {
    super(props);

    this.page = this.props.match.params.page;
    this.state = {content: "" };

  }

  componentWillMount() {
    console.log("loading page", this.page);

    let url = `/cms/${this.page}.md`;
    let xhr = new XMLHttpRequest();
    const loadPage = ()=> {
      const md = markdown.toHTML(xhr.responseText);
      this.setState({
        content: md,
        loading: false
      })
    }

    xhr.addEventListener("load",loadPage);
    xhr.addEventListener("error", ()=>{console.log(xhr.response)});
    xhr.open("GET",url);
    xhr.send();

  }

  componentDidUpdate() {
    const hash = window.decodeURIComponent(window.location.hash);
    try {
      if(!hash || !hash.length>0)
        return;
      const id = hash.substr(1);
      const target = document.getElementById(id);
      if(target)
        target.scrollIntoView();
    }
    catch(e) {
      console.log("error finding targer response with id", hash);
      console.log(e);
    }
  }

  render() {
    if(this.state.loading)
      return <LoadingModal show={true} status="loading page..." />
    return (
      <div className="PageContent" dangerouslySetInnerHTML={{__html: this.state.content}} />
    )

  }

}

  export default PageScreen;