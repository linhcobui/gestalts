from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='my-awesome-app/dist')

# Serve React static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Example API route
@app.route('/api/hello')
def hello():
    return {"message": "Hello from backend!"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
