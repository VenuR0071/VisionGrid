IP Camera Streaming and Management with YOLO Inference

A comprehensive web application for real-time IP camera streaming, management, and object detection using YOLO-based inference. The application supports Region of Interest (ROI) drawing on video streams, with backend integration for advanced detection and analytics, optimized for dynamic environments. Built with React and Flask, it ensures a seamless user experience and efficient video processing.

Project Goal
The goal of this project is to provide a robust platform for monitoring and analyzing IP camera feeds in real-time. Key features include:

Adding, deleting, and streaming IP cameras via RTSP URLs.
Drawing ROIs on video streams for targeted analysis.
Performing object detection using YOLO-based inference.
Managing camera and video data through a SQLite database.
Providing a user-friendly interface for camera management and visualization.

The application is designed to be scalable and adaptable for use in dynamic environments such as surveillance systems, smart cities, or industrial monitoring.
Tech Stack
Frontend

React: A JavaScript library for building user interfaces, used for creating a dynamic and responsive dashboard.
Material-UI (MUI): A React UI framework for designing modern, responsive, and accessible components.
Axios: A promise-based HTTP client for making API requests to the backend.
react-canvas-polygons: A library for drawing shapes (lines, polygons, rectangles) on a canvas, used for ROI annotation.
Canvas API: Utilized for rendering video streams and drawing ROIs in the browser.

Backend

Flask: A lightweight Python web framework for building the API and handling video streaming.
OpenCV (cv2): A computer vision library for capturing and processing video streams from RTSP URLs.
SQLite: A lightweight database for storing camera and video metadata.
Flask-CORS: A Flask extension to handle Cross-Origin Resource Sharing, enabling communication between the frontend and backend.
YOLO (planned integration): A deep learning model for real-time object detection (not fully implemented in the provided code but part of the project goal).

Other Tools

Python: The primary language for the backend.
JavaScript: The primary language for the frontend.
JSON: Used for configuration (e.g., camera_urls.json) and data exchange.
Node.js and npm: For managing frontend dependencies and running the React development server.

Prerequisites
To run this project locally, ensure you have the following installed:

Python 3.8+: For running the Flask backend.
Node.js 16+ and npm: For running the React frontend.
pip: Python package manager for installing backend dependencies.
Git: For cloning the repository.

Installation

Clone the Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


Set Up the Backend

Navigate to the backend directory (assuming the backend files like serv.py are in the root).
Create a virtual environment and activate it:python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install backend dependencies:pip install flask flask-cors opencv-python sqlite3


Ensure the cameras.db SQLite database is initialized automatically by the backend script (serv.py).


Set Up the Frontend

Navigate to the frontend directory (assuming frontend files like App.js are in a frontend folder; create one if not provided).
Install frontend dependencies:cd frontend
npm install


Install specific dependencies if not already included in package.json:npm install axios @mui/material @emotion/react @emotion/styled react-canvas-polygons


Configure Environment

Ensure camera_urls.json exists in the root directory (it can be empty: {}).
Verify that the backend runs on http://localhost:5000 and the frontend on http://localhost:3000 (default ports).



Running the Project

Start the Backend

In the root directory, with the virtual environment activated, run the Flask server:python serv.py


The backend should be accessible at http://localhost:5000.


Start the Frontend

In the frontend directory, start the React development server:npm start


The frontend should open in your browser at http://localhost:3000.


Access the Application

Open your browser and navigate to http://localhost:3000.
Use the dashboard to add cameras by entering a camera ID and RTSP URL (e.g., rtsp://your-camera-ip:554/stream).
View camera streams, draw ROIs, and manage cameras via the interface.


Features

Camera Management: Add, delete, and view IP cameras using RTSP URLs.
Real-Time Streaming: Stream camera feeds in the browser using MJPEG over HTTP.
ROI Drawing: Draw lines, polygons, and rectangles on video streams for analysis.
Database Integration: Store camera and video metadata in SQLite.
Responsive UI: A clean, modern interface built with Material-UI.
YOLO Integration (Planned): Perform object detection on video streams (requires additional setup).

Usage

Adding a Camera

Enter a unique Camera ID (integer) and a valid RTSP URL in the input fields.
Click "Add Camera" to register the camera.
The camera feed will appear in the left panel as a thumbnail.


Viewing a Stream

Click a camera thumbnail to view its full stream in the right panel.
Use the canvas to draw ROIs (lines, polygons, rectangles) for analysis.


Deleting a Camera

Click the "Delete Camera" button on a camera thumbnail to remove it.


Drawing ROIs

Use the drawing tools (Line, Polygon, Rectangle) to annotate regions of interest.
Adjust brush size and color using the input controls.
Clear the canvas or undo actions as needed.




