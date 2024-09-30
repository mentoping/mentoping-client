import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '../firebaseConfig'; // Firebase 설정 파일 가져오기
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';

export const useChatStore = defineStore('chat', () => {
  const messages = ref([]);
  const messageContent = ref('');
  const userId = ref(''); // 사용자 ID 저장
  const userNickname = ref(''); // 사용자 닉네임 저장
  const userName = ref('');
  const receiverId = ref('user2'); // 상대방의 ID를 저장 (예시)

  // Firestore에서 실시간 메시지 구독
  const fetchMessages = () => {
    const messagesCollection = collection(db, 'chats', 'chatRoom1', 'messages');
    const q = query(messagesCollection, orderBy('timestamp'));

    onSnapshot(q, (querySnapshot) => {
      messages.value = [];
      querySnapshot.forEach((doc) => {
        messages.value.push(doc.data());
      });
    });
  };


  // 사용자 정보를 설정하는 함수
  const setUser = (id, nickname , name) => {
    userId.value = id;
    userNickname.value = nickname;
    userName.value = name;
  };

  // 메시지 보내기
  const sendMessage = async () => {
    if (messageContent.value.trim() !== '' && userName.value ) {
      const message = {
        senderId: userName.value,
        senderNickname: userNickname.value,
        receiverId: receiverId.value,
        content: messageContent.value,
        timestamp: Date.now(),
      };
      try {
        await addDoc(collection(db, 'chats', 'chatRoom1', 'messages'), message);
        messageContent.value = '';
      } catch (error) {
        console.error('Error sending message: ', error);
      }
    }
  };

  return {
    messages,
    messageContent,
    fetchMessages,
    sendMessage,
    setUser, // 사용자 정보를 설정하는 함수 노출
    userId,
    userNickname,
    userName
  };
});
