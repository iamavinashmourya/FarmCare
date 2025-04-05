# FarmCare - Smart Agriculture Management System

![FarmCare Logo](https://your-logo-url.com) <!-- You can add your logo image later -->

## Overview

FarmCare is a comprehensive agriculture management system designed to help farmers optimize their crop production through AI-powered insights, weather monitoring, and government scheme tracking. The application combines modern technology with agricultural expertise to provide farmers with actionable insights and recommendations.

## Features

- **AI-Powered Crop Analysis**
  - Upload crop images for disease detection
  - Get instant health analysis and recommendations
  - Track crop health history

- **Weather Monitoring**
  - Real-time weather updates
  - Weather forecasts for better planning
  - Rainfall probability predictions

- **Government Schemes**
  - Access to latest agricultural schemes
  - Easy application process
  - Track application status

- **Dashboard Analytics**
  - Comprehensive crop health overview
  - Weather trends and patterns
  - Scheme application status

## Tech Stack

### Frontend
- React.js
- Material-UI
- Chart.js for analytics
- React Icons
- Axios for API calls

### Backend
- Python Flask
- MongoDB
- JWT Authentication
- AWS S3 for image storage
- Google Cloud Vision AI

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB
- AWS Account (for S3)
- Google Cloud Account (for Vision AI)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Update .env with your credentials
```

### Frontend Setup

1. Navigate to the project directory:
```bash
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Update .env.local with your credentials
```

## Running the Application

### Start Backend Server
```bash
cd Backend
python server.py
```

### Start Frontend Development Server
```bash
cd project
npm run dev
```

The application will be available at `http://localhost:5173`

## API Documentation

### Authentication Endpoints
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- GET `/auth/verify` - Verify JWT token

### Crop Analysis Endpoints
- POST `/upload/image` - Upload crop image
- GET `/analysis/history` - Get analysis history
- GET `/user/analysis/count` - Get total analysis count

### Weather Endpoints
- GET `/weather/current` - Get current weather
- GET `/weather/forecast` - Get weather forecast

### Government Schemes Endpoints
- GET `/schemes` - Get all schemes
- GET `/schemes/:id` - Get specific scheme details
- POST `/schemes/apply` - Apply for a scheme

## Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_uri
SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_google_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Avinash Mourya - avinashgoweb@gmail.com

Project Link: [https://github.com/iamavinashmourya/FarmCare](https://github.com/iamavinashmourya/FarmCare)

## Acknowledgments

- [React.js](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://mui.com/)
- [Google Cloud Vision AI](https://cloud.google.com/vision) 