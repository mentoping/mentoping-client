<template>
  <div class="chat-list">
    <input v-model="search" placeholder="유저 이름" />
    <ul>
      <li v-for="(room, index) in chatRooms" :key="index" @click="$emit('select-room', room.id)">
        <div class="room-info">
          <img src="https://via.placeholder.com/50" alt="User Icon" />
          <div>
            <h4>{{ room.name }}</h4>
            <p>{{ room.lastMessage }}</p>
          </div>
        </div>
        <span>{{ room.timestamp }}</span>
      </li>
    </ul>
  </div>
</template>

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

    // 채팅방 목록을 실시간으로 가져오기
    onMounted(() => {
      const roomsCollection = collection(db, 'rooms');
      const q = query(roomsCollection, orderBy('createdAt'));

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
  padding: 10px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
</style>
