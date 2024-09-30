import { createRouter, createWebHistory } from 'vue-router';
import ChatRoom from '../components/ChatRoom.vue';
import MentoringLogin from '../components/MentoringLogin.vue';

const routes = [
  {
    path: '/chat',
    name: 'RoomList',
    component: ChatRoom,
  },
  {
    path: '/login',
    name: 'Login',
    component: MentoringLogin,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
