import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Grid, Paper, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import DrawCanvas from "./components";
const MediaStream = ({ mediaId, onDelete, onClick, frameUrl, showDelete, type }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 8 }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="subtitle1" align="center" gutterBottom>
          {type} {mediaId}
        </Typography>
        <Box position="relative" onClick={() => onClick(mediaId, type)} sx={{ cursor: 'pointer', borderRadius: 4, overflow: 'hidden' }}>
          <img
            src={frameUrl}
            alt={`${type} ${mediaId}`}
            style={{ width: '100%', borderRadius: 4 }}
          />
        </Box>
        {showDelete && (
          <Button variant="outlined" color="error" onClick={() => onDelete(mediaId, type)} fullWidth sx={{ mt: 1 }}>
            Delete {type}
          </Button>
        )}
      </Box>
    </Paper>
  );
};


const App = () => {
  const [cameras, setCameras] = useState([]);
  const [videos, setVideos] = useState([]);
  const [cameraId, setCameraId] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoPath, setVideoPath] = useState('');
  const [addError, setAddError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState({ id: null, type: null });
  const [loading, setLoading] = useState(false);

  const handleAddCamera = useCallback(async () => {
    if (!cameraId || !rtspUrl) {
      setAddError('Both Camera ID and RTSP URL are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/add_camera', {
        camera_id: parseInt(cameraId),
        rtsp_url: rtspUrl,
      });

      const response = await axios.get(`http://localhost:5000/single_frame/${cameraId}`, { responseType: 'blob' });
      const frameUrl = URL.createObjectURL(new Blob([response.data], { type: 'image/jpeg' }));

      setCameras([...cameras, { mediaId: parseInt(cameraId), rtspUrl, frameUrl }]);
      setCameraId('');
      setRtspUrl('');
      setAddError('');
    } catch (error) {
      console.error('Error adding camera:', error);
      setAddError('Error adding camera');
    } finally {
      setLoading(false);
    }
  }, [cameraId, rtspUrl, cameras]);

  const handleAddVideo = useCallback(async () => {
    if (!videoId || !videoPath) {
      setAddError('Both Video ID and Video Path are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/add_video', {
        video_id: parseInt(videoId),
        video_path: videoPath,
      });

      const response = await axios.get(`http://localhost:5000/single_frame_video/${videoId}`, { responseType: 'blob' });
      const frameUrl = URL.createObjectURL(new Blob([response.data], { type: 'image/jpeg' }));

      setVideos([...videos, { mediaId: parseInt(videoId), videoPath, frameUrl }]);
      setVideoId('');
      setVideoPath('');
      setAddError('');
    } catch (error) {
      console.error('Error adding video:', error);
      setAddError('Error adding video');
    } finally {
      setLoading(false);
    }
  }, [videoId, videoPath, videos]);

  const handleDeleteMedia = useCallback(async (deletedMediaId, type) => {
    setLoading(true);
    try {
      if (type === 'Camera') {
        await axios.delete(`http://localhost:5000/delete_camera/${deletedMediaId}`);
        setCameras(cameras.filter((camera) => camera.mediaId !== deletedMediaId));
      } else {
        await axios.delete(`http://localhost:5000/delete_video/${deletedMediaId}`);
        setVideos(videos.filter((video) => video.mediaId !== deletedMediaId));
      }
    } catch (error) {
      console.error(`Error deleting ${type.toLowerCase()}:`, error);
    } finally {
      setLoading(false);
    }
  }, [cameras, videos]);

  const handleMediaClick = useCallback((mediaId, type) => {
    setSelectedMedia({ id: mediaId, type });
  }, []);

  const getVideoSrc = () => {
    if (selectedMedia.type === 'Camera') {
      return `http://localhost:5000/camera/${selectedMedia.id}`;
    } else if (selectedMedia.type === 'Video') {
      return `http://localhost:5000/video/${selectedMedia.id}`;
    }
    return '';
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2, flexDirection: 'column', height: '100vh' }}>
      <Typography variant="h5" gutterBottom>
        IP Camera and Video Dashboard
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 8 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Camera ID"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="RTSP URL"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" color="primary" onClick={handleAddCamera} fullWidth>
              {loading ? <CircularProgress size={24} /> : 'Add Camera'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Video ID"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Video Path"
              value={videoPath}
              onChange={(e) => setVideoPath(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{ sx: { borderRadius: 4 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" color="primary" onClick={handleAddVideo} fullWidth>
              {loading ? <CircularProgress size={24} /> : 'Add Video'}
            </Button>
          </Grid>
        </Grid>
        {addError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {addError}
          </Typography>
        )}
      </Paper>
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid item xs={4}>
            <Box sx={{ backgroundColor: '#f0f0f0', height: '140%', borderRadius: 2, overflow: 'auto', padding: 3 }}>
              <Grid container spacing={3} sx={{ height: '80%' }}>
                {cameras.map((camera) => (
                  <Grid item xs={6} key={camera.mediaId} sx={{ height: '50%' }}>
                    <MediaStream
                      mediaId={camera.mediaId}
                      onDelete={handleDeleteMedia}
                      onClick={handleMediaClick}
                      frameUrl={camera.frameUrl}
                      showDelete={true}
                      type="Camera"
                    />
                  </Grid>
                ))}
                {videos.map((video) => (
                  <Grid item xs={6} key={video.mediaId} sx={{ height: '50%' }}>
                    <MediaStream
                      mediaId={video.mediaId}
                      onDelete={handleDeleteMedia}
                      onClick={handleMediaClick}
                      frameUrl={video.frameUrl}
                      showDelete={true}
                      type="Video"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#f0f0f0',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {selectedMedia.id && (
                <video width="100%" height="100%" controls autoPlay>
                  <source src={getVideoSrc()} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default App;