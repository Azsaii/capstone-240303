import React from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { Text as RNText } from 'react-native-elements';
import Svg, { Line, Text as SvgText, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

//회차별 점수 그래프
class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 40 },
        { x: 2, y: 25 },
        { x: 3, y: 60 },
        { x: 4, y: 30 },
      ],
      maxY: 110, // 최대 Y 값
      svgHeight: 200,
      svgWidth: 350,
      margin: 20, // 그래프와 축 사이의 간격
    };
  }

  addDataPoint = () => {
    // 현재 데이터를 복제하여 새로운 데이터 포인트를 추가
    const newData = [...this.state.data, { x: this.state.data.length, y: 40 }];

    this.setState({ data: newData });
  };

  render() {
    // 데이터 포인트을 선으로 변환 및 데이터 레이블 추가
    const lines = this.state.data.map((point, index) => (
      <React.Fragment key={index}>
        <Line
          x1={(this.state.svgWidth / (this.state.data.length - 1)) * index}
          y1={
            this.state.svgHeight -
            (point.y / this.state.maxY) * this.state.svgHeight
          }
          x2={
            (this.state.svgWidth / (this.state.data.length - 1)) * (index + 1)
          }
          y2={
            this.state.svgHeight -
            (this.state.data[index + 1]
              ? (this.state.data[index + 1].y / this.state.maxY) *
                this.state.svgHeight
              : 0)
          }
          stroke="blue"
          strokeWidth="2"
        />

        <SvgText
          x={(this.state.svgWidth / (this.state.data.length - 1)) * index - 30}
          y={
            this.state.svgHeight -
            (point.y / this.state.maxY) * this.state.svgHeight
          }
          fontSize="12"
          fill="black"
        >
          {`${point.y}점`} {/* 숫자를 문자열로 변환 */}
        </SvgText>

        <Rect
          x={(this.state.svgWidth / (this.state.data.length - 1)) * index - 3} // x 좌표 조정
          y={
            this.state.svgHeight -
            (point.y / this.state.maxY) * this.state.svgHeight -
            4
          } // y 좌표 조정
          width="8" // 네모의 가로 길이
          height="8" // 네모의 세로 길이
          fill="black" // 채우기 색상
        />
      </React.Fragment>
    ));

    // 가로축을 그림
    const horizontalAxis = (
      <Line
        x1={0}
        y1={this.state.svgHeight}
        x2={this.state.svgWidth}
        y2={this.state.svgHeight}
        stroke="black"
        strokeWidth="1"
      />
    );

    // 세로축 레이블 및 눈금을 추가
    const verticalAxis = (
      <View>
        <Line
          x1={0}
          y1={0}
          x2={0}
          y2={this.state.svgHeight}
          stroke="black"
          strokeWidth="1"
        />
        {[50, 100].map((value, i) => {
          const yPos =
            this.state.svgHeight -
            (this.state.svgHeight / this.state.maxY) * value;
          return (
            <React.Fragment key={i}>
              <Line
                x1={0}
                y1={yPos}
                x2={this.state.svgWidth}
                y2={yPos}
                stroke="black"
                strokeWidth="1"
                strokeDasharray="4 4" // 점선 설정
              />
              <SvgText
                x={20}
                y={yPos - 5}
                fontSize="12"
                fill="black"
                textAnchor="end"
              >
                {`${value}`}
              </SvgText>
            </React.Fragment>
          );
        })}
      </View>
    );

    return (
      <View style={[styles.container, { marginTop: this.state.margin }]}>
        <RNText h4>점수 성장 그래프</RNText>
        <Text style={styles.subtitle}>
          회차별 점수를 시간 순으로 보여줍니다.
        </Text>
        <Svg
          height={this.state.svgHeight + this.state.margin}
          width={this.state.svgWidth - 10}
        >
          {lines}
          {horizontalAxis}
          {verticalAxis}
        </Svg>
        <Button title="Add Data Point" onPress={this.addDataPoint} />
      </View>
    );
  }
}

