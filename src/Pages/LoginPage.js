import React from "react";
import makeToast from "../Toaster";
import { withRouter } from "react-router-dom";

const LoginPage = (props) => {
  const userNameRef = React.createRef();
  const nickNameRef = React.createRef();

  const handelkeyPress = (e) => {
    if (e.key === "Enter") {
      loginUser();
    }
  };
  
  const loginUser = () => {
    const userName = userNameRef.current.value;
    const nickName = nickNameRef.current.value;
    if(userName !== '' && nickName !== ''){
      localStorage.setItem("username", userName);
      localStorage.setItem("userId", userName);
      localStorage.setItem("nickName", nickName);
      makeToast("success", userName + ' connected successfully');
      props.history.push("/dashboard");
    } else{
      makeToast("error", 'connection failed');
    }
  };

  return (
    <div className="card">
      <div className="cardHeader">SignIn</div>
      <div className="cardBody">
        <div className="inputGroup">
          <label htmlFor="userName">User Name</label>
          <input
            type="text"
            name="userNmae"
            id="userName"
            placeholder="VSONUK"
            ref={userNameRef}
          />
        </div>
        <div className="inputGroup">
          <label htmlFor="nickName">Nick Name</label>
          <input
            type="text"
            name="nickName"
            id="nickName"
            placeholder="Nick Name"
            ref={nickNameRef}
            onKeyPress={handelkeyPress}
          />
        </div>
        <button onClick={loginUser}>signIn</button>
      </div>
    </div>
  );
};

export default withRouter(LoginPage);
