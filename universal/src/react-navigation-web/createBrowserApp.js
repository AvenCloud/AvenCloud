import { createBrowserHistory } from 'history';
import React from 'react';
import { NavigationActions, getNavigation } from '../react-navigation-core';
const queryString = require('query-string');

const history = createBrowserHistory();

const getPathAndParamsFromLocation = location => {
  const path = location.pathname.substr(1);
  const params = queryString.parse(location.search);
  return { path, params };
};

const matchPathAndParams = (a, b) => {
  if (a.path !== b.path) {
    return false;
  }
  if (queryString.stringify(a.params) !== queryString.stringify(b.params)) {
    return false;
  }
  return true;
};

let currentPathAndParams = getPathAndParamsFromLocation(history.location);

export default function createBrowserApp(App) {
  const setHistoryListener = dispatch => {
    history.listen(location => {
      const pathAndParams = getPathAndParamsFromLocation(location);
      if (matchPathAndParams(pathAndParams, currentPathAndParams)) {
        return;
      }
      currentPathAndParams = pathAndParams;
      const action = App.router.getActionForPathAndParams(
        pathAndParams.path,
        pathAndParams.params,
      );
      dispatch(action);
    });
  };

  const initAction =
    App.router.getActionForPathAndParams(
      currentPathAndParams.path,
      currentPathAndParams.params,
    ) || NavigationActions.init();

  class WebApp extends React.Component {
    state = { nav: App.router.getStateForAction(initAction) };
    _title = document.title;
    _actionEventSubscribers = new Set();
    componentDidMount() {
      setHistoryListener(this._dispatch);
      this._actionEventSubscribers.forEach(subscriber =>
        subscriber({
          type: 'action',
          action: initAction,
          state: this.state.nav,
          lastState: null,
        }),
      );
    }
    componentDidUpdate() {
      document.title = this._title;
    }
    render() {
      this._navigation = getNavigation(
        App.router,
        this.state.nav,
        this._dispatch,
        this._actionEventSubscribers,
        () => this.props.screenProps,
        () => this._navigation,
      );
      return <App navigation={this._navigation} />;
    }
    _dispatch = action => {
      const lastState = this.state.nav;
      const newState = App.router.getStateForAction(action, lastState);
      const dispatchEvents = () =>
        this._actionEventSubscribers.forEach(subscriber =>
          subscriber({
            type: 'action',
            action,
            state: newState,
            lastState,
          }),
        );
      if (newState && newState !== lastState) {
        this.setState({ nav: newState }, dispatchEvents);
        const pathAndParams =
          App.router.getPathAndParamsForState &&
          App.router.getPathAndParamsForState(newState);
        if (
          pathAndParams &&
          !matchPathAndParams(pathAndParams, currentPathAndParams)
        ) {
          currentPathAndParams = pathAndParams;
          history.push(
            `/${pathAndParams.path}?${queryString.stringify(
              pathAndParams.params,
            )}`,
          );
        }
      } else {
        dispatchEvents();
      }
    };
  }
  return WebApp;
}