
declare module '@google/model-viewer' {
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        ar?: boolean;
        poster?: string;
        'reveal-when-loaded'?: boolean;
        loading?: 'auto' | 'lazy' | 'eager';
        'camera-orbit'?: string;
        'camera-target'?: string;
        'field-of-view'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'min-field-of-view'?: string;
        'max-field-of-view'?: string;
        interpolation?: 'step' | 'linear';
        orientation?: string;
        scale?: string;
        'ios-src'?: string;
        'skybox-image'?: string;
        'environment-image'?: string;
        exposure?: string;
        'shadow-intensity'?: string;
        'shadow-softness'?: string;
        'animation-name'?: string;
        'animation-crossfade-duration'?: string;
        autoplay?: boolean;
        'variant-name'?: string;
        'material-name'?: string;
        'morph-target'?: string;
        bounds?: 'tight' | 'legacy';
        'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
        'interaction-prompt-style'?: 'basic' | 'wiggle';
        'interaction-prompt-threshold'?: string;
        'quick-look-browsers'?: string;
        'ar-modes'?: string;
        'ar-scale'?: 'auto' | 'fixed';
        'ar-placement'?: 'floor' | 'wall';
        'ar-hit-test'?: boolean;
        'xr-environment'?: boolean;
        'stage-light-intensity'?: string;
        'disable-zoom'?: boolean;
        'disable-pan'?: boolean;
        'disable-tap'?: boolean;
        'touch-action'?: string;
        'mouse-orbit-sensitivity'?: string;
        'touch-orbit-sensitivity'?: string;
        'zoom-sensitivity'?: string;
        'pan-sensitivity'?: string;
      };
    }
  }

  interface ModelViewerElement extends HTMLElement {
    loaded: boolean;
    src: string;
    alt: string;
    getCameraOrbit(): { theta: number; phi: number; radius: number };
    getCameraTarget(): { x: number; y: number; z: number };
    getFieldOfView(): number;
    setCameraOrbit(orbit: string): void;
    setCameraTarget(target: string): void;
    setFieldOfView(fov: string): void;
    cameraOrbit: string;
    cameraTarget: string;
    fieldOfView: string;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }
}