from flask import Flask, send_from_directory
from flask_cors import CORS
from models import init_app
from routes import api
from flask_pymongo import PyMongo
import os

app = Flask(__name__, static_folder='../frontend')

# Configuration
app.config["MONGO_URI"] = os.getenv('MONGO_URI', "mongodb://admin:password@localhost:27017/nosqlproject?authSource=admin")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize MongoDB connection
try:
    init_app(app)
    mongo = PyMongo(app)
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5000", "http://127.0.0.1:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# Register Blueprint
app.register_blueprint(api, url_prefix='/api')

# Serve frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)