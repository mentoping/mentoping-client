import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router'; // Vue Router를 사용할 경우

// Firebase 설정 파일을 가져옵니다 (firebaseConfig.js에서 초기화가 이루어집니다).
import './firebaseConfig'; 

const app = createApp(App);

// Pinia를 전역 상태 관리로 사용하도록 설정
app.use(createPinia());

// Vue Router를 사용하는 경우 라우터를 등록
app.use(router);

app.mount('#app');
