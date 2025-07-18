[Open in Colab](https://colab.research.google.com/github/Anne-Okingo/Code_Ssipers_Anfya_Kuu/blob/main/Predicting_cervical_cancer_with_decision_trees_2025.ipynb)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/Anne-Okingo/Code_Ssipers_Anfya_Kuu/HEAD?labpath=Predicting_cervical_cancer_with_decision_trees_2025.ipynb)


# Cervical Cancer Risk Assessment System

A comprehensive AI-powered web application for cervical cancer risk assessment using decision tree algorithms. This system provides healthcare professionals with intelligent risk evaluation and personalized medical recommendations.

## 🎯 Project Overview

This project combines machine learning, web development, and healthcare expertise to create a complete cervical cancer screening and risk assessment platform. The system analyzes patient data through trained decision tree models to provide risk predictions and clinical recommendations.

### Key Features

- **AI-Powered Risk Assessment**: Decision tree models trained on cervical cancer datasets
- **Real-time Predictions**: Instant risk evaluation and medical recommendations
- **Interactive Web Interface**: User-friendly frontend for data input and results visualization
- **Clinical Decision Support**: Evidence-based recommendations for healthcare providers
- **Comprehensive Reporting**: Detailed risk profiles with actionable insights

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  ML Models      │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│  (Scikit-learn) │
│                 │    │                 │    │                 │
│ - Risk Form     │    │ - Data Processing│    │ - Decision Trees│
│ - Results UI    │    │ - Predictions   │    │ - Risk Models   │
│ - Visualizations│    │ - API Endpoints │    │ - Recommendations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 13.5+ (React Framework)
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons
- Firebase for authentication (optional)

**Backend:**
- Flask (Python web framework)
- Flask-CORS for cross-origin requests
- Pandas for data manipulation
- Scikit-learn for ML models

**Machine Learning:**
- Decision Tree Classifiers
- Random Forest models
- Feature engineering and selection
- Model evaluation and validation

**Data Storage:**
- Firestore (NoSQL database) - optional
- LocalStorage (fallback when Firebase unavailable)
- CSV datasets for training
- Pickle files for model persistence

## 📊 Machine Learning Models

### Risk Prediction Model (`risk_prediction_model.pkl`)
- **Purpose**: Predicts "High Risk" or "Low Risk" for cervical cancer
- **Algorithm**: Decision Tree Classifier
- **Features**: Age, sexual history, screening results, lifestyle factors
- **Output**: Risk level with confidence percentage

### Recommendation Model (`recommendation_model.pkl`)
- **Purpose**: Provides clinical recommendations based on risk assessment
- **Algorithm**: Decision Tree Classifier
- **Output**: Specific medical actions (e.g., "FOR COLPOSCOPY, BIOPSY, AND CYTOLOGY")

### Model Training Process
1. **Data Preprocessing**: Cleaning and feature engineering
2. **Feature Selection**: Identifying key risk factors
3. **Model Training**: Using decision trees with class weights
4. **Validation**: Cross-validation and performance metrics
5. **Deployment**: Model serialization and API integration

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Decision-Tree-Algorithm
```

2. **Backend Setup**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Verify models are present
ls -la *.pkl
```

3. **Frontend Setup**
```bash
# Navigate to frontend directory
cd Frontend/Code-Her-Care/my-frontend

# Install dependencies
npm install

# Set up environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

### Running the Application

1. **Start the Backend API**
```bash
# From project root
python app.py
```
The API will be available at `http://localhost:5000`

2. **Start the Frontend**
```bash
# From Frontend/Code-Her-Care/my-frontend
npm run dev
```
The web application will be available at `http://localhost:3001`

### Running Without Firebase (Simplified Setup)

**The project works perfectly without Firebase!** Firebase is only used for user authentication, which is optional.

1. **Skip Firebase Configuration**: The app will automatically run in demo mode
2. **Demo User**: A demo healthcare provider account is created automatically
3. **Data Storage**: Uses localStorage instead of Firestore
4. **Full ML Functionality**: All risk assessment features work normally

To test without Firebase:
```bash
python test_without_firebase.py
```

### API Endpoints

- `GET /health` - Health check and model status
- `POST /predict` - Risk prediction endpoint
- `GET /` - API information

## 📱 Usage Guide

### For Healthcare Providers

1. **Access the Application**: Navigate to the risk assessment page
2. **Patient Information**: Enter demographic and contact details
3. **Medical History**: Input lifestyle and health factors
4. **Screening Results**: Add test results and screening history
5. **Get Assessment**: Receive AI-powered risk evaluation
6. **Review Recommendations**: Follow clinical guidance provided

### Sample Request Format
```json
{
  "age": "28",
  "ageFirstSex": "19",
  "smoking": "No",
  "stdsHistory": "No",
  "region": "nairobi",
  "insurance": "Yes",
  "hpvTest": "Negative",
  "papSmear": "Negative",
  "lastScreeningType": "Pap smear"
}
```

### Sample Response
```json
{
  "success": true,
  "risk_prediction": 1,
  "risk_percentage": 73,
  "risk_level": "High Risk",
  "recommendation": "FOR COLPOSCOPY, BIOPSY, AND CYTOLOGY",
  "risk_probability": 0.73
}
```

## 📁 Project Structure

```
Decision-Tree-Algorithm/
├── app.py                          # Flask backend API
├── requirements.txt                # Python dependencies
├── *.pkl                          # Trained ML models
├── *.csv                          # Training datasets
├── *.ipynb                        # Jupyter notebooks
├── Frontend/
│   └── Code-Her-Care/
│       └── my-frontend/
│           ├── src/
│           │   ├── app/
│           │   │   ├── components/     # React components
│           │   │   ├── services/       # API integration
│           │   │   └── risk-assessment/ # Main pages
│           │   └── ...
│           ├── package.json
│           └── .env.local
├── test_integration.py            # Integration tests
└── README.md                      # This file
```

## 🧪 Testing

### Backend Testing
```bash
# Test API health
curl http://localhost:5000/health

# Test prediction endpoint
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"age": "28", "smoking": "No", ...}'
```

### Integration Testing
```bash
python test_integration.py
```

### Frontend Testing
- Navigate to `http://localhost:3001/risk-assessment`
- Fill out the assessment form
- Verify real-time API integration
- Check error handling and loading states

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5000)

