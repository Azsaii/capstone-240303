import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import RenderHtml from 'react-native-render-html';
const { width } = Dimensions.get('window'); // 전체 디바이스 화면의 너비를 가져옵니다

function DictionaryExplain({ route }) {
  const { eid } = route.params;
  const [word, setWord] = useState(null);
  const [body, setBody] = useState('');
  useEffect(() => {
    fetch('http://192.168.219.171:8080/character/' + eid) //home
      //fetch('http://192.168.219.129:8080/character/' + eid) //school
      //fetch('http://192.168.0.107:8080/character/' + eid) //school2
      //fetch('http://10.138.17.218:8080/character/' + eid) //another
      .then((response) => response.json())
      .then((data) => {
        setWord(data.article);

        const source = { html: data.article.body };
        setBody(source);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  // const mixedContent = `
  // # 개설\r\n

  // ## This is a paragraph with **bold** markdown and a <b>bold</b> HTML tag.

  // * Markdown list item
  // `;
  const markdownToHtml = (markdown) => {
    return markdown
      .replace(/(#+) (.*?)(\r\n|$)/g, (_, hashes, content) => {
        const level = hashes.length; // 제목의 레벨을 결정 (h1, h2, h3, ...)
        return `<h${level}>▣ ${content}</h${level}>`;
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n/g, '<br>'); // 줄바꿈 변환
  };
  //const source = { html: markdownToHtml(mixedContent) };

  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.outline}>
          <Text>{word && word.headword}</Text>
          <Text>{word && word.definition}</Text>
          {word && (
            <Image
              key={word.headMedia.definition}
              source={{
                uri: word.headMedia.url,
              }}
              style={{ height: 200, aspectRatio: 1 }}
              resizeMode="contain"
            />
          )}
          {word && <Text>△ {word.headMedia.caption}</Text>}
        </View>
        <Text style={styles.BigText}>▣ 요약</Text>
        <Text>{word && word.summary}</Text>

        {/* <RenderHtml contentWidth={320} source={source} /> */}
        {word && (
          <RenderHtml
            contentWidth={320}
            source={{ html: markdownToHtml(word.body) }}
          />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.BigText}>관련문제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    fontSize: 24,
  },
  outline: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'orange',
    borderRadius: 5,
  },
  BigText: {
    fontSize: 28, // 큰 글씨 크기
    fontWeight: 'bold', // 굵은 글씨
  },
});

export { DictionaryExplain };
