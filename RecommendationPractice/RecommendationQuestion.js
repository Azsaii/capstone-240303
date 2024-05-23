import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

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
    backgroundColor: '#838abd',
    borderRadius: 5,
  },
  disabledButton: {
    padding: 10,
    backgroundColor: '#495057',
    borderRadius: 5,
  },
  line: {
    borderBottomColor: '#7bb4e3',
    borderBottomWidth: 10,
    margin: 20,
    borderRadius: 5,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

const RecommendationQuestion = () => {
  const [currentProblems, setCurrentProblems] = useState([]); // 현재 페이지에 표시될 문제들
  const [currentIndex, setCurrentIndex] = useState(1); // 현재 시작 인덱스
  const [recommendProblems, setRecommendProblems] = useState([]); // 추천 문제

  const [answerShown, setAnswerShown] = useState([]); // 정답 보임 여부
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const userEmail = useSelector((state) => state.userEmail); // 유저 이메일

  const scrollViewRef = useRef(); // 화면 최상단으로 이동시키기 위한 변수
  const [imageSizes, setImageSizes] = useState({}); // 모든 카드의 이미지 크기를 저장할 객체
  const prevProblemsRef = useRef(currentProblems); // 추천문제 업데이트 감지용 useRef

  useFocusEffect(
    React.useCallback(() => {
      // 페이지가 포커스 될 때 실행할 코드
      setCurrentIndex(1);
      fetchUserRelatedData();
      scrollViewRef.current.scrollTo({ y: 0, animated: false }); // 화면 최상단으로 스크롤
    }, [])
  );

  // 배열 섞는 함수
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // 요소 위치 교환
    }
  }

  // Firestore에서 데이터를 가져오고 섞는 함수
  const fetchData = async (ref) => {
    const snapshot = await getDocs(ref);
    let items = [];
    snapshot.forEach((doc) => items.push(doc.id));
    return items;
  };

  // Firestore에서 특정 회차의 문제 정보와 답안 정보를 가져오는 함수
  const fetchRoundData = async (round, id) => {
    const problemRef = doc(firestore, `exam round/${round}/${round}`, id);
    const answerRef = doc(firestore, `answer round/${round}/${round}`, id);
    const problemDoc = await getDoc(problemRef);
    const answerDoc = await getDoc(answerRef);

    let problemData = problemDoc.exists() ? problemDoc.data().img : null;
    let answerData = answerDoc.exists() ? answerDoc.data().answer : null;

    return { id, img: problemData, answer: answerData };
  };

  const fetchUserRelatedData = async () => {
    setIsLoading(true);

    // 유저 오답, 킬러문제, 북마크 문제 가져오기 및 섞기
    const wrongProblemsRef = collection(
      firestore,
      `users/${userEmail}/wrongProblems`
    );
    const killerProblemsRef = collection(firestore, 'killer round');
    const bookMarksRef = collection(firestore, `users/${userEmail}/bookMark`);

    const [a1, a2, a3] = await Promise.all([
      fetchData(wrongProblemsRef),
      fetchData(killerProblemsRef),
      fetchData(bookMarksRef),
    ]);

    // 모든 문제를 하나의 배열에 저장
    let recommendDatas = [...a1, ...a2, ...a3];

    // 배열을 섞는다
    shuffleArray(recommendDatas);
    setRecommendProblems(recommendDatas);
  };

  useEffect(() => {
    if (userEmail === null) return;
    fetchUserRelatedData();
  }, [userEmail]);

  // 현재 인덱스가 변경되면 해당 인덱스부터 10개 문제를 보이게 한다.
  useEffect(() => {
    if (recommendProblems.length === 0) return;

    let ci = 0;
    if (currentIndex !== 0) ci = currentIndex - 1;

    // recommendProblems 사용하여 배열 업데이트 처리를 위한 함수
    const updateArrayFromRecommend = async (recommendArr, ci) => {
      // 시작 인덱스와 끝 인덱스를 계산하여 10개 문제를 선택
      const startIndex = ci * 10;
      const endIndex = startIndex + 10;
      const choiceTen = recommendArr.slice(
        startIndex,
        Math.min(endIndex, recommendArr.length)
      );

      // 선택된 10문제의 이미지와 답 정보를 가져온다.
      const fetchProblemsAndAnswers = async (array) => {
        return Promise.all(
          array.map(async (id) => {
            const round = parseInt(id.toString().substring(0, 2), 10);
            return fetchRoundData(round, id);
          })
        );
      };

      const recommendData = await fetchProblemsAndAnswers(choiceTen);
      return recommendData;
    };

    const fetchAndSetProblems = async () => {
      const updArr = await updateArrayFromRecommend(recommendProblems, ci);
      if (updArr[0] === null) return;
      setCurrentProblems(updArr); // 현재 문제 상태 업데이트
    };

    fetchAndSetProblems();
  }, [recommendProblems, currentIndex]);

  useEffect(() => {
    if (currentProblems.length !== 0) {
      // currentProblems가 이전 상태와 다른지 비교.
      // 다르면 추천문제가 업데이트 되었다는 것을 의미하므로 로딩을 종료한다.
      if (
        JSON.stringify(prevProblemsRef.current) !==
        JSON.stringify(currentProblems)
      ) {
        setIsLoading(false);
      }
      // 이전 상태를 업데이트
      prevProblemsRef.current = currentProblems;
    }
  }, [currentProblems]);

  // 이전 / 다음 문제 10개 보여주기
  function handlelMove(state) {
    setCurrentIndex(currentIndex + state);
    scrollViewRef.current.scrollTo({ y: 0, animated: false }); // 화면 최상단으로 스크롤
  }

  // 동적 이미지 처리 함수
  // 세로로 긴 이미지 처리에 필요하다.
  const handleImageLoad = (id, event) => {
    const { width, height } = event.nativeEvent.source;
    const screenWidth = Dimensions.get('window').width;
    const scaledHeight = (height / width) * screenWidth;
    setImageSizes((prevSizes) => ({
      ...prevSizes,
      [id]: { width: screenWidth, height: scaledHeight },
    }));
  };

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
            style={{
              width: '100%',
              height: imageSizes[item.id]?.height || 200,
            }} // 초기 높이는 200으로 설정, 이미지 로드 후 업데이트
            source={{ uri: item.img }}
            resizeMode="contain"
            onLoad={(event) => handleImageLoad(item.id, event)}
          />
        </ScrollView>

        <View style={styles.line}></View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      {isLoading ? (
        <Spinner
          visible={true}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
      ) : (
        <>
          <View style={styles.cardContainer}>
            {currentProblems.map((item) => renderItem(item))}
          </View>
          <View style={styles.moveButtonContainer}>
            {currentIndex === 1 ? (
              <View style={styles.disabledButton}>
                <Icon name="left" size={30} color="gray" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handlelMove(-1)}
                style={styles.moveButton}
              >
                <Icon name="left" size={30} color="white" />
              </TouchableOpacity>
            )}
            {currentProblems.length < 10 ? (
              <View style={styles.disabledButton}>
                <Icon name="right" size={30} color="gray" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handlelMove(1)}
                style={styles.moveButton}
              >
                <Icon name="right" size={30} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default RecommendationQuestion;
