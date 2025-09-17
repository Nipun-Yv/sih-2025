'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Expand, Shrink, Glasses } from 'lucide-react';

const getVideoUrlBySlug = (slug) => {
  const CLOUDFLARE_VIDEO_BASE_URL = 'https://pub-5d28c5ce084241daa5f2350e6f994323.r2.dev';

  switch (slug) {
    case 'india-gate':
      return `${CLOUDFLARE_VIDEO_BASE_URL}/india-gate-360.mp4`;
    case 'qutub-minar':
      return `${CLOUDFLARE_VIDEO_BASE_URL}/qutub-minar-360.mp4`;
    default:
      return `${CLOUDFLARE_VIDEO_BASE_URL}/vrtest.mp4`;
  }
};

export default function VRPlayer({ slug }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const videoRef = useRef(null);

  const cameraRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const sphereRef = useRef();
  const isDraggingRef = useRef(false);
  const previousMousePosRef = useRef({ x: 0, y: 0 });
  const lonRef = useRef(0);
  const latRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);

  useEffect(() => {
    const checkVRSupport = async () => {
      if (navigator.xr && await navigator.xr.isSessionSupported('immersive-vr')) {
        setIsVRSupported(true);
      }
    };
    checkVRSupport();
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    
    sceneRef.current = new THREE.Scene();
    
    cameraRef.current = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 1, 1100);
    
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current.xr.enabled = true;
    currentMount.appendChild(rendererRef.current.domElement);
    
    const video = document.createElement('video');
    video.src = getVideoUrlBySlug(slug);
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    
    const texture = new THREE.VideoTexture(video);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    sphereRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(sphereRef.current);
    
    const animate = () => {
      if (!rendererRef.current) return;
      
      if (!rendererRef.current.xr.isPresenting) {
          const lat = Math.max(-85, Math.min(85, latRef.current));
          const phi = THREE.MathUtils.degToRad(90 - lat);
          const theta = THREE.MathUtils.degToRad(lonRef.current);

          const target = new THREE.Vector3(
              500 * Math.sin(phi) * Math.cos(theta),
              500 * Math.cos(phi),
              500 * Math.sin(phi) * Math.sin(theta)
          );
          cameraRef.current.lookAt(target);
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    rendererRef.current.setAnimationLoop(animate);
    
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && currentMount) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };

    const handleTimeUpdate = () => {
        setTime({ current: video.currentTime, duration: video.duration || 0 });
    };

    window.addEventListener('resize', handleResize);
    video.addEventListener('timeupdate', handleTimeUpdate);
    const onLoadedData = () => setTime({ current: video.currentTime, duration: video.duration });
    video.addEventListener('loadeddata', onLoadedData);

    return () => {
      rendererRef.current?.setAnimationLoop(null);
      if (rendererRef.current?.xr.getSession()) {
        rendererRef.current.xr.getSession().end();
      }
      if (rendererRef.current?.domElement && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', onLoadedData);
      window.removeEventListener('resize', handleResize);
    };
  }, [slug]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current?.src) {
        if (videoRef.current.paused) {
            videoRef.current.play().catch(err => console.error("Video play failed:", err));
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    if (videoRef.current) {
        const progressContainer = e.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const elem = playerRef.current;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
  }, []);
  
  const handleEnterVR = useCallback(async () => {
    if (isVRSupported && rendererRef.current) {
      try {
        const session = await navigator.xr.requestSession('immersive-vr');
        await rendererRef.current.xr.setSession(session);
        if (videoRef.current?.paused) {
          handlePlayPause();
        }
      } catch (err) {
        console.error("Failed to start VR session:", err);
      }
    }
  }, [isVRSupported, handlePlayPause]);
  
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleDragStart = (clientX, clientY) => {
    if (rendererRef.current?.xr.isPresenting) return;
    isDraggingRef.current = true;
    previousMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX, clientY) => {
    if (!isDraggingRef.current || rendererRef.current?.xr.isPresenting) return;
    const deltaX = clientX - previousMousePosRef.current.x;
    const deltaY = clientY - previousMousePosRef.current.y;
    lonRef.current -= deltaX * 0.1;
    latRef.current += deltaY * 0.1;
    previousMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const progressPercentage = time.duration > 0 ? (time.current / time.duration) * 100 : 0;

  return (
    <div
        ref={playerRef}
        className="w-full h-screen bg-black relative select-none"
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
    >
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-2xl">
        <div className="bg-black/60 backdrop-blur-md rounded-full p-2 flex items-center gap-4 text-white">
            <button onClick={handlePlayPause} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <div className="flex-grow flex items-center gap-2">
                <div onClick={handleSeek} className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group">
                    <div className="h-full bg-red-500 rounded-full relative" style={{ width: `${progressPercentage}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                <span className="text-xs font-mono w-24 text-center">
                    {formatTime(time.current)} / {formatTime(time.duration)}
                </span>
            </div>

            <button onClick={handleMuteToggle} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            {/* VR button always visible */}
            <button
              onClick={isVRSupported ? handleEnterVR : undefined}
              disabled={!isVRSupported}
              className={`p-2 rounded-full transition-colors ${
                isVRSupported
                  ? "hover:bg-white/20 text-white"
                  : "opacity-40 cursor-not-allowed"
              }`}
              title={isVRSupported ? "Enter VR" : "VR not supported"}
            >
              <Glasses size={24} />
            </button>

            <button onClick={handleFullscreen} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              {isFullscreen ? <Shrink size={24} /> : <Expand size={24} />}
            </button>
        </div>
      </div>
    </div>
  );
}
