import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

/*
 * The home page backdrop: a moving blue-gray, grainy ShaderGradient (github.com/ruucm/shadergradient).
 * Fixed behind the whole scrolling page. It uses the library's "3d" lighting, which needs no
 * downloaded environment maps. preserveDrawingBuffer lets the liquid glass buttons read it.
 */
export default function ShaderBackdrop() {
  return (
    <div className="shader-backdrop" aria-hidden="true">
      <ShaderGradientCanvas pixelDensity={1} fov={45} pointerEvents="none" lazyLoad={false} preserveDrawingBuffer style={{ position: 'absolute', inset: 0 }}>
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate="on"
          uSpeed={0.18}
          uStrength={3.2}
          uDensity={1.8}
          uFrequency={6.5}
          uAmplitude={0}
          uTime={0}
          color1="#4d6a8c"
          color2="#8593a1"
          color3="#1a2330"
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          cAzimuthAngle={180}
          cPolarAngle={80}
          cDistance={2.8}
          cameraZoom={9.1}
          lightType="3d"
          brightness={0.9}
          reflection={0.1}
          grain="on"
          wireframe={false}
          shader="defaults"
        />
      </ShaderGradientCanvas>
      {/* Extra film grain on top of the library's own, for a rougher, printed texture. */}
      <div className="shader-grain" />
    </div>
  )
}
