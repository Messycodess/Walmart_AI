# app.py (MODIFIED for comprehensive dashboard data)

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import joblib
import numpy as np
import pandas as pd
import os
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError # Import for database errors

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db' # Using the same database file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ----------------------------- Database Models -----------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

# NEW/MODIFIED: ProductPrediction Model to store all products with pre-calculated predictions
class ProductPrediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Assuming 'Product ID' or similar is in your dataset for unique identification
    # If not, you might need to add a unique identifier or use a combination of fields
    product_name = db.Column(db.String(255), nullable=True) # Add a product name if available in dataset
    brand_score = db.Column(db.Float, nullable=False)
    cost_price = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    days_to_expire = db.Column(db.Integer, nullable=False)
    demand_factor = db.Column(db.Float, nullable=False)
    quantity_left = db.Column(db.Integer, nullable=False)
    predicted_discount = db.Column(db.Float, nullable=False)
    # Add other columns from your dataset if you want them displayed/searchable

# ----------------------------- Load Models and Dataset Once -----------------------------
model = None
scaler = None
full_dataset_df = None # To store the loaded dataset

try:
    model = joblib.load("xgb_model.pkl")
    scaler = joblib.load("scaler.pkl")
    full_dataset_df = pd.read_csv("large_smart_sustainability_dataset.csv")
    print("Models and dataset loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading files: {e}. Ensure 'xgb_model.pkl', 'scaler.pkl', and 'large_smart_sustainability_dataset.csv' are in the same directory as app.py")
except Exception as e:
    print(f"An unexpected error occurred during model/dataset loading: {e}")


# ----------------------------- Feature List -----------------------------
features = [
    "Brand Score", "Cost Price (cp)", "Selling Price (sp)",
    "Days to Expire", "Demand Factor", "Quantity Left"
]
target = "Discount (%)" # The target column in your dataset (if it exists)

# ----------------------------- Utility: Authenticate User -----------------------------
def authenticate(username, password):
    user = User.query.filter_by(username=username).first()
    return user and check_password_hash(user.password_hash, password)

def get_current_user(username):
    return User.query.filter_by(username=username).first()

# ----------------------------- Pre-calculate and Populate Database -----------------------------
def populate_product_predictions():
    if full_dataset_df is None or model is None or scaler is None:
        print("Cannot populate predictions: Models or dataset not loaded.")
        return

    # Clear existing data to avoid duplicates on restart (for development)
    # In production, you might want a more sophisticated update/insert logic
    with app.app_context():
        db.session.query(ProductPrediction).delete()
        db.session.commit()
        print("Cleared existing ProductPrediction data.")

        # Prepare data for prediction
        df_to_predict = full_dataset_df.dropna(subset=features)
        X_predict = df_to_predict[features]
        X_scaled_predict = scaler.transform(X_predict)
        predictions = model.predict(X_scaled_predict)

        # Add predictions to the DataFrame
        df_to_predict['Predicted Discount (%)'] = np.round(predictions, 2)

        # Populate the database
        for index, row in df_to_predict.iterrows():
            # Assuming 'Product Name' column exists in your CSV, otherwise adjust
            product_name = row.get('Product Name', f"Product_{index+1}") # Fallback if no 'Product Name'
            
            new_product_prediction = ProductPrediction(
                product_name=product_name,
                brand_score=row["Brand Score"],
                cost_price=row["Cost Price (cp)"],
                selling_price=row["Selling Price (sp)"],
                days_to_expire=row["Days to Expire"],
                demand_factor=row["Demand Factor"],
                quantity_left=row["Quantity Left"],
                predicted_discount=row["Predicted Discount (%)"]
            )
            db.session.add(new_product_prediction)
            try:
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                print(f"Skipping duplicate product: {product_name}")
            except Exception as e:
                db.session.rollback()
                print(f"Error adding product {product_name}: {e}")
        print(f"Populated {db.session.query(ProductPrediction).count()} product predictions.")


# ----------------------------- Routes -----------------------------

# 🏠 Home
@app.route("/", methods=["GET"])
def home():
    return "Walmart Sparkathon API. Routes: /register, /login, /predict, /dashboard_data"

# 👤 Register (No changes needed here)
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
        app.logger.error(f"Registration error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# 🔑 Login (No changes needed here)
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
        app.logger.error(f"Login error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# 📈 Predict Discount (Keep for individual predictions, but won't populate dashboard)
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not authenticate(username, password):
            return jsonify({"error": "Unauthorized"}), 401

        missing = [f for f in features if f not in data]
        if missing:
            return jsonify({"error": f"Missing features: {', '.join(missing)}"}), 400

        values = [data[f] for f in features]
        input_df = pd.DataFrame([values], columns=features)

        if scaler is None or model is None:
            return jsonify({"error": "Prediction models not loaded on server."}), 500

        X_scaled = scaler.transform(input_df)
        prediction = float(round(model.predict(X_scaled)[0], 2))

        # We are NOT saving individual predictions to the database here for the dashboard.
        # The dashboard will be populated from pre-calculated data.
        # If you still want to save *individual* predictions made via this route,
        # you would need a separate table for 'UserSpecificPredictions' or similar.

        return jsonify({"predicted_discount": prediction})

    except Exception as e:
        app.logger.error(f"Individual prediction error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# NEW: Route to get all product data with pre-calculated predictions for the dashboard
@app.route("/dashboard_data", methods=["POST"]) # Using POST for authenticated requests
def dashboard_data():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not authenticate(username, password):
            return jsonify({"error": "Unauthorized"}), 401

        # Fetch all product predictions
        all_products = ProductPrediction.query.all()

        # Format data for frontend
        dashboard_items = []
        for product in all_products:
            dashboard_items.append({
                "id": product.id,
                "Product Name": product.product_name,
                "Brand Score": product.brand_score,
                "Cost Price (cp)": product.cost_price,
                "Selling Price (sp)": product.selling_price,
                "Days to Expire": product.days_to_expire,
                "Demand Factor": product.demand_factor,
                "Quantity Left": product.quantity_left,
                "Predicted Discount (%)": product.predicted_discount
            })

        return jsonify(dashboard_items)

    except Exception as e:
        app.logger.error(f"Dashboard data fetch error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# ----------------------------- Run App -----------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all() # Create User and ProductPrediction tables
        # Populate product predictions only if the table is empty
        if db.session.query(ProductPrediction).count() == 0:
            print("Populating product predictions for the first time...")
            populate_product_predictions()
        else:
            print("ProductPrediction table already populated.")
    app.run(debug=True)