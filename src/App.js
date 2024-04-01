import React, {Component} from 'react';
import {SafeAreaView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from './navigators/RootNavigator';
import {StyleSheet} from 'react-native';
export class App extends Component {
  render = () => {
    return (
      <SafeAreaView style={{flex: 1}}>
        <NavigationContainer>
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