### Model Configuration
- Models are loaded automatically on backend startup
- Model files must be present in the project root
- Feature names are validated against training data

### Regional Settings
Supported regions for risk assessment:
- pumwani, kakamega, machakos, embu, mombasa
- loitoktok, garisaa, kitale, moi, kericho

## 📈 Performance & Metrics

### Model Performance
- **Accuracy**: Evaluated through cross-validation
- **Precision/Recall**: Optimized for clinical sensitivity
- **Feature Importance**: Key risk factors identified
- **Class Weights**: Balanced for medical priorities

### System Performance
- **API Response Time**: < 500ms for predictions
- **Frontend Load Time**: < 3 seconds initial load
- **Concurrent Users**: Supports multiple simultaneous assessments
- **Model Loading**: < 2 seconds on startup

## 🔍 Data Science & ML Details

### Dataset Information
- **Source**: Cervical cancer screening datasets
- **Features**: Demographics, lifestyle, screening history
- **Target Variables**: Risk levels and recommendations
- **Preprocessing**: Data cleaning, encoding, feature engineering

### Model Training Pipeline
1. **Data Collection**: Cervical cancer screening data
2. **Data Cleaning**: Handle missing values, outliers
3. **Feature Engineering**: Create meaningful predictors
4. **Model Selection**: Decision trees for interpretability
5. **Hyperparameter Tuning**: Grid search optimization
6. **Validation**: Cross-validation and holdout testing
7. **Deployment**: Model serialization and API integration

### Key Features Used
- **Demographics**: Age, region
- **Sexual History**: Age at first sexual activity
- **Lifestyle**: Smoking status, STD history
- **Healthcare**: Insurance coverage
- **Screening**: HPV test, Pap smear results
- **Medical History**: Previous screening types

## 🚨 Important Notes

### Medical Disclaimer
⚠️ **This system is designed to assist healthcare professionals and should not replace clinical judgment. Always consult with qualified medical professionals for diagnosis and treatment decisions.**

### Data Privacy
- Patient data is handled securely
- No sensitive information is stored permanently
- HIPAA compliance considerations implemented
- Firebase authentication for secure access

### Limitations
- Model trained on specific dataset demographics
- Requires regular retraining with new data
- Should be validated in clinical settings
- Not a substitute for professional medical advice

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new features
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Add comprehensive tests for new features
- Update documentation as needed
- Ensure medical accuracy in health-related features

### Areas for Contribution
- Model improvement and retraining
- Additional screening parameters
- Enhanced visualizations
- Mobile responsiveness
- Performance optimizations
- Security enhancements

## 📚 References & Research

### Academic References
- [Induction of Decision Trees](https://link.springer.com/article/10.1007/BF00116251) - J.R. Quinlan
- [Scikit-learn Documentation](https://scikit-learn.org/stable/modules/tree.html) - Decision Trees
- [Cervical Cancer Screening Guidelines](https://www.who.int/publications/i/item/9789241550086) - WHO

### Technical Resources
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Medical Resources
- World Health Organization Cervical Cancer Guidelines
- American Cancer Society Screening Recommendations
- Clinical decision support system research

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Healthcare professionals who provided domain expertise
- Open-source contributors and maintainers
- Research community for cervical cancer prevention
- Dataset providers and medical institutions
- Scikit-learn and Flask communities

## 📞 Support & Contact

For questions, issues, or contributions:
- **Issues**: Create an issue in the repository
- **Documentation**: Review this README and inline code comments
- **Medical Questions**: Consult with qualified healthcare professionals
- **Technical Support**: Check existing issues or create a new one

### Quick Links
- 🌐 **Frontend**: http://localhost:3001/risk-assessment
- 🔧 **Backend API**: http://localhost:5000
- 📊 **Health Check**: http://localhost:5000/health
- 📖 **API Docs**: http://localhost:5000/

---

**Built with ❤️ for healthcare professionals and patients worldwide**



