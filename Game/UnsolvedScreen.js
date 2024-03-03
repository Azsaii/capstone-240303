import React, { useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, BackHandler } from 'react-native';
import { Card } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 10,
    backgroundColor: '#bbd2ec',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 10,
  },
  era: {
    paddingBottom: 5,
  },
  eraText: {
    fontSize: 13,
  },
  explanation: {
    paddingBottom: 5,
  },
  keyword: {
    fontSize: 17,
  },
  title: {
    paddingTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#bbd2ec',
    textAlign: 'center',
  },
});

const UnsolvedScreen = ({ route, navigation }) => {
  const { unsolved } = route.params;

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

  const renderItem = ({ item }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.era}>
          <Text style={styles.eraText}>시대: {item.data.era}</Text>
        </View>
        <View style={styles.explanation}>
          <Text>{item.data.explanation}</Text>
        </View>
        <View>
          <Text style={styles.keyword}>답: {item.data.keyword}</Text>
        </View>
      </Card>
    );
  };

  return (
    <>
      <View>
        <Text style={styles.title}>넘긴 문제 정답</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={unsolved}
          renderItem={renderItem}
          keyExtractor={(item) => item.data.keyword}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </View>
    </>
  );
};

export default UnsolvedScreen;
