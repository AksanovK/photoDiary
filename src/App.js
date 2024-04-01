import React, {Component} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from './navigators/RootNavigator';
import {StyleSheet} from 'react-native';
export class App extends Component {
  render = () => {
    return (
      <SafeAreaView>
        <NavigationContainer>
          <Text>LIST</Text>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaView>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
