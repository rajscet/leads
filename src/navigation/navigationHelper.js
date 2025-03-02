import {CommonActions} from '@react-navigation/native';

let navigationRef;

export function setTopLevelNavigation(navigatorRef) {
  navigationRef = navigatorRef;
}

export function resetNavigateTo(navigation, routeName, params) {
  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{name: routeName, params}],
    })
  );
}

export function resetNavigate(routeName, params) {
  navigationRef.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{name: routeName, params}],
    })
  );
}

export function navigateTo(routeName, params) {
  navigationRef.navigate(routeName, params);
}
