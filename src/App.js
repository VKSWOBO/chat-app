import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import DashboardPage from "./Pages/DashboardPage";
import LoginPage from "./Pages/LoginPage";
import IndexPage from "./Pages/IndexPage";
import ChatroomPage from "./Pages/ChatroomPage";
// import SimpleMap from "./Components/Maps"


function App() {

  return (
    // <SimpleMap/>
    <BrowserRouter>
      <Switch>
        <Route path="/" component={IndexPage} exact />
        <Route
          path="/login"
          render={() => <LoginPage  />}
          exact
        />
        <Route
          path="/dashboard"
          render={() => <DashboardPage />}
          exact
        />
        <Route
          path="/chatroom/:url"
          render={() => <ChatroomPage />}
          exact
        />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
