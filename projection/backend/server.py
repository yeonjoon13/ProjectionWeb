from flask import Flask, request, jsonify
import pdfplumber
from flask_cors import CORS
import openai
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from dotenv import load_dotenv
import joblib


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow requests from your frontend

final_model = joblib.load('final_model.joblib')
scaler = joblib.load('scaler.joblib')
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

keys = [
    'Glucose', 'Creatinine', 'Sodium', 'TotalProtein', 'AlkPhos', 'Potassium',
    'Chloride', 'Calcium', 'Albumin', 'BUN', 'AST', 'ALT', 'Globulin',
    'Bilirubin', 'T3', 'T4', 'Tsh', 'BMI', 'Age', 'Outcome'
]
# Function to extract text from PDF
def extract_text_from_pdf(file_content):
    text = ""
    with pdfplumber.open(file_content) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

# Function to get data from OpenAI
def get_openai_response(extracted_text):
    prompt = f"""
    Provide the following patient lab results in the specified format where value is the patient's value in this {extracted_text}. 
    If any of the following value's units are different, convert them to specified unit.
    If there are multiple values for a feature, then choose one.
    BUN means Blood Urea Nitrogen or Urea Nitrogen Blood.
    Keep the exact spelling and capitalization as the format.
    If any of the following is missing, then put N/A:

    Glucose: [value] mg/dL
    Creatinine: [value] mg/dL
    Sodium: [value] mmol/L
    TotalProtein: [value] g/dL
    AlkPhos: [value] U/L
    Potassium: [value] mmol/L
    Chloride: [value] mmol/L
    Calcium: [value] mg/dL
    Albumin: [value] g/dL
    BUN: [value] mg/dL
    AST: [value] U/L
    ALT: [value] U/L
    Globulin: [value] g/dL
    Bilirubin: [value] mg/dL
    T3: [value] ng/dL
    T4: [value] μg/dL
    Tsh: [value] μU/mL
    BMI: [value]
    Age: [value] years
    Outcome: [value]
    Collected By: 
    Collected Date: 
    """

    openai.api_key = api_key

    
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    return response.choices[0].message.content.strip()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Extract text from PDF
    extracted_text = extract_text_from_pdf(file)

    # Get response from OpenAI
    openai_response = get_openai_response(extracted_text)

    return jsonify({'openai_response': openai_response})

def process_patient_data(data):
    patient_data = {key: np.nan for key in keys}

    for line in data.split('\n'):
        if not line.strip():
            continue
        key_value = line.strip().split(': ')
        
        key = key_value[0].strip()
        value = key_value[1].strip()
        
        if value == 'N/A':
            value = np.nan
        elif 'years' in value:
            value = int(value.split()[0])
        elif 'μg' in value:  # Handling μg/dL and μU/mL
            value = float(value.split()[0]) / 1000  # Convert to mg/dL or U/mL
        else:
            try:
                value = float(value.split()[0])
            except ValueError:
                value = np.nan
        
        # Assign value to the corresponding key in patient_data dictionary
        if key in patient_data:
            patient_data[key] = value

    df_patient = pd.DataFrame(patient_data, index=[0])
    df = pd.read_csv('diabetes_data.csv')
    df_patient_imputed = impute_missing_values(df_patient, df)
    
    # Assuming `scaler` is your trained scaler
    df_patient_input = df_patient_imputed.drop(columns=['Outcome'])
    new_data_scaled = scaler.transform(df_patient_input)
    
    # Assuming `final_model` is your trained model
    pred = final_model.predict(new_data_scaled)
    pred_proba = final_model.predict_proba(new_data_scaled)[:, 1]
    
    # Interpret the prediction
    interpretation = [
        f"Probability of having diabetes: {pred_proba[0]:.4f}",
        "The model predicts that the patient has diabetes." if pred[0] == 1 else "The model predicts that the patient does not have diabetes."
    ]
    
    return interpretation


def impute_missing_values(df_patient, df_full):
    columns_with_missing = df_patient.columns[df_patient.isnull().any()].tolist()
    for col in columns_with_missing:
        # Drop current column and non-numeric columns for prediction
        features = df_patient.drop([col], axis=1)        
        # Separate rows with and without missing current column
        df_with_target = df_full[df_full[col].notna()]
        
        # Features and target for current column
        X = df_with_target.drop([col], axis=1)
        y = df_with_target[col]
        
        # Splitting data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Model for current column prediction
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Predict current column for the patient's data
        predicted_values = model.predict(features)
        
        # Update the patient's DataFrame with predicted values
        df_patient.loc[df_patient[col].isnull(), col] = predicted_values
    
    return df_patient



@app.route('/process-file-data', methods=['POST'])
def process_file_data():
    data = request.get_data(as_text=True)
    interpretation = process_patient_data(data)
    return jsonify({'interpretation': interpretation})

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
