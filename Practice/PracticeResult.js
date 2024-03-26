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

  const [originWrongEras, setOriginWrongEras] = useState(new Array(9).fill(0)); // 기존 오답들 시대 데이터
  const [originWrongTypes, setOriginWrongTypes] = useState(
    new Array(11).fill(0)
  ); // 기존 오답들 유형 데이터

  const [newWrongEras, setNewWrongEras] = useState(new Array(9).fill(0)); // 새 오답 시대 데이터
  const [newWrongTypes, setNewWrongTypes] = useState(new Array(11).fill(0)); // 새 유형 시대 데이터

  const [saveWrongEras, setSaveWrongEras] = useState(new Array(9).fill(0)); // 저장용 시대 데이터
  const [saveWrongTypes, setSaveWrongTypes] = useState(new Array(11).fill(0)); // 저장용 시대 데이터

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

  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     const statisticsCollectionRef = collection(
  //       firestore,
  //       'users',
  //       userEmail,
  //       'wrongStatistics'
  //     );
  //     try {
  //       const querySnapshot = await getDocs(statisticsCollectionRef);
  //       querySnapshot.forEach((docSnap) => {
  //         if (docSnap.exists()) {
  //           console.log(docSnap.id);
  //           const data = docSnap.data();
  //           console.log(data);
  //           // const key =
  //           //   'wrong' +
  //           //   docSnap.id.charAt(0).toUpperCase() +
  //           //   docSnap.id.slice(1);
  //           const key = docSnap.id;
  //           // key를 기반으로 적절한 상태 업데이트 함수와 새로운 값들을 설정합니다.
  //           let setStateFunction, newValues;
  //           if (key === 'era') {
  //             setStateFunction = setOriginWrongEras;
  //             newValues = new Array(9).fill(0);
  //           } else if (key === 'type') {
  //             setStateFunction = setOriginWrongTypes;
  //             newValues = new Array(11).fill(0);
  //           }

  //           // 상태 업데이트 함수와 새로운 값들이 정의된 경우에만 업데이트를 실행합니다.
  //           updateStateFromSnapshot(data, key, setStateFunction, newValues);
  //         } else {
  //           console.log(
  //             `No document found for ${docSnap.id}, creating a new one.`
  //           );
  //           // 새 문서 생성 로직을 여기에 추가할 수 있습니다.
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error fetching statistics data: ', error);
  //     }
  //   };

  //   fetchAllData();
  // }, []);

  // function updateStateFromSnapshot(data, key, setStateFunction, newValues) {
  //   if (data[key]) {
  //     console.log(`data.${key}: ` + data[key]);
  //     let ch = 0;
  //     for (let i = 0; i < data[key].length; i++) {
  //       if (data[key][i] !== 0) {
  //         ch = 1;
  //         break;
  //       }
  //     }
  //     if (ch == 1) {
  //       const updatedValues = newValues.map(
  //         (value, index) => value + (data[key][index] || 0)
  //       );
  //       setStateFunction(updatedValues);
  //     } else {
  //       console.log(`No data found for ${key}, initializing.`);
  //       setStateFunction([...newValues]); // 새 값으로 초기화
  //     }
  //   }
  // }

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      const wrongRef = doc(firestore, 'users', userEmail);

      try {
        const docSnap = await getDoc(wrongRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(data);

          // 각 key에 대해 상태 업데이트 함수와 새로운 값들을 설정하고 업데이트를 실행합니다.
          const keys = ['era', 'type']; // 필요에 따라 다른 key들을 추가할 수 있습니다.
          keys.forEach((key) => {
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

  function updateStateFromSnapshot(data, key, setStateFunction, newValues) {
    if (data[key]) {
      console.log(`data.${key}: ` + data[key]);
      let ch = 0;
      for (let i = 0; i < data[key].length; i++) {
        if (data[key][i] !== 0) {
          ch = 1;
          break;
        }
      }
      if (ch == 1) {
        const updatedValues = newValues.map(
          (value, index) => value + (data[key][index] || 0)
        );
        setStateFunction(updatedValues);
      } else {
        console.log(`No data found for ${key}, initializing.`);
        setStateFunction([...newValues]); // 새 값으로 초기화
      }
    }
  }

  useEffect(() => {
    console.log('originWrongEras: ' + originWrongEras);
    console.log('newWrongEras: ' + newWrongEras);
    let check = 0;
    const arr = new Array(9).fill(0);
    for (let i = 0; i < newWrongEras.length; i++) {
      arr[i] = newWrongEras[i] + originWrongEras[i];
      if (newWrongEras[i] !== 0 || originWrongEras[i] !== 0) {
        check = 1;
      }
    }
    if (check === 1) setSaveWrongEras(arr);
  }, [newWrongEras, originWrongEras]);

  useEffect(() => {
    console.log('originWrongTypes: ' + originWrongTypes);
    console.log('newWrongTypes: ' + newWrongTypes);
    let check = 0;
    const arr = new Array(11).fill(0);
    for (let i = 0; i < newWrongTypes.length; i++) {
      arr[i] = newWrongTypes[i] + originWrongTypes[i];
      if (newWrongTypes[i] !== 0 || originWrongTypes[i] !== 0) {
        check = 1;
      }
    }
    if (check === 1) setSaveWrongTypes(arr);
  }, [newWrongTypes, originWrongTypes]);

  // db 반영
  useEffect(() => {
    if (!isLoggedIn) return;
    // save path
    const wrongRef = doc(firestore, 'users', userEmail);
    const wrongEraRef = doc(
      firestore,
      'users',
      userEmail,
      'wrongStatistics',
      'era'
    );
    const wrongTypeRef = doc(
      firestore,
      'users',
      userEmail,
      'wrongStatistics',
      'type'
    );
    const wrongStatisticsSave = async () => {
      try {
        console.log('saveWrongEras: ' + saveWrongEras);
        console.log('saveWrongTypes: ' + saveWrongTypes);
        await updateDoc(wrongRef, {
          era: saveWrongEras,
          type: saveWrongTypes,
          name: 'test',
        });
        // await setDoc(wrongEraRef, {
        //   era: saveWrongEras,
        // });
        // await setDoc(wrongTypeRef, {
        //   type: saveWrongTypes,
        // });
        console.log('Data updated successfully.');
      } catch (error) {
        console.error('Data could not be saved.' + error);
      }
    };
    wrongStatisticsSave();
  }, [isLoggedIn, saveWrongEras, saveWrongTypes]);

  // 새 오답 분류 데이터 생성 후 상태변수에 반영
  // useEffect(() => {
  //   const updatedWrongEras = [...newWrongEras];
  //   const updatedWrongTypes = [...newWrongTypes];

  //   const eraUpdate = async () => {
  //     console.log('updatedWrongEras: ' + updatedWrongEras);
  //     const wrongEraRef = doc(
  //       firestore,
  //       'users',
  //       userEmail,
  //       'wrongStatistics',
  //       'era'
  //     );
  //     const wrongEraDoc = await getDoc(wrongEraRef);

  //     if (wrongEraDoc.exists()) {
  //       const data = wrongEraDoc.data();
  //       if (data.wrongEra) {
  //         console.log('data.wrongEra: ' + data.wrongEra);
  //         for (let i = 0; i < updatedWrongEras.length; i++) {
  //           updatedWrongEras[i] += data.wrongEra[i];
  //         }
  //         setSaveWrongEras(updatedWrongEras);
  //       } else {
  //         console.log('test1');
  //         eraUpdate();
  //       }
  //     }
  //   };

  //   const typeUpdate = async () => {
  //     console.log('updatedWrongTypes: ' + updatedWrongTypes);

  //     const wrongTypeRef = doc(
  //       firestore,
  //       'users',
  //       userEmail,
  //       'wrongStatistics',
  //       'type'
  //     );

  //     const wrongTypeDoc = await getDoc(wrongTypeRef);

  //     if (wrongTypeDoc.exists()) {
  //       const data = wrongTypeDoc.data();
  //       if (data.wrongType) {
  //         console.log('data.wrongType: ' + data.wrongType);
  //         for (let i = 0; i < updatedWrongTypes.length; i++) {
  //           updatedWrongTypes[i] += data.wrongType[i];
  //         }
  //         setSaveWrongTypes(updatedWrongTypes);
  //       } else {
  //         console.log('test2');
  //         typeUpdate();
  //       }
  //     }
  //   };

  //   eraUpdate();
  //   typeUpdate();
  // }, [newWrongEras, newWrongTypes]);

  // function reducer(state, action) {
  //   switch (action.type) {
  //     case 'setNewWrongTypes':
  //       return { ...state, wrongTypes: action.payload, saveNeeded: true };
  //     case 'saveDone':
  //       return { ...state, saveNeeded: false };
  //     default:
  //       throw new Error();
  //   }
  // }

  // const [state, dispatch] = useReducer(reducer, initialState); // 분류값 저장 리듀서

  // // wrongTypes 변경 후에 wrongTypesSave 호출
  // useEffect(() => {
  //   if (state.saveNeeded) {
  //     wrongTypesSave();
  //     dispatch({ type: 'saveDone' });
  //   }
  // }, [state]);

  // 오답 분류값 가져오기 - 오답 분류값은 통계에서 사용됨
  // useEffect(() => {
  //   if (!isLoggedIn) return;
  //   const userRef = doc(firestore, 'users', userEmail, 'koreanHistory', examId);
  //   const getTypesData = onSnapshot(userRef, (snapshot) => {
  //     const data = snapshot.data();
  //     if (data && data.wrongTypes) {
  //       setPrevWrongTypes(data.wrongTypes);
  //     }
  //   });

  //   return () => {
  //     getTypesData();
  //   };
  // }, [isLoggedIn]);

  // useEffect(() => {
  //   if (state.saveNeeded) return; // 무한루프 방지
  //   initialState.wrongTypes = prevWrongTypes;

  //   choicesArray.forEach(([index, value], i) => {
  //     const answer = answers.find((answer) => answer.id === index);
  //     const problem = problems.find((problem) => problem.id === index);

  //     if (answer && problem && value != answer.data.answer) {
  //       // era에 따른 오답 분류 인덱스 증가
  //       const eraIndex = getEraIndex(problem.data.era);
  //       if (eraIndex != -1) newWrongTypes[eraIndex]++;
  //     }
  //   });
  //   // newWrongTypes와 wrongTypes가 다르면 상태 업데이트
  //   if (
  //     JSON.stringify(newWrongTypes) !== JSON.stringify(initialState.wrongTypes)
  //   ) {
  //     // wrongTypes 변경
  //     dispatch({ type: 'setNewWrongTypes', payload: newWrongTypes });
  //   }
  // }, [prevWrongTypes]);

  // 오답 분류값 저장
  // const wrongTypesSave = async () => {
  //   if (!isLoggedIn) return;
  //   const userRef = doc(firestore, 'users', userEmail, 'koreanHistory', examId);

  //   try {
  //     await setDoc(userRef, {
  //       wrongTypes: state.wrongTypes,
  //     });
  //     setCheck = 0;
  //     console.log('Data updated successfully.');
  //   } catch (error) {
  //     console.error('Data could not be saved.' + error);
  //   }
  // };

  // 저장용 데이터 업데이트
  // useEffect(() => {
  //   let a1 = new Array(9).fill(0);
  //   let a2 = new Array(11).fill(0);

  //   console.log('newWrongEras: ' + newWrongEras);
  //   console.log('originWrongEras: ' + originWrongEras);
  //   console.log('newWrongTypes: ' + newWrongTypes);
  //   console.log('originWrongTypes: ' + originWrongTypes);

  //   for (let i = 0; i < newWrongEras.length; i++) {
  //     a1[i] = newWrongEras[i] + originWrongEras[i];
  //   }

  //   for (let i = 0; i < newWrongTypes.length; i++) {
  //     a2[i] = newWrongTypes[i] + originWrongTypes[i];
  //   }

  //   console.log('a1: ' + a1);
  //   console.log('a2: ' + a2);

  //   setSaveWrongEras(a1);
  //   setSaveWrongTypes(a2);
  // }, [newWrongEras, newWrongTypes, originWrongEras, originWrongTypes]);

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
