import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import {Buffer} from 'buffer';
const VerificationScreen = ({initialProps, onClose}) => {
  let {referenceNumber} = initialProps || {};
  if (Platform.OS === 'ios') {
    referenceNumber = initialProps.referenceID;
  }
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = 'enrollment';
  const password = '@ISPL@082023@innotrust';
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  useEffect(() => {
    if (referenceNumber) {
      const fetchVerificationData = async () => {
        try {
          const response = await fetch(
            `https://innotrust.innovitegra.online/api/enroll/${referenceNumber}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
              },
            },
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.status}
${response.statusText}`);
          }
          const data = await response.json();
          setVerificationData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchVerificationData();
    }
  }, [referenceNumber]);
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Processing KYC...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.containerSafe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const getBase64Uri = base64String => {
    return base64String ? `data:image/jpeg;base64,${base64String}` : null;
  };
  const frontData =
    verificationData?.data?.Front_OCR_Data?.id_analysis?.front || {};
  const backData =
    verificationData?.data?.Back_OCR_Data?.id_analysis?.back || {};
  const score = verificationData?.data?.Score || 'N/A';
  const verificationStatus =
    verificationData?.data?.Verification_Status || 'N/A';
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  return (
    <SafeAreaView style={styles.containerSafe}>
      <ScrollView style={styles.container}>
        {verificationData ? (
          <>
            <View style={styles.card}>
              <Text style={styles.title}>Reference Number:</Text>
              <Text style={styles.value}>{referenceNumber}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.statusTitle}>Verification Status:</Text>
              <Text
                style={[
                  styles.statusValue,
                  verificationStatus === 'SUCCESS'
                    ? styles.success
                    : styles.failed,
                ]}>
                {verificationStatus}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.title}>Score:</Text>
              <Text style={styles.value}>{score}</Text>
            </View>
            {/* FRONT ID DETAILS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Front ID Details</Text>
              {Object.entries(frontData).map(([key, value]) => (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key.replace(/_/g, '')}:</Text>
                  <Text style={styles.value}>{value || 'N/A'}</Text>
                </View>
              ))}
            </View>
            {/* BACK ID DETAILS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Back ID Details</Text>
              {Object.entries(backData).map(([key, value]) => (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key.replace(/_/g, '')}:</Text>
                  <Text style={styles.value}>{value || 'N/A'}</Text>
                </View>
              ))}
            </View>
            {/* IMAGE DISPLAY */}
            <View style={styles.imageSection}>
              {[
                {label: 'Front ID Image', key: 'Front_ID_Image'},
                {label: 'Back ID Image', key: 'Back_ID_Image'},
                {label: 'Front Extracted Image', key: 'Extracted_Image'},
                {label: 'Selfie Image', key: 'Selfie_Image'},
              ].map(({label, key}) => (
                <View key={key} style={styles.imageCard}>
                  <Text style={styles.imageLabel}>{label}</Text>
                  {verificationData.data?.[key] ? (
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{
                          uri: getBase64Uri(verificationData.data[key]),
                        }}
                        style={styles.image}
                      />
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Text style={styles.placeholder}>No image available</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {/* Navigate Button */}
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noDataText}>No data available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  containerSafe: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
  },
  failed: {
    color: 'red',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  imageSection: {
    marginTop: 15,
    marginBottom: 20,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 15,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  imageWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  placeholderContainer: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  placeholder: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '90%',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
export default VerificationScreen;
