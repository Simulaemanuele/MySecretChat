import React, {useState} from 'react';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../config/firebase';
import {
  Alert,
  Image,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
const backImage = require('../img/sun-tornado-orange-spinning-background.jpg');

export default function Signup({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onHandleSignup = () => {
    if (email != '' && password != '') {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => console.log('Signup succeded!'))
        .catch(err => Alert.alert('Signup error', err.message));
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Sign up</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={text => setPassword(text)}
        />

        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
        <View style={styles.ctaNavigationSignup}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.secondaryBrandText}>To the Login screen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'orange',
    alignSelf: 'center',
    paddingBottom: 24,
    textShadowColor: '#6b635b',
    textShadowOffset: {
      width: 2,
      height: 3,
    },
    textShadowRadius: 8,
  },
  input: {
    backgroundColor: '#F6F7F8',
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: '100%',
    height: 340,
    position: 'absolute',
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '85%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#F57C00',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
  },
  ctaNavigationSignup: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  secondaryText: {
    color: 'gray',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryBrandText: {
    color: '#f57c00',
    fontWeight: '600',
    fontSize: 14,
  },
});
