import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import React, { useState, useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import AnswerModal from './AnswerModal';
import { firestore } from '../firebaseConfig';
import Spinner from 'react-native-loading-spinner-overlay';

export default function TypeProblem({ param, isLoggedIn, userEmail, route }) {
  const { statisticsType } = route.params || { statisticsType: '' };
  const [imageUrl, setImageUrl] = useState(null);
  const [problems, setProblems] = useState([]);
  const [displayProblem, setDisplayProblem] = useState(null);
  const [problemCount, setProblemCount] = useState(0);
  const [selectlistData, setSelectlistData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [bookMarkList, setBookMarkList] = useState([]);
  const [bookMarkStar, setBookMarkStar] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [isScrollButton, setIsScrollButton] = useState(false);
  const scrollViewRef = useRef(null);
  const [scrollIntervalId, setScrollIntervalId] = useState(null);
  const [placeholder, setPlaceholder] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const isFocused = useIsFocused();
  const openModal = () => {
    setModalOpen(true);
    getAnswer();
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  const changeData = async (temp) => {
    try {
      const parentCollectionId = 'exam round'; // 부모 컬렉션
      const subCollectionIds = ['61', '62', '63', '64', '65', '66', '67', '68']; // 자식 컬렉션

      //각 자식컬렉션에 대해 반복적으로 쿼리를 수행
      var newProblems = [];
      for (const subCollectionId of subCollectionIds) {
        //console.log('Selected Problem:', temp);
        const q = query(
          collection(
            firestore,
            parentCollectionId,
            subCollectionId,
            subCollectionId
          ),
          param === 'era'
            ? where('era', '==', temp)
            : where('type', 'array-contains', temp)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          newProblems = [...newProblems, doc];
          //console.log(doc.id, ' => ', doc.data());
        });
      }

      setImageUrl(newProblems[0].data().img);
      //console.log(newProblems[0].data().id);
      setProblems(newProblems);
      setDisplayProblem(newProblems[0].data().id);
      setProblemCount(1);
      if (isLoggedIn) getBookMark(newProblems[0].data().id);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAnswer = async () => {
    try {
      const docRef = doc(
        firestore,
        'answer round',
        String(Math.floor(parseInt(displayProblem) / 100)),
        String(Math.floor(parseInt(displayProblem) / 100)),
        displayProblem
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAnswer(docSnap.data());
        //console.log('Document data:', docSnap.data());
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addBookMark = async () => {
    await setDoc(
      doc(firestore, 'users', userEmail, 'bookMark', displayProblem),
      {}
    );
    setBookMarkList([...bookMarkList, displayProblem]);
  };
  const deleteBookMark = async () => {
    await deleteDoc(
      doc(firestore, 'users', userEmail, 'bookMark', displayProblem)
    );
    const newArray = bookMarkList.filter((item) => item !== displayProblem);
    setBookMarkList(newArray);
  };
  const getBookMark = async (firstProblem) => {
    try {
      var firstBookMark = [];
      const querySnapshot = await getDocs(
        collection(firestore, 'users', userEmail, 'bookMark')
      );
      querySnapshot.forEach((doc) => {
        firstBookMark.push(doc.id);
        //console.log(doc.id, ' => ', doc.data());
      });
      setBookMarkList(firstBookMark);
      if (firstBookMark.includes(firstProblem)) {
        //console.log('체크 true' + firstProblem);
        setBookMarkStar(true);
      } else {
        //console.log('체크 false' + firstProblem);
        setBookMarkStar(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const eraData = [
    { key: '전삼국', value: '전삼국' },
    { key: '삼국', value: '삼국' },
    { key: '후삼국', value: '후삼국' },
    { key: '고려', value: '고려' },
    { key: '조선', value: '조선' },
    { key: '개항기', value: '개항기' },
    { key: '일제강점기', value: '일제강점기' },
    { key: '해방이후', value: '해방이후' },
  ];

  const typeData = [
    { key: '사건', value: '사건' },
    { key: '유물', value: '유물' },
    { key: '인물', value: '인물' },
    { key: '문화', value: '문화' },
    { key: '장소', value: '장소' },
    { key: '그림', value: '그림' },
    { key: '제도', value: '제도' },
    { key: '조약', value: '조약' },
    { key: '기구', value: '기구' },
    { key: '단체', value: '단체' },
    { key: '미분류', value: '미분류' },
  ];
  const handlePrevious = () => {
    if (problemCount > 1) {
      const temp = problems[problemCount - 2].data();
      setDisplayProblem(temp.id);
      setImageUrl(temp.img);
      setProblemCount((prevCount) => prevCount - 1);
      if (bookMarkList.includes(temp.id)) {
        console.log('북마크 체크 true' + temp.id);
        setBookMarkStar(true);
      } else {
        console.log('북마크 체크 false' + temp.id);
        setBookMarkStar(false);
      }
    }
  };

  const handleNext = () => {
    if (problemCount < problems.length) {
      const temp = problems[problemCount].data();
      setDisplayProblem(temp.id);
      setImageUrl(temp.img);
      setProblemCount((prevCount) => prevCount + 1);
      if (bookMarkList.includes(temp.id)) {
        console.log('북마크 체크 true' + temp.id);
        setBookMarkStar(true);
      } else {
        console.log('북마크 체크 false' + temp.id);
        setBookMarkStar(false);
      }
    }
  };

  const handleBookMark = () => {
    if (!bookMarkStar) {
      setBookMarkStar(true);
      addBookMark();
    } else {
      setBookMarkStar(false);
      deleteBookMark();
    }
  };

  useEffect(() => {
    if (isLoggedIn && problems.length > 0)
      getBookMark(problems[problemCount - 1].data().id);
    // if (param === 'era') setSelectlistData(eraData);
    // else setSelectlistData(typeData);
    setSelectlistData(param === 'era' ? eraData : typeData);
    if (!statisticsType == '') {
      console.log('통계타입' + statisticsType);
      changeData(statisticsType);
      setSelectedKey(statisticsType);
      setPlaceholder(statisticsType);
    } else {
      const temp = param === 'era' ? '전삼국' : '사건';
      changeData(temp);
      setSelectedKey(temp);
      setPlaceholder(temp);
    }
  }, [isFocused]);

  //좌우 화면 슬라이드로 문제 넘기기
  const [panX] = useState(new Animated.Value(0));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: panX }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
      // 화면의 50% 이상을 슬라이드할 때마다 이전 또는 다음 문제 호출
      if (Math.abs(gestureState.dx) > 50) {
        if (gestureState.dx > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
      // 애니메이션 초기화
      Animated.timing(panX, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start(() => {
        // 애니메이션이 끝난 후 x 좌표를 0으로 초기화합니다.
        panX.setValue(0);
      });
    },
  });

  const animatedStyle = { transform: [{ translateX: panX }] };

  //이미지 크기에 따른 화면 조절
  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => {
          // 이미지의 원본 비율에 따라 상태 업데이트
          const aspectRatio = width / height;
          setImageAspectRatio(aspectRatio);
        },
        (error) => {
          console.error(`Couldn't get the image size: ${error.message}`);
        }
      );
    }
  }, [imageUrl]);

  //이미지 높이가 길어서 스크롤이 필요할 시 추가적으로 상하 이동 버튼을 생성
  const handleScrollButton = (contentWidth, contentHeight) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.measure((x, y, width, height, pageX, pageY) => {
        // 콘텐츠 높이가 스크롤뷰 높이보다 크면 스크롤이 필요
        if (contentHeight > height) {
          setIsScrollButton(true);
        } else {
          setIsScrollButton(false);
        }
      });
    }
  };

  const upScrolling = () => {
    const id = setInterval(() => {
      scrollViewRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const newScrollY = pageY - 150;
        scrollViewRef.current?.scrollTo({
          y: newScrollY,
          animated: true,
        });
      });
    }, 100);

    setScrollIntervalId(id);
  };

  const downScrolling = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const stopScrolling = () => {
    if (scrollIntervalId) {
      clearInterval(scrollIntervalId);
      setScrollIntervalId(null);
      console.log('stop');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} onContentSizeChange={handleScrollButton}>
        <View style={styles.problemInfo}>
          <SelectList
            setSelected={(val) => {
              const key = selectlistData.find(
                (item) => item.value === val
              )?.key;
              changeData(key);
              setSelectedKey(key);
            }}
            data={selectlistData}
            save="value"
            placeholder={placeholder}
            boxStyles={styles.boxStyles} // 스타일 적용
            dropdownStyles={styles.dropdownStyles} // 스타일 적용
            defaultOption={{ key: selectedKey, value: selectedKey }}
          />
        </View>
        {displayProblem ? (
          <Animated.View
            style={[styles.content, animatedStyle]}
            {...panResponder.panHandlers}
          >
            <View style={styles.problemInfo}>
              <Text style={{ paddingRight: 20 }}>
                한국사 능력 검정 시험{' '}
                {Math.floor(parseInt(displayProblem) / 100)}회{' '}
                {parseInt(displayProblem) % 100}번
              </Text>
              <TouchableOpacity style={styles.answerButton} onPress={openModal}>
                <Text>정답보기</Text>
              </TouchableOpacity>
              {isLoggedIn && (
                <TouchableOpacity onPress={handleBookMark}>
                  {bookMarkStar ? (
                    <AntDesign name="star" size={24} color="yellow" />
                  ) : (
                    <AntDesign name="staro" size={24} color="black" />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {imageUrl && (
              <Image
                key={imageUrl}
                source={{
                  uri: imageUrl,
                }}
                style={{
                  width: '100%',
                  height: undefined,
                  aspectRatio: imageAspectRatio,
                }}
                resizeMode="contain"
              />
            )}
          </Animated.View>
        ) : (
          <Spinner
            visible={true}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
        )}
        <AnswerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          problem={displayProblem}
          answer={answer}
        />
      </ScrollView>
      <View style={styles.arrowButton}>
        <TouchableOpacity onPress={handlePrevious}>
          <Text>이전</Text>
          <MaterialIcons name="west" size={30} color="black" />
        </TouchableOpacity>
        <Text>
          {problemCount}/{problems.length}
        </Text>
        <TouchableOpacity onPress={handleNext}>
          <Text> 다음</Text>
          <MaterialIcons name="east" size={30} color="black" />
        </TouchableOpacity>
      </View>
      {isScrollButton && (
        <View style={styles.scrollButtonsContainer}>
          <TouchableOpacity
            onPressIn={() => upScrolling()}
            onPressOut={stopScrolling}
          >
            <AntDesign name="upcircle" size={36} color="orange" />
          </TouchableOpacity>
          <TouchableOpacity onPressIn={() => downScrolling()}>
            <AntDesign
              name="downcircle"
              size={36}
              color="orange"
              style={{ marginTop: 10 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#bbd2ec',
  },
  problemInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2%',
  },
  boxStyles: {
    width: 300,
    marginRight: 15,
    borderColor: '#028391',
    backgroundColor: 'white',
  },
  dropdownStyles: {
    borderColor: '#028391',
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: 60,
  },
  answerButton: {
    backgroundColor: 'orange',
    borderRadius: 5,
    marginRight: '2%',
  },
  arrowButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollButtonsContainer: {
    position: 'absolute', // 위치를 절대적으로 설정
    bottom: 20, // 화면 하단에 위치
    right: 20,
    backgroundColor: 'transparent', // 배경색 투명
    zIndex: 1, // 다른 뷰들 위에 떠 있게 설정
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});
