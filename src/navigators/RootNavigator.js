import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {PersonListScreen} from '../screens/PersonListScreen';
import {PersonInfoScreen} from '../screens/PersonInfoScreen';
import {SelectedDayScreen} from '../screens/SelectedDayScreen';
import {CalendarScreen} from '../screens/CalendarScreen';
import {EditEventScreen} from '../screens/EditEventScreen';
import SelectedEventScreen from '../screens/SelectedEventScreen';
const Stack = createStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'selectedDay'}
      screenOptions={{headerShown: false, unmountOnBlur: true}}>
      <Stack.Screen
        name={'selectedDay'}
        component={SelectedDayScreen}
        options={{headerShown: false}}
        initialParams={{isFirst: true}}
      />
      <Stack.Screen
        name={'calendar'}
        component={CalendarScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={'editEvent'}
        component={EditEventScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={'selectedEvent'}
        component={SelectedEventScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name={'list'} component={PersonListScreen} />
      <Stack.Screen name={'info'} component={PersonInfoScreen} />
    </Stack.Navigator>
  );
};
