import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#bbd2ec',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

const PracticeRoundSelect = ({ navigation }) => {
  const [examRounds, setExamRounds] = useState([]);

  useEffect(() => {
    const fetchExamRounds = async () => {
      try {
        const list = [];
        const examRoundCollection = collection(firestore, 'exam round');
        const examRoundSnapshot = await getDocs(examRoundCollection);
        examRoundSnapshot.forEach((doc) => {
          list.push({ id: doc.id, ref: doc.ref });
        });
        setExamRounds(list);
      } catch (err) {
        console.error('Error fetching data: ', err);
      }
    };
    fetchExamRounds();
  }, []);

  const handleSelect = async (item) => {
    try {
      const answerRoundCollection = collection(firestore, 'answer round');
      const answerRoundSnapshot = await getDocs(answerRoundCollection);
      let answerItem;
      answerRoundSnapshot.forEach((doc) => {
        if (doc.id == item.id) answerItem = { id: doc.id, ref: doc.ref };
      });

      // 가져온 답안 데이터를 ProblemDetail 화면으로 전달
      navigation.navigate('ProblemDetail', {
        examDoc: item,
        answerDoc: answerItem,
      });
    } catch (err) {
      console.error('Error fetching data: ', err);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => handleSelect(item)}>
      <Card.Content>
        <Title>{item.id}회차</Title>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={examRounds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default PracticeRoundSelect;
