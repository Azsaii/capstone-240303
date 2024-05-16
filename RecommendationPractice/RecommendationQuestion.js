import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#bbd2ec',
  },
  card: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
    width: 90,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  title: {
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
    width: 90,
    height: 40,
    textAlign: 'center',
  },
  problemImage: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moveButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  moveButton: {
    padding: 10,
    backgroundColor: '#978ff9',
    borderRadius: 5,
  },
  disabledButton: {
    padding: 10,
    backgroundColor: '#aaa',
    borderRadius: 5,
  },
  line: {
    borderBottomColor: '#7bb4e3',
    borderBottomWidth: 10,
    margin: 20,
    borderRadius: 5,
  },
});

const RecommendationQuestion = () => {
  const [currentProblems, setCurrentProblems] = useState([]); // 현재 페이지에 표시될 문제들
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 시작 인덱스
  const [allProblems, setAllProblems] = useState([]); // 모든 문제 정보
  const [allAnswers, setAllAnswers] = useState([]); // 모든 답안 정보

  const [recommendProblems, setRecommendProblems] = useState([]); // 추천 문제

  const [answerShown, setAnswerShown] = useState([]); // 정답 보임 여부
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const userEmail = useSelector((state) => state.userEmail); // 유저 이메일

  const scrollViewRef = useRef(); // 화면 최상단으로 이동시키기 위한 변수
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // 동적 이미지 크기변화를 위한 변수

  // 배열 섞는 함수
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // 요소 위치 교환
    }
  }

  // Firestore에서 데이터를 가져오고 섞는 함수
  const fetchAndShuffle = async (ref) => {
    const snapshot = await getDocs(ref);
    let items = [];
    snapshot.forEach((doc) => items.push(doc.id));
    shuffleArray(items);
    return items;
  };

  // 모든 문제, 정답 정보 가져오기
  const fetchProblemsAndAnswers = async () => {
    setIsLoading(true);
    let tempAllProblems = {};
    let tempAllAnswers = {};

    // 문제 정보 가져오기
    for (let round = 61; round <= 68; round++) {
      const roundRef = collection(firestore, `exam round/${round}/${round}`);
      const roundSnapshot = await getDocs(roundRef);
      let roundProblems = {}; // 객체로 초기화
      roundSnapshot.forEach((doc) => {
        roundProblems[doc.id] = doc.data().img; // 문제 ID를 키로, 이미지 URL을 값으로 저장
      });
      tempAllProblems[round] = roundProblems;
    }

    // 답안 정보 가져오기
    for (let round = 61; round <= 68; round++) {
      const answerRef = collection(firestore, `answer round/${round}/${round}`);
      const answerSnapshot = await getDocs(answerRef);
      let roundAnswers = {};
      answerSnapshot.forEach((doc) => {
        roundAnswers[doc.id] = doc.data().answer;
      });
      tempAllAnswers[round] = roundAnswers;
    }

    console.log('t1');
    setAllProblems(tempAllProblems);
    setAllAnswers(tempAllAnswers);
  };

  useEffect(() => {
    if (allProblems.length === 0 && allAnswers.length === 0) {
      fetchProblemsAndAnswers(); // 모든 문제, 정답 정보 가져오기
    }
  }, []);

  useEffect(() => {
    const fetchUserRelatedData = async () => {
      // 유저 오답, 킬러문제, 북마크 문제 가져오기 및 섞기
      const wrongProblemsRef = collection(
        firestore,
        `users/${userEmail}/wrongProblems`
      );
      const killerProblemsRef = collection(firestore, 'killer round');
      const bookMarksRef = collection(firestore, `users/${userEmail}/bookMark`);

      const [a1, a2, a3] = await Promise.all([
        fetchAndShuffle(wrongProblemsRef),
        fetchAndShuffle(killerProblemsRef),
        fetchAndShuffle(bookMarksRef),
      ]);

      // 각 추천문제 배열에 문제번호에 맞게 id, 문제 사진, 답 정보를 저장한다.
      const indexRecommendProblems = [a1, a2, a3];

      // 배열 업데이트 함수
      const updateArrayWithInfo = (array, allProblems, allAnswers) => {
        return array.map((id) => {
          const round = parseInt(id.toString().substring(0, 2), 10);
          const img = allProblems[round] ? allProblems[round][id] : null;
          const answer = allAnswers[round] ? allAnswers[round][id] : null;
          if (img === null || answer === null) fetchProblemsAndAnswers();
          return { id, img, answer };
        });
      };

      // 상태 업데이트 공통 로직
      const newRecommendProblems = indexRecommendProblems.map(
        (array, index) => {
          return updateArrayWithInfo(array, allProblems, allAnswers);
        }
      );

      console.log('t2');
      //console.log(newRecommendProblems);

      setRecommendProblems(newRecommendProblems);
    };
    if (allProblems.length !== 0 && allAnswers.length !== 0) {
      console.log('test');
      fetchUserRelatedData();
    }
  }, [allProblems, allAnswers]);

  // 현재 인덱스가 변경되면 해당 인덱스부터 10개 문제를 보이게 한다.
  useEffect(() => {
    setIsLoading(true);
    console.log('ci: ' + currentIndex);
    if (recommendProblems.length === 0) return;
    //console.log(recommendProblems);
    console.log('t3');

    let updArr = [];
    let ci = 0;
    if (currentIndex !== 0) ci = currentIndex - 1;

    // recommendProblems 사용하여 배열 업데이트 처리를 위한 함수
    const updateArrayFromRecommend = (recommendArr, ci) => {
      let totalPerChunk = [4, 4, 2]; // 각 배열에 대한 추출 개수 설정
      let result = [];
      let counter = 0; // 현재까지 추출한 문제의 총 개수를 추적

      for (let i = 0; i < recommendArr.length; i++) {
        let perChunk = totalPerChunk[i]; // 현재 배열에 대한 추출 개수
        let sourceArray = recommendArr[i];
        let startIndex = ci * perChunk;
        let endIndex = startIndex + perChunk;

        if (startIndex < sourceArray.length) {
          result.push(
            ...sourceArray.slice(
              startIndex,
              Math.min(endIndex, sourceArray.length)
            )
          );
          counter += endIndex - startIndex; // 추출된 개수를 카운터에 추가
        }

        if (counter >= 10) break; // 총 10개를 추출했으면 반복 종료
      }

      return result;
    };

    updArr = updateArrayFromRecommend(recommendProblems, ci);
    if (updArr[0].img === null) return;
    setCurrentProblems(updArr); // 현재 문제 상태 업데이트
    setIsLoading(false);

    console.log(updArr);
  }, [recommendProblems, currentIndex]); // currentIndex 의존성 추가

  // 이전 / 다음 문제 10개 보여주기
  function handlelMove(state) {
    setCurrentIndex(currentIndex + state);
    scrollViewRef.current.scrollTo({ y: 0, animated: false }); // 화면 최상단으로 스크롤
  }

  const renderItem = (item) => {
    if (typeof item === 'string') return;
    // 답 표시 상태를 토글하는 함수
    const handleToggleAnswer = (id) => {
      if (answerShown.includes(id)) {
        // 이미 답이 표시된 경우, 해당 id를 answerShown 배열에서 제거
        setAnswerShown(answerShown.filter((answerId) => answerId !== id));
      } else {
        // 답이 표시되지 않은 경우, 해당 id를 answerShown 배열에 추가
        setAnswerShown([...answerShown, id]);
      }
    };

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.rowContainer}>
          <Text style={styles.title}>{`${item.id.slice(0, 2)}회차 ${parseInt(
            item.id.slice(2)
          )}번`}</Text>
          <TouchableOpacity
            style={styles.answerBtn}
            onPress={() => handleToggleAnswer(item.id)}
          >
            <Text>
              {answerShown.includes(item.id)
                ? `정답: ${item.answer}`
                : '정답 보기'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Image
            style={{ width: '100%', height: imageSize.height }}
            source={{ uri: item.img }}
            resizeMode="contain"
            onLoad={(event) => {
              const { width, height } = event.nativeEvent.source;
              const screenWidth = Dimensions.get('window').width;
              const scaledHeight = (height / width) * screenWidth;
              setImageSize({ width: screenWidth, height: scaledHeight });
            }}
          />
        </ScrollView>

        <View style={styles.line}></View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <View style={styles.cardContainer}>
            {currentProblems.map((item) => renderItem(item))}
          </View>
          <View style={styles.moveButtonContainer}>
            {currentIndex <= 1 ? (
              <View style={styles.disabledButton}>
                <Text>이전</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handlelMove(-1)}
                style={styles.moveButton}
              >
                <Text>이전</Text>
              </TouchableOpacity>
            )}
            {currentProblems.length < 10 ? (
              <View style={styles.disabledButton}>
                <Text>다음</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handlelMove(1)}
                style={styles.moveButton}
              >
                <Text>다음</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default RecommendationQuestion;
