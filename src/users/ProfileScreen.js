import React from 'react';
import FBUtil from "../FBUtil";


const ProfileScreen = (props)=>{
  const firebase = FBUtil.init();
  const user = firebase.auth().currentUser;
  return (
    <div className="ProfileScreen screen">
      <h2>{user.displayName}</h2>
      <p>{user.email}</p>
    </div>
  );

}


export default ProfileScreen;