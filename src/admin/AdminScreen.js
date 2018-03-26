import React from "react";
import {Link} from "react-router-dom";
import FBUtil from "../FBUtil";

class AdminScreen  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  componentWillMount() {
    this.props.setAppClass("admin");
    // const hello = FBUtil.getFunction("hello");
    // // console.log(hello);
    


    // const u = {
    //   email: "mattcuringa@gmail.com",
    //   firstName: "foo",
    //   lastName: "bar"
    // }

    // const createUser = FBUtil.getFunction("createUser");
    // console.log("got create user");
    // console.log(createUser);

    // createUser(u).then((data)=>{
    //   console.log("new user created");
    //   console.log(data);
    // },(e)=>{console.log(e);});


  }

  componentWillUnmount() {
    this.props.setAppClass("");
  }

  render() {
    if(!this.props.user.admin)
      return null;

    return (
      <div className="AdminScreen screen">
        The admin screen.
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/challenges">Challenges</Link>
      </div>
    );
  }

}


export default AdminScreen;
