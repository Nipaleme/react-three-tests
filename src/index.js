import { render } from 'react-dom'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import * as meshline from 'threejs-meshline'
import {Controls, useControl} from "react-three-gui"
import { OrbitControls, TransformControls, StandardEffects } from "@react-three/drei"
import { extend, Canvas, useFrame, useThree } from 'react-three-fiber'
import './styles.css'
import { EllipseCurve } from 'three'

extend(meshline)

const Array2THREEVector3 = (points) => {
  return (points.map(value3D => new THREE.Vector3(value3D[0], value3D[1], value3D[2])))
};

const points = [
  [-10, 0, 0],
  [0, 5, 0],
  [10, 0, 0],
  [5,-4,2],
  [-5, -2, -10]
];




const ellipse = {
  aX: 0,
  aY: 0,
  xRadius: 2,
  yRadius: 2,
  aStartAngle: 0,
  aEndAngle: 90 * Math.PI / 180,
  aClockwise: true,
  aRotation: 0,
}

// const Cube = (props) => {
//   const mesh = useRef()
//   // useFrame(() => {
//   //   mesh.current.rotation.x = mesh.current.rotation.y += 0.01
//   // })
//   console.log(props)
//   return (
//     <mesh>
//       {/* {...props} */}
//       ref={mesh}
//       <boxBufferGeometry props={[1, 1, 1]} />
//       <meshStandardMaterial color={'orange'} />
//     </mesh>
//   )
// }

function Ellipse(props) {
  const geometry = useMemo(() => {
    const n = props.props;
    const [aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwisz, aRotation] = [n.aX, n.aY, n.xRadius, n.yRadius, n.aStartAngle, n.aEndAngle, n.aClockwise, n.aRotation]
    const curve = new THREE.EllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwisz, aRotation)
    const points = curve.getPoints(50)
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])
  return (
    <line geometry={geometry} {...props}>
      <meshBasicMaterial attach="material" color={"black"} />
    </line>
  )
}

// const Curve = ({id, ellipse, width, color}) => {
//   const material = useRef();
//   const [center, radius, angle] = [ellipse.center, ellipse.radius, ellipse.angle];
//   const curve = new THREE.EllipseCurve(
//     center.x, center.y,
//     1, 2,
//     angle.start*Math.PI/180, angle.end*Math.PI/180,
//     false,
//     0).getPoints(50);
//   return (
//     <mesh>
//       <meshLine attach="geometry" vertices={curve} />
//       <meshLineMaterial attach="material" ref={material} lineWidth={width} color={color} />
//     </mesh>
//   )
// };


const SmoothLine = ({id, points, width, color}) => {
  const material = useRef();
  const curve = new THREE.CatmullRomCurve3(Array2THREEVector3(points)).getPoints(1000);
  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial attach="material" ref={material} lineWidth={width} color={color} />
    </mesh>
  )
};

const AngularLine = ({id, points, width, color}) => {
  const material = useRef();
  return (
    <mesh>
      <meshLine attach="geometry" vertices={Array2THREEVector3(points)} />
      <meshLineMaterial attach="material" ref={material} lineWidth={width} color={color} />
    </mesh>
  )
};



function Fatline({ curve, width, color, speed }) {
  const material = useRef()
  useFrame(() => (material.current.uniforms.dashOffset.value -= speed))
  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial attach="material" ref={material} transparent depthTest={false} lineWidth={width} color={color} dashArray={0.1} dashRatio={0.9} />
    </mesh>
  )
}

function Lines({ count, colors }) {
  const lines = useMemo(
    () =>
      new Array(count).fill().map(() => {
        const pos = new THREE.Vector3(10 - Math.random() * 20, 10 - Math.random() * 20, 10 - Math.random() * 20)
        const points = new Array(30).fill().map(() => pos.add(new THREE.Vector3(4 - Math.random() * 8, 4 - Math.random() * 8, 2 - Math.random() * 4)).clone())
        const curve = new THREE.CatmullRomCurve3(points).getPoints(1000)
        return {
          color: colors[parseInt(colors.length * Math.random())],
          width: Math.min(0.1, 0.5 * Math.random()),
          speed: Math.min(0.001, 0.0005 * Math.random()),
          curve
        }
      }),
    [colors, count]
  )
  return lines.map((props, index) => <Fatline key={index} {...props} />)
}

