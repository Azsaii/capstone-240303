import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
  Linking,
} from 'react-native'; // StyleSheet import 추가
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { setLoggedIn, setUserEmail, setIsWeb } from '../state';

const currentDate = new Date();
const testDate = new Date('2024-05-25');
//const MainImage = 'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EC%9B%B9%EB%B0%B0%EA%B2%BD.png?alt=media&token=d57d8462-d4f1-43b6-a92e-968d30cb27f0'
const imageurl =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EB%B0%B0%EA%B2%BD.webp?alt=media&token=cabac6ad-77a8-4c88-9366-a33cd01c5bf6';

const timeDifference = testDate - currentDate;
const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

const LinkButtonPressed = () => {
  const examScheduleLink =
    'https://www.historyexam.go.kr/pageLink.do?link=examSchedule&netfunnel_key=E934081640D391F04FC56AC6C042B32037B017A93AECD22ED318655502C0D5E0FA9916BC7EEDE001B98B1F659245D8B5B481AF320FC49BDFDDA9E487CC5FA5E3C219884E7E69AE8FCA7EF380A6F8D3B91CF6BADBB12E604C00464C9F2FE9B694EE4301E896CCCBABBF1C7F32CA7A9D942C312C302C30';
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
              {isLoggedIn ? <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                {userEmail.split('@')[0] + ' 님, '}   
              </Text>
               : <></>}
                환영합니다.
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
