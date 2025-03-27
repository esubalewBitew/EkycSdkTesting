/* eslint-disable react/react-in-jsx-scope */
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Ekyc from '../../Auth/Ekyc';
import VerificationScreen from '../../Auth/Ekyc/Verification';

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Stack.Navigator initialRouteName="Ekyc">
        <Stack.Screen
          name="Ekyc"
          component={Ekyc}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="VerificationScreen"
          component={VerificationScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </>
  );
}

export default AuthNavigator;
