import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, deleteDoc, addDoc, getDocs, updateDoc, orderBy, query } from 'firebase/firestore';
import { Button, Card, TextInput, List, IconButton, MD3Colors, Divider, Icon } from 'react-native-paper';
import SlidingUpPanel from 'rn-sliding-up-panel';

const HistoryTalesScreen = ({ navigation, isLoggedIn, userEmail }) => {
    const [videos, setVideos] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('고조선');
    const [selectedTypeKeywords, setSelectedTypeKeywords] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태를 관리할 새로운 상태 변수

    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState();

    
    const [selectedVideo, setselectedVideo] = useState();


    const [selected, setSelected] = React.useState("");

    const flatListRef = useRef();
    const _panel = useRef(null);

    const openPanel = () => {
        _panel.current?.show();
    };

    const closePanel = () => {
        _panel.current?.hide();
    };

    const data = [
        '고조선', '삼국', '남북국 시대', '후삼국', '고려', '조선', '개항기', '일제강점기', '해방 이후'
    ];
    
    const [modalVisible, setModalVisible] = useState(false);

    const addFavorite = async (video) => {

        if (!isLoggedIn) {
            Alert.alert(
                '경고!',
                '해당 영상을 즐겨 찾기에 추가하실려면 로그인을 해주세요',
                [
                    {
                        text: '예',

                        onPress: () => navigation.navigate('로그인'),
                    }
                ]
            );
            return;

        }

        try {
            const userSnapshot = await getDoc(doc(firestore, "users", userEmail));
            if (userSnapshot.exists()) {
                addDoc(collection(firestore, "users", userEmail, "LikedVideos"), {
                    videoId: video.videoId,
                })
                    .then((docRef) => {
                        console.log("Document written with ID: ", docRef.id);
                        Alert.alert(
                            '성공!',
                            '해당 영상이 즐겨찾기에 추가 되었습니다!'
                        );
                    })
                    .catch((e) => {
                        console.error("Error adding document: ", e);
                    });
            } else {
                console.error("User not found");
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }

    };


    const addLike = async (video) => {

        if (!isLoggedIn) {
            Alert.alert(
                '경고!',
                '해당 영상을 좋아요 하실려면 로그인을 해주세요',
                [
                    {
                        text: '예',

                        onPress: () => navigation.navigate('로그인'),
                    }
                ]
            );
            return;

        }

        try {
            const snapshot = await getDocs(collection(firestore, 'Videos'));

            snapshot.forEach((document) => {
                

                const data = document.data();

                if (data.videoId === video.videoId) {
                
                    const currentLikes = data.like;

                    if(currentLikes.includes(userEmail)) {

                        Alert.alert(
                            '경고!',
                            '이미 해당 영상을 성공적으로 좋아요 했습니다!'
                        );


                        return;

                    }

                    const updatedLikes = [...currentLikes, userEmail];


                    updateDoc(doc(firestore, 'Videos', document.id), {
                        like: updatedLikes
                    }).then(() => {
                        Alert.alert(
                            '성공!',
                            '해당 영상을 성공적으로 좋아요 했습니다!'
                        );

                        fetchVideos();
                    }).catch((e) => {
                        console.error("Error updating document: ", e);
                    });
                }
            });
        } catch (e) {
            console.error("Error like document: ", e);
        }

    };

    const fetchVideos = async () => {

        setIsLoading(true); //로딩 시작

        let filteredDocs = [];

        try {
            const snapshot = await getDocs(collection(firestore, 'Videos'));
            snapshot.forEach((doc) => {
                let data = doc.data();
                let categories = data.category;

                for (let i = 0; i < categories.length; i++) {

                    if (selectedTypeKeywords.includes(categories[i]) || selectedKeyword === categories[i]) {

                        filteredDocs.push(data);
                        break;
                    }
                }
            });
            
            setVideos(filteredDocs);

        } catch (error) {
            console.error("Error getting documents: ", error);
        } finally {
            setIsLoading(false); //로딩 종료
        }

    }



    const fetchComments = async (video) => {
        const snapshot = await getDocs(collection(firestore, 'Videos'));
    
        let commentsArray = [];
    
        for (const document of snapshot.docs) {
            const data = document.data();
    
            if (data.videoId === video.videoId) {
                const commentsSnapshot = await getDocs(query(collection(firestore, `Videos/${document.id}/comments`), orderBy("created", "desc")));
                commentsSnapshot.forEach(doc => {
                    commentsArray.push({
                        docId: doc.id,
                        comment: doc.data().comment,
                        userEmail: doc.data().userEmail,
                        created: doc.data().created // 날짜 필드도 포함
                    });
                });
            }
        }
    
        return commentsArray;
    }


    const submitComments = async () => {
        const snapshot = await getDocs(collection(firestore, 'Videos'));
    
        for (const document of snapshot.docs) {
            const data = document.data();
            if (data.videoId === selectedVideo.videoId) {
                try {
                    await addDoc(collection(firestore, `Videos/${document.id}/comments`), {
                        comment: comment,
                        userEmail: userEmail,
                        created: new Date()
                    });
                    const comments = await fetchComments(selectedVideo);
                    setComments(comments);
                    setComment("");
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            }
        }
    }


    const deleteComment = async (commentDocId) => {
        const snapshot = await getDocs(collection(firestore, 'Videos'));

        for (const document of snapshot.docs) {
            const data = document.data();
            if (data.videoId === selectedVideo.videoId) {
                try {
                    await deleteDoc(doc(firestore, `Videos/${document.id}/comments`, commentDocId));
                    const comments = await fetchComments(selectedVideo);
                    setComments(comments);
                    setComment(""); // 필요에 따라 주석 처리를 해제하세요.
                } catch (e) {
                    console.error("Error delete document: ", e);
                }
            }
        }
        
    };
    
    
    

    useEffect(() => {
        fetchVideos();
    }, [selectedKeyword, selectedTypeKeywords]);

    return (
        <View style={styles.container}>
            <View>
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 10, marginBottom: 10 }}><AntDesign name="clockcircleo" size={25} color="black" /> 시대 별</Text>
                <SelectList 
                    setSelected={(val) => setSelectedKeyword(val)} 
                    data={[
                        { key: '1', value: '고조선' },
                        { key: '2', value: '삼국' },
                        { key: '3', value: '남북국 시대' },
                        { key: '4', value: '후삼국' },
                        { key: '5', value: '고려' },
                        { key: '6', value: '조선' },
                        { key: '7', value: '개항기' },
                        { key: '8', value: '일제강점기' },
                        { key: '9', value: '해방 이후' }
                    ]}
                    save="value"
                />

                <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 10, marginBottom: 10 }}><Feather name="list" size={25} color="black" /> 유형 별</Text>

                <MultipleSelectList
                    data={[
                        { key: '1', value: '문화' },
                        { key: '2', value: '유물' },
                        { key: '3', value: '사건' },
                        { key: '4', value: '인물' },
                        { key: '5', value: '장소' },
                        { key: '6', value: '그림' },
                        { key: '7', value: '제도' },
                        { key: '8', value: '기구' },
                        { key: '9', value: '조약' },
                        { key: '10', value: '단체' },
                    ]}
                    setSelected={(val) => setSelectedTypeKeywords(val)}
                    save="value"
                />

            </View>


            <FlatList
                    ref={flatListRef}
                    data={videos}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={isLoading ? <ActivityIndicator /> : null}
                    contentContainerStyle={{ padding: 5 }}
                    renderItem={({ item }) => (
                        <Card style={{marginBottom: 30, padding: 4, backgroundColor: 'white'}}>
                            <YoutubePlayer
                                height={200}
                                videoId={item.videoId}
                            />
                            
                            <View style={{marginBottom: 10, marginTop: 10, display: 'flex', flexDirection: 'row' , justifyContent: 'space-around'}}>
                                <Button icon="thumb-up" buttonColor='white' textColor='black' mode="elevated" onPress={() => addLike(item)}>{`좋아요 ${item.like.length}`}</Button>
                                <Button icon="comment" buttonColor='white' textColor='black' mode="elevated" title='Comments Button' onPress={ async () => {
                                   
                                    const comments = await fetchComments(item);
                                    setComments(comments); 
                                    setselectedVideo(item)
                                    setModalVisible(true);
                                    openPanel();
                                }}>댓글</Button>
                                <Button icon="bookmark" buttonColor='white' textColor='black' mode="elevated" title='Save Button' onPress={() => addFavorite(item)}>저장하기</Button>
                            </View>
                        </Card>

                        
                        )
                    }
                />


            <SlidingUpPanel
                ref={_panel}
                draggableRange={{ top: 600, bottom: 0 }}
                height={600}
            >
                {(dragHandler) => (
                    <View style={styles.panel}>
                        <View style={styles.panelHeader} {...dragHandler}>
                            <Text style={{ fontWeight: 'bold', fontSize: 30, padding: 10 }}>
                                <Icon source="message-reply-text" size={30} /> 댓글
                            </Text>
                            <TextInput
                                    style={{ backgroundColor: 'white' }} {...dragHandler}
                                    right={<TextInput.Icon icon="send-circle" onPress={submitComments} />}
                                    placeholder={
                                        isLoggedIn ? '댓글을 작성해주세요!' : '로그인하고 댓글을 작성해주세요!'
                                    }
                                    onChangeText={(text) => setComment(text)}
                                    value={comment}
                                    editable={isLoggedIn}
                                />
                        </View>
                        <Divider />
                        
                        <ScrollView style={styles.panelContent}
                        contentContainerStyle={{ padding: 20}}>
                            {comments.map((comment) => (
                                <React.Fragment key={comment.docId}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <List.Item
                                            title={comment.comment}
                                            description={`${comment.userEmail}\n${new Date(comment.created.seconds * 1000).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}`}
                                            left={(props) => <List.Icon {...props} icon="comment" />}
                                        />
                                        {comment.userEmail === userEmail && (
                                            <IconButton
                                                icon="trash-can"
                                                iconColor={MD3Colors.error50}
                                                size={20}
                                                onPress={() => deleteComment(comment.docId)}
                                            />
                                        )}
                                    </View>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </SlidingUpPanel>
        </View>
    );
};


const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },


    container: {
        backgroundColor: 'white',
        padding: 15,
        flex: 1,
        flexDirection: 'column'
    },


    Card: {
        backgroundColor: '#ffffff'
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        width: '90%%',

        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
        paddingTop: 15,
        paddingBottom: 15,

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
     
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
      },

      panel: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
      },
      panelHeader: {
        padding: 20,
        backgroundColor: 'white'
      },
      panelContent: {
        margin: 20
      },
});


export default HistoryTalesScreen;