import React, {useEffect, useState, useLayoutEffect, useCallback} from 'react';
import {TouchableOpacity} from 'react-native';
import {
  collection,
  orderBy,
  addDoc,
  query,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'; // Importa le funzioni corrette per Firestore
import {signOut} from 'firebase/auth';
import {auth, database} from '../config/firebase';
import {useNavigation} from '@react-navigation/native';
import colors from '../colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {GiftedChat} from 'react-native-gifted-chat';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const chatRef = collection(database, 'chats'); // Usa collection() per accedere a una collezione Firestore

    // Aggiungi un listener per rilevare quando qualcuno sta scrivendo
    const unsubscribeTyping = onSnapshot(chatRef, snapshot => {
      setIsTyping(snapshot.docs[0]?.data()?.isTyping || false);
    });

    // Aggiungi un listener per ricevere i messaggi
    const messagesRef = collection(database, 'chats');
    const queryRef = query(messagesRef, orderBy('createdAt', 'desc'));
    const unsubscribeMessages = onSnapshot(queryRef, snapshot => {
      setMessages(
        snapshot.docs.map(doc => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        })),
      );
    });

    return () => {
      // Rimuovi i listener quando il componente viene smontato
      unsubscribeTyping();
      unsubscribeMessages();
    };
  }, []);

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

    // Verifica se il documento utente esiste al mount del componente
    const initializeUserDoc = async () => {
      const currentUserEmail = auth?.currentUser?.email;
      const userDocRef = doc(database, 'users', currentUserEmail);

      try {
        // snapshot of the user doc
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
          // If not exists create it
          await setDoc(userDocRef, {
            isTyping: false,
          });
        }
      } catch (error) {
        console.error('Error User Doc verify: ', error);
      }
    };

    initializeUserDoc();
  }, []);

  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));

      const {_id, createdAt, text, user} = newMessages[0];
      await addDoc(collection(database, 'chats'), {
        _id,
        createdAt,
        text,
        user,
      });

      const chatRef = doc(database, 'users', currentUserEmail); // Aggiungi l'ID del documento di chat
      await updateDoc(chatRef, {isTyping: false});
    },
    [setMessages],
  );

  const handleInputTextChanged = async text => {
    const currentUserEmail = auth?.currentUser?.email;
    const userDocRef = doc(database, 'users', currentUserEmail);

    try {
      // Verify is the doc exists before the update
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        // If exists, update isTyping field
        const typingUserId = messages[0]?.user?._id;

        const isOtherUserTyping =
          text.length > 0 && typingUserId !== currentUserEmail;
        const isCurrentUserTyping =
          text.length > 0 && typingUserId === currentUserEmail;

        await updateDoc(userDocRef, {
          isTyping: isOtherUserTyping,
        });

        const chatRef = doc(database, 'users', currentUserEmail); // Aggiungi l'ID del documento di chat
        await updateDoc(chatRef, {isTyping: isCurrentUserTyping});
      } else {
        console.error('User Doc not found.');
      }
    } catch (error) {
      console.error('Error updating stat of isTyping: ', error);
    }
  };

  const onSignOut = () => {
    signOut(auth).catch(err => console.log(err));
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: auth?.currentUser?.email,
        avatar: 'https://picsum.photos/200/300',
      }}
      messagesContainerStyle={{
        backgroundColor: colors.mediumGray,
      }}
      isTyping={isTyping}
      onInputTextChanged={text => handleInputTextChanged(text)}
      showUserAvatar={true}
    />
  );
};

export default Chat;
