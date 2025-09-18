'use client';

import { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

// --- Interfaces and Types ---
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

interface Asset {
  _id: string;
  name: string;
  link: string;
}


function getModelKeysFromName(locationName: string): { mainKey: string; textKey: string } | null {
  if (!locationName || typeof locationName !== 'string') {
    return null;
  }
  const firstWord = locationName.split(' ')[0].toLowerCase();
  return {
    mainKey: `${firstWord}M`,
    textKey: `${firstWord}T`,
  };
}

// --- React Component ---
export default function ARPage({ params }: { params: { location: string } }) {
  const locationName = decodeURIComponent(params.location).replace(/-/g, ' ');

  const [modelUrls, setModelUrls] = useState<ModelUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mainModelRef = useRef<ModelViewerElement | null>(null);
  const textModelRef = useRef<ModelViewerElement | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const horizontalOffset = 0.1;

  // Effect to fetch data and set model URLs
  useEffect(() => {
    const fetchAndSetModels = async () => {
      setLoading(true);

      // 1. Derive the database keys from the location name
      const modelKeys = getModelKeysFromName(locationName);
      if (!modelKeys) {
        setError(`Error: Invalid location name provided.`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/links');
        const result = await response.json();
        console.log(result)
        if (!result.success) throw new Error('Failed to fetch assets from API.');
        
        const allAssets: Asset[] = result.data;
        console.log(allAssets)
        const mainModelAsset = allAssets.find(asset => asset.name === modelKeys.mainKey);
        const textModelAsset = allAssets.find(asset => asset.name === modelKeys.textKey);

        if (mainModelAsset && textModelAsset) {
          setModelUrls({
            main: mainModelAsset.link,
            text: textModelAsset.link,
          });
          setError(null);
        } else {
          throw new Error(`Could not find AR models for "${locationName}" in the database. (Looked for: ${modelKeys.mainKey} & ${modelKeys.textKey})`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetModels();
  }, [locationName]); // Re-run if the location name from the URL changes

  // Effect to sync the two model-viewer cameras
  useEffect(() => {
    // This entire effect remains the same as before
    const mainModel = mainModelRef.current;
    const textModel = textModelRef.current;

    if (!mainModel || !textModel) return;

    let animationFrame: number;

    const syncCameras = () => {
      try {
        if (mainModel.loaded && textModel.loaded) {
          const orbit = mainModel.getCameraOrbit();
          const mainTarget = mainModel.getCameraTarget();
          const fov = mainModel.getFieldOfView();

          textModel.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
          textModel.fieldOfView = `${fov}deg`;
          
          const textTargetX = mainTarget.x - (2 * horizontalOffset);
          textModel.cameraTarget = `${textTargetX}m ${mainTarget.y}m ${mainTarget.z}m`;
        }
      } catch (e) {
        console.warn('Camera sync failed on a frame:', e);
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
      if (animationFrame) cancelAnimationFrame(animationFrame);
      mainModel?.removeEventListener('load', handleLoad);
      textModel?.removeEventListener('load', handleLoad);
      mainModel?.removeEventListener('click', handleClick);
    };
  }, [horizontalOffset, modelUrls]); // Re-run if modelUrls changes

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading AR Experience for {locationName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-red-400 p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Could not load AR model</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black">
      {modelUrls && (
        <>
          <model-viewer
            ref={mainModelRef}
            src={modelUrls.main}
            alt={`Main 3D model for ${locationName}`}
            auto-rotate
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-target={`${horizontalOffset}m 0m 0m`}
            className="absolute inset-0 w-full h-full"
          />

          <model-viewer
            ref={textModelRef}
            src={modelUrls.text}
            alt={`Text overlay model for ${locationName}`}
            camera-target={`${-horizontalOffset}m 0m 0m`}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
              overlayVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white text-xs bg-black/60 px-3 py-2 rounded-lg pointer-events-none">
        Click model to toggle text
      </div>
    </div>
  );
}