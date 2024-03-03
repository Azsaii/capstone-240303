import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const styles = StyleSheet.create({
  box: {
    borderRadius: 10, // 모서리를 둥글게 만듭니다.
    padding: 10, // 내부의 여백을 설정합니다.
    marginBottom: 10, // 박스 사이의 간격을 설정합니다.
  },
  correctBox: {
    backgroundColor: '#e0f7fa', // 박스의 배경색을 설정합니다.
  },
  incorrectBox: {
    backgroundColor: '#ffebee', // 박스의 배경색을 설정합니다.
  },
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  semiTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 350,
    marginBottom: 30,
  },
});

const ProblemCommentary = ({ route }) => {
  const { problem, answer } = route.params;
  const splitText = (text) => {
    // 정규표현식을 사용하여 '①', '②', '③', '④', '⑤'로 시작하는 문장을 찾습니다.
    const regex = /(①|②|③|④|⑤)[^①-⑤]*/g;
    const sentences = text.match(regex);

    return sentences.map((sentence, index) => (
      <View key={index} style={styles.paragraph}>
        <Text style={styles.content}>{sentence.trim()}</Text>
      </View>
    ));
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>해설</Text>
      <ScrollView>
        <Image
          style={styles.image}
          source={{ uri: problem.data.img }}
          resizeMode="contain"
        />

        <View style={[styles.box, styles.correctBox]}>
          <Text style={styles.semiTitle}>정답: {answer.data.answer}</Text>
          <Text style={styles.semiTitle}>정답 해설</Text>
          <Text style={styles.content}>{answer.data.commentary}</Text>
        </View>

        <View style={[styles.box, styles.incorrectBox]}>
          <Text style={styles.semiTitle}>오답 해설</Text>
          {splitText(answer.data.wrongCommentary)}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProblemCommentary;
