// store/userStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  // 사용자 정보 및 전체 사용자 목록 상태 정의
  const user = ref(null);
  const users = ref([]);

  // 현재 사용자 정보를 저장하는 함수
  const setUser = (userInfo) => {
    user.value = userInfo;
  };

  // 현재 사용자 정보를 가져오는 함수
  const getUser = () => {
    return user.value;
  };

  // 서버로부터 전체 사용자 목록을 가져오는 함수
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8089/api/memeber'); // 사용자 목록을 가져올 API 엔드포인트
      users.value = response.data; // 사용자 목록을 상태에 저장
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  return {
    user,
    users, // 전체 사용자 목록 노출
    setUser,
    getUser,
    fetchUsers, // 사용자 목록 가져오는 함수 노출
  };
});
