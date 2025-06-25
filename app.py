from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

# Initialize the Flask app
app = Flask(__name__)

# Load the trained discount model and scaler
model = joblib.load("xgb_model.pkl")  # Discount prediction model
scaler = joblib.load("scaler.pkl")

# NOTE: Skipping loading forecast_model and inventory_model
# since the files don't exist yet
# forecast_model = joblib.load("forecast_model.pkl")
# inventory_model = joblib.load("inventory_model.pkl")

# Expected features for discount prediction
features = [
    "Brand Score", "Cost Price (cp)", "Selling Price (sp)",
    "Days to Expire", "Demand Factor", "Quantity Left"
]

# -----------------------------
# Discount Prediction Route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Validate input
        missing = [f for f in features if f not in data]
        if missing:
            return jsonify({"error": f"Missing features: {', '.join(missing)}"}), 400

        values = [data[f] for f in features]
        input_df = pd.DataFrame([values], columns=features)

        # Scale and predict
        X_scaled = scaler.transform(input_df)
        prediction = model.predict(X_scaled)

        result = float(round(prediction[0], 2))
        return jsonify({"predicted_discount": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Forecast Route (Mock Response)
@app.route("/forecast", methods=["POST"])
def forecast():
    try:
        data = request.get_json()
        # Return a dummy forecast value
        return jsonify({"predicted_forecast": 123.45})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Inventory Route (Mock Response)
@app.route("/inventory", methods=["POST"])
def inventory():
    try:
        data = request.get_json()
        # Return a dummy inventory suggestion
        return jsonify({"recommended_inventory": 5000})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Home Route
@app.route("/", methods=["GET"])
def home():
    return "Smart Discount Prediction API. Endpoints: POST /predict, POST /forecast, POST /inventory"

# -----------------------------
# Run the app
if __name__ == "__main__":
    app.run(debug=True)
