import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {PersonListScreen} from '../screens/PersonListScreen';

const Stack = createStackNavigator();

export const RootNavigator = () => {
    return (
        <Stack.Navigator initialRouteName={'list'}>
            <Stack.Screen name={'list'} component={PersonListScreen} />
        </Stack.Navigator>
    );
};
