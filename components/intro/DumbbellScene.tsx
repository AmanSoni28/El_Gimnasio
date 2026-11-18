"use client";
/* eslint-disable react-hooks/immutability -- three.js scene objects (camera, meshes)
   are intentionally mutated per frame outside React render; that's how R3F works. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ════════════════════════════════════════════════════════════════════
   Procedural 3D dumbbell, built from real geometry in two separable
   halves. The left half carries a threaded connector pin that seats
   inside the right half's handle on assembly.

   Local build axis is +Y (native cylinder axis); each half is rotated
   so +Y maps to world +X. The GSAP timeline in CinematicIntro drives
   everything through the `DumbbellApi` handed out via `onReady`.
   ════════════════════════════════════════════════════════════════════ */

export type DumbbellApi = {
  left: THREE.Group;
  right: THREE.Group;
  leftSpin: THREE.Group;
  rightSpin: THREE.Group;
  assembly: THREE.Group;
  glow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  shock: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  seam: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  /** Environment rotation: animating it sweeps reflections across the metal for free. */
  envRotation: THREE.Euler;
  pulse: THREE.PointLight;
  dust: THREE.PointsMaterial;
  shake: { amp: number };
  burst: () => void;
  /** Half of the visible world width at z = 0 (for off-screen entry). */
  halfVisibleWidth: () => number;
  /** On-screen width (css px) of the assembled dumbbell at rest. */
  widthPx: () => number;
};

/** Half-length of the assembled dumbbell, in world units. */
const HALF_LEN = 1.205;
const FOV = 30;

/* ─────────────── Procedural textures ─────────────── */

function makeKnurlTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#1a1a1a";
  g.lineWidth = 3;
  for (let i = -128; i < 256; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 128, 128);
    g.stroke();
    g.beginPath();
    g.moveTo(i + 128, 0);
    g.lineTo(i, 128);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 3);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

function makeRadialTexture(inner = "rgba(255,214,120,1)", mid = "rgba(212,175,55,0.35)") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.25, mid);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ─────────────── Materials ─────────────── */

type Mats = ReturnType<typeof makeMaterials>;

function makeMaterials(knurl: THREE.Texture) {
  // MeshStandard (not Physical): visually near-identical for polished metal,
  // but far cheaper to compile through ANGLE/D3D on low-end Windows GPUs.
  const plate = new THREE.MeshStandardMaterial({
    color: "#d8a83c",
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.35,
  });
  const bright = new THREE.MeshStandardMaterial({
    color: "#f2cb68",
    metalness: 1,
    roughness: 0.1,
    envMapIntensity: 1.5,
  });
  const handle = new THREE.MeshStandardMaterial({
    color: "#b48a36",
    metalness: 1,
    roughness: 0.42,
    bumpMap: knurl,
    bumpScale: 1.2,
    envMapIntensity: 1.1,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: "#9a9890",
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 1.2,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#2a2418",
    metalness: 0.9,
    roughness: 0.35,
    envMapIntensity: 0.8,
  });
  return { plate, bright, handle, steel, dark };
}

/* ─────────────── Geometry builders ─────────────── */

function cyl(r: number, len: number, mat: THREE.Material, y: number, rTop = r, seg = 64) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, r, len, seg, 1), mat);
  m.position.y = y;
  return m;
}

function torusY(R: number, tube: number, mat: THREE.Material, y: number, seg = 96) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 18, seg), mat);
  m.rotation.x = Math.PI / 2; // torus axis → Y
  m.position.y = y;
  return m;
}

/** A weight plate with a rounded rim, raised hub and machined ring detail. */
function plate(R: number, t: number, y: number, mats: Mats) {
  const g = new THREE.Group();
  g.position.y = y;
  const r = t / 2;
  g.add(cyl(R - r, t, mats.plate, 0, R - r, 112));
  g.add(torusY(R - r, r, mats.plate, 0, 112));
  g.add(cyl(R * 0.3, t + 0.035, mats.bright, 0));
  g.add(torusY(R * 0.72, 0.011, mats.bright, t / 2));
  g.add(torusY(R * 0.72, 0.011, mats.bright, -t / 2));
  g.add(torusY(R * 0.46, 0.007, mats.dark, t / 2 + 0.004));
  g.add(torusY(R * 0.46, 0.007, mats.dark, -t / 2 - 0.004));
  return g;
}

/**
 * One half of the dumbbell. `sign` = -1 builds the left half (extending to
 * local −Y), +1 the right. The join face sits at local y = 0.
 */
