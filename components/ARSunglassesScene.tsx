import React, { useState } from 'react';
import {
    ViroARScene,
    Viro3DObject,
    ViroAmbientLight,
    ViroDirectionalLight,
    ViroNode,
} from '@reactvision/react-viro';

const ARSunglassesScene = () => {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadStart = () => {
        setIsLoading(true);
        console.log('Model loading started');
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
        console.log('Model loaded successfully');
    };

    const handleError = (event: any) => {
        console.error('Model loading error:', event.nativeEvent?.error);
    };

    return (
        <ViroARScene>
            {/* Lighting */}
            <ViroAmbientLight color="#ffffff" intensity={200} />
            <ViroDirectionalLight
                color="#ffffff"
                direction={[0, -1, -0.5]}
                intensity={500}
            />

            {/* 3D Sunglasses Model */}
            <ViroNode position={[0, 0, -1]}>
                <Viro3DObject
                    source={require('../assets/models/sunglasses.glb')}
                    type="GLB"
                    position={[0, 0, 0]}
                    scale={[0.3, 0.3, 0.3]}
                    rotation={[0, 0, 0]}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                />
            </ViroNode>
        </ViroARScene>
    );
};

export default ARSunglassesScene;
