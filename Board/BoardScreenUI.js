import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  BackHandler,
} from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';

const styles = StyleSheet.create({
  padding: {
    paddingTop: 30,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#bbd2ec',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  writeButton: {
    width: 100,
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  card: {
    margin: 5,
    height: 60,
    justifyContent: 'center',
  },
  cardEven: {
    backgroundColor: '#f8f8f8', // 짝수 인덱스 카드의 배경색
  },
  cardOdd: {
    backgroundColor: '#e8e8e8', // 홀수 인덱스 카드의 배경색
  },
  commentInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#dfe9f5',
    marginBottom: 10,
  },
});
// 게시판 UI: 글 리스트 표시, 글 작성 버튼
const BoardScreenUI = ({ navigation, boardName }) => {
  const [posts, setPosts] = useState([]); // 게시글 데이터
  const [search, setSearch] = useState(''); // 검색 텍스트
  const [filteredPosts, setFilteredPosts] = useState([]); // 검색으로 필터링 된 글
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [index, setIndex] = useState(0);

  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);
  //const serverPath = 'http://192.168.0.3:8080/'; // 안드로이드 환경에서는 localhost로 작성하면 에러 발생하므로 ip주소 입력 필요.
  //const serverPath = 'http://223.194.133.88:8080/';
  const serverPath = 'http://223.194.132.156:8080/';

  // 뒤로가기 시 게시판으로 이동
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

  // 글 검색
  useEffect(() => {
    setFilteredPosts(
      posts.filter((post) => {
        return post.title.includes(search);
      })
    );
  }, [search, posts]);

  // 10개씩 글 가져오기
  const fetchPosts = () => {
    setIsLoading(true);
    console.log('test');
    axios
      .get(serverPath + 'posts', { params: { boardName: boardName, index: index } })
      .then((response) => {
        const fetchedPosts = response.data;

        if (fetchedPosts) {
          const postList = Object.keys(fetchedPosts).map((key) => ({
            id: fetchedPosts[key].id,
            postId: fetchedPosts[key].postId,
            userEmail: fetchedPosts[key].userEmail,
            title: fetchedPosts[key].title,
            body: fetchedPosts[key].body,
          }));
          console.log('postList: ');
          console.log(postList);
          setPosts(prevPosts => [...prevPosts, ...postList]);
          setIndex(index + 10); // 10개씩 보임.
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error: ' + error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts(); // 글 가져오기
  }, [index]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = 10; // 총 페이지 수, 예시로 10을 사용
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(
        <TouchableOpacity key={i} onPress={() => setIndex(i)}>
          <Text style={{ margin: 10 }}>{i + 1}</Text>
        </TouchableOpacity>
      );
    }
    return pageNumbers;
  };

  // 글 가져오기
  // useEffect(() => {
  //   setIsLoading(true);
  //   const postsRef = ref(database, boardName);
  //   const listener = onValue(
  //     postsRef,
  //     (snapshot) => {
  //       const data = snapshot.val();
  //       if (data) {
  //         const postList = Object.keys(data).map((key) => ({
  //           id: key,
  //           userEmail: data[key].userEmail,
  //           title: data[key].title,
  //           body: data[key].body,
  //         }));
  //         setPosts(postList);
  //       }
  //       setIsLoading(false);
  //     },
  //     (error) => {
  //       console.error('Error: ' + error);
  //       setIsLoading(false);
  //     }
  //   );

  //   return () => {
  //     off(postsRef, listener);
  //   };
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <Spinner
          visible={true}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
      ) : (
        <>
          <View style={styles.content}>
            <TextInput
              style={styles.commentInput}
              placeholder="글 검색"
              onChangeText={(text) => setSearch(text)}
            />
            <FlatList
              data={filteredPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <Card
                  style={[
                    styles.card,
                    index % 2 === 0 ? styles.cardEven : styles.cardOdd, // 홀수와 짝수 인덱스에 따라 다른 배경색 적용
                  ]}
                  onPress={() =>
                    navigation.navigate('PostDetail', {
                      post: item,
                      boardName: boardName,
                    })
                  }
                >
                  <Card.Content>
                    <Text style={{ fontSize: 18 }}>
                      {item.title.length > 20
                        ? item.title.substring(0, 20) + '..'
                        : item.title}
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                      {item.userEmail.split('@')[0]}
                    </Text>
                  </Card.Content>
                </Card>
              )}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIndex(prev => Math.max(prev - 1, 0))}>
                <Text>이전</Text>
              </TouchableOpacity>
              {renderPageNumbers()}
              <TouchableOpacity onPress={() => setIndex(prev => Math.min(prev + 1, 9))}>
                <Text>다음</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Button
            style={styles.writeButton}
            icon="pencil"
            mode="contained"
            onPress={() => {
              isLoggedIn
                ? // 글 작성 페이지로 이동
                navigation.navigate('PostCreate', {
                  boardName: boardName,
                  navigation: navigation,
                })
                : navigation.navigate('Login');
            }}
          >
            작성
          </Button>
        </>
      )}
    </SafeAreaView>
  );
};
export default BoardScreenUI;