function Rig({ mouse }) {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.x += (mouse.current[0] / 25 - camera.position.x) * 0.5
    camera.position.y += (-mouse.current[1] / 25 - camera.position.y) * 0.5
    camera.lookAt(0, 0, 0)
  })
  return null
}

const Box = ({position, color, scale, rotation, offset}) => {
  const ref = useRef()
  const newoffset= (offset != undefined) ? offset : [0,0,0]
  const newPosition = position.map((x, index) => x + newoffset[index])
  useFrame(() => (ref.current.rotation.x1 = ref.current.rotation.y += 0.01))
  return (
    <mesh position={newPosition} ref={ref} scale={scale} rotation={rotation} offset={offset}>
      <boxBufferGeometry args={[1, 1, 1]} attach="geometry" />
      <meshPhongMaterial color={color} attach="material" />
    </mesh>
  )
}

//Positions of the 4 cube
let pos = [
  [-6,0,0],
  [-3,0,0],
  [0,0,0],
  [-3,3,0]
]

// function to transform the pos of children to the center of mass axis
const Calcnewpos = (array, cms) =>  {
  let parentArray = [];
  for(let k=0, l=array.length ; k<l ; k++){
    const Vector3 = array[k];
    let childArray = [];
  	for (let i=0, j=Vector3.length ; i<j ; i++){
    	const value = Vector3[i]-cms[i];
      	childArray.push(value);
    }
    parentArray.push(childArray)
  }
  return parentArray;
}; 

//CALC CENTER OF MASS (cms)
const extractColumn = (arr, column) => {
	const reduction = (previousValue, currentValue) => {
		previousValue.push(currentValue[column]);
		return previousValue;
	}
	return arr.reduce(reduction, []);
};
const sum = (accumulator, currentValue) => accumulator + currentValue;
// const axis = [extractColumn(pos, 0), extractColumn(pos, 1), extractColumn(pos, 2)]; 
const cms = axis.map((element, index) => element.reduce(sum)/element.length);
// const cms = [0,0,0];

//update pos of Children
pos = Calcnewpos(pos, cms); 
//update position of group
let groupPosition = cms; 

//transformations to the group
const groupScale = [1,1,1];
const groupRotation=[0,-Math.PI/2,0];
const offset = [0,0,0];

//update position of groupe with new offset
groupPosition = groupPosition.map((a,i) => a+offset[i]);

console.log("Box 1 - Green Left:", pos[0])
console.log("Box 2 - Blue middle:", pos[1])
console.log("Box 3 - Yellow Right:", pos[2])
console.log("Box 4 - Blue Top:", pos[3])

console.log("groupe Position", groupPosition)
console.log("groupe Scale", groupScale)
console.log("groupe Rotation", groupRotation)

function App() {
  const mouse = useRef([0, 0])
  return (
    <Canvas
      camera={{ position: [0, 0, 45], fov: 25 }}
      onMouseMove={(e) => (mouse.current = [e.clientX - window.innerWidth / 2, e.clientY - window.innerHeight / 2])}>
      <Lines count={40} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} />
      <AngularLine id={1} points={points} width={0.1} color={"blue"} />
      <SmoothLine id={2} points={points} width={0.05} color={"red"} />
      {/* <Curve id={3} ellipse={ellipse} width={0.1} color={"yellow"} /> */}
      <Ellipse props={ellipse} />
      <group position={groupPosition} scale={groupScale} rotation={groupRotation}>
        <Box position={pos[0]} color={"green"} scale={[2,2,2]} rotation={[0,0,0]} offset={[0,0,0]} />
        <Box position={pos[1]} color={"blue"} offset={[0,0,0]} />
        <Box position={pos[2]} color={"yellow"} offset={[0,0,0]} />
        <Box position={pos[3]} color={"blue"} offset={[0,0,0]} />
      </group>
      <directionalLight color="#ffffff" intensity={1} position={[-1, 2, 4]} />
      <Rig mouse={mouse} />
    </Canvas>
  )
}

render(<App />, document.querySelector('#root'))
