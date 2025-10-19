import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const pdfApi = {
  upload: (formData) => api.post('/pdfs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTeacherPdfs: () => api.get('/pdfs/teacher/pdfs'),
  getStudentPdfs: () => api.get('/pdfs/student/pdfs'),
  // Removed getStudents since it's no longer used for assignment
};
export const announcementApi = {
  createAnnouncement: (data) => api.post('/announcements', data),
  getAnnouncements: () => api.get('/announcements'),
  getTeacherAnnouncements: () => api.get('/announcements/teacher'),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`)
};
export const quizApi = {
  createQuiz: (data) => api.post('/quiz/generate', data),
  getTeacherQuizzes: () => api.get('/quiz/teacher/quizzes'),
  getStudentQuizzes: () => api.get('/quiz/student/quizzes'),
  getResults: () => api.get('/quiz/teacher/dashboard-results'),
  submitQuiz: (quizId, data) => api.post(`/quiz/student/submit/${quizId}`, data),
  getStudentResults: () => api.get('/quiz/student/results'),
  deleteQuiz: (quizId) => api.delete(`/quiz/teacher/quiz/${quizId}`),
  fixQuizzes: () => api.post('/quiz/teacher/fix-quizzes'), // Add this
};

export const userPdfApi = {
  askTemporaryPdf: (data) => api.post('/user-pdf/ask-temporary-pdf', data)
    .catch(error => {
      throw new Error(error.response?.data?.message || 'Failed to process PDF question');
    }),
};

export const aiApi = {
  askPdfQuestion: (data) => api.post('/ai/ask-pdf', data),
};

export default api;