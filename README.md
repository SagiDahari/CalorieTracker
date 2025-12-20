# 🍎 Nutrition Tracker API

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A full-stack web application for tracking daily nutrition and macronutrient intake. Users can log meals, search for foods from the USDA database, and monitor their progress toward nutrition goals.

## 📸 Screenshots

![Dashboard](screenshots/dashboard.png)
![Meals](screenshots/meals.png)

*(Add actual screenshots!)*

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication with httpOnly cookies
- 🍔 **Meal Tracking** - Log breakfast, lunch, dinner, and snacks
- 🔍 **Food Search** - Search 300,000+ foods from USDA FoodData Central API
- 📊 **Nutrition Goals** - Set and track daily calorie and macro targets
- 📈 **Progress Tracking** - Visual progress bars for daily goals
- 💾 **Smart Caching** - Foods are cached to minimize API calls
- 🎯 **User Isolation** - Each user's data is completely separate

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- CSS3

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt

**DevOps:**
- Docker
- Docker Compose

## 🏗️ Architecture
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   Express   │─────▶│ PostgreSQL  │
│   Frontend  │      │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            │
                            ▼
                     ┌─────────────┐
                     │ USDA Food   │
                     │     API     │
                     └─────────────┘
```

## 📋 Prerequisites

**Option 1: Using Docker (Recommended)**
- Docker Desktop or Docker Engine
- Docker Compose

**Option 2: Manual Setup**
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the repository
```bash
git clone https://github.com/SagiDahari/NutritionTracker.git
cd NutritionTracker
```

### 2. Create environment files

**Root `.env`:**
```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=calorie_tracker
DB_HOST=db
PORT=5000

PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```

**`backend/.env`** (create in `backend/` folder):
```env
# Database (these will be overridden by Docker Compose)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=calorie_tracker
DB_PASSWORD=postgres
DB_PORT=5432

# Server
PORT=5000
NODE_ENV=development

# USDA API (Get your key: https://fdc.nal.usda.gov/api-key-signup.html)
API_KEY=your_usda_api_key_here

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_generated_jwt_secret_here
```

### 3. Start the application
```bash
docker-compose up -d
```

That's it! The app is now running:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **Database**: PostgreSQL on port 5432

### 4. View logs (optional)
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Stop the application
```bash
docker-compose down
```

To remove all data (including database):
```bash
docker-compose down -v
```

---

## 🔧 Manual Setup (Alternative)

<details>
<summary>Click to expand manual setup instructions</summary>

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=calorie_tracker
DB_PASSWORD=your_db_password
DB_PORT=5432

PORT=5000
NODE_ENV=development

API_KEY=your_usda_api_key

JWT_SECRET=your_generated_jwt_secret_here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Setup
```bash
createdb calorie_tracker

psql calorie_tracker

psql nutrition_tracker < init.sql
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

</details>

---

## 🐳 Docker Commands Cheat Sheet
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild images (after code changes)
docker-compose up -d --build

# Reset everything (including database)
docker-compose down -v
docker-compose up -d --build

# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d calorie_tracker

# Access backend container shell
docker-compose exec backend sh

# View running containers
docker-compose ps
```

## 📚 API Documentation

Full interactive API documentation (Swagger UI):
```
http://localhost:5000/api-docs
```

### Quick Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/meals/:date` | Get meals for date | Yes |
| POST | `/api/meals/log-food` | Add food to meal | Yes |
| DELETE | `/api/meals/delete-food/:mealId/:fdcId` | Remove food | Yes |
| GET | `/api/foods/search?food=chicken` | Search foods | No |
| GET | `/api/users/goals` | Get nutrition goals | Yes |
| PUT | `/api/users/goals` | Update goals | Yes |

## 🧪 Running Tests
```bash
cd backend
npm test
```

## 📁 Project Structure
```
nutrition-tracker/
├── backend/
│   ├── db/
│   │   ├── init.sql
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── swagger.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── screenshots/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with httpOnly cookies (XSS protection)
- ✅ CORS configuration
- ✅ Input validation with Joi
- ✅ SQL injection prevention (parameterized queries)
- ✅ User data isolation
- ✅ Authentication middleware on protected routes

## 🚀 Future Enhancements

- [ ] Data visualization (charts/graphs)
- [ ] Export meals as CSV/PDF
- [ ] Barcode scanning for foods
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

**Sagi Dahari**
- GitHub: [@SagiDahari](https://github.com/SagiDahari)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/sagi-dahari-582531214)
- Email: sagidahari7@gmail.com

## 🙏 Acknowledgments

- [USDA FoodData Central](https://fdc.nal.usda.gov/) for the comprehensive food database API
- [React](https://reactjs.org/) 
- [Express](https://expressjs.com/)

---

⭐ Star this repo if you found it helpful!

💬 Have questions? [Open an issue](https://github.com/yourusername/nutrition-tracker/issues)