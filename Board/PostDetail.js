import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { TextInput, Card } from 'react-native-paper';
import { database } from '../firebaseConfig';
import { ref, set, remove, onValue, off } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 20,
    backgroundColor: '#bbd2ec',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  idRow: {
    flexDirection: 'row', // 가로 방향으로 배치
    justifyContent: 'space-between', // 양쪽 끝에 배치
    alignItems: 'center',
    padding: 5,
  },
  commentRow: {
    flexDirection: 'row', // 가로 방향으로 배치
    justifyContent: 'space-between', // 양쪽 끝에 배치
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row', // 가로 방향으로 배치
    justifyContent: 'flex-end', // 양쪽 끝에 배치
    alignItems: 'center', // 세로 방향으로 중앙 정렬
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 5,
  },
  button: {
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  contentText: {
    padding: 10,
    fontSize: 16,
    backgroundColor: '#dfe9f5',
    minHeight: 405,
    borderRadius: 20,
  },
  writeButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#E6E6FA',
    borderColor: '#4b3e9a',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 30,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 5,
    marginTop: 30,
  },
  commentDeleteButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#DF243B',
  },
  card: {
    margin: 5,
    minHeight: 50,
    fontSize: 20,
  },
  line: {
    borderBottomColor: '#7bb4e3',
    borderBottomWidth: 10,
    margin: 10,
    borderRadius: 5,
  },
});
// 게시판 글 클릭했을 때 내용 보이는 화면
const PostDetail = ({ route, navigation }) => {
  const { post, boardName } = route.params;
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [userName, setUserName] = useState();

  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);
  const isWeb = useSelector((state) => state.isWeb);
  const serverPath = 'http://localhost:8080/';

  // 뒤로가기 시 게시판으로 이동
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BoardScreen' }],
        });
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (userEmail) {
      setUserName(userEmail.split('@')[0]);
    }
  }, [userEmail]);

  // 댓글 가져오기
  const fetchComments = () => {
    axios
      .get(serverPath + 'comments', { params: { postId: post.id } })
      .then((response) => {
        const data = response.data;
        if (data) {
          const comments = Object.keys(data).map((key) => ({
            commentId: data[key].commentId,
            userEmail: data[key].userEmail,
            comment: data[key].comment,
          }));
          setCommentList(comments);
        }
      })
      .catch((error) => {
        console.error('Comments data could not be fetched.' + error);
      });
  };

  useEffect(() => {
    // 댓글 가져오기
    fetchComments();
  }, []);

  // 댓글 가져오기
  // const fetchComments1 = () => {
  //   const commentsRef = ref(database, boardName + '/' + post.id + '/comments');
  //   const listener = onValue(commentsRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const comments = Object.keys(data).map((key) => ({
  //         id: key,
  //         userEmail: data[key].userEmail,
  //         comment: data[key].comment,
  //         postId: post.id,
  //       }));
  //       setCommentList(comments);
  //     } else setCommentList([]); // 댓글이 없는 경우 빈칸으로 세팅
  //   });
  //   // 이벤트 리스너를 반환
  //   return { ref: commentsRef, listener };
  // };

  // useEffect(() => {
  //   // 댓글 가져오기
  //   const { ref: commentsRef, listener } = fetchComments();

  //   // 클린업 함수에서 이벤트 리스너를 제거
  //   return () => {
  //     off(commentsRef, listener);
  //   };
  // }, []);

  const scrollViewRef = useRef();

  const handleSubmit = () => {
    // 댓글 저장
    if (comment.trim() === '') {
      // 댓글 내용이 없으면 저장하지 않음
      return;
    }
    const commentId = userName + '_' + Date.now();

    // post와 post.id가 존재하는지 확인
    if (!post || !post.id) {
      console.error('Post or post.id is undefined.');
      return;
    }

    const newComment = {
      commentId: commentId,
      userEmail: userEmail,
      comment: comment,
      postId: post.id,
    };

    axios
      .post(serverPath + 'comments', newComment)
      .then((response) => {
        console.log('Comments data updated successfully.');
        fetchComments(); // 댓글 새로고침
        scrollViewRef.current.scrollToEnd({ animated: true }); // 화면 최하단으로 스크롤 이동
      })
      .catch((error) => {
        console.error('Comments data could not be saved.' + error);
      });

    setComment(''); // 인풋창 초기화
  };

  // '수정' 버튼 클릭 시 수정 페이지로 이동
  const handleUpdate = () => {
    navigation.navigate('PostCreate', {
      boardName: boardName,
      post: post, // 현재 글 정보를 PostCreate 로 보낸다. 페이지 재활용을 위함.
      commentList: commentList, // 현재 글 댓글 리스트
      navigation: navigation,
    });
  };

  // 데이터 삭제 요청
  const removeData = (url) => {
    axios
      .delete(serverPath + url)
      .then(() => {
        console.log('Data removed successfully.');
      })
      .catch((error) => {
        console.error('Data could not be removed.' + error);
      });
  };

  // 삭제 확인 창
  const removeProcess = (url) => {
    if (isWeb) {
      const userConfirmed = window.confirm(
        '삭제 확인',
        '정말로 삭제하시겠습니까?'
      );
      if (userConfirmed) {
        removeData(url);
      }
    } else {
      Alert.alert('삭제 확인', '정말로 삭제하시겠습니까?', [
        {
          text: '취소',
          onPress: () => console.log('삭제 취소'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            removeData(url);
          },
        },
      ]);
    }
  };

  // 글 삭제
  const handleDelete = () => {
    console.log('id = ' + post.postId);
    const url = 'posts/' + post.postId;
    removeProcess(url);
  };

  // 댓글 삭제
  const handleCommentDelete = (commentId) => {
    const url = 'comments/' + commentId;
    removeProcess(url);
    fetchComments(); // 삭제 후 댓글을 다시 불러옴
  };

  // 데이터 삭제 요청
  // const removeData = (dataRef) => {
  //   remove(dataRef)
  //     .then(() => {
  //       console.log('Data removed successfully.');
  //       navigation.goBack();
  //     })
  //     .catch((error) => {
  //       console.error('Data could not be removed.' + error);
  //     });
  // };
  // 삭제 확인 창
  // const removeProcess = (dataRef) => {
  //   if (isWeb) {
  //     const userConfirmed = window.confirm(
  //       '삭제 확인',
  //       '정말로 삭제하시겠습니까?'
  //     );
  //     if (userConfirmed) {
  //       removeData(dataRef);
  //     }
  //   } else {
  //     Alert.alert('삭제 확인', '정말로 삭제하시겠습니까?', [
  //       {
  //         text: '취소',
  //         onPress: () => console.log('삭제 취소'),
  //         style: 'cancel',
  //       },
  //       {
  //         text: '확인',
  //         onPress: () => {
  //           removeData(dataRef);
  //         },
  //       },
  //     ]);
  //   }
  // };

  // // 글 삭제
  // const handleDelete = () => {
  //   const path = `${boardName}/${post.id}`;
  //   const postRef = ref(database, path);
  //   removeProcess(postRef);
  // };

  // // 댓글 삭제
  // const handleCommentDelete = (id) => {
  //   const path = `${boardName}/${post.id}/comments/${id}`;
  //   const commentRef = ref(database, path);
  //   removeProcess(commentRef);
  //   fetchComments(); // 삭제 후 댓글을 다시 불러옴
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
        <View style={styles.content}>
          {isWeb && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-u-left-top" size={30} color="#000" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.idRow}>
            <Text style={{ fontSize: 15 }}>
              작성자: {post ? post.userEmail.split('_')[0] : ''}
            </Text>

            <View style={styles.buttonRow}>
              {userEmail === post.userEmail ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#004EA2' }]}
                    onPress={handleUpdate}
                  >
                    <Text style={styles.buttonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#DF243B' }]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.buttonText}>삭제</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>
          <Text style={styles.contentText}>{post.body}</Text>
        </View>

        {commentList.length > 0 && <View style={styles.line} />}

        {commentList.length > 0 &&
          commentList.map((item, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <View style={styles.commentRow}>
                  <View>
                    <Text style={{ fontSize: 12 }}>
                      {item.userEmail.split('@')[0]}
                    </Text>
                    <Text style={{ fontSize: 16 }}>{item.comment}</Text>
                  </View>
                  {userEmail === item.userEmail ? (
                    <TouchableOpacity
                      style={[styles.commentDeleteButton]}
                      onPress={() => handleCommentDelete(item.commentId)}
                    >
                      <Text style={styles.buttonText}>삭제</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </Card.Content>
            </Card>
          ))}

        {commentList.length > 0 && <View style={styles.line} />}

        <View style={styles.inputRow}>
          <TextInput // 댓글 입력창
            style={styles.commentInput}
            placeholder={
              isLoggedIn ? '댓글 작성하기' : '로그인하고 댓글을 작성해보세요!'
            }
            onChangeText={(text) => setComment(text)} // 입력값을 상태로 관리
            value={comment}
            editable={isLoggedIn}
          />
          <TouchableOpacity style={styles.writeButton} onPress={handleSubmit}>
            <Icon name="comment" size={24} color="#35439c" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostDetail;
