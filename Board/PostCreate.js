import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

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
    const postType = post ? 1 : 0; // 직성모드(0), 수정모드(1)
    const serverPath = 'http://localhost:8080/';

    // 새 글 데이터
    const newPost = {
      userEmail: userEmail,
      title: title,
      body: body,
      type: postType,
    };

    axios
      .post(serverPath + 'posts', newPost)
      .then((response) => {
        console.log('Post data updated successfully.');

        if (post && commentList) {
          axios
            .post(serverPath + 'commentList', commentList)
            .then((response) => {
              console.log('Comments data updated successfully.');
            })
            .catch((error) => {
              console.error('Comments data could not be saved.' + error);
            });
        }
        // 이전 화면으로 돌아간다.
        if (post) {
          navigation.navigate('PostDetail', {
            post: newPost,
            boardName: boardName,
          });
        } else navigation.navigate('BoardScreen');
      })
      .catch((error) => {
        console.error('Post data could not be saved.' + error);
      });
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
