import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  BackHandler,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

function DictionaryExplain({ route }) {
  const { eid, fromMap } = route.params;
  const [content, setContent] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // fetch('http://192.168.219.110:8080/character/' + eid) //home
      fetch('http://10.138.17.218:8080/character/' + eid) //home
        .then((response) => response.json())
        .then((data) => {
          setContent(data.article);
          navigation.setOptions({
            headerTitle: data.article.headword,
            headerShown: true,
          });
        })
        .catch((error) => console.error('Error:', error));
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() => {
              if (fromMap) {
                navigation.navigate('Dictionary');
                navigation.navigate('사건지도');
              } else {
                navigation.navigate('Dictionary');
              }
              // navigation.navigate('Dictionary', { fromMap: fromMap });
            }}
          >
            <MaterialIcons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
        ),
      });
      const backAction = () => {
        if (fromMap) {
          navigation.navigate('Dictionary');
          navigation.navigate('사건지도');
        } else {
          navigation.navigate('Dictionary');
        }
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }
  }, [isFocused, navigation]);

  // const markdownToHtml = (markdown) => {
  //   // 순수 HTML 테이블이 포함된 부분을 감지하여 변환하지 않도록
  //   return markdown
  //     .replace(/<table[\s\S]*?<\/table>/g, (match) => match)
  //     .replace(/(#+) (.*?)(\r\n|$)/g, (_, hashes, content) => {
  //       const level = hashes.length; // 제목의 레벨을 결정 (h1, h2, h3, ...)
  //       return `<h${level} style="width:90%; margin-bottom: 2em;">▣ ${content}</h${level}>`;
  //     })
  //     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  //     .replace(/\*(.*?)\*/g, '<em>$1</em>')
  //     .replace(/\[(.*?)\]\(.*?\)/g, '$1')
  //     .replace(/\n/g, '<br style="margin-bottom: 2em;">'); // 줄바꿈 변환 및 스타일 적용
  // };
  const markdownToHtml = (markdown) => {
    // 태그와 스타일 사이에 공백을 허용하는 정규식
    const tableRegex = /<table[\s\S]*?<\/table>/gi;

    // HTML 블록을 분리
    const htmlBlocks = [];
    const separatedMarkdown = markdown.replace(tableRegex, (match) => {
      htmlBlocks.push(match);
      return `<!--HTML_BLOCK_${htmlBlocks.length - 1}-->`;
    });

    // 나머지 마크다운을 변환
    const convertedMarkdown = separatedMarkdown
      .replace(/(#+) (.*?)(\r\n|$)/g, (_, hashes, content) => {
        const level = hashes.length; // 제목의 레벨을 결정 (h1, h2, h3, ...)
        return `<h${level} style="width:90%; margin-bottom: 2em;">▣ ${content}</h${level}>`;
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n/g, '<br style="margin-bottom: 2em;">'); // 줄바꿈 변환 및 스타일 적용

    // HTML 블록을 다시 삽입
    const finalHtml = convertedMarkdown.replace(
      /<!--HTML_BLOCK_(\d+)-->/g,
      (_, index) => htmlBlocks[parseInt(index)]
    );

    return finalHtml;
  };

  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        {content && (
          <View>
            <View style={styles.outline}>
              {content.headMedia.url ? (
                <Image
                  key={content.headMedia.definition}
                  source={{
                    uri: content.headMedia.url,
                  }}
                  style={{ height: 200, aspectRatio: 1 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{
                    height: 200,
                    aspectRatio: 1,
                    backgroundColor: '#e9e9e9',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text>이미지없음</Text>
                </View>
              )}
              {content.headMedia.caption && (
                <Text>△ {content.headMedia.caption}</Text>
              )}
            </View>
            {content.definition && <Text style={styles.BigText}>▣ 정의</Text>}
            <Text>{content.definition}</Text>
            {content.summary && <Text style={styles.BigText}>▣ 요약</Text>}

            <Text>{content && content.summary}</Text>

            {content && (
              <RenderHtml
                contentWidth={320}
                source={{ html: markdownToHtml(content.body) }}
              />
            )}
          </View>
        )}
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
    paddingTop: '4%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  BigText: {
    fontSize: 28, // 큰 글씨 크기
    fontWeight: 'bold', // 굵은 글씨
    paddingTop: '6%',
  },
});

export { DictionaryExplain };
