'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Expand, Shrink, Glasses, RotateCcw } from 'lucide-react';

interface Asset {
  _id: string;
  name: string;
  link: string;
}

interface VRPlayerProps {
  slug: string;
}
    
export default function VRPlayer({ slug }: VRPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();

  const isDraggingRef = useRef(false);
  const previousMousePosRef = useRef({ x: 0, y: 0 });
  const lonRef = useRef(0);
  const latRef = useRef(0);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCardboardMode, setIsCardboardMode] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const [deviceOrientationEnabled, setDeviceOrientationEnabled] = useState(false);
  
  const deviceOrientationRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const initialOrientationRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const orientationInitializedRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile && window.innerHeight > window.innerWidth) {
        setShowRotatePrompt(true);
      } else {
        setShowRotatePrompt(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkMobile, 100);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha;
      const beta = event.beta; 
      const gamma = event.gamma;
      
      deviceOrientationRef.current = { 
        alpha: alpha || 0, 
        beta: beta || 0, 
        gamma: gamma || 0 
      };
      
      if (!isCardboardMode || !isMobile) {
        return;
      }
      
      if (!orientationInitializedRef.current && (alpha !== null || beta !== null || gamma !== null)) {
        initialOrientationRef.current = { 
          alpha: alpha || 0, 
          beta: beta || 0, 
          gamma: gamma || 0 
        };
        orientationInitializedRef.current = true;
        return;
      }
      
      if (!orientationInitializedRef.current) return;
      
      let deltaAlpha = (alpha || 0) - initialOrientationRef.current.alpha;
      let deltaBeta = (beta || 0) - initialOrientationRef.current.beta;
      
      if (deltaAlpha > 180) deltaAlpha -= 360;
      if (deltaAlpha < -180) deltaAlpha += 360;
      
      lonRef.current = -deltaAlpha * 2.0;
      latRef.current = Math.max(-85, Math.min(85, deltaBeta * 2.0));
    };

    const handleDeviceMotion = (event: DeviceMotionEvent) => {};
    
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true, once: true });
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [isCardboardMode, isMobile]);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/links');
        const result = await response.json();
        if (!result.success) throw new Error("API fetch failed");

        const allAssets: Asset[] = result.data;
        const vrVideos = allAssets.filter(
          asset => !asset.name.endsWith('M') && !asset.name.endsWith('T')
        );

        const searchKey = slug.split('-')[0].toLowerCase();
        
        let targetVideo = vrVideos.find(video => video.name === searchKey);

        if (!targetVideo) {
          targetVideo = vrVideos.find(video => video.name === 'netarhat');
        }

        if (targetVideo) {
          setVideoUrl(targetVideo.link);
        } else {
          throw new Error(`Could not find a video for "${slug}" or the default "netarhat" video.`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideoUrl();
  }, [slug]);

  useEffect(() => {
    if (!videoUrl || !mountRef.current) return;

    const currentMount = mountRef.current;
    
    sceneRef.current = new THREE.Scene();
    const aspect = isCardboardMode ? (currentMount.clientWidth / 2) / currentMount.clientHeight : currentMount.clientWidth / currentMount.clientHeight;
    cameraRef.current = new THREE.PerspectiveCamera(75, aspect, 1, 1100);
    
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current.xr.enabled = true;
    currentMount.appendChild(rendererRef.current.domElement);
    
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    
    const texture = new THREE.VideoTexture(video);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    sceneRef.current.add(sphere);
    
    let leftCamera, rightCamera;
    
    if (isCardboardMode) {
      leftCamera = cameraRef.current.clone();
      rightCamera = cameraRef.current.clone();
      leftCamera.position.x = -0.032;
      rightCamera.position.x = 0.032;
    }
    
    const animate = () => {
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
      
      if (!rendererRef.current.xr.isPresenting) {
        const lat = Math.max(-85, Math.min(85, latRef.current));
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lonRef.current);
        const target = new THREE.Vector3(
          500 * Math.sin(phi) * Math.cos(theta),
          500 * Math.cos(phi),
          500 * Math.sin(phi) * Math.sin(theta)
        );
        
        if (isCardboardMode && leftCamera && rightCamera) {
          leftCamera.lookAt(target);
          rightCamera.lookAt(target);
          
          const width = currentMount.clientWidth;
          const height = currentMount.clientHeight;
          
          rendererRef.current.setScissorTest(true);
          
          rendererRef.current.setScissor(0, 0, width / 2, height);
          rendererRef.current.setViewport(0, 0, width / 2, height);
          rendererRef.current.render(sceneRef.current, leftCamera);
          
          rendererRef.current.setScissor(width / 2, 0, width / 2, height);
          rendererRef.current.setViewport(width / 2, 0, width / 2, height);
          rendererRef.current.render(sceneRef.current, rightCamera);
          
          rendererRef.current.setScissorTest(false);
        } else {
          cameraRef.current.lookAt(target);
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      } else {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    rendererRef.current.setAnimationLoop(animate);
    
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && currentMount) {
        const newAspect = isCardboardMode ? (currentMount.clientWidth / 2) / currentMount.clientHeight : currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.aspect = newAspect;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        
        if (isCardboardMode && leftCamera && rightCamera) {
          leftCamera.aspect = newAspect;
          rightCamera.aspect = newAspect;
          leftCamera.updateProjectionMatrix();
          rightCamera.updateProjectionMatrix();
        }
      }
    };

    const handleTimeUpdate = () => {
      if (video) {
        setTime({ current: video.currentTime, duration: video.duration || 0 });
      }
    };

    const onLoadedData = () => {
      if (video) {
        setTime({ current: video.currentTime, duration: video.duration });
      }
    };

    window.addEventListener('resize', handleResize);
    video.addEventListener('timeupdate', handleTimeUpdate);
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
  }, [videoUrl, isCardboardMode]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current?.src) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
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

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const progressContainer = e.currentTarget;
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const elem = playerRef.current;
    if (!document.fullscreenElement && elem) {
      if (isMobile) {
        screen.orientation?.lock('landscape').catch(() => {});
      }
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
      if (isMobile) {
        screen.orientation?.unlock();
      }
    }
  }, [isMobile]);
  
  const handleEnterVR = useCallback(async () => {
    if (navigator.xr && await navigator.xr.isSessionSupported('immersive-vr')) {
      try {
        const session = await (navigator as any).xr.requestSession('immersive-vr');
        await rendererRef.current?.xr.setSession(session);
        if (videoRef.current?.paused) {
          handlePlayPause();
        }
      } catch (err) {
        handleCardboardMode();
      }
    } else {
      handleCardboardMode();
    }
  }, []);

  const handleCardboardMode = useCallback(() => {
    const toggleMode = async () => {
      const newCardboardMode = !isCardboardMode;
      
      if (newCardboardMode && isMobile) {
        setDeviceOrientationEnabled(true);
        
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          try {
            const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
            
            if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
              const motionPermission = await (DeviceMotionEvent as any).requestPermission();
            }
            
            if (orientationPermission !== 'granted') {
              alert('❌ Device orientation permission denied. VR mode requires sensor access.');
              setDeviceOrientationEnabled(false);
              return;
            }
          } catch (error) {
            alert('Failed to get sensor permissions. Make sure you\'re using HTTPS.');
            setDeviceOrientationEnabled(false);
            return;
          }
        }
      } else {
        setDeviceOrientationEnabled(false);
      }
      
      setIsCardboardMode(newCardboardMode);
      
      if (newCardboardMode && !isFullscreen) {
        setTimeout(() => handleFullscreen(), 100);
      }
      
      orientationInitializedRef.current = false;
      initialOrientationRef.current = { alpha: 0, beta: 0, gamma: 0 };
      if (!newCardboardMode) {
        lonRef.current = 0;
        latRef.current = 0;
      }
    };
    
    toggleMode();
  }, [isCardboardMode, isFullscreen, handleFullscreen, isMobile]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (rendererRef.current?.xr.isPresenting) return;
    if (isCardboardMode && isMobile) return;
    isDraggingRef.current = true;
    previousMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || rendererRef.current?.xr.isPresenting) return;
    if (isCardboardMode && isMobile) return;
    const deltaX = clientX - previousMousePosRef.current.x;
    const deltaY = clientY - previousMousePosRef.current.y;
    lonRef.current -= deltaX * 0.1;
    latRef.current += deltaY * 0.1;
    previousMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = time.duration > 0 ? (time.current / time.duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-orange-950 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Loading VR Environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-orange-950 to-background flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-2 text-orange-400">Failed to Load Video</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

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
      
      {showRotatePrompt && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center text-white p-8">
            <RotateCcw size={48} className="mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2">Rotate Your Device</h3>
            <p className="text-gray-300">Please rotate your device to landscape mode for the best VR experience</p>
          </div>
        </div>
      )}

      {isCardboardMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
          {isMobile ? `Move your phone | Lon: ${lonRef.current.toFixed(1)}° Lat: ${latRef.current.toFixed(1)}°` : "Use mouse to look around"}
        </div>
      )}

      {isCardboardMode && (
        <div className="absolute top-1/2 left-1/2 w-0.5 h-full bg-black -translate-x-1/2 -translate-y-1/2 z-10"></div>
      )}
      
      <div className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-2xl transition-opacity duration-300 ${isCardboardMode ? 'opacity-30 hover:opacity-100' : ''}`}>
        <div className="bg-black/60 backdrop-blur-md rounded-full p-2 flex items-center gap-4 text-white border border-orange-500/50">
          <button 
            onClick={handlePlayPause} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div className="flex-grow flex items-center gap-2">
            <div 
              onClick={handleSeek} 
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group"
            >
              <div 
                className="h-full bg-red-500 rounded-full relative" 
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs font-mono w-24 text-center">
              {formatTime(time.current)} / {formatTime(time.duration)}
            </span>
          </div>

          <button 
            onClick={handleMuteToggle} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button
            onClick={handleEnterVR}
            className={`p-2 rounded-full transition-colors ${
              isCardboardMode ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-white/20"
            } text-white`}
            title="VR Mode"
          >
            <Glasses size={24} />
          </button>

          <button 
            onClick={handleFullscreen} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {isFullscreen ? <Shrink size={24} /> : <Expand size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}
