'use client';

import { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

interface ModelViewerElement extends HTMLElement {
  loaded: boolean;
  getCameraOrbit(): { theta: number; phi: number; radius: number };
  getCameraTarget(): { x: number; y: number; z: number };
  getFieldOfView(): number;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
}

type ModelUrls = {
  main: string;
  text: string;
};

function getModelUrls(location: string): ModelUrls {
  switch (location) {
    case 'temple':
      return {
        main: 'https://pub-5d28c5ce084241daa5f2350e6f994323.r2.dev/3dt.glb',
        text: 'https://pub-5d28c5ce084241daa5f2350e6f994323.r2.dev/textt.glb',
      };
    // Add more cases for other locations
    default:
      return {
        main: 'https://pub-5d28c5ce084241daa5f2350e6f994323.r2.dev/3dt.glb',
        text: 'https://pub-5d28c5ce084241daa5f2350e6f994323.r2.dev/textt.glb',
      };
  }
}

export default function ARPage({ params }: { params: { location: string } }) {
  const { location } = params;
  const urls = getModelUrls(location);

  const mainModelRef = useRef<ModelViewerElement | null>(null);
  const textModelRef = useRef<ModelViewerElement | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    const mainModel = mainModelRef.current;
    const textModel = textModelRef.current;

    if (!mainModel || !textModel) return;

    let animationFrame: number;

    const syncCameras = () => {
      try {
        if (mainModel.loaded && textModel.loaded) {
          const orbit = mainModel.getCameraOrbit();
          const target = mainModel.getCameraTarget();
          const fov = mainModel.getFieldOfView();

          textModel.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
          textModel.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;
          textModel.fieldOfView = `${fov}deg`;
        }
      } catch (error) {
        console.warn('Camera sync error:', error);
      }
      animationFrame = requestAnimationFrame(syncCameras);
    };

    const handleLoad = () => {
      if (mainModel.loaded && textModel.loaded) {
        syncCameras();
      }
    };

    const handleClick = () => setOverlayVisible((prev) => !prev);

    mainModel.addEventListener('load', handleLoad);
    textModel.addEventListener('load', handleLoad);
    mainModel.addEventListener('click', handleClick);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      mainModel?.removeEventListener('load', handleLoad);
      textModel?.removeEventListener('load', handleLoad);
      mainModel?.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      {/* Main interactive model */}
      <model-viewer
        ref={mainModelRef}
        src={urls.main}
        alt="Main 3D model"
        auto-rotate
        camera-controls
        ar
        className="absolute inset-0 w-full h-full"
      />

      {/* Text overlay model */}
      <model-viewer
        ref={textModelRef}
        src={urls.text}
        alt="Text overlay model"
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
          overlayVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-2 rounded">
        Click to toggle text overlay
      </div>
    </div>
  );
}