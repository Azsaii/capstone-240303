import React, { useState, useEffect, useReducer } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#bbd2ec',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 7,
  },
  number: {
    width: '20%',
  },
  userChoice: {
    width: '30%',
  },
  correctChoice: {
    color: 'blue',
  },
  incorrectChoice: {
    color: 'red',
  },
  answer: {
    width: '30%',
    color: 'blue',
  },
  explanationButton: {
    width: 60,
    height: 30,
    backgroundColor: '#838abd',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  score: {
    marginTop: 20,
    fontSize: 20,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  line: {
    borderBottomColor: '#838abd',
    borderBottomWidth: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  showButton: {
    width: 110,
    height: 25,
    margin: 5,
    backgroundColor: '#838abd',
    borderRadius: 5,
    justifyContent: 'center',
  },
  showButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

const PracticeResult = ({ route, navigation }) => {
  const { userChoices, problems, answers, examId } = route.params; // 선택 답안
  const choicesArray = Object.entries(userChoices);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false); // 오답만 보기 여부
  const [prevWrongTypes, setPrevWrongTypes] = useState([]);
  const initialState = { wrongTypes: Array(9).fill(0), saveNeeded: false };

  // 틀린 문제의 인덱스를 0으로 설정
  let wrongIndexes = new Array(choicesArray.length).fill(1);
  let newWrongTypes = initialState.wrongTypes;

  // 로그인 정보
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);

  let totalScore = 100;

  // 뒤로가기 시 메인화면으로 이동
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Sidebar' }],
        });
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  function reducer(state, action) {
    switch (action.type) {
      case 'setWrongTypes':
        return { ...state, wrongTypes: action.payload, saveNeeded: true };
      case 'saveDone':
        return { ...state, saveNeeded: false };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState); // 분류값 저장 리듀서

  // wrongTypes 변경 후에 wrongTypesSave 호출
  useEffect(() => {
    if (state.saveNeeded) {
      wrongTypesSave();
      dispatch({ type: 'saveDone' });
    }
  }, [state]);

  // 오답 분류값 가져오기 - 오답 분류값은 통계에서 사용됨
  useEffect(() => {
    if (!isLoggedIn) return;
    const userRef = doc(firestore, 'users', userEmail, 'koreanHistory', examId);
    const getTypesData = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      if (data && data.wrongTypes) {
        setPrevWrongTypes(data.wrongTypes);
      }
    });

    return () => {
      getTypesData();
    };
  }, [isLoggedIn]);

  // 오답 인덱스 저장
  choicesArray.forEach(([index, value], i) => {
    const answer = answers.find((answer) => answer.id === index);
    const problem = problems.find((problem) => problem.id === index);

    if (answer && problem && value != answer.data.answer) {
      totalScore -= problem.data.score;
      wrongIndexes[i] = 0;
    }
  });

  useEffect(() => {
    if (state.saveNeeded) return; // 무한루프 방지
    initialState.wrongTypes = prevWrongTypes;

    choicesArray.forEach(([index, value], i) => {
      const answer = answers.find((answer) => answer.id === index);
      const problem = problems.find((problem) => problem.id === index);

      if (answer && problem && value != answer.data.answer) {
        // era에 따른 오답 분류 인덱스 증가
        const eraIndex = getEraIndex(problem.data.era);
        if (eraIndex != -1) newWrongTypes[eraIndex]++;
      }
    });
    // newWrongTypes와 wrongTypes가 다르면 상태 업데이트
    if (
      JSON.stringify(newWrongTypes) !== JSON.stringify(initialState.wrongTypes)
    ) {
      // wrongTypes 변경
      dispatch({ type: 'setWrongTypes', payload: newWrongTypes });
    }
  }, [prevWrongTypes]);

  // era 이름에 따라 인덱스를 반환하는 함수
  function getEraIndex(eraName) {
    const eras = [
      '전삼국',
      '삼국',
      '남북국',
      '후삼국',
      '고려',
      '조선',
      '개항기',
      '일제강점기',
      '해방이후',
    ];
    return eras.indexOf(eraName);
  }

  // 오답 분류값 저장
  const wrongTypesSave = async () => {
    if (!isLoggedIn) return;
    const userRef = doc(firestore, 'users', userEmail, 'koreanHistory', examId);

    try {
      await setDoc(userRef, {
        wrongTypes: state.wrongTypes,
      });
      setCheck = 0;
      console.log('Data updated successfully.');
    } catch (error) {
      console.error('Data could not be saved.' + error);
    }
  };

  // 해설 버튼 클릭 시 이동
  const handleCommentary = (index) => {
    const answer = answers.find((answer) => answer.id === index);
    const problem = problems.find((problem) => problem.id === index);
    navigation.navigate('ProblemCommentary', {
      problem: problem,
      answer: answer,
    });
  };

  // 오답만 보기 여부
  const filteredData = showOnlyWrong
    ? choicesArray.filter((_, index) => wrongIndexes[index] === 0)
    : choicesArray;

  const renderItem = ({ item }) => {
    const [index, value] = item;
    const answer = answers.find((answer) => answer.id === index);

    // 틀린 문제만 보이는 경우
    if (showOnlyWrong && wrongIndexes[index] === 0) {
      return null;
    }

    return (
      <Card style={styles.card}>
        <View style={styles.listItem}>
          <View style={{ flexDirection: 'row', flex: 0.9 }}>
            <Text style={styles.number}>{`${parseInt(
              index.slice(-2)
            )}번`}</Text>
            <Text
              style={[
                styles.userChoice,
                wrongIndexes[parseInt(index.slice(-2)) - 1]
                  ? styles.correctChoice
                  : styles.incorrectChoice,
              ]}
            >
              {`선택: ${value}`}
            </Text>
            <Text style={styles.answer}>{`정답: ${
              answer ? answer.data.answer : '정답 정보 없음'
            }`}</Text>
          </View>
          <TouchableOpacity
            style={styles.explanationButton}
            onPress={() => handleCommentary(index)}
          >
            <Text style={styles.explanationButtonText}>해설</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>총점: {totalScore}</Text>
      <View style={styles.line} />

      <View style={{ alignItems: 'flex-end' }}>
        <TouchableOpacity
          style={styles.showButton}
          onPress={() => setShowOnlyWrong(!showOnlyWrong)}
        >
          <Text style={styles.showButtonText}>
            {showOnlyWrong ? '전부 표시' : '틀린 문제만 표시'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item[0]}
      />
    </View>
  );
};

export default PracticeResult;
