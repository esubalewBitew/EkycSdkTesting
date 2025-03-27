import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import {LogBox} from 'react-native';

LogBox.ignoreAllLogs();

function RootNavigator() {
  return (
    <NavigationContainer onStateChange={() => {}}>
      <AuthNavigator />
    </NavigationContainer>
  );
}
export default RootNavigator;
