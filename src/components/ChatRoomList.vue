<template>
  <div class="chat-list">
    <input v-model="search" placeholder="유저 이름" />
    <ul>
      <li v-for="(room, index) in chatRooms" :key="index" @click="$emit('select-room', room.id)">
        <div class="room-info">
          <img src="https://via.placeholder.com/50" alt="User Icon" />
          <div>
            <h4>
              {{ room.name }}
              <!-- 마지막 메시지의 날짜 및 시간 표시 -->
              <small class="timestamp">{{ formatTimestamp(room.lastMessageTimestamp) }}</small>
            </h4>
            <p>{{ room.lastMessage }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<!-- 
<script>
import { ref, onMounted } from 'vue';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export default {
  name: 'ChatRoomList',
  emits: ['select-room'],
  setup() {
    const search = ref('');
    const chatRooms = ref([]);

    // 날짜 및 시간 포맷팅 함수
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}월 ${day}일 ${hours}시 ${minutes}분`;
    };

    // 채팅방 목록을 실시간으로 가져오기
    onMounted(() => {
      const roomsCollection = collection(db, 'rooms');
      const q = query(roomsCollection, orderBy('createdAt'));

      onSnapshot(q, (querySnapshot) => {
        chatRooms.value = [];
        querySnapshot.forEach((doc) => {
          chatRooms.value.push({ id: doc.id, ...doc.data() });
        });

        
        // 가져온 채팅방 목록을 'lastMessageTime'을 기준으로 내림차순 정렬
        chatRooms.value.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      });
    });

    return {
      search,
      chatRooms,
      formatTimestamp, // 포맷팅 함수 반환
    };
  },
};
</script> -->


<script>
import { ref, onMounted } from 'vue';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export default {
  name: 'ChatRoomList',
  emits: ['select-room'],
  setup() {
    const search = ref('');
    const chatRooms = ref([]);

    // 날짜 및 시간 포맷팅 함수
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}월 ${day}일 ${hours}시 ${minutes}분`;
    };

    // 채팅방 목록을 실시간으로 가져오기
    onMounted(() => {
      const roomsCollection = collection(db, 'rooms');
      const q = query(roomsCollection, orderBy('lastMessageTimestamp', 'desc')); // 'lastMessageTime'을 기준으로 내림차순 정렬

      onSnapshot(q, (querySnapshot) => {
        chatRooms.value = [];
        querySnapshot.forEach((doc) => {
          chatRooms.value.push({ id: doc.id, ...doc.data() });
        });
      });
    });

    return {
      search,
      chatRooms,
      formatTimestamp, // 포맷팅 함수 반환
    };
  },
};
</script>


<style scoped>
.chat-list {
  width: 300px;
  border-right: 1px solid #ccc;
  padding: 20px;
  overflow-y: auto;
}

.chat-list input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
}

.chat-list ul {
  list-style: none;
  padding: 0;
}

.chat-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

.timestamp {
  font-size: 12px;
  color: gray;
  margin-left: 10px; /* 이름 옆에 간격을 주기 위해 추가 */
}

.room-info h4 {
  display: flex;
  align-items: center;
}
</style>
