import React, {useEffect, useState} from 'react';
import {
  openSelectionScreen,
  showEkycUI,
} from '@innovitegranpm/innotrust-rn-eth';
import {
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
// import VerificationScreen from './Verification';
import VerificationScreen from './Verification';
import DeviceInfo from 'react-native-device-info';

const {LivelinessDetectionBridge} = NativeModules;
const Inno = NativeModules.Inno;
const innoEmitter =
  Platform.OS === 'ios' && Inno ? new NativeEventEmitter(Inno) : null;

export default function App({initialProps}: {initialProps: any}) {
  const {referenceNumber, sessionTimeoutStatus} = initialProps || {};

  const [referenceID, setReferenceID] = useState<string | null>('');
  const [showVerification, setShowVerification] = useState(!!referenceNumber);
  const [clicked, setClicked] = useState<boolean>(false);
  const [sessionTimeout, setSessionTimeout] = useState<boolean>(
    Boolean(sessionTimeoutStatus),
  );

  //session timeoutstatus for ios
  const [timeoutStatus, setTimeoutStatus] = useState<string | null>('');

  function generateReferenceID(): string {
    // Get the current timestamp in seconds.
    const timestamp = Math.floor(Date.now() / 1000);
    // Generate a random number between 1,000,000 and 9,999,999.
    const randomNum =
      Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
    // Pad the random number to 8 digits (if needed).
    const randomNumString = randomNum.toString().padStart(8, '0');
    return `INNOVERIFYIOS${timestamp}${randomNumString}`;
  }

  const reference = generateReferenceID();

  const generateReferenceNumber = () => {
    try {
      const currentDate = new Date();
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(currentDate);
      const formattedDateTime = dateFormatter.replace(/[^0-9]/g, '');
      const randomNumber = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      let referenceId = `INNOVERIFYJUB${formattedDateTime}${randomNumber}`;

      if (referenceId.length > 32) {
        referenceId = referenceId.substring(0, 32);
      }
      return referenceId;
    } catch (error) {
      console.error('Failed to generate reference number:', error.message);
      return `INNOVERIFYJUB${Date.now()}`; // Fallback reference number
    }
  };

  const [referenceVerification, setReferenceVerification] = useState<
    string | null
  >(null);

  const startEkyc = async () => {
    setReferenceVerification(reference);
    if (Platform.OS === 'ios') {
      setClicked(true);
      try {
        await showEkycUI(reference);
      } catch (error) {
        Alert.alert('Error', 'Failed to launch eKYC');
      }
    }
    if (Platform.OS === 'android') {
      setShowVerification(true);
      try {
        const referenceNumber = generateReferenceNumber();
        const apkName = await DeviceInfo.getApplicationName();
        await openSelectionScreen(referenceNumber, apkName);
        console.log('Selection screen opened');
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to open selection screen');
      }
    }
  };

  if (Platform.OS === 'ios') {
    useEffect(() => {
      const eventEmitter = new NativeEventEmitter(LivelinessDetectionBridge);

      const subscription = eventEmitter.addListener(
        'sessionTimeoutStatus',
        event => {
          console.log(
            '✅ Reference ID received from native:',
            event.sessionTimeout,
          );
          setReferenceID(event.sessionTimeout);
          setTimeoutStatus(event.sessionTimeout);
        },
      );

      const subscriptionTimeout = innoEmitter.addListener(
        'onScreenTimeout',
        value => {
          console.log('Screen timed out with value:', value);
          // Handle timeout event here (e.g., reset state or navigate)
          setClicked(false);
          setReferenceID(null);

          Alert.alert(
            'Timeout',
            'The native screen was closed due to inactivity.',
          );
        },
      );

      return () => {
        subscription.remove();
        subscriptionTimeout.remove();
      };
    }, []);
  }

  const handleCloseVerification = () => {
    setShowVerification(false);
    setClicked(false);
    setReferenceID(null);
    setTimeoutStatus('null');
    setSessionTimeout(false);
  };

  const handleCloseSessionTimeout = () => {
    setShowVerification(false);
    setSessionTimeout(false);
    setClicked(false);
    setReferenceID(null);
  };

  if (sessionTimeout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Session Timeout. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseSessionTimeout}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showVerification || sessionTimeout === 0 || timeoutStatus === '0') {
    return Platform.OS === 'ios' ? (
      <VerificationScreen
        initialProps={{referenceID: referenceVerification}}
        onClose={handleCloseVerification}
      />
    ) : (
      <VerificationScreen
        initialProps={{referenceNumber: referenceNumber || referenceID}}
        onClose={handleCloseVerification}
      />
    );
  }
  if (
    (reference != 'null' && timeoutStatus != 0) ||
    (!referenceID && !clicked)
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={startEkyc}>
          <Text style={styles.buttonText}>Launch eKYC</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    margin: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
