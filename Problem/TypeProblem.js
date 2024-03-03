import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
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
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import AnswerModal from './AnswerModal';
import { firestore } from '../firebaseConfig';

export default function TypeProblem({ param, isLoggedIn, userEmail }) {
  //const { param } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [problems, setProblems] = useState([]);
  const [displayProblem, setDisplayProblem] = useState(null);
  const [problemCount, setProblemCount] = useState(0);
  const [selectlistData, setSelectlistData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [bookMarkList, setBookMarkList] = useState([]);
  const [bookMarkStar, setBookMarkStar] = useState(false);
  const [answer, setAnswer] = useState(null);
  const openModal = () => {
    setModalOpen(true);
    getAnswer();
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  const changeData = async (temp) => {
    try {
      const parentCollectionId = 'exam round'; // 부모 컬렉션
      const subCollectionIds = ['61', '62', '63', '64']; // 자식 컬렉션

      //각 자식컬렉션에 대해 반복적으로 쿼리를 수행
      var newProblems = [];
      for (const subCollectionId of subCollectionIds) {
        console.log('Selected Problem:', temp);
        const q = query(
          collection(
            firestore,
            parentCollectionId,
            subCollectionId,
            subCollectionId
          ),
          param === 'era'
            ? where('era', '==', temp)
            : where('type', 'array-contains', temp)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          newProblems = [...newProblems, doc];
          //console.log(doc.id, ' => ', doc.data());
        });
      }

      setImageUrl(newProblems[0].data().img);
      console.log(newProblems[0].data().id);
      setProblems(newProblems);
      setDisplayProblem(newProblems[0].data().id);
      setProblemCount(1);
      if (isLoggedIn) getBookMark(newProblems[0].data().id);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAnswer = async () => {
    try {
      const docRef = doc(
        db,
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

  const addBookMark = async () => {
    await setDoc(
      doc(firestore, 'users', userEmail, 'bookMark', displayProblem),
      {}
    );
    setBookMarkList([...bookMarkList, displayProblem]);
  };
  const deleteBookMark = async () => {
    await deleteDoc(
      doc(firestore, 'users', userEmail, 'bookMark', displayProblem)
    );
    const newArray = bookMarkList.filter((item) => item !== displayProblem);
    setBookMarkList(newArray);
  };
  const getBookMark = async (firstProblem) => {
    try {
      var firstBookMark = [];
      const querySnapshot = await getDocs(
        collection(firestore, 'users', userEmail, 'bookMark')
      );
      querySnapshot.forEach((doc) => {
        firstBookMark.push(doc.id);
        console.log(doc.id, ' => ', doc.data());
      });
      setBookMarkList(firstBookMark);
      if (firstBookMark.includes(firstProblem)) {
        console.log('체크 true' + firstProblem);
        setBookMarkStar(true);
      } else {
        console.log('체크 false' + firstProblem);
        setBookMarkStar(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const eraData = [
    { key: '전삼국', value: '전삼국' },
    { key: '삼국', value: '삼국시대' },
    { key: '후삼국', value: '후삼국시대' },
    { key: '고려', value: '고려시대' },
    { key: '조선', value: '조선시대' },
    { key: '개항기', value: '개항기' },
    { key: '일제강점기', value: '일제강점기' },
    { key: '해방이후', value: '해방이후' },
  ];

  const typeData = [
    { key: '사건', value: '사건' },
    { key: '유물', value: '유물' },
    { key: '인물', value: '인물' },
    { key: '문화', value: '문화' },
    { key: '장소', value: '장소' },
    { key: '그림', value: '그림' },
    { key: '제도', value: '제도' },
    { key: '조약', value: '조약' },
    { key: '기구', value: '기구' },
    { key: '단체', value: '단체' },
    { key: '미분류', value: '미분류' },
  ];
  const handlePrevious = () => {
    if (problemCount > 1) {
      const temp = problems[problemCount - 2].data();
      setDisplayProblem(temp.id);
      setImageUrl(temp.img);
      setProblemCount((prevCount) => prevCount - 1);
      if (bookMarkList.includes(temp.id)) {
        console.log('체크 true' + temp.id);
        setBookMarkStar(true);
      } else {
        console.log('체크 false' + temp.id);
        setBookMarkStar(false);
      }
    }
  };

  const handleNext = () => {
    if (problemCount < problems.length) {
      const temp = problems[problemCount].data();
      setDisplayProblem(temp.id);
      setImageUrl(temp.img);
      setProblemCount((prevCount) => prevCount + 1);
      if (bookMarkList.includes(temp.id)) {
        console.log('체크 true' + temp.id);
        setBookMarkStar(true);
      } else {
        console.log('체크 false' + temp.id);
        setBookMarkStar(false);
      }
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

  useEffect(() => {
    if (param === 'era') setSelectlistData(eraData);
    else setSelectlistData(typeData);
    //setSelectlistData(param === 'era' ? eraData : typeData);
    changeData(param === 'era' ? '전삼국' : '사건');
  }, []); //컴포넌트가 마운트될 때만 실행
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text>{param}</Text>
        <View style={styles.problemInfo}>
          <SelectList
            setSelected={(val) => {
              const selectedKey = selectlistData.find(
                (item) => item.value === val
              )?.key;
              changeData(selectedKey);
            }}
            data={selectlistData}
            save="value"
            placeholder={param === 'era' ? '시대 설정' : '타입 설정'}
            boxStyles={{ width: 300, marginRight: 15 }}
          />
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
