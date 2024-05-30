import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    marginBottom: 10,
  },
  contentInput: {
    height: 300,
    marginBottom: 10,
  },
  editor: {
    flex: 1,
    minHeight: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
// 게시판 글 생성 화면
const PostCreate = ({ route, navigation }) => {
  const { boardName, post } = route.params;
  const [title, setTitle] = useState(post ? post.title : '');
  const [body, setBody] = useState(post ? post.body : '');
  const [userName, setUserName] = useState();
  const richText = React.useRef();
  const handleHead = ({ tintColor }) => (
    <Text style={{ color: tintColor }}>H1</Text>
  );

  const userEmail = useSelector((state) => state.userEmail);
  const serverPath = 'http://192.168.0.5:8080/';
  //const serverPath = 'http://223.194.133.88:8080/';
  //const serverPath = 'http://223.194.132.156:8080/';

  useEffect(() => {
    setUserName(userEmail?.split('@')[0]);
  }, [userEmail]);

  // 작성한 글을 db에 반영
  const handleSubmit = async () => {

    if (title.length > 100) {
      Alert.alert(
        '경고',
        '제목은 최대 100자 입니다.',
        [
          { text: '확인', onPress: () => console.log('OK Pressed') }, // 확인 버튼
        ]
      );
      return;
    }

    if (body.length > 5000) {
      Alert.alert(
        '경고',
        '본문은 최대 5000자 입니다.',
        [
          { text: '확인', onPress: () => console.log('OK Pressed') }, // 확인 버튼
        ]
      );
      return;
    }

    const id = post ? post.id : null;
    const postId = post ? post.postId : userEmail + '_' + Date.now();

    // 새 글 데이터
    const newPost = {
      id: id,
      postId: postId,
      boardName: boardName,
      userEmail: userEmail,
      title: title,
      body: body,
    };

    axios
      .post(serverPath + 'posts', newPost)
      .then((response) => {
        console.log('Post data updated successfully.');

        // 이전 화면으로 돌아간다.
        if (post) {
          navigation.navigate('PostDetail', {
            post: newPost,
            boardName: boardName,
          });
        } else {
          navigation.replace('BoardScreen');
        }
      })
      .catch((error) => {
        console.error('Post data could not be saved.' + error);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="제목"
        value={title}
        onChangeText={(text) => setTitle(text)} // 제목을 입력할 때마다 state 업데이트
        style={styles.input}
      />
      {/* <TextInput
        label="내용을 입력하세요..."
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        value={body}
        onChangeText={(text) => setBody(text)} // 내용을 입력할 때마다 state 업데이트
        style={styles.contentInput}
      /> */}
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.heading1,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.undo,
          actions.redo,
        ]}
        iconMap={{ [actions.heading1]: handleHead }}
      />
      <RichEditor
        ref={richText}
        style={styles.editor}
        placeholder="내용을 입력하세요..."
        onChange={(text) => {
          setBody(text);
        }}
        initialContentHTML={body}
      />

      <Button mode="contained" onPress={handleSubmit}>
        등록
      </Button>
    </View>
  );
};

export default PostCreate;
