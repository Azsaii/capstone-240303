import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
  Linking,
  LogBox,
} from 'react-native'; // StyleSheet import 추가
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { setLoggedIn, setUserEmail, setIsWeb } from '../state';
import { ScrollRestoration } from 'react-router-dom';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Achievement = 52;
const currentDate = new Date();
const testDate = new Date('2024-05-25');
//const MainImage = 'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9B%B9%EB%B0%B0%EA%B2%BD.png?alt=media&token=d57d8462-d4f1-43b6-a92e-968d30cb27f0'
const imageurl =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EB%B0%B0%EA%B2%BD.webp?alt=media&token=cabac6ad-77a8-4c88-9366-a33cd01c5bf6';
const imageurl2 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9B%B9%EB%B0%B0%EA%B2%BD.jpg?alt=media&token=ecd1f36d-ecc3-4a81-a159-1e2f002a8a87';
const imageurl3 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%ED%95%9C%EC%84%B1%EB%8C%80%ED%95%99%EA%B5%90.jpg?alt=media&token=dc8b154b-e4ac-49fe-9031-317465a962d7';
const imageurl4 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9B%B9%ED%99%88%EB%9D%BC%EB%B2%A8.jpg?alt=media&token=63425a12-b57b-4035-aa33-f5b11a2f5067';
const imageurl5 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%8B%9C%ED%97%98%EC%9D%BC%EC%A0%95.png?alt=media&token=9b215c0e-97bf-4a40-b822-b8adec900752';
//5번 시험일정
const imageurl6 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%8B%9C%ED%97%98%EC%9E%A5%EC%9C%84%EC%B9%98.png?alt=media&token=6442cd8e-b2cf-4d1e-961e-1ac1a95a953b';
const imageurl7 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%9B%90%EC%84%9C%EC%A0%91%EC%88%98.png?alt=media&token=88b005ae-c46a-4f40-9cea-388df96cedfa';
const imageurl8 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EA%B5%AD%EC%82%AC%ED%8E%B8%EC%B0%AC%EC%9C%84%EC%9B%90%ED%9A%8C.jpg?alt=media&token=2389d417-430d-4466-baae-345b0c19f807';
const imageurl9 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4.jpg?alt=media&token=168b5172-1e7b-4e6f-8b4c-57b5a10f4b65';
const imageicon1 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%95%84%EC%9D%B4%EC%BD%98%EA%B8%B0%EC%B6%9C.png?alt=media&token=935af2c3-4f95-4a02-93bb-5db425f1de67';
const imageicon2 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%95%84%EC%9D%B4%EC%BD%98%EC%8B%9C%EB%8C%80%EB%B3%84.png?alt=media&token=abb013f1-aa34-4f10-9b6c-28829def5540';
const imageicon3 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%95%84%EC%9D%B4%EC%BD%98%EC%9C%A0%ED%98%95%EB%B3%84.png?alt=media&token=b8624708-862d-455a-9c9e-970cd6337495';
const imageicon4 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%95%84%EC%9D%B4%EC%BD%98%EC%98%A4%EB%8B%B5%EB%85%B8%ED%8A%B8.png?alt=media&token=d4ef9ade-3d62-42ae-a5b4-bd6525dc4d5d';
const imageicon5 =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9D%B4%EB%AF%B8%EC%A7%80%2F%EC%95%84%EC%9D%B4%EC%BD%98%EC%97%AD%EC%82%AC%EC%9D%B4%EC%95%BC%EA%B8%B0.png?alt=media&token=1714beb0-a163-4e87-a0b4-60af19970931';

const timeDifference = testDate - currentDate;
const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

const LinkButtonPressed = () => {
  const examScheduleLink =
    'https://www.historyexam.go.kr/pageLink.do?link=examSchedule&netfunnel_key=E934081640D391F04FC56AC6C042B32037B017A93AECD22ED318655502C0D5E0FA9916BC7EEDE001B98B1F659245D8B5B481AF320FC49BDFDDA9E487CC5FA5E3C219884E7E69AE8FCA7EF380A6F8D3B91CF6BADBB12E604C00464C9F2FE9B694EE4301E896CCCBABBF1C7F32CA7A9D942C312C302C30';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};
const Link1 = () => {
  const examScheduleLink =
    'https://www.historyexam.go.kr/pst/list.do?bbs=noti&netfunnel_key=4F315CE4A29D6F3D49839EB5A3B9191FEF8546B25998EC2052C61D241427C4958E6DAB7217606E99262E063BD05AB8EC4C171BB07FC8A9F5810EFA3989156F09C219884E7E69AE8FCA7EF380A6F8D3B91CF6BADBB12E604C00464C9F2FE9B694D33D11D672413A9D3AD634B434176C80312C302C30';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};
