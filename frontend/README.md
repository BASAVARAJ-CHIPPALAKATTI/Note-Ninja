# EduChat - AI-Powered Educational Platform

A full-stack MERN application that enables teachers to upload educational PDFs and create quizzes, while students can interact with PDF content through AI-powered chat and take assessments.

## 🚀 Features

### For Teachers
- 📤 Upload PDF documents
- 📢 Create announcements
- ❓ Generate AI-powered quizzes
- 📊 View student results and analytics
- 👥 Manage classroom materials

### For Students
- 📚 Access assigned PDFs
- 💬 Ask questions about PDF content (AI-powered)
- 📝 Take quizzes and assessments
- 🔔 View announcements
- 📊 Track learning progress

## 🛠️ Tech Stack

### Frontend
- React.js
- Context API for state management
- Axios for API calls
- CSS3 with modern styling

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- AI Integration (Ollama/Llama2)
- File upload handling

### AI Features
- Instant PDF content search
- Question-answering system
- Quiz generation from PDF content

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/educhat-platform.git
   cd educhat-platform


Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configurations
node server.js

Frontend Setup
cd frontend
npm install
cp .env.example .env
# Edit .env with your configurations
npm start

AI Setup (Optional)
Install Ollama: https://ollama.ai/
Pull model: ollama pull llama2
Start Ollama service


# Backend .env.example
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/educhat
PORT=5000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Frontend .env.example
REACT_APP_API_URL=http://localhost:5000/api
