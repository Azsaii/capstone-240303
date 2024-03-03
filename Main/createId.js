import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import { useSelector, useDispatch } from 'react-redux';
const CreateId = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  // 오류 메시지를 저장할 상태 변수들
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const isWeb = useSelector((state) => state.isWeb);
  const handleSignUp = async () => {
    // 초기화
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setNicknameError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('이메일을 입력하세요.');
      return;
    } else if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력하세요.');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!nickname) {
      setNicknameError('닉네임을 입력하세요.');
      return;
    }
    // 계정 정보 저장
    try {
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          const userRef = doc(firestore, 'users', email);
          setDoc(userRef, {
            name: nickname,
            email: email,
          });
        })
        .then(() => {
          alert('회원가입이 완료되었습니다.');
          navigation.navigate('로그인');
        });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setEmailError('이미 사용 중인 이메일 주소입니다.');
      } else {
        alert('회원가입 실패. 다시 시도하세요.');
        console.error(error.message);
      }
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EB%B0%B0%EA%B2%BD.webp?alt=media&token=cabac6ad-77a8-4c88-9366-a33cd01c5bf6',
      }} // 배경 이미지 파일 경로를 설정하세요
      style={styles.background}
    >
      <View style={isWeb ? styles.WebContainer : styles.container}>
        <Text style={styles.title}>회원가입</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
          }}
        />
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmPasswordError('');
          }}
        />
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="닉네임"
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            setNicknameError('');
          }}
        />
        {nicknameError ? (
          <Text style={styles.errorText}>{nicknameError}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 배경의 투명도 조절 가능
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 5,
    borderColor: 'gray', // 모바일이 아닐 때는 테두리 색을 회색으로 설정합니다.
    backgroundColor: '#ffffff', // 입력 필드의 기본 배경색
  },
  button: {
    width: 80,
    height: 40,
    backgroundColor: '#21825B',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },

  WebContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%', // 컨테이너의 너비를 화면 전체로 설정합니다.
    maxWidth: 500, // 웹 버전에서 최대 너비 설정
    margin: 'auto', // 화면 중앙 정렬
  },
});

export default CreateId;