const Link2 = () => {
  const examScheduleLink =
    'https://www.historyexam.go.kr/pageLink.do?link=examArea&netfunnel_key=27C91A4C564EFF0A164E9F5918532E493CFC14C442784B17E2AF5E4D3ABDC10F470E0011C8D26FFF07E72FDA269343FD4CB6B0FEFE8B68023EF4207F3FCC565D2822BAFEB69BBD22D19BB2DEA4ABC17B5040FF6CCA34DB8A028CF47044B6F18A234B1EEDF2C1E725FD8CB4420BEBC394352C312C302C30';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};
const Link3 = () => {
  const examScheduleLink = 'https://www.history.go.kr/';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};
const Link4 = () => {
  const examScheduleLink = 'https://db.history.go.kr/';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};
const Link5 = () => {
  const examScheduleLink = 'https://www.historyexam.go.kr/user/userLgin.do';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};

const HomeScreen = ({ navigation }) => {
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);
  const isWeb = useSelector((state) => state.isWeb);
  const dispatch = useDispatch();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <MaterialIcons name="home" size={30} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleRefresh = () => {
    window.location.reload(); // 화면 새로고침
  };

  const handleLogout = () => {
    dispatch(setUserEmail(null));
    dispatch(setLoggedIn(false));
    if (isWeb) {
      localStorage.removeItem('email');
    }
    handleRefresh();
  };

  return (
    <>
      {!isWeb && (
        <View style={[styles.container]}>
          <View style={styles.imagecontainer}>
            <Image source={{ uri: imageurl }} style={styles.image} />
          </View>
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>한국사 능력 검정 시험</Text>
            <Text style={{ fontSize: 15 }}>
              환영합니다.{' '}
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                {userEmail}
              </Text>
              님.
            </Text>
            <StatusBar style="auto" />
          </View>
          <View style={styles.horizontalLine}>
            <Text style={styles.gogo}>바로가기</Text>
          </View>
          <View style={styles.buttonttopContainer}>
            <TouchableOpacity
              style={styles.buttontop}
              onPress={() => navigation.navigate('기출문제')}
            >
              <Text style={styles.buttontopText}>기출문제 풀이</Text>
              <MaterialIcons
                name="format-list-numbered"
                size={30}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttontop}
              onPress={() => navigation.navigate('시대별 풀이')}
            >
              <Text style={styles.buttontopText}>시대별 풀이</Text>
              <MaterialIcons
                name="access-time-filled"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttontop}
              onPress={() => navigation.navigate('유형별 풀이')}
            >
              <Text style={styles.buttontopText}>유형별 풀이</Text>
              <MaterialIcons name="account-balance" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.boardContainer}>
            <TouchableOpacity
              style={styles.buttonboard}
              onPress={() => navigation.navigate('게시판')}
            >
              <Text style={styles.buttonboardText}>게시판 바로가기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalLine2}></View>

          <View style={styles.skyBlueBoxContainer}>
            <View style={styles.skyBlueBox}>
              <Text style={styles.dateText}>
                시험까지 {dayDifference}일 남았습니다.
              </Text>
              <Text style={styles.boxText}>
                시험일 : {testDate.getFullYear()}-{testDate.getMonth() + 1}-
                {testDate.getDate()}
              </Text>
              <TouchableOpacity
                style={styles.buttonLink}
                onPress={LinkButtonPressed}
              >
                <Text style={styles.buttonDateText}>시험 일정 확인하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    widht: '100%',
    height: '100%',
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  imagecontainer: {
    width: '100%',
    height: '30%',
    position: 'absolute',
    flex: 1,
  },
  titlecontainer: {
    width: '100%',
    height: '35%',
    padding: 15,
  },
  boardContainer: {
    width: '100%',
    height: '13%',
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center', // 가로 중앙 정렬
  },
  skyBlueBoxContainer: {
    widtt: '100%',
    height: '24%',
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center', // 가로 중앙 정렬
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right', // 오른쪽 맞춤
  },
  horizontalLine: {
    width: '100%',
    height: '5%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 10, // 수평선 위아래 간격 조절
  },
  horizontalLine2: {
    width: '100%',
    height: '1%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  gogo: {
    fontSize: 13,
    textAlign: 'center', // 가운데 정렬
    marginBottom: 10, // 원하는 간격으로 조절
  },
  buttonttopContainer: {
    width: '100%',
    height: '20%',
    flexDirection: 'row', // 수평으로 배치
    justifyContent: 'space-between', // 간격을 일정하게 분배
    alignItems: 'center', // 가운데 정렬
    justifyContent: 'center', // 가운데 정렬
  },
  buttontop: {
    width: '30%',
    height: '100%',
    backgroundColor: 'orange',
    borderRadius: 5,
    marginRight: 5,
    marginLeft: 5,
    alignItems: 'center', // 가운데 정렬
    justifyContent: 'center', // 가운데 정렬
  },
  buttonLink: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    width: 300,
    height: 40,
    marginLeft: 22,
    marginTop: 10,
    alignItems: 'center', // 가운데 정렬
    justifyContent: 'center', // 가운데 정렬
  },
  buttontopText: {
    color: 'white',
    fontSize: 15,
    marginBottom: 20,
  },
  skyBlueBox: {
    backgroundColor: 'skyblue',
    width: 350,
    height: 140,
    borderRadius: 10, // 테두리를 둥글게 하는 속성 추가
  },
  boxText: {
    color: 'black',
    fontSize: 15,
    marginBottom: 10,
    marginTop: 6,
    marginLeft: 20,
  },
  dateText: {
    color: 'black',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 10,
    fontWeight: 'bold',
  },
  buttonDateText: {
    color: 'black',
    fontSize: 15,
  },
  buttonboard: {
    width: '95%',
    height: '57%',
    backgroundColor: 'gray', // 버튼 배경색
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center', // 가로 중앙 정렬
    borderRadius: 10, // 버튼 테두리 둥글게
  },
  buttonboardText: {
    color: 'white', // 버튼 텍스트 색상
    fontSize: 20, // 버튼 텍스트 크기
    fontWeight: 'bold', // 버튼 텍스트 굵기
  },

  //웹 전용 스타일
  webTotalContainer: {
    backgroundColor: 'white', // 배경색을 흰색으로 설정
    height: '100%',
  },
  webinnerView: {
    flexDirection: 'row', // 가로로 배치
    justifyContent: 'flex-end', // 오른쪽 정렬
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: 'white', // 배경색을 흰색으로 설정
    height: '4%',
    // 원하는 스타일을 지정하세요
  },
  webinnerView2: {
    flexDirection: 'row', // 가로로 배치
  },
  webloginText: {
    fontSize: 17, // 로그인 텍스트의 폰트 크기
    color: 'gray', // 로그인 텍스트의 글자 색
    marginRight: 10, // 오른쪽 간격
    // 로그인 텍스트의 스타일을 지정하세요
  },
  websignupText: {
    fontSize: 17, // 회원가입 텍스트의 폰트 크기
    color: 'gray', // 회원가입 텍스트의 글자 색
    marginLeft: 10, // 왼쪽 간격
    marginRight: 155,
    // 회원가입 텍스트의 스타일을 지정하세요
  },
  webImagecontainer: {
    width: '90%', // 부모 요소의 100% 너비를 가짐
    height: '42%',
    alignItems: 'center', // 수평 가운데 정렬
    paddingLeft: '10%',
  },
  webImagecontainer2: {
    position: 'absolute',
    top: 2, // 부모 요소의 상단에 배치
    left: '10%',
    width: 185,
    height: 40,
    zIndex: 9999, // 다른 요소들 위로 오게 함
  },
  webimage: {
    width: '100%',
    height: '100%', // 부모 요소인 웹 이미지 컨테이너와 동일한 크기를 가짐
    alignItems: 'center', // 수평 가운데 정렬
    justifyContent: 'center', // 수직 가운데 정렬
  },
  webimage2: {
    width: '100%',
    height: '100%', // 부모 요소인 웹 이미지 컨테이너와 동일한 크기를 가짐
  },
  webimage3: {
    width: '100%',
    height: '100%',
    marginBottom: 10,
  },
  webIconcontainer: {
    flexDirection: 'row', // 요소를 가로로 정렬
    backgroundColor: 'white',
    width: '70%',
    height: '23%',
    alignItems: 'center', // 수평 가운데 정렬
    justifyContent: 'center', // 수직 가운데 정렬
    marginLeft: '15%',
  },
  webIconcontainer2: {
    flexDirection: 'row', // 요소를 가로로 정렬
    backgroundColor: 'white',
    width: '80%',
    height: '22%',
    justifyContent: 'center', // 수직 가운데 정렬
    marginLeft: '10%',
    marginTop: 20,
  },
  webimageIconcontainer: {
    width: '10%',
    height: '69%',
    alignItems: 'center', // 수평 가운데 정렬
    justifyContent: 'center', // 수직 가운데 정렬
    marginHorizontal: 20, // 요소들 사이의 가로 간격을 조절
  },
  webImage3Container: {
    width: '20%',
    height: '100%',
  },
  webImage4Container: {
    width: '15%',
    height: '100%',
    marginLeft: 5,
  },
  webImage5Container: {
    width: '10%',
    height: '80%',
    marginLeft: 20,
  },
  webImage6Container: {
    width: '15%',
    height: '33%',
    marginLeft: 50,
  },
  webBottomContainer: {
    borderTopWidth: 1,
    borderTopColor: 'black',
  },
  webBottomView: {
    width: '100%',
    /* 필요한 다른 스타일 속성들 */
  },
});

export default HomeScreen;
