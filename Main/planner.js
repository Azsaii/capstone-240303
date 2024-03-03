import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
} from 'victory-native';
import Svg, { Line, Text as SvgText, Rect, Circle } from 'react-native-svg';

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

export default function Planner() {
  const data = [
    //막대그래프 데이터
    { category: '시대별', progress: 70 },
    { category: '유형별', progress: 80 },
    { category: '기출', progress: 60 },
  ];

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

  const data1 = [20, 40, 60, 30, 10, 25, 11, 52, 23]; // 막대 그래프에 표시할 데이터
  const data2 = [11, 23, 33, 12, 32, 42, 23, 11, 6, 12];

  const minera = Math.min(...data1);
  const mincategory = Math.min(...data2);

  const mineraindex = data1.indexOf(minera);
  const mincategoryindex = data2.indexOf(mincategory);

  const studyera = horizontalAxisLabels[mineraindex];
  const studycategory = horizontalAxisLabels2[mincategoryindex];

  // 가장 작은 progress를 가진 요소의 category를 찾아서 min 변수에 저장
  const min = data.reduce((prev, current) =>
    prev.progress < current.progress ? prev : current
  ).category;
  const minIndex = data.findIndex(
    (d) => d.progress === Math.min(...data.map((d) => d.progress))
  );
  return (
    <ScrollView>
      <View style={styles.titlecontainer}>
        <Text style={styles.title}>사용자의 학습을 분석하여</Text>
        <Text style={styles.title}>학습 방안을 제안합니다.</Text>

        <View style={styles.graphContainer}>
          <Text style={styles.subtitle}>학습 진행도</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 20 }}
            height={200}
            width={370}
          >
            <VictoryAxis
              dependentAxis
              tickValues={[0, 25, 50, 75, 100]} // You can adjust these values based on your needs
              tickFormat={(tick) => `${tick}%`}
            />
            <VictoryAxis
              tickFormat={(tick) => tick} // You can customize the tick formatting as needed
            />
            <VictoryBar
              horizontal
              data={data}
              x="category"
              y="progress"
              style={{
                data: {
                  fill: 'gray',
                },
              }}
              domain={{ y: [0, 100] }}
            />
          </VictoryChart>
        </View>
        <Text style={styles.normaltext}>
          <Text style={styles.boldText}>{min}</Text> 부분이 다른 학습에 비해
          부족합니다.
        </Text>
        <Text style={styles.normaltext}> 이를 중점으로 공부하세요</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // 여기에 버튼을 눌렀을 때 실행할 동작을 추가하세요
            console.log(`"${min}" 공부하러 가기 버튼이 눌렸습니다.`);
          }}
        >
          <Text style={styles.buttonText}>{`${min} 공부하러 가기`}</Text>
        </TouchableOpacity>
        <View style={styles.graphContainer}>
          <Text style={styles.subtitle}>시대별 문제풀이 개수 통계</Text>
          <BarChart data={data1} />
        </View>
        <View style={styles.graphContainer}>
          <Text style={styles.subtitle}>유형별 문제풀이 개수 통계</Text>
          <BarChart data={data2} />
        </View>
      </View>
      <View>
        <Text>
          <Text style={styles.boldText}>{studyera}</Text>
          시대와,
          <Text style={styles.boldText}> {studycategory}</Text>
          유형의 학습이 부족합니다
        </Text>

        {/* 공부하러 가기 버튼들을 가로로 배치 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log(`"${studyera}" 공부하러 가기 버튼이 눌렸습니다.`); //화면 띄우기 추가
            }}
          >
            <Text style={styles.buttonText}>{`${studyera} 공부하러 가기`}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log(
                `"${studycategory}" 공부하러 가기 버튼이 눌렸습니다.`
              ); //화면띄우기 추가
            }}
          >
            <Text
              style={styles.buttonText}
            >{`${studycategory} 공부하러 가기`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titlecontainer: {
    marginLeft: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  graphContainer: {
    marginTop: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  normaltext: {
    // normaltext에 적용할 스타일 속성들을 정의
    fontSize: 16,
    color: 'black', // 원하는 색상으로 변경
    // 필요에 따라 다른 스타일 속성들을 추가할 수 있습니다.
  },
  buttonContainer: {
    flexDirection: 'row', // 가로 방향으로 배치
    justifyContent: 'space-between', // 각 버튼을 공간을 균등하게 배치
    marginTop: 10,
  },
  button: {
    backgroundColor: '#008000',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    width: 180, // 버튼의 width를 200으로 설정
    marginBottom: 50,
  },
  buttonText: {
    fontSize: 18,
    color: 'white', // 원하는 글자색으로 변경
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});
