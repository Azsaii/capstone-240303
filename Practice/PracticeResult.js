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
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { set } from '@firebase/database';

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

  const [originWrongEras, setOriginWrongEras] = useState(new Array(9).fill(-1)); // 기존 오답들 시대 데이터
  const [originWrongTypes, setOriginWrongTypes] = useState(
    new Array(11).fill(-1)
  ); // 기존 오답들 유형 데이터

  const [newWrongEras, setNewWrongEras] = useState(new Array(9).fill(0)); // 새 오답 시대 데이터
  const [newWrongTypes, setNewWrongTypes] = useState(new Array(11).fill(0)); // 새 유형 시대 데이터

  const [saveWrongEras, setSaveWrongEras] = useState(new Array(9).fill(-1)); // 저장용 시대 데이터
  const [saveWrongTypes, setSaveWrongTypes] = useState(new Array(11).fill(-1)); // 저장용 시대 데이터

  const [wrongIndexes, setWrongIndexes] = useState(new Array(50).fill(1)); // 오답 인덱스
  const [totalScore, setTotalScrore] = useState(100);

  //let newWrongTypes = initialState.wrongTypes;

  // 로그인 정보
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);

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

  // type 이름에 따라 인덱스를 반환하는 함수
  function getTypeIndex(typeName) {
    const types = [
      '문화',
      '유물',
      '사건',
      '인물',
      '장소',
      '그림',
      '제도',
      '일제강점기',
      '조약',
      '단체',
      '미분류',
    ];
    return types.indexOf(typeName);
  }

  // 새 오답 분류 정보 저장
  useEffect(() => {
    if (!isLoggedIn) return;
    const updatedWrongEras = [...newWrongEras];
    const updatedWrongTypes = [...newWrongTypes];
    let saveWrongIndexes = new Array(50).fill(1);
    let score = 100;

    // 오답 인덱스 저장
    choicesArray.forEach(([index, value], i) => {
      const answer = answers.find((answer) => answer.id === index);
      const problem = problems.find((problem) => problem.id === index);

      if (answer && problem && value != answer.data.answer) {
        score -= problem.data.score;
        saveWrongIndexes[i] = 0;

        // 오답에 해당하는 era의 인덱스를 찾아 updatedWrongEras 배열의 해당 위치 값을 1 증가
        const eraIndex = getEraIndex(problem.data.era);
        if (eraIndex !== -1) {
          updatedWrongEras[eraIndex] += 1; // 해당 era 인덱스의 값을 1 증가
        }

        // 오답 문제 유형 저장
        const typeIndexArray = problem.data.type;
        for (let i = 0; i < typeIndexArray.length; i++) {
          const typeIndex = getTypeIndex(typeIndexArray[i]);
          if (typeIndex !== -1) {
            updatedWrongTypes[typeIndex] += 1; // 해당 type 인덱스의 값을 1 증가
          }
        }
      }
    });

    setNewWrongEras(updatedWrongEras);
    setNewWrongTypes(updatedWrongTypes);
    setWrongIndexes(saveWrongIndexes);
    setTotalScrore(score);
  }, [isLoggedIn]);

  // 기존 데이터 가져온 후 상태변수에 저장
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchData = async () => {
      const wrongRef = doc(
        firestore,
        'users',
        userEmail,
        'wrongStatistics',
        'data'
      );
      try {
        const docSnap = await getDoc(wrongRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          let check = 1;
          const keys = ['era', 'type'];

          keys.forEach((key) => {
            if (!data[key]) {
              // 기존 데이터가 없는 경우 체크
              check = 0;
            }
            let setStateFunction, newValues;
            if (key === 'era') {
              setStateFunction = setOriginWrongEras;
              newValues = new Array(9).fill(0);
            } else if (key === 'type') {
              setStateFunction = setOriginWrongTypes;
              newValues = new Array(11).fill(0);
            }
            if (setStateFunction && newValues) {
              updateStateFromSnapshot(data, key, setStateFunction, newValues);
            }
          });
          if (check === 0) {
            // 기존 데이터가 없는 경우 기존 데이터를 0으로만 구성된 배열로 초기화
            console.log(`Data initializing.`);
            setOriginWrongEras(new Array(9).fill(0));
            setOriginWrongTypes(new Array(11).fill(0));
          }
        } else {
          console.log('No such document!');
          fetchData();
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  // 상태변수에 기존 데이터 저장
  function updateStateFromSnapshot(data, key, setStateFunction, newValues) {
    if (data[key]) {
      const updatedValues = newValues.map(
        (value, index) => value + (data[key][index] || 0)
      );
      setStateFunction(updatedValues);
    }
  }

  // 기존 데이터에 새 데이터를 누적하여 상태변수에 저장
  useEffect(() => {
    if (originWrongEras[0] === -1) return;
    setSaveArray(newWrongEras, originWrongEras, setSaveWrongEras);
  }, [newWrongEras, originWrongEras]);

  useEffect(() => {
    if (originWrongTypes[0] === -1) return;
    setSaveArray(newWrongTypes, originWrongTypes, setSaveWrongTypes);
  }, [newWrongTypes, originWrongTypes]);

  function setSaveArray(newArray, originArray, setStateFunction) {
    const size = newArray.length;
    const arr = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      arr[i] = newArray[i] + originArray[i];
    }
    setStateFunction(arr);
  }

  // 누적한 데이터를 db에 저장
  useEffect(() => {
    if (!isLoggedIn) return;
    if (saveWrongEras[0] == -1) return; // 가장 처음 useEffect 실행 시 저장 방지

    const wrongRef = doc(
      firestore,
      'users',
      userEmail,
      'wrongStatistics',
      'data'
    );
    const wrongStatisticsSave = async () => {
      try {
        await updateDoc(wrongRef, {
          era: saveWrongEras,
          type: saveWrongTypes,
        });
        console.log('Data updated successfully.');
      } catch (error) {
        console.error('Data could not be saved.' + error);
      }
    };
    wrongStatisticsSave();
  }, [isLoggedIn, saveWrongEras, saveWrongTypes]);

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
