import React from "react";
import Homepage from "./Components/Homepage";
import { Switch, Route } from "react-router-dom";
class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Homepage} />
        </Switch>
      </div>
    );
  }
}

export default App;