function buildHalf(sign: -1 | 1, mats: Mats) {
  const root = new THREE.Group(); // position / tilt (animated)
  const axis = new THREE.Group(); // maps local +Y → world +X
  axis.rotation.z = -Math.PI / 2;
  const spin = new THREE.Group(); // rotation around the bar (animated)
  root.add(axis);
  axis.add(spin);

  let c = 0; // running offset from the join face, outward
  const put = (len: number) => {
    const centre = sign * (c + len / 2);
    c += len;
    return centre;
  };

  spin.add(cyl(0.105, 0.04, mats.bright, put(0.04))); // coupler
  spin.add(torusY(0.105, 0.012, mats.bright, sign * 0.012));
  spin.add(cyl(0.085, 0.44, mats.handle, put(0.44))); // knurled grip
  spin.add(cyl(0.1, 0.025, mats.bright, put(0.025))); // grip stop
  const collar = put(0.07);
  spin.add(cyl(0.19, 0.07, mats.bright, collar)); // inner collar
  spin.add(torusY(0.19, 0.02, mats.bright, collar + sign * 0.035));
  spin.add(plate(0.62, 0.16, put(0.16), mats));
  c += 0.018;
  spin.add(plate(0.52, 0.15, put(0.15), mats));
  c += 0.018;
  spin.add(plate(0.42, 0.14, put(0.14), mats));
  c += 0.012;
  spin.add(cyl(0.17, 0.07, mats.bright, put(0.07))); // outer collar
  // Tapered end cap
  const capY = put(0.06);
  const cap = cyl(0.14, 0.06, mats.bright, capY, 0.11);
  if (sign < 0) cap.rotation.x = Math.PI;
  spin.add(cap);
  spin.add(torusY(0.112, 0.012, mats.dark, sign * c));

  if (sign < 0) {
    // Threaded connector pin protruding into +Y; hidden inside the right handle once joined.
    spin.add(cyl(0.05, 0.3, mats.steel, 0.15));
    for (let i = 0; i < 6; i++) spin.add(torusY(0.05, 0.009, mats.steel, 0.05 + i * 0.042, 40));
  }

  return { root, spin };
}

function disposeTree(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}

/* ─────────────── Particles ─────────────── */

function makeDust(count: number, tex: THREE.Texture) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 2] = -6 + Math.random() * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.035,
    map: tex,
    color: "#f5c451",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

const SPARKS = 90;

