import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  collectionGroup,
} from 'firebase/firestore';
import AnswerModal from './AnswerModal';
//const app = initializeApp(firebaseConfig);
//const db = getFirestore(app);

export default function BasicProblem({ route }) {
  const { problemId, userEmail } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [bookMarkStar, setBookMarkStar] = useState(false);
  const [answer, setAnswer] = useState(null);
  const isLoggedIn = true;
  const openModal = () => {
    setModalOpen(true);
    getAnswer();
  };
  const closeModal = () => {
    setModalOpen(false);
  };
  const getData = async () => {
    try {
      const docRef = doc(
        firestore,
        'exam round',
        String(Math.floor(parseInt(problemId) / 100)),
        String(Math.floor(parseInt(problemId) / 100)),
        problemId
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setImageUrl(docSnap.data().img);
        console.log('Document data:', docSnap.data());
        if (isLoggedIn) getBookMark();
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const addBookMark = async () => {
    await setDoc(doc(firestore, 'users', userEmail, 'bookMark', problemId), {});
  };
  const deleteBookMark = async () => {
    await deleteDoc(doc(firestore, 'users', userEmail, 'bookMark', problemId));
  };
  const getBookMark = async () => {
    try {
      var firstBookMark = [];
      const querySnapshot = await getDocs(
        collection(firestore, 'users', userEmail, 'bookMark')
      );
      querySnapshot.forEach((doc) => {
        firstBookMark.push(doc.id);
        console.log(doc.id, ' => ', doc.data());
      });
      if (firstBookMark.includes(problemId)) {
        console.log('체크 true' + problemId);
        setBookMarkStar(true);
      } else {
        console.log('체크 false' + problemId);
        setBookMarkStar(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleBookMark = () => {
    if (!bookMarkStar) {
      setBookMarkStar(true);
      addBookMark();
    } else {
      setBookMarkStar(false);
      deleteBookMark();
    }
  };
  const getAnswer = async () => {
    try {
      const docRef = doc(
        firestore,
        'answer round',
        String(Math.floor(parseInt(problemId) / 100)),
        String(Math.floor(parseInt(problemId) / 100)),
        problemId
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAnswer(docSnap.data());
        console.log('Document data:', docSnap.data());
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.problemInfo}>
          <Text style={{ paddingRight: 20 }}>
            한국사 능력 검정 시험 {Math.floor(parseInt(problemId) / 100)}회{' '}
            {parseInt(problemId) % 100}번
          </Text>
          <TouchableOpacity style={styles.answerButton} onPress={openModal}>
            <Text>정답보기</Text>
          </TouchableOpacity>
          {isLoggedIn && (
            <TouchableOpacity onPress={handleBookMark}>
              {bookMarkStar ? (
                <AntDesign name="star" size={24} color="yellow" />
              ) : (
                <AntDesign name="staro" size={24} color="black" />
              )}
            </TouchableOpacity>
          )}
        </View>
        {imageUrl && (
          <Image
            key={imageUrl}
            source={{
              uri: imageUrl,
            }}
            style={{ width: 400, aspectRatio: 1 }}
            resizeMode="contain"
          />
        )}
        <AnswerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          problem={problemId}
          answer={answer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  problemInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: 'orange',
    borderRadius: 5,
  },
  arrowButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
