import React, { useEffect, useMemo, useRef } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { Face } from 'react-native-vision-camera-face-detector';

interface FaceFilter3DWebViewProps {
  face: Face | null;
  cameraFormat: { width: number; height: number };
  enabled: boolean;
  modelBase64: string | null;
  onStatus?: (status: string) => void;
}

type FacePayload = {
  hasFace: boolean;
  normX: number;
  normY: number;
  yawDeg: number;
  rollDeg: number;
  scale: number;
  // Debug info
  debugInfo?: string;
};

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
      canvas { display: block; }
      #debug {
        position: absolute;
        top: 10px;
        left: 10px;
        color: yellow;
        font-family: monospace;
        font-size: 12px;
        pointer-events: none;
        text-shadow: 1px 1px 1px black;
      }
    </style>
  </head>
  <body>
    <div id="debug">Initializing...</div>
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.160.0/examples/js/loaders/GLTFLoader.js"></script>
    <script>
      (function () {
        const debugEl = document.getElementById('debug');
        function log(msg) {
           debugEl.innerText = msg;
        }

        function post(msg) {
          try {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(String(msg));
            }
          } catch (e) {}
        }

        post('webview_loaded');

        if (!window.THREE) {
          post('three_missing');
          log('Three.js missing');
          return;
        }
        
        // ... Scene Setup ...
        const scene = new THREE.Scene();
        // Adjust camera FOV/Position to better match typical phone selfie cam
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
        camera.position.set(0, 0, 3);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0);
        document.body.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(0, 2, 5);
        scene.add(dir);

        // Debug Box (Red) - Visible until model loads
        const debugGeo = new THREE.BoxGeometry(1, 1, 1);
        const debugMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.5 });
        let obj = new THREE.Mesh(debugGeo, debugMat);
        scene.add(obj);

        function resize() {
          const w = window.innerWidth || 1;
          const h = window.innerHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', resize);
        resize();

        function setVisible(v) {
          obj.visible = !!v;
        }

        function setTransform(payload) {
          if (!payload || !payload.hasFace) {
            setVisible(false);
            return;
          }
          setVisible(true);
          
          if (payload.debugInfo) {
             log(payload.debugInfo);
          }

          const normX = payload.normX; // 0..1
          const normY = payload.normY; // 0..1

          // Map 0..1 to Screen Coordinates in 3D world at z=0
          // Visible height at z=0 with camera at z=3 and FOV 75:
          // vFOV = 75 * (PI/180)
          // visibleHeight = 2 * tan(vFOV / 2) * distance
          // visibleHeight = 2 * tan(0.6545) * 3 = 2 * 0.767 * 3 = 4.6
          // visibleWidth = visibleHeight * aspect
          
          const dist = camera.position.z - obj.position.z; // 3
          const vFOV = THREE.MathUtils.degToRad(camera.fov);
          const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
          const visibleWidth = visibleHeight * camera.aspect;

          const x = (normX - 0.5) * visibleWidth;
          const y = -(normY - 0.5) * visibleHeight; 

          obj.position.set(x, y, 0);

          const yaw = THREE.MathUtils.degToRad(-payload.yawDeg);
          const roll = THREE.MathUtils.degToRad(-payload.rollDeg);
          // Combine rotations. Z is roll, Y is yaw.
          obj.rotation.set(0, yaw, roll);

          const s = payload.scale || 0.4;
          obj.scale.set(s, s, s);
        }

        function loadModel(base64) {
          try {
            log('Loading Model...');
            const uri = 'data:application/octet-stream;base64,' + base64;
            const loader = new THREE.GLTFLoader();
            loader.load(
              uri,
              (gltf) => {
                scene.remove(obj);
                obj = gltf.scene;
                
                obj.traverse((child) => {
                   if (child.isMesh) {
                      child.material.side = THREE.DoubleSide;
                   }
                });

                scene.add(obj);
                post('model_loaded_success');
                log('Model Loaded!');
              },
              undefined,
              (err) => {
                post('model_error: ' + err.message);
                log('Error: ' + err.message);
              }
            );
          } catch (e) {
            post('model_exception: ' + e.message);
            log('Ex: ' + e.message);
          }
        }

        function render() {
          renderer.render(scene, camera);
          requestAnimationFrame(render);
        }
        render();

        window.__setFace = setTransform;
        
        function handleMessage(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'load_model') {
                    loadModel(data.payload);
                }
            } catch (e) {}
        }

        document.addEventListener('message', handleMessage);
        window.addEventListener('message', handleMessage);

        post('bridge_ready');
      })();
    </script>
  </body>
</html>
`;

export default function FaceFilter3DWebView({
  face,
  cameraFormat,
  enabled,
  modelBase64,
  onStatus,
}: FaceFilter3DWebViewProps) {
  const webRef = useRef<WebView>(null);
  const [isBridgeReady, setIsBridgeReady] = React.useState(false);

  const payload: FacePayload = useMemo(() => {
    if (!face) {
      return {
        hasFace: false,
        normX: 0.5,
        normY: 0.5,
        yawDeg: 0,
        rollDeg: 0,
        scale: 0.4,
      };
    }

    // Camera Format is usually Landscape (e.g. 1280x720)
    // But in Portrait mode, the frame is rotated.
    // Effectively the camera buffer is 720x1280.
    // We need to ensure we divide by the correct dimensions.
    
    // Assume we are in Portrait mode.
    const camWidth = Math.min(cameraFormat.width, cameraFormat.height);
    const camHeight = Math.max(cameraFormat.width, cameraFormat.height);

    const cx = face.bounds.x + face.bounds.width / 2;
    const cy = face.bounds.y + face.bounds.height / 2;

    let normX = cx / camWidth;
    let normY = cy / camHeight;

    // Mirror X for selfie
    normX = 1 - normX;
    
    // Debug info for the screen
    const debugInfo = `X:${normX.toFixed(2)} Y:${normY.toFixed(2)} W:${face.bounds.width}`;

    // Adjust scale based on face width relative to camera width
    const faceWidthRatio = face.bounds.width / camWidth;
    // Scale factor needs tuning
    const scale = faceWidthRatio * 4.0; 

    return {
      hasFace: true,
      normX,
      normY,
      yawDeg: face.yawAngle ?? 0,
      rollDeg: face.rollAngle ?? 0,
      scale,
      debugInfo
    };
  }, [face, cameraFormat]);

  // Send model only when bridge is ready and we have the base64
  useEffect(() => {
    if (!enabled || !modelBase64 || !isBridgeReady) return;
    
    const msg = JSON.stringify({ type: 'load_model', payload: modelBase64 });
    webRef.current?.postMessage(msg);
    onStatus?.('sent_model_to_webview');
    
  }, [enabled, modelBase64, isBridgeReady]);

  useEffect(() => {
    if (!enabled) return;
    webRef.current?.injectJavaScript(
      `window.__setFace && window.__setFace(${JSON.stringify(payload)}); true;`
    );
  }, [enabled, payload]);

  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <WebView
        ref={webRef}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        style={styles.webview}
        androidLayerType="hardware"
        onMessage={(event) => {
          const msg = event.nativeEvent.data;
          if (msg === 'bridge_ready') {
              setIsBridgeReady(true);
          }
          onStatus?.(msg);
        }}
        onError={(event) => {
          onStatus?.(`webview_error:${event.nativeEvent.description}`);
        }}
        onHttpError={(event) => {
          onStatus?.(`webview_http_error:${event.nativeEvent.statusCode}`);
        }}
        onLoadEnd={() => {
          onStatus?.('webview_load_end');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
