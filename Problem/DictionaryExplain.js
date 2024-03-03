import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

function DictionaryExplain({ route }) {
  const { word } = route.params;
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.outline}>
          <Text>
            {word.id} {word.birth}
          </Text>
          <Text>{word.outline}</Text>
          <Image
            key={word.img}
            source={{
              uri: word.img,
            }}
            style={{ height: 200, aspectRatio: 1 }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.BigText}>업적</Text>
        <Text>{word.achievements}</Text>
        <View style={styles.content}>
          {word.content &&
            Object.keys(word.content)
              .sort()
              .map((contentKey) => (
                <View key={contentKey}>
                  {word.content[contentKey].map((item, index) => (
                    <Text
                      key={index}
                      style={index === 0 ? styles.firstText : styles.normalText}
                    >
                      {item}
                    </Text>
                  ))}
                </View>
              ))}
        </View>
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
  content: {
    backgroundColor: 'lightgray',
  },
  firstText: {
    fontSize: 20,
  },
  normalText: {
    fontSize: 16,
  },
  BigText: {
    fontSize: 24,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'orange',
    borderRadius: 5,
  },
});

export { DictionaryExplain };
