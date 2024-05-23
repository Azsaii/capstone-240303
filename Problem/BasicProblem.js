import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler,
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
import { useNavigation } from '@react-navigation/native';

export default function BasicProblem({ route }) {
  const { problemId, userEmail } = route.params;
  const [data, setData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [bookMarkStar, setBookMarkStar] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const navigation = useNavigation();
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
        setData(docSnap.data());
        //setImageUrl(docSnap.data().img);
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
    navigation.setOptions({
      headerTitle:
        '한국사 능력 검정 시험' +
        Math.floor(parseInt(problemId) / 100) +
        '회' +
        (parseInt(problemId) % 100) +
        '번',
      headerShown: true,
    });
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  //이미지 크기에 따른 화면 조절
  useEffect(() => {
    if (data) {
      Image.getSize(
        data.img,
        (width, height) => {
          // 이미지의 원본 비율에 따라 상태 업데이트
          const aspectRatio = width / height;
          setImageAspectRatio(aspectRatio);
        },
        (error) => {
          console.error(`Couldn't get the image size: ${error.message}`);
        }
      );
    }
  }, [data]);
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        {data && (
          <View style={styles.problemInfo}>
            <Text style={{ paddingRight: 20 }}>시대: {data.era}</Text>
            <Text style={{ paddingRight: 20 }}>
              유형:{' '}
              {data.type.map((type, index) => (
                <Text key={index}>
                  {type}
                  {index !== data.type.length - 1 && <Text>,&nbsp;</Text>}
                </Text>
              ))}
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
        )}
        {data && (
          <Image
            key={data.img}
            source={{
              uri: data.img,
            }}
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: imageAspectRatio,
            }}
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
