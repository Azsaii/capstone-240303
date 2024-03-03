import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import AnswerModal from './AnswerModal';
import { firestore } from '../firebaseConfig';

export default function KillerProblem() {
  const [imageUrl, setImageUrl] = useState(null);
  const [problems, setProblems] = useState([]);
  const [displayProblem, setDisplayProblem] = useState(null);
  const [problemCount, setProblemCount] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [answer, setAnswer] = useState(null);
  const openModal = () => {
    setModalOpen(true);
    getAnswer();
  };
  const closeModal = () => {
    setModalOpen(false);
  };
  const getKillerProblem = async (temp) => {
    try {
      var killerList = [];
      var newProblems = [];
      const q = query(collection(firestore, 'killer round'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        killerList.push(doc.id);
        console.log(doc.id);
      });
      for (const item of killerList) {
        const subCollectionId = String(Math.floor(parseInt(item) / 100));
        const docRef = doc(
          firestore,
          'exam round',
          subCollectionId,
          subCollectionId,
          item
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          newProblems = [...newProblems, docSnap];
          console.log('Document data:', docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
      setImageUrl(newProblems[0].data().img);
      console.log(newProblems[0].data().id);
      setProblems(newProblems);
      setDisplayProblem(newProblems[0].data().id);
      setProblemCount(1);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAnswer = async () => {
    try {
      const docRef = doc(
        firestore,
        'answer round',
        String(Math.floor(parseInt(displayProblem) / 100)),
        String(Math.floor(parseInt(displayProblem) / 100)),
        displayProblem
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

  const handlePrevious = () => {
    if (problemCount > 1) {
      setDisplayProblem(problems[problemCount - 2].data().id);
      setImageUrl(problems[problemCount - 2].data().img);
      setProblemCount((prevCount) => prevCount - 1);
    }
  };

  const handleNext = () => {
    if (problemCount < problems.length) {
      setDisplayProblem(problems[problemCount].data().id);
      setImageUrl(problems[problemCount].data().img);
      setProblemCount((prevCount) => prevCount + 1);
    }
  };
  useEffect(() => {
    getKillerProblem();
  }, []); //컴포넌트가 마운트될 때만 실행
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.problemInfo}>
          <Text style={{ paddingRight: 20 }}>
            한국사 능력 검정 시험 {Math.floor(parseInt(displayProblem) / 100)}회{' '}
            {parseInt(displayProblem) % 100}번
          </Text>
          <TouchableOpacity style={styles.answerButton} onPress={openModal}>
            <Text>정답보기</Text>
          </TouchableOpacity>
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
        <View style={styles.arrowButton}>
          <TouchableOpacity onPress={handlePrevious}>
            <Text>이전</Text>
            <MaterialIcons name="west" size={30} color="black" />
          </TouchableOpacity>
          <Text>
            {problemCount}/{problems.length}
          </Text>
          <TouchableOpacity onPress={handleNext}>
            <Text> 다음</Text>
            <MaterialIcons name="east" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <AnswerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          problem={displayProblem}
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
