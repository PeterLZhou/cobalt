import * as React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import Root from "./containers/Root";

const state = require("./renderer/state");

render(
  <AppContainer>
    <Root />
  </AppContainer>,
  document.getElementById("root"),
);

if ((module as any).hot) {
  (module as any).hot.accept("./containers/Root", () => {
    const NextRoot = require("./containers/Root").default;
    render(
      <AppContainer>
        <NextRoot />
      </AppContainer>,
      document.getElementById("root"),
    );
  });
}
