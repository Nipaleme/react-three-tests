import React, { Suspense, useEffect, useRef } from "react"
import { Canvas, useLoader, useFrame } from "react-three-fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { Controls, useControl } from "react-three-gui"
import { OrbitControls, TransformControls } from "@react-three/drei"
import "./styles.css"



const Keen = () => {
    const orbit = useRef()
    const transform = useRef()
    const mode = useControl("mode", { type: "select", items: ["scale", "rotate", "translate"] })
    const { nodes, materials } = useLoader(GLTFLoader, "/scene.gltf")
    useEffect(() => {
      if (transform.current) {
        const controls = transform.current
        controls.setMode(mode)
        const callback = event => (orbit.current.enabled = !event.value)
        controls.addEventListener("dragging-changed", callback)
        return () => controls.removeEventListener("dragging-changed", callback)
      }
    })
    return (
      <>
        <TransformControls ref={transform}>
          <group position={[0, -7, 0]} rotation={[-Math.PI / 2, 0, 0]} dispose={null}>
            <mesh material={materials["Scene_-_Root"]} geometry={nodes.mesh_0.geometry} castShadow receiveShadow />
            <Box position={[5,0,0]} color={"green"} scale={[2,2,2]} rotation={[0,0,0]} offset={[0,0,0]} />
            <Box position={[-5,0,0]} color={"green"} scale={[2,2,2]} rotation={[0,0,0]} offset={[0,0,0]} />
          </group>
        </TransformControls>
        <OrbitControls ref={orbit} />
      </>
    )
}

export default Keen;