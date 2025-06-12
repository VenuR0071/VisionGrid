import cv2
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import threading

app = Flask(__name__)
CORS(app)

def initialize_database():
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS cameras (camera_id INTEGER PRIMARY KEY, rtsp_url TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS videos (video_id INTEGER PRIMARY KEY, video_path TEXT)''')
    conn.commit()
    conn.close()

# Initialize the database
initialize_database()

def generate_stream(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                continue  # Skip frames that could not be read
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    except Exception as e:
        print(f"Error generating stream: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()

def fetch_single_frame(rtsp_url):
    cap = cv2.VideoCapture(rtsp_url)
    ret, frame = cap.read()
    if not ret:
        return None
    _, buffer = cv2.imencode('.jpg', frame)
    frame = buffer.tobytes()
    cap.release()
    return frame

def generate_video_stream(video_path):
    cap = cv2.VideoCapture(video_path)
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break  # End of video file
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    except Exception as e:
        print(f"Error generating video stream: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()

def fetch_single_video_frame(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video file: {video_path}")
        return None
    
    try:
        ret, frame = cap.read()
        if not ret:
            print(f"Error reading frame from video: {video_path}")
            return None
        
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        return frame
    
    except Exception as e:
        print(f"Error fetching video frame: {e}")
        return None
    
    finally:
        cap.release()

def video_feed(camera_id):
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT rtsp_url FROM cameras WHERE camera_id = ?", (camera_id,))
    result = c.fetchone()
    conn.close()
    if result is None:
        return "Camera not found", 404
    rtsp_url = result[0]
    return Response(generate_stream(rtsp_url), mimetype='multipart/x-mixed-replace; boundary=frame')

def video_file_feed(video_id):
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT video_path FROM videos WHERE video_id = ?", (video_id,))
    result = c.fetchone()
    conn.close()
    if result is None:
        return "Video not found", 404
    video_path = result[0]
    return Response(generate_video_stream(video_path), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/add_camera', methods=['POST'])
def add_camera():
    data = request.json
    if 'camera_id' not in data or 'rtsp_url' not in data:
        return jsonify({"message": "Both camera_id and rtsp_url are required"}), 400
    camera_id = data['camera_id']
    rtsp_url = data['rtsp_url']
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT * FROM cameras WHERE camera_id = ?", (camera_id,))
    result = c.fetchone()
    if result is not None:
        conn.close()
        return jsonify({"message": "Camera already exists"}), 400
    c.execute("INSERT INTO cameras (camera_id, rtsp_url) VALUES (?, ?)", (camera_id, rtsp_url))
    conn.commit()
    conn.close()
    return jsonify({"message": "Camera added successfully"})

@app.route('/add_video', methods=['POST'])
def add_video():
    data = request.json
    if 'video_id' not in data or 'video_path' not in data:
        return jsonify({"message": "Both video_id and video_path are required"}), 400
    video_id = data['video_id']
    video_path = data['video_path']
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT * FROM videos WHERE video_id = ?", (video_id,))
    result = c.fetchone()
    if result is not None:
        conn.close()
        return jsonify({"message": "Video already exists"}), 400
    c.execute("INSERT INTO videos (video_id, video_path) VALUES (?, ?)", (video_id, video_path))
    conn.commit()
    conn.close()
    return jsonify({"message": "Video added successfully"})

@app.route('/delete_camera/<int:camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT * FROM cameras WHERE camera_id = ?", (camera_id,))
    result = c.fetchone()
    if result is None:
        conn.close()
        return jsonify({"message": "Camera not found"}), 404
    c.execute("DELETE FROM cameras WHERE camera_id = ?", (camera_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Camera deleted successfully"})

@app.route('/delete_video/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT * FROM videos WHERE video_id = ?", (video_id,))
    result = c.fetchone()
    if result is None:
        conn.close()
        return jsonify({"message": "Video not found"}), 404
    c.execute("DELETE FROM videos WHERE video_id = ?", (video_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Video deleted successfully"})

@app.route('/single_frame/<int:camera_id>', methods=['GET'])
def single_frame(camera_id):
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT rtsp_url FROM cameras WHERE camera_id = ?", (camera_id,))
    result = c.fetchone()
    conn.close()
    if result is None:
        return "Camera not found", 404
    rtsp_url = result[0]
    frame = fetch_single_frame(rtsp_url)
    if frame is None:
        return "Unable to fetch frame", 500
    return Response(frame, mimetype='image/jpeg')

@app.route('/single_frame_video/<int:video_id>', methods=['GET'])
def single_frame_video(video_id):
    conn = sqlite3.connect('cameras.db')
    c = conn.cursor()
    c.execute("SELECT video_path FROM videos WHERE video_id = ?", (video_id,))
    result = c.fetchone()
    conn.close()
    if result is None:
        return "Video not found", 404
    video_path = result[0]
    frame = fetch_single_video_frame(video_path)
    if frame is None:
        return "Unable to fetch frame", 500
    return Response(frame, mimetype='image/jpeg')

@app.route('/camera/<int:camera_id>')
def camera_feed(camera_id):
    return video_feed(camera_id)

@app.route('/video/<int:video_id>')
def video_feed_route(video_id):
    return video_file_feed(video_id)

if __name__ == '__main__':
    app.run(debug=True)
