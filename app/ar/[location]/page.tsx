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

export default function ARPage({ params }: { params: { location: string } }) {
  const locationName = decodeURIComponent(params.location).replace(/-/g, ' ');

  const [modelUrls, setModelUrls] = useState<ModelUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mainModelRef = useRef<ModelViewerElement | null>(null);
  const textModelRef = useRef<ModelViewerElement | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const horizontalOffset = 0.1;

  useEffect(() => {
    const fetchAndSetModels = async () => {
      setLoading(true);

      const modelKeys = getModelKeysFromName(locationName);
      if (!modelKeys) {
        setError(`Error: Invalid location name provided.`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/links');
        const result = await response.json();
        if (!result.success) throw new Error('Failed to fetch assets from API.');
        
        const allAssets: Asset[] = result.data;
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
  }, [locationName]);

  useEffect(() => {
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
  }, [horizontalOffset, modelUrls]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-950 to-background text-foreground">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading AR Experience for {locationName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-orange-950 to-background text-destructive p-4 text-center">
        <h2 className="text-xl font-bold mb-2 text-orange-400">Could not load AR model</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-orange-950/20 to-background">
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

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white text-sm bg-orange-500/90 backdrop-blur-sm px-4 py-2 rounded-full pointer-events-none font-medium shadow-lg">
        Click model to toggle text
      </div>
    </div>
  );
}