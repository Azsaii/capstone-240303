import React, { useEffect, useState, useRef } from 'react';
import {Modal, Text, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, deleteDoc, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Button, Card, TextInput, List, IconButton, MD3Colors, Divider, Icon } from 'react-native-paper';

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
                const commentsSnapshot = await getDocs(collection(firestore, `Videos/${document.id}/comments`));
                commentsSnapshot.forEach(doc => {
                    commentsArray.push({
                        docId: doc.id,
                        comment: doc.data().comment,
                        userEmail: doc.data().userEmail
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
                        userEmail: userEmail
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
                                }}>댓글</Button>
                                <Button icon="bookmark" buttonColor='white' textColor='black' mode="elevated" title='Save Button' onPress={() => addFavorite(item)}>저장하기</Button>
                            </View>
                        </Card>

                        
                        )
                    }
                />


                <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}
                >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                    <Text style={{ fontWeight: 'bold', fontSize: 35, marginTop: 10, marginBottom: 10, padding: 10 }}><Icon source="message-reply-text" size={35}/> 댓글</Text>
                    <Divider />
                    
                    {
                        comments.map((comment, index) => {
                            return (
                                <>
                                    <View style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                                        <List.Item
                                        key={index}
                                        title={comment.comment}
                                        description={comment.userEmail}
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

                                    <Divider key={index} />
                                </>
                            );
                        })
                        
                    }

                            
                    <TextInput
                        style={{width: '100%', marginTop: 20, marginBottom: 20, backgroundColor: 'white'}}
                        right={<TextInput.Icon icon="send-circle" onPress={submitComments} />}
                        placeholder={
                            isLoggedIn ? '댓글을 작성해주세요!' : '로그인하고 댓글을 작성해주세요!'
                        }

                        onChangeText={(text) => setComment(text)} // 입력값을 상태로 관리
                        value={comment}
                        editable={isLoggedIn}
                    />

                    <Button icon="close" buttonColor='white' textColor='black' mode="elevated" title='Comments Button' onPress={() => setModalVisible(!modalVisible)}>닫기</Button>
            
                    </View>
                </View>
            </Modal>
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
});


export default HistoryTalesScreen;