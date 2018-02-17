import React from 'react';
import FBUtil from "../FBUtil";


const ProfileScreen = (props)=>{
  const firebase = FBUtil.init();
  const user = firebase.auth().currentUser;
  return (
    <div className="ProfileScreen screen">
      <p>{props.user.email}</p>
    </div>
  );

}


export default ProfileScreen;