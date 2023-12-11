import React, {useEffect, useState, useLayoutEffect, useCallback} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {
  collection,
  orderBy,
  addDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import {signOut} from 'firebase/auth';
import {auth, database} from '../config/firebase';
import {useNavigation} from '@react-navigation/native';
import colors from '../colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {GiftedChat} from 'react-native-gifted-chat';

const Chat = () => {
  const [messages, setMessages] = useState([]);

  const navigation = useNavigation();

  // useEffect(() => {
  //   // Esegui solo al mount
  //   setMessages([
  //     {
  //       _id: 1,
  //       text: 'Hello developer',
  //       createdAt: new Date(),
  //       user: {
  //         _id: 2,
  //         name: 'React Native',
  //         avatar: 'https://placeimg.com/140/140/any',
  //       },
  //     },
  //   ]);
  // }, []); // Array di dipendenze vuoto per eseguire solo al mount

  // const onSend = (newMessages = []) => {
  //   setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
  // };

  const onSignOut = () => {
    signOut(auth).catch(err => console.log(err));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{marginRight: 10}} onPress={onSignOut}>
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{marginRight: 10}}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useLayoutEffect(() => {
    const collectionRef = collection(database, 'chats');
    const queryRef = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsuscribe = onSnapshot(queryRef, snapshot => {
      console.log('snapshot');
      setMessages(
        snapshot.docs.map(doc => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        })),
      );
    });

    return () => unsuscribe();
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(prevMessages => GiftedChat.append(prevMessages, messages));

    const {_id, createdAt, text, user} = messages[0];
    addDoc(collection(database, 'chats'), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: auth?.currentUser?.email,
        avatar: 'https://placeimg.com/140/140/any',
      }}
      messagesContainerStyle={{
        backgroundColor: colors.mediumGray,
      }}
    />
  );
};

export default Chat;
