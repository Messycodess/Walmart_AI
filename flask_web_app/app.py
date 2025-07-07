# app.py (MODIFIED for comprehensive dashboard data)

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import joblib
import numpy as np
import pandas as pd
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ----------------- Models -----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

class ProductPrediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(255), nullable=True)
    brand_score = db.Column(db.Float, nullable=False)
    cost_price = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    days_to_expire = db.Column(db.Integer, nullable=False)
    demand_factor = db.Column(db.Float, nullable=False)
    quantity_left = db.Column(db.Integer, nullable=False)
    predicted_discount = db.Column(db.Float, nullable=False)

# ----------------- Load ML Models & Data -----------------
model = scaler = full_dataset_df = None
try:
    model = joblib.load("xgb_model.pkl")
    scaler = joblib.load("scaler.pkl")
    full_dataset_df = pd.read_csv("large_smart_sustainability_dataset.csv")
    print("✅ Models and dataset loaded.")
except Exception as e:
    print(f"❌ Load error: {e}")

features = [
    "Brand Score", "Cost Price (cp)", "Selling Price (sp)",
    "Days to Expire", "Demand Factor", "Quantity Left"
]

# ----------------- Auth Helpers -----------------
def authenticate(username, password):
    user = User.query.filter_by(username=username).first()
    return user and check_password_hash(user.password_hash, password)

# ----------------- Populate DB -----------------
def populate_product_predictions():
    if full_dataset_df is None or model is None or scaler is None:
        return
    with app.app_context():
        db.session.query(ProductPrediction).delete()
        db.session.commit()
        df = full_dataset_df.dropna(subset=features)
        X = scaler.transform(df[features])
        df['Predicted Discount (%)'] = np.round(model.predict(X), 2)
        for i, row in df.iterrows():
            db.session.add(ProductPrediction(
                product_name=row.get('Product Name', f"Product_{i+1}"),
                brand_score=row["Brand Score"],
                cost_price=row["Cost Price (cp)"],
                selling_price=row["Selling Price (sp)"],
                days_to_expire=row["Days to Expire"],
                demand_factor=row["Demand Factor"],
                quantity_left=row["Quantity Left"],
                predicted_discount=row["Predicted Discount (%)"]
            ))
        db.session.commit()

# ----------------- Routes -----------------
@app.route("/", methods=["GET"])
def home():
    return "Walmart Sparkathon API Running. Endpoints: /register, /login, /predict, /dashboard_data, /charts_data"

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username, password = data.get("username"), data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 409
    new_user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if authenticate(data.get("username"), data.get("password")):
        return jsonify({"message": f"Welcome, {data.get('username')}!"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not authenticate(data.get("username"), data.get("password")):
        return jsonify({"error": "Unauthorized"}), 401
    if not all(f in data for f in features):
        return jsonify({"error": "Missing features"}), 400
    input_df = pd.DataFrame([[data[f] for f in features]], columns=features)
    prediction = round(model.predict(scaler.transform(input_df))[0], 2)
    return jsonify({"predicted_discount": prediction})

@app.route("/dashboard_data", methods=["POST"])
def dashboard_data():
    data = request.get_json()
    if not authenticate(data.get("username"), data.get("password")):
        return jsonify({"error": "Unauthorized"}), 401
    filters = data.get("filters", {})
    query = ProductPrediction.query
    if "product_name" in filters:
        query = query.filter(ProductPrediction.product_name.ilike(f"%{filters['product_name']}%"))
    if "brand_score_min" in filters:
        query = query.filter(ProductPrediction.brand_score >= float(filters["brand_score_min"]))
    if "brand_score_max" in filters:
        query = query.filter(ProductPrediction.brand_score <= float(filters["brand_score_max"]))
    if "quantity_min" in filters:
        query = query.filter(ProductPrediction.quantity_left >= int(filters["quantity_min"]))
    if "quantity_max" in filters:
        query = query.filter(ProductPrediction.quantity_left <= int(filters["quantity_max"]))
    results = query.all()
    return jsonify([{
        "id": p.id,
        "Product Name": p.product_name,
        "Brand Score": p.brand_score,
        "Cost Price (cp)": p.cost_price,
        "Selling Price (sp)": p.selling_price,
        "Days to Expire": p.days_to_expire,
        "Demand Factor": p.demand_factor,
        "Quantity Left": p.quantity_left,
        "Predicted Discount (%)": p.predicted_discount
    } for p in results])

@app.route("/charts_data", methods=["POST"])
def charts_data():
    data = request.get_json()
    if not authenticate(data.get("username"), data.get("password")):
        return jsonify({"error": "Unauthorized"}), 401
    filters = data.get("filters", {})
    query = ProductPrediction.query
    if "product_name" in filters:
        query = query.filter(ProductPrediction.product_name.ilike(f"%{filters['product_name']}%"))
    if "brand_score_min" in filters:
        query = query.filter(ProductPrediction.brand_score >= float(filters["brand_score_min"]))
    if "brand_score_max" in filters:
        query = query.filter(ProductPrediction.brand_score <= float(filters["brand_score_max"]))
    if "quantity_min" in filters:
        query = query.filter(ProductPrediction.quantity_left >= int(filters["quantity_min"]))
    if "quantity_max" in filters:
        query = query.filter(ProductPrediction.quantity_left <= int(filters["quantity_max"]))
    results = query.all()
    return jsonify([
        {
            "Product Name": p.product_name,
            "Brand Score": p.brand_score,
            "Quantity Left": p.quantity_left,
            "Predicted Discount (%)": p.predicted_discount
        }
        for p in results
    ])

# ----------------- App Entry -----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        if db.session.query(ProductPrediction).count() == 0:
            populate_product_predictions()
    app.run(debug=True)
