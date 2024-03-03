import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { database } from '../firebaseConfig';
import { ref, set, update } from 'firebase/database';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    marginBottom: 10,
  },
  contentInput: {
    height: 200,
    marginBottom: 10,
  },
});
// 게시판 글 생성 화면
const PostCreate = ({ route, navigation }) => {
  const { boardName, post, commentList } = route.params;
  const [title, setTitle] = useState(post ? post.title : '');
  const [body, setBody] = useState(post ? post.body : '');
  const [userName, setUserName] = useState();

  const userEmail = useSelector((state) => state.userEmail);

  useEffect(() => {
    setUserName(userEmail?.split('@')[0]);
  }, [userEmail]);

  // 작성한 글을 db에 반영
  const handleSubmit = () => {
    // post가 존재하면 수정 모드이므로 기존 경로 사용한다.
    const path = `${boardName}/${post ? post.id : `${userName}_${Date.now()}`}`;
    const postRef = ref(database, path);

    console.log('path: ' + path);

    // 새 글 데이터
    const newPost = {
      userEmail: userEmail,
      title: title,
      body: body,
    };
    if (!post) {
      // 작성 모드인 경우 새로 작성
      set(postRef, newPost)
        .then(() => {
          console.log('Data updated successfully.');
          // 게시판 화면으로 돌아간다.
          navigation.navigate('PostDetail', {
            post: newPost,
            boardName: boardName,
          });
        })
        .catch((error) => {
          console.error('Data could not be saved.' + error);
        });
    } else {
      // 수정 모드인 경우 업데이트
      update(postRef, newPost)
        .then(() => {
          console.log('Post data updated successfully.');

          // commentList가 있으면 각 comment를 업데이트
          if (commentList) {
            commentList.forEach((comment) => {
              const commentRef = ref(
                database,
                boardName + '/' + post.id + '/' + 'comments/' + comment.id
              );

              update(commentRef, comment)
                .then(() => console.log('Comment data updated successfully.'))
                .catch((error) =>
                  console.error('Comment data could not be updated.' + error)
                );
            });
          }
        })
        .then(() => {
          // 수정한 글 화면으로 돌아간다.
          if (post) {
            navigation.navigate('PostDetail', {
              post: newPost,
              boardName: boardName,
            });
          } else navigation.navigate('BoardScreen');
        })
        .catch((error) => {
          console.error('Post data could not be updated.' + error);
        });
    }
  };

  // 글 수정 모드일 때 post가 존재하고, 기존 글 내용을 표시한다.
  return (
    <View style={styles.container}>
      <TextInput
        label="제목"
        value={title}
        onChangeText={(text) => setTitle(text)} // 제목을 입력할 때마다 state 업데이트
        style={styles.input}
      />
      <TextInput
        label="내용"
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        value={body}
        onChangeText={(text) => setBody(text)} // 내용을 입력할 때마다 state 업데이트
        style={styles.contentInput}
      />
      <Button mode="contained" onPress={handleSubmit}>
        등록
      </Button>
    </View>
  );
};

export default PostCreate;