//유형별 막대그래프
const BarChart = ({ data }) => {
  var barWidth = 30;
  const maxValue = Math.max(...data);
  const chartWidth = data.length * (barWidth + 10);
  const chartHeight = 200;
  const verticalAxisHeight = chartHeight - 20;

  // 가로축에 표시할 레이블 배열
  const horizontalAxisLabels = [
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
  const horizontalAxisLabels2 = [
    '문화',
    '유물',
    '사건',
    '인물',
    '장소',
    '그림',
    '제도',
    '기구',
    '조약',
    '단체',
  ];
  if (data.length == 9) {
    list = horizontalAxisLabels;
    barWidth = 30;
    color = '#3498db';
  } else {
    list = horizontalAxisLabels2;
    barWidth = 28;
    color = '#8A2BE2';
  }

  return (
    <View>
      <Svg height={chartHeight} width={chartWidth}>
        {/* 가로축 */}
        <Line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="black"
          strokeWidth="3"
        />

        {/* 세로축 */}
        <Line
          x1={0}
          y1={0}
          x2={0}
          y2={verticalAxisHeight}
          stroke="black"
          strokeWidth="3"
        />

        {data.map((value, index) => (
          <React.Fragment key={index}>
            {/* 막대 그래프 */}
            <Rect
              x={index * (barWidth + 10)}
              y={chartHeight - (value / maxValue) * verticalAxisHeight}
              width={barWidth}
              height={(value / maxValue) * verticalAxisHeight}
              fill={color}
            />

            {/* 가로축 눈금 */}
            <SvgText
              x={index * (barWidth + 10) + barWidth / 2}
              y={chartHeight - 15}
              fontSize="12"
              fill="black"
              textAnchor="middle"
            >
              {list[index]}
            </SvgText>
            <SvgText
              x={index * (barWidth + 10) + barWidth / 2}
              y={chartHeight - 5}
              fontSize="12"
              fill="black"
              textAnchor="middle"
            >
              {data[index]}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

//메인 랜더링
const Statistics = () => {
  const name = 'woo';
  const TrueCheck = 100;
  const FalseCheck = 5;
  const truePercentage = (TrueCheck / (TrueCheck + FalseCheck)) * 100;
  const roundedPercentage = parseFloat(truePercentage.toFixed(2));
  const Totalscore = 436;
  const imageurl =
    'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%ED%86%B5%EA%B3%84%EB%B0%B0%EA%B2%BD%EA%B2%BD.jpg?alt=media&token=0bbb3935-6ca6-4eba-8093-65771dcbb7f0';
  const time = 302;
  const data1 = [20, 40, 60, 30, 10, 25, 11, 52, 23]; // 막대 그래프에 표시할 데이터
  const data2 = [11, 23, 33, 12, 32, 42, 23, 11, 6, 12];
  const handleButtonPress = () => {
    // 버튼이 눌렸을 때 실행되는 로직 추가
    console.log('버튼이 눌렸습니다!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imagecontainer}>
        <Image source={{ uri: imageurl }} style={styles.image} />
      </View>

      <Text style={styles.title}>{name}님의 학습 통계</Text>
      <Text style={styles.subtitle}>사용자의 학습 통계를 보여줍니다.</Text>

      <LineChart />
      <Text style={styles.title}>지금까지 푼 문제 중...</Text>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>
          지금까지 {TrueCheck + FalseCheck}문제를 풀었어요!!
        </Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>{TrueCheck} 문제를 맞추고</Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>{FalseCheck} 문제를 틀렸습니다</Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>정답률 {roundedPercentage}%</Text>
        <Text style={styles.answerText}>총점 {Totalscore}점</Text>
      </View>
      <View style={styles.answerContainer}>
        <Text style={styles.answerText}>시험에 사용한 총 시간 : {time}분</Text>
      </View>
      <View>
        <Text style={styles.title}>시대별 문제풀이 통계</Text>
        <BarChart data={data1} />
      </View>
      <View>
        <Text style={styles.title}>유형별 문제풀이 통계</Text>
        <BarChart data={data2} />
      </View>

      <Button
        title="공부하러가기"
        onPress={() => {
          //학습창으로 이동하는 기능 넣어야함.
        }}
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
  imagecontainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width, // 화면의 가로 길이에 맞추기
    height: 160,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    marginTop: 20,
    marginBottom: 10,
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
