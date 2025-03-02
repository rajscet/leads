import colors from 'assets/colors';
import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

const SafeAreaViewContext = React.createContext();

export function SafeAreaViewProvider({children}) {
  const [edges, setEdges] = React.useState(['left', 'right', 'top']);
  const [hidden, setShowStatusBar] = React.useState(false);
  const [statusBarTheme, setStatusBarTheme] = React.useState('dark-content');
  const [statusBarBackground, setStatusBarBackground] = React.useState(colors.primary);
  const [statusBarTranslucent, setStatusBarTranslucent] = React.useState(false);

  const showTopEdge = () => {
    if (!edges.includes('top')) {
      setEdges([...edges, 'top']);
    }
  };
  const hideTopEdge = () => {
    if (edges.includes('top')) {
      setEdges(edges.filter((item) => item !== 'top'));
    }
  };

  const value = React.useMemo(
    () => ({
      setShowStatusBar,
      setEdges,
      setStatusBarTheme,
      showTopEdge,
      hideTopEdge,
      setStatusBarBackground,
      setStatusBarTranslucent,
    }),
    [
      setShowStatusBar,
      setEdges,
      setStatusBarTheme,
      showTopEdge,
      hideTopEdge,
      setStatusBarBackground,
      setStatusBarTranslucent,
    ]
  );

  return (
    <SafeAreaViewContext.Provider value={value}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={statusBarTheme}
          backgroundColor={colors.primary}
          translucent={statusBarTranslucent}
          hidden={!hidden}
        />
        <SafeAreaView edges={edges} style={styles.container}>
          {children}
        </SafeAreaView>
      </SafeAreaProvider>
    </SafeAreaViewContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    position: 'relative',
  },
});

export const useSafeArea = () => React.useContext(SafeAreaViewContext);
