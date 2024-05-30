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
  const userName = useSelector((state) => state.userName);
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

  //틀린 문제 수
  const [wrongProblemsCount, setWrongProblemsCount] = useState(0);

  const maxera = Math.max(...data1);
  const maxcategory = Math.max(...data2);
  const maxeraindex = data1.indexOf(maxera);
  const maxcategoryindex = data2.indexOf(maxcategory);

  const studyera = horizontalAxisLabels[maxeraindex];
  const studycategory = horizontalAxisLabels2[maxcategoryindex];

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

      {wrongProblemsCount == 0 && (
        <>
        <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.title}>{userName}님의 오답 통계</Text>
        </View>
        <View style={{ marginTop: 10, flex: 1, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>오답 데이터가 없습니다.</Text>
          <Button
          title="기출문제 공부하러가기"
          onPress={() => navigation.navigate('기출문제')}
          buttonStyle={{ marginTop: 20, backgroundColor: '#008000' }} // Green color
        />
        </View>
        </>
      )}
      
      {wrongProblemsCount != 0 && (
        <>
        <Text style={styles.title}>{userName}님의 오답 통계</Text>
        <Text style={styles.title2}>지금까지 푼 문제 중...</Text>
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{wrongProblemsCount} 문제를 틀렸습니다</Text>
        </View>
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
        <View>
          <Text style={styles.title}>시대별 오답 통계</Text>
          <BarChart data={data1} />
        </View>
        <View>
          <Text style={styles.title}>유형별 오답 통계</Text>
          <BarChart data={data2} />
        </View>
        <Button
          title="기출문제 공부하러가기"
          onPress={() => navigation.navigate('기출문제')}
          buttonStyle={{ marginTop: 20, backgroundColor: '#008000' }} // Green color
        />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
  },
  studybuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    width: width,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center', // 텍스트를 수평 가운데 맞춤
},
  title2: {
    fontSize: 30,
    marginTop: 10,
  },
  answerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  answerText: {
    fontSize: 16,
    fontWeight: 'bold',

  },
});

export default Statistics;
