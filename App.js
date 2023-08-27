
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import CryptoJS from 'react-native-crypto-js';
import { Alert } from 'react-native';
import moment from 'moment';
import QRCode from 'react-native-qrcode-svg';
import { ScrollView } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Dimensions } from 'react-native';
import { Vibration } from 'react-native';


export default function App() {

  const encrptedKey = "8899134781";
  const [status, setStatus] = useState(null);
  const [amount, setAmount] = useState(null);
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const width = Dimensions.get('window').width
  const [scanned, setScanned] = useState(false);
  const [data, setdata] = useState('')
  const encrypt = () => {
    var date = moment().utcOffset('+05:30').format('DD-MM-YYYY hh:mm:ss');
    var value = {
      amount: amount,
      date: date
    }


    setEncrypted(CryptoJS.AES.encrypt(JSON.stringify(value), encrptedKey).toString());
  }
  const decrypt = (encrypted) => {
    try {
      setDecrypted(JSON.parse(CryptoJS.AES.decrypt(encrypted, encrptedKey).toString(CryptoJS.enc.Utf8)));
    }
    catch (e) {
      throw e;
    }
  }

  const scanning = (type, data) => {
    Vibration.vibrate(100); 
    try {
      decrypt(data);
      Alert.alert('QR is Scanned...', `Amount is Rs ${decrypted.amount}/- and date is ${decrypted.date}`, [
      
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
      setScanned(true);
      setdata(JSON.stringify(data));
      
    }
    catch(e){
      Alert.alert('Error in Scanning code ', 'Please check the qr code once', [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
      
      setScanned(true);
      console.log(e);
    }
    console.log(type);
  }
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      const status2 = await BarCodeScanner.requestPermissionsAsync();
    })();
  }, []);
  return (
    <ScrollView style={styles.container}>
      <TextInput placeholder='Enter the amount' style={styles.textinput} onChangeText={(text) => setAmount(text)} keyboardType='numeric' />
      <View style={styles.buttonView} >

        <TouchableOpacity activeOpacity={.7} style={styles.button} onPress={() =>
          setStatus("success")
        }>
          <Text style={{ color: 'white' }}>Success</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={.7} style={styles.button} onPress={() => {
          setStatus("processing")
          encrypt()
        }}>
          <Text style={{ color: 'white' }}>Processing</Text>
        </TouchableOpacity>

      </View>

      {
        status == 'processing' ?
          <View>
            <Text style={{ color: 'black', marginLeft: 10, marginBottom: 20, fontWeight: 'bold' }}>Encrypted Text:</Text>
            <Text style={{ borderColor: 'gray', borderWidth: 2, borderRadius: 20, padding: 20, marginBottom: 20 }}>{encrypted}</Text>

            {
              encrypted &&
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: 'black', marginLeft: 10, marginBottom: 20, width: '100%', fontWeight: 'bold' }}>QrCode:</Text>
                <QRCode size={250} value={encrypted} />
              </View>
            }

            
          </View>
          :
          // <QRCodeScanner
          // onRead={{}}
          // topContent={
          // <Text style={styles.centerText}>
          //   Go to{' '}
          //   <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
          //   your computer and scan the QR code.
          // </Text>
          // }
          // bottomContent={
          //   <TouchableOpacity style={styles.buttonTouchable}>
          //     <Text style={styles.buttonText}>OK. Got it!</Text>
          //   </TouchableOpacity>
          // }
          // />
          <View style={{ flex: 1 }}>

            <BarCodeScanner style={{ width: '100%', height: 500 }}
              onBarCodeScanned={({ type, data }) => scanned ? undefined : scanning(type, data)}

            />
          </View>
      }

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    margin: 10,
    backgroundColor: '#fff',

  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30
  },

  button: {
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
  },
  textinput: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10
  }
});
