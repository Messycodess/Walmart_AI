from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import joblib
import numpy as np
import pandas as pd
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ----------------------------- Database Model -----------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

# ----------------------------- Load Models Once -----------------------------
model = joblib.load("xgb_model.pkl")
scaler = joblib.load("scaler.pkl")

# ----------------------------- Feature List -----------------------------
features = [
    "Brand Score", "Cost Price (cp)", "Selling Price (sp)",
    "Days to Expire", "Demand Factor", "Quantity Left"
]

# ----------------------------- Utility: Authenticate User -----------------------------
def authenticate(username, password):
    user = User.query.filter_by(username=username).first()
    return user and check_password_hash(user.password_hash, password)

# ----------------------------- Routes -----------------------------

# 🏠 Home
@app.route("/", methods=["GET"])
def home():
    return "Walmart Sparkathon API. Routes: /register, /login, /predict, /forecast, /inventory"

# 👤 Register
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "User already exists"}), 409

        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, password_hash=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔑 Login
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if authenticate(username, password):
            return jsonify({"message": f"Welcome, {username}!"}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📈 Predict Discount
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Authentication check
        if not authenticate(data.get("username"), data.get("password")):
            return jsonify({"error": "Unauthorized"}), 401

        missing = [f for f in features if f not in data]
        if missing:
            return jsonify({"error": f"Missing features: {', '.join(missing)}"}), 400

        values = [data[f] for f in features]
        input_df = pd.DataFrame([values], columns=features)
        X_scaled = scaler.transform(input_df)
        prediction = float(round(model.predict(X_scaled)[0], 2))

        return jsonify({"predicted_discount": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔮 Forecast (Mock)
@app.route("/forecast", methods=["POST"])
def forecast():
    try:
        data = request.get_json()
        if not authenticate(data.get("username"), data.get("password")):
            return jsonify({"error": "Unauthorized"}), 401
        return jsonify({"predicted_forecast": 123.45})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🧾 Inventory Suggestion (Mock)
@app.route("/inventory", methods=["POST"])
def inventory():
    try:
        data = request.get_json()
        if not authenticate(data.get("username"), data.get("password")):
            return jsonify({"error": "Unauthorized"}), 401
        return jsonify({"recommended_inventory": 5000})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------- Run App -----------------------------
if __name__ == "__main__":
    if not os.path.exists("users.db"):
        with app.app_context():
            db.create_all()
    app.run(debug=True)
