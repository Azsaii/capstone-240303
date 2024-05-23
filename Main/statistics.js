import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Animated, TouchableOpacity, Alert } from 'react-native';
import { Button, Text } from 'react-native-elements';
import Svg, { Line, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const horizontalAxisLabels = [
  '전삼국', '삼국', '남북국', '후삼국', '고려', '조선', '개항기', '일제강점기', '해방이후',
];
const horizontalAxisLabels2 = [
  '문화', '유물', '사건', '인물', '장소', '그림', '제도', '기구', '조약', '단체',
];

//유형별 막대그래프
const BarChart = ({ data }) => {
  var barWidth = 40;
  const maxValue = Math.max(...data);
  const chartWidth = data.length * (barWidth + 10);
  const chartHeight = 200;
  const verticalAxisHeight = chartHeight - 20;

  // 가로축에 표시할 레이블 배열


  if (data.length == 9) {
    list = horizontalAxisLabels;
    color = '#CD7F32';
  } else {
    list = horizontalAxisLabels2;
    color = '#8A2BE2';
  }

  const animatedValues = data.map(() => new Animated.Value(0));

  useEffect(() => {
    // 모든 막대에 대해 애니메이션을 동시에 실행합니다.
    const animations = animatedValues.map((animValue, index) => {
      return Animated.timing(animValue, {
        toValue: (data[index] / maxValue) * verticalAxisHeight,
        duration: 1000,
        useNativeDriver: false,
      });
    });
    Animated.parallel(animations).start();
  }, [data, animatedValues, maxValue, verticalAxisHeight]);

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={{ marginTop: 20 }}>
      <View>
        <Svg height={chartHeight} width={chartWidth}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#3498db" stopOpacity="1" />
              <Stop offset="100%" stopColor="#8A2BE2" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* 가로축 */}
          <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e0e0e0" strokeWidth="2" />
          {/* 세로축 */}
          <Line x1={0} y1={0} x2={0} y2={verticalAxisHeight} stroke="#e0e0e0" strokeWidth="2" />
          {data.map((value, index) => (
            <React.Fragment key={index}>
              {/* 막대 그래프 */}
              <Rect
                x={index * (barWidth + 10) + 5}
                y={chartHeight - (value / maxValue) * verticalAxisHeight}
                width={barWidth}
                height={(value / maxValue) * verticalAxisHeight}
                fill={color}
                rx="4" // 모서리 둥글게 처리
              />
              {/* 레이블 및 값 */}
              <SvgText
                x={index * (barWidth + 10) + barWidth / 2 + 5}
                y={index % 2 === 1 ? chartHeight - 30 : chartHeight - 20}
                fontSize="14"
                fill="black"
                textAnchor="middle"
              >
                {list[index]}
              </SvgText>
              <SvgText
                x={index * (barWidth + 10) + barWidth / 2 + 5}
                y={chartHeight - 6}
                fontSize="12"
                fill="#ffffff"
                textAnchor="middle"
              >
                {value}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </ScrollView>
  );
};

//메인 랜더링
const Statistics = () => {

  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);
  const Totalscore = 436;
  const imageurl =
    'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%ED%86%B5%EA%B3%84%EB%B0%B0%EA%B2%BD%EA%B2%BD.jpg?alt=media&token=0bbb3935-6ca6-4eba-8093-65771dcbb7f0';
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      if (!isLoggedIn) {

        Alert.alert(
          '통계',
          '로그인 후 이용해주세요',
          [
            {
              text: '예',

              onPress: () => navigation.navigate('로그인'),
            }
          ],
        );
        return;
      } else {
      }
    }, [isLoggedIn, userEmail])
  );

  const [data1, setData1] = useState([]); // 시대별 풀이 데이터
  const [data2, setData2] = useState([]); // 유형별 풀이 데이터
  //지금까지 푼 문제 수
  const solve = data1.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  //틀린 문제 수
  const [wrongProblemsCount, setWrongProblemsCount] = useState(0);


  //최저 공부량 탐색변수
  const minera = Math.min(...data1);
  const mincategory = Math.min(...data2);
  const mineraindex = data1.indexOf(minera);
  const mincategoryindex = data2.indexOf(mincategory);
  const studyera = horizontalAxisLabels[mineraindex];
  const studycategory = horizontalAxisLabels2[mincategoryindex];

  //통계 랜더링마다 파이어베이스에서 통계값을 가져온다.
  useEffect(() => {
    const fetchData = async () => {
      const dataDocRef = doc(firestore, `users/${userEmail}/wrongStatistics/data`);

      try {
        const docSnap = await getDoc(dataDocRef);
        if (docSnap.exists()) {
          const eraData = docSnap.data().era;
          setData1(eraData);

          // type 배열에서 7번 인덱스(일제강점기 오류) 제외하고 data2 상태에 저장
          const typeData = docSnap.data().type;
          const filteredTypeData = typeData.filter((item, index) => index !== 7);
          setData2(filteredTypeData);
        } else {
          console.log('No such document!');
        }

        const wrongProblemsCollectionRef = collection(firestore, `users/${userEmail}/wrongProblems`);
        const querySnapshot = await getDocs(wrongProblemsCollectionRef);
        setWrongProblemsCount(querySnapshot.docs.length); // 문서 개수 업데이트

      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    if (userEmail) {
      fetchData();
    }
  }, [userEmail]);



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imagecontainer}>
        <Image source={{ uri: imageurl }} style={styles.image} />
      </View>

      <Text style={styles.title}>{userEmail}님의 학습 통계</Text>
      <View>
        <Text style={styles.title}>시대별 문제풀이 통계</Text>
        <BarChart data={data1} />
      </View>
      <View>
        <Text style={styles.title}>유형별 문제풀이 통계</Text>
        <BarChart data={data2} />
        <Text style={{ marginTop: 10 }}>
          <Text style={styles.boldText}>{studyera}</Text>
          시대와,
          <Text style={styles.boldText}> {studycategory}</Text>
          유형의 학습이 부족합니다
        </Text>


        <View style={styles.studybuttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('시대별 풀이')}
          >
            <Text style={styles.buttonText}>{`${studyera} 공부하러 가기`}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('유형별 풀이')}
          >
            <Text
              style={styles.buttonText}
            >{`${studycategory} 공부하러 가기`}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title2}>지금까지 푼 문제 중...</Text>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>
          {solve}문제를 풀었습니다
        </Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>{solve - wrongProblemsCount} 문제를 맞추고</Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>{wrongProblemsCount} 문제를 틀렸습니다</Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>
          정답률 {(((solve - wrongProblemsCount) / solve) * 100).toFixed(2)}%
        </Text>
        <Text style={styles.answerText}>총점 {Totalscore}점</Text>
      </View>
      <Button
        title="공부하러가기"
        onPress={() => navigation.navigate('기출문제')}
        buttonStyle={{ marginTop: 20, backgroundColor: '#008000' }} // Green color
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
  },
  studybuttonContainer: {
    flexDirection: 'row', // 버튼을 가로로 배치
    justifyContent: 'space-evenly', // 버튼 사이에 공간을 동등하게 배분
    marginTop: 10, // 상단 여백
  },
  button: {
    backgroundColor: '#008000', // 녹색 배경
    padding: 10, // 내부 여백
    borderRadius: 5, // 버튼의 모서리를 둥글게
  },
  buttonText: {
    color: '#FFFFFF', // 흰색 글씨
    fontSize: 16, // 글씨 크기
    fontWeight: 'bold', // 글씨 두께
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  imagecontainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width, // 화면의 가로 길이에 맞추기
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    marginTop: 20,
    marginBottom: 30,
  },
  title2: {
    fontSize: 30,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  answerContainer: {
    flexDirection: 'row', // 수평으로 배치하기 위해 flexDirection 설정
    justifyContent: 'space-between', // 요소들 사이에 공간을 나누어 배치
    marginTop: 10,
  },
  answerText: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 10,
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 20, // 수평선 위아래 간격 조절
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -10 }],
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
});

export default Statistics;