function makeSparks(tex: THREE.Texture) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
  const vel = new Float32Array(SPARKS * 3);
  for (let i = 0; i < SPARKS; i++) {
    // Radial burst around the bar axis (the seam ring), slight x spread
    const a = Math.random() * Math.PI * 2;
    const s = 1.2 + Math.random() * 3.2;
    vel[i * 3] = (Math.random() - 0.5) * 1.4;
    vel[i * 3 + 1] = Math.cos(a) * s;
    vel[i * 3 + 2] = Math.sin(a) * s;
  }
  const mat = new THREE.PointsMaterial({
    size: 0.05,
    map: tex,
    color: "#ffe1a0",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return { pts, vel };
}

/* ─────────────── Scene rig ─────────────── */

function Rig({ onReady, lowPower }: { onReady: (api: DumbbellApi) => void; lowPower: boolean }) {
  const { camera, size, gl, scene } = useThree();
  const compileState = useRef<"idle" | "compiling" | "done">("idle");
  const slowFrames = useRef(0);
  const pulseRef = useRef<THREE.PointLight>(null);
  const shake = useRef({ amp: 0 }).current;
  const baseZ = useRef(8);
  const burstAt = useRef(-1);
  const frames = useRef(0);
  const readySent = useRef(false);

  const built = useMemo(() => {
    const knurl = makeKnurlTexture();
    const dot = makeRadialTexture("rgba(255,236,190,1)", "rgba(245,196,81,0.5)");
    const glowTex = makeRadialTexture();
    const mats = makeMaterials(knurl);

    const assembly = new THREE.Group();
    const L = buildHalf(-1, mats);
    const R = buildHalf(1, mats);
    assembly.add(L.root, R.root);

    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(0.112, 0.02, 16, 72),
      new THREE.MeshBasicMaterial({
        color: "#fff1c4",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    seam.rotation.y = Math.PI / 2; // ring around the bar (X axis)
    assembly.add(seam);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    glow.position.z = -1.6;
    glow.scale.setScalar(2);

    const shock = new THREE.Mesh(
      new THREE.RingGeometry(0.94, 1, 128),
      new THREE.MeshBasicMaterial({
        color: "#f5c451",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
    );
    shock.renderOrder = 10;

    const dust = makeDust(lowPower ? 140 : 360, dot);
    const sparks = makeSparks(dot);

    return { knurl, dot, glowTex, mats, assembly, L, R, seam, glow, shock, dust, sparks };
  }, [lowPower]);

  // Dispose everything we created imperatively.
  useEffect(() => {
    const b = built;
    return () => {
      disposeTree(b.assembly);
      [b.glow, b.shock, b.dust, b.sparks.pts].forEach((o) => {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      });
      b.seam.material.dispose();
      Object.values(b.mats).forEach((m) => m.dispose());
      b.knurl.dispose();
      b.dot.dispose();
      b.glowTex.dispose();
    };
  }, [built]);

  // Fit camera distance so the dumbbell always has room (portrait phones included).
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const needForWidth = 4.1 / (2 * tan * aspect);
    baseZ.current = Math.max(8, needForWidth);
    cam.position.set(0, 0, baseZ.current);
    cam.fov = FOV;
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const b = built;

    // Slow atmospheric drift
    b.dust.rotation.y += delta * 0.018;
    b.dust.position.y = Math.sin(t * 0.25) * 0.15;

    // Controlled camera shake (amplitude driven by the timeline)
    const a = shake.amp;
    camera.position.x = a ? a * (Math.sin(t * 91) + Math.sin(t * 53)) * 0.5 : 0;
    camera.position.y = a ? a * (Math.sin(t * 77 + 1) + Math.sin(t * 41)) * 0.5 : 0;

    // Impact sparks
    if (burstAt.current >= 0) {
      const age = t - burstAt.current;
      const attr = b.sparks.pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const k = (1 - Math.exp(-age * 3.2)) / 3.2; // velocity with drag
      for (let i = 0; i < SPARKS * 3; i++) arr[i] = b.sparks.vel[i] * k;
      attr.needsUpdate = true;
      const mat = b.sparks.pts.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 1 - age / 0.85);
      if (age > 0.9) {
        burstAt.current = -1;
        mat.opacity = 0;
      }
    }

    frames.current++;

    // Adaptive quality: if frames are slow, drop the pixel ratio once.
    if (delta > 0.045 && frames.current > 5) {
      slowFrames.current++;
      if (slowFrames.current === 8 && state.viewport.dpr > 1) state.setDpr(1);
    }

    // Precompile every shader (halves are still off-screen) once the environment
    // map exists, so nothing compiles mid-animation.
    if (compileState.current === "idle" && frames.current > 2) {
      compileState.current = "compiling";
      gl.compileAsync(scene, camera)
        .catch(() => undefined)
        .then(() => {
          compileState.current = "done";
        });
    }

    if (!readySent.current && compileState.current === "done" && pulseRef.current) {
      readySent.current = true;
      const cam = camera as THREE.PerspectiveCamera;
      const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      onReady({
        left: b.L.root,
        right: b.R.root,
        leftSpin: b.L.spin,
        rightSpin: b.R.spin,
        assembly: b.assembly,
        glow: b.glow,
        shock: b.shock,
        seam: b.seam,
        envRotation: scene.environmentRotation,
        pulse: pulseRef.current,
        dust: b.dust.material as THREE.PointsMaterial,
        shake,
        burst: () => {
          burstAt.current = state.clock.elapsedTime;
        },
        halfVisibleWidth: () => baseZ.current * tan * cam.aspect,
        widthPx: () => {
          const st = state.get();
          return ((2 * HALF_LEN) / (2 * baseZ.current * tan)) * st.size.height;
        },
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight ref={pulseRef} position={[0, 0, 1.6]} intensity={0} color="#f5c451" distance={8} />

      <Environment resolution={lowPower ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff2d2" position={[0, 6, 0]} scale={[12, 3]} />
        <Lightformer form="rect" intensity={1.3} color="#ffd88a" position={[-6, 1, 2]} scale={[2.5, 8]} />
        <Lightformer form="rect" intensity={0.9} color="#ffffff" position={[6, -1, 2]} scale={[2.5, 8]} />
        <Lightformer form="ring" intensity={1.1} color="#ffe0a0" position={[0, 0, 7]} scale={4} />
        <Lightformer form="rect" intensity={0.35} color="#ffb84d" position={[0, -6, 0]} scale={[12, 3]} />
        <Lightformer form="rect" intensity={5} color="#fff7e6" position={[-4, 0, 5]} scale={[1.2, 12]} />
      </Environment>

      <primitive object={built.dust} />
      <primitive object={built.glow} />
      <primitive object={built.assembly} />
      <primitive object={built.shock} />
      <primitive object={built.sparks.pts} />
    </>
  );
}

export default function DumbbellScene({
  onReady,
  lowPower,
}: {
  onReady: (api: DumbbellApi) => void;
  lowPower: boolean;
}) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, 8] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Rig onReady={onReady} lowPower={lowPower} />
    </Canvas>
  );
}
