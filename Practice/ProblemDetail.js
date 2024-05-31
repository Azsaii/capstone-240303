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
  Dimensions,
} from 'react-native';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
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
    backgroundColor: '#978ff9',
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
  const { examDocId } = route.params;
  const [problems, setProblems] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoices, setUserChoices] = useState({});

  const [indexBookMark, setIndexBookMark] = useState([]); // 북마크 인덱스 저장
  const [finalBookMark, setFinalBookMark] = useState([]); // 최종적으로 db에 반영할 북마크
  const [isBookmarkSaved, setIsBookmarkSaved] = useState(false); // 최종 북마크 저장 확인

  // 로그인 정보
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);

  const [userId, setUserId] = useState();
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const isWeb = useSelector((state) => state.isWeb); // 웹 앱 구분

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // 동적 이미지 크기변화를 위한 변수

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

  // 문제 정보 가져오기
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const plist = [];
        const problemCollection = collection(
          firestore,
          'exam round',
          examDocId,
          examDocId
        );

        const problemSnapshot = await getDocs(problemCollection);
        problemSnapshot.forEach((problemDoc) => {
          plist.push({ id: problemDoc.id, data: problemDoc.data() });
        });
        setProblems(plist);

        const initialChoices = {};
        plist.forEach((problem) => {
          initialChoices[problem.id] = 1;
        });
        setUserChoices(initialChoices);
      } catch (err) {
        console.error('Error fetching problem data: ', err);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await fetchProblems();
      setIsLoading(false);
    };

    fetchData();
  }, [examDocId]);

  // 북마크 가져오기
  const fetchBookmarks = async () => {
    if (!isLoggedIn) return;

    const bookMarkRef = collection(firestore, 'users', userEmail, 'bookMark');
    try {
      const querySnapshot = await getDocs(bookMarkRef);

      // 6101, 6103, 6201, 6335, ... 등 북마크 중 회차에 맞는 id만 필터링
      const filteredIds = [];
      querySnapshot.forEach((doc) => {
        if (doc.id.substring(0, 2) === examDocId.substring(0, 2)) {
          filteredIds.push(doc.id);
        }
      });

      // 북마크를 인덱스 형태로 추가 저장. 예) 6101 -> 0, 6102 -> 1, ...
      const indexArray = filteredIds.map((id) => {
        return id - examDocId * 100 - 1;
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
      try {
        const savePromises = finalBookMark.map(async (item) => {
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

        await Promise.all(savePromises);

        console.log('FINAL: BOOKMARK SAVED.');
        setIsBookmarkSaved(true); // 모든 북마크 저장이 완료되면 상태 업데이트
      } catch (error) {
        console.error('Data could not be saved. ' + error);
        setIsBookmarkSaved(true); // 오류가 발생해도 상태 업데이트
      }
    };

    if (finalBookMark.length > 0 && isLoggedIn) {
      bookmarkSave();
    }
  }, [finalBookMark]);

  // 최종적으로 북마크 저장 완료 후 결과 화면으로 이동
  useEffect(() => {
    if (isBookmarkSaved) {
      navigation.navigate('PracticeResult', {
        userChoices: userChoices,
        problems: problems,
        examDocId: examDocId,
      });
    }
  }, [isBookmarkSaved]);

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
        return id + examDocId * 100 + 1;
      });

      if (saveBookMarkArray.length === 0) {
        // 북마크 없으면 바로 네비게이트
        setIsBookmarkSaved(true);
      }

      setFinalBookMark(saveBookMarkArray); // 북마크 저장 후 네비게이트
    } else {
      setIsBookmarkSaved(true);
    }
  };

  // 제출 확인 창
  const handleSubmit = (dataRef) => {
    if (isWeb) {
      // const userConfirmed = window.confirm(
      //   '제출 확인',
      //   '답을 제출하시겠습니까?'
      // );
      // if (userConfirmed) {
      //   saveBookMarkAndNavigate();
      // }
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

  useEffect(() => {
    if (problems.length > 0 && problems[currentIndex].data.img) {
      const imgUri = problems[currentIndex].data.img;

      // 이미지의 원본 크기를 가져옴
      Image.getSize(imgUri, (width, height) => {
        const screenWidth = Dimensions.get('window').width;
        const scaledHeight = (height / width) * screenWidth;
        setImageSize({
          width: screenWidth,
          height: scaledHeight,
        });
      }, (error) => {
        console.error(`Failed to get image size: ${error}`);
      });
    }
  }, [problems, currentIndex]);

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
            <>
              <ScrollView>
                {problems[currentIndex].data.img && (
                  <Image
                    style={{ width: '100%', height: imageSize.height }}
                    source={{ uri: problems[currentIndex].data.img }}
                    resizeMode="contain"

                  />
                )}
              </ScrollView>
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
            </>
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
