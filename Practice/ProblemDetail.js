import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  LogBox,
} from 'react-native';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import { useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#bbd2ec',
  },
  idText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    minHeight: 460,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  controlButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: '#838abd',
    padding: 10,
    borderRadius: 5,
    width: 60,
  },
  controlButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    width: 60,
    height: 40,
    backgroundColor: '#4b3e9a',
    padding: 5,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedButton: {
    width: 60,
    height: 40,
    backgroundColor: '#523383',
    padding: 5,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
    borderColor: '#DF243B',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  line: {
    borderBottomColor: '#838abd',
    borderBottomWidth: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

const ProblemDetail = ({ route, navigation }) => {
  const { examDoc, answerDoc } = route.params;
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoices, setUserChoices] = useState({});
  const [originBookMark, setOriginBookMark] = useState([]); // 필터링 안된 기존 북마크 저장
  const [indexBookMark, setIndexBookMark] = useState([]); // 북마크 인덱스 저장

  // 로그인 정보
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);

  const [userId, setUserId] = useState();
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const isWeb = useSelector((state) => state.isWeb); // 웹 앱 구분

  const id = String(problems[currentIndex]?.id);
  const formattedId = `${id.slice(0, 2)}회차 ${parseInt(id.slice(2))}번`;
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]); // 경고창 안뜨게 하기

  useEffect(() => {
    if (userEmail) {
      setUserId(userEmail.split('.')[0]);
    }
  }, [userEmail]);

  // 문제 가져오기
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const list = [];
        const problemCollection = collection(examDoc.ref, examDoc.id);
        const problemSnapshot = await getDocs(problemCollection);
        problemSnapshot.forEach((problemDoc) => {
          list.push({ id: problemDoc.id, data: problemDoc.data() });
        });
        setProblems(list);

        const alist = [];
        const answerCollection = collection(answerDoc.ref, answerDoc.id);
        const answerSnapshot = await getDocs(answerCollection);
        answerSnapshot.forEach((answerDoc) => {
          alist.push({ id: answerDoc.id, data: answerDoc.data() });
        });
        setAnswers(alist);

        const initialChoices = {};
        list.forEach((problem) => {
          initialChoices[problem.id] = 1;
        });
        setUserChoices(initialChoices);
        setIsLoading(false);        
      } catch (err) {
        console.error('Error fetching data: ', err);
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [examDoc, answerDoc]);

  // 북마크 가져오기
  const fetchBookmarks = async () => {
    if (!isLoggedIn) return;

    const bookMarkRef = collection(firestore, 'users', userEmail, 'bookMark');
    try {
      const querySnapshot = await getDocs(bookMarkRef);

      // 6101, 6103, 6201, 6335, ... 등 북마크 중 회차에 맞는 id만 필터링
      const filteredIds = [];
      const originIds = [];
      querySnapshot.forEach((doc) => {
        if (doc.id.substring(0, 2) === examDoc.id.substring(0, 2)) {
          filteredIds.push(doc.id);
        } else {
          originIds.push(doc.id);
        }
      });
      setOriginBookMark(originIds);

      // 북마크를 인덱스 형태로 추가 저장. 예) 6101 -> 0, 6102 -> 1, ...
      const indexArray = filteredIds.map((id) => {
        return id - examDoc.id * 100 - 1;
      });
      setIndexBookMark(indexArray);

      console.log('Bookmarks fetched and filtered successfully.');
    } catch (error) {
      console.error('Error fetching bookmarks: ', error);
    }
  };
  useEffect(() => {
    fetchBookmarks();
  }, [userId]);

  // 북마크 저장
  useEffect(() => {
    const bookmarkSave = async () => {
      if (!isLoggedIn) return;
      if (indexBookMark.length === 0) {
        return;
      }

      try {
        originBookMark.forEach(async (item) => {
          const itemRef = doc(
            firestore,
            'users',
            userEmail,
            'bookMark',
            item.toString()
          );
          // 문서를 빈 상태로 저장
          await setDoc(itemRef, {});
        });

        console.log('All items saved successfully.');
      } catch (error) {
        console.error('Data could not be saved. ' + error);
      }
    };

    if (originBookMark.length > 0) {
      bookmarkSave();
    }
  }, [originBookMark]);

  // 북마크 선택 시 상태 변경
  const handleBookmark = (index) => {
    if (!isLoggedIn) return;
    if (indexBookMark.includes(index)) {
      // 이미 북마크한 문제라면 북마크 해제
      setIndexBookMark(indexBookMark.filter((i) => i !== index));
    } else {
      // 아직 북마크하지 않은 문제라면 북마크 설정
      setIndexBookMark([...indexBookMark, index]);
    }
  };

  // 이전 문제로 이동
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  // 다음 문제로 이동
  const handleNext = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  // 답안 선택
  const handleSelect = (number) => {
    setUserChoices((prevChoices) => ({
      ...prevChoices,
      [problems[currentIndex].id]: number,
    }));
  };

  // 북마크 저장 후 결과 페이지로 이동
  const saveBookMarkAndNavigate = () => {
    if (isLoggedIn) {
      // 로그인 되었을 떄만 북마크 저장
      // originBookMark 상태변수 업데이트 시 useEffect에 의해 저장 로직 실행됨.
      const saveBookMarkArray = indexBookMark.map((id) => {
        return id + examDoc.id * 100 + 1;
      });
      setOriginBookMark((prevOriginBookMark) => [
        ...prevOriginBookMark,
        ...saveBookMarkArray,
      ]);
    }
    const examId = examDoc.id;
    navigation.navigate('PracticeResult', {
      userChoices,
      problems,
      answers,
      examId,
    });
  };

  // 제출 확인 창
  const handleSubmit = (dataRef) => {
    if (isWeb) {
      const userConfirmed = window.confirm(
        '제출 확인',
        '답을 제출하시겠습니까?'
      );
      if (userConfirmed) {
        saveBookMarkAndNavigate();
      }
    } else {
      // userChoices를 PracticeResult 화면으로 전달
      Alert.alert('제출 확인', '답을 제출하시겠습니까?', [
        {
          text: '취소',
          onPress: () => console.log('취소를 누르셨습니다.'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            saveBookMarkAndNavigate();
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Spinner
          visible={true}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text style={styles.idText}>{formattedId}</Text>
            {isLoggedIn ? (
              <TouchableOpacity onPress={() => handleBookmark(currentIndex)}>
                <FontAwesome
                  name={
                    indexBookMark.includes(currentIndex) ? 'star' : 'star-o'
                  }
                  size={30}
                  color={indexBookMark.includes(currentIndex) ? 'gold' : 'gray'}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.line} />
          {problems.length > 0 && (
            <ScrollView>
              {problems[currentIndex].data.img && (
                <Image
                  style={styles.image}
                  source={{ uri: problems[currentIndex].data.img }}
                  resizeMode="contain"
                />
              )}
              <View style={styles.buttonContainer}>
                {[1, 2, 3, 4, 5].map((number) => (
                  <TouchableOpacity
                    key={number}
                    style={
                      userChoices[problems[currentIndex].id] === number
                        ? styles.selectedButton
                        : styles.button
                    }
                    onPress={() => handleSelect(number)}
                  >
                    <Text style={styles.buttonText}>{number}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
          <View style={styles.controlButtonContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePrev}
              disabled={currentIndex === 0}
            >
              <Text style={styles.controlButtonText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSubmit}
            >
              <Text style={styles.controlButtonText}>제출</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleNext}
              disabled={currentIndex === problems.length - 1}
            >
              <Text style={styles.controlButtonText}>다음</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ProblemDetail;
