"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const TOKENS = {
  brand: "#1A6B3A", active: "#639922", border: "#97C459",
};

export interface CountryData {
  name: string; flag: string; cuisine: string;
  lat: number; lon: number; dishes: string[];
}

const COUNTRIES: CountryData[] = [
  { name:"Italy",flag:"🇮🇹",cuisine:"Italian",lat:41.9,lon:12.5,dishes:["Cacio e Pepe","Osso Buco","Tiramisu"] },
  { name:"France",flag:"🇫🇷",cuisine:"French",lat:46.2,lon:2.2,dishes:["Coq au Vin","Ratatouille","Tarte Tatin"] },
  { name:"Spain",flag:"🇪🇸",cuisine:"Spanish",lat:40.5,lon:-3.7,dishes:["Paella","Gazpacho","Tortilla Española"] },
  { name:"Portugal",flag:"🇵🇹",cuisine:"Portuguese",lat:39.4,lon:-8.2,dishes:["Bacalhau à Brás","Pastel de Nata","Cataplana"] },
  { name:"Greece",flag:"🇬🇷",cuisine:"Greek",lat:39.1,lon:21.8,dishes:["Moussaka","Souvlaki","Spanakopita"] },
  { name:"Germany",flag:"🇩🇪",cuisine:"German",lat:51.2,lon:10.5,dishes:["Schnitzel","Sauerbraten","Spätzle"] },
  { name:"United Kingdom",flag:"🇬🇧",cuisine:"British",lat:54.0,lon:-2.0,dishes:["Sunday Roast","Fish & Chips","Shepherd's Pie"] },
  { name:"Ireland",flag:"🇮🇪",cuisine:"Irish",lat:53.4,lon:-8.0,dishes:["Irish Stew","Colcannon","Boxty"] },
  { name:"Sweden",flag:"🇸🇪",cuisine:"Swedish",lat:60.1,lon:18.6,dishes:["Köttbullar","Gravlax","Smörgåstårta"] },
  { name:"Poland",flag:"🇵🇱",cuisine:"Polish",lat:51.9,lon:19.1,dishes:["Pierogi","Bigos","Żurek"] },
  { name:"Hungary",flag:"🇭🇺",cuisine:"Hungarian",lat:47.2,lon:19.5,dishes:["Goulash","Lángos","Chicken Paprikash"] },
  { name:"Netherlands",flag:"🇳🇱",cuisine:"Dutch",lat:52.1,lon:5.3,dishes:["Stamppot","Bitterballen","Stroopwafel"] },
  { name:"Turkey",flag:"🇹🇷",cuisine:"Turkish",lat:38.9,lon:35.2,dishes:["Lamb Kebab","Manti","Baklava"] },
  { name:"Lebanon",flag:"🇱🇧",cuisine:"Lebanese",lat:33.9,lon:35.9,dishes:["Kibbeh","Tabbouleh","Manakish"] },
  { name:"Israel",flag:"🇮🇱",cuisine:"Israeli",lat:31.5,lon:34.8,dishes:["Shakshuka","Sabich","Hummus Masabacha"] },
  { name:"Iran",flag:"🇮🇷",cuisine:"Persian",lat:32.4,lon:53.7,dishes:["Ghormeh Sabzi","Tahdig","Fesenjan"] },
  { name:"Morocco",flag:"🇲🇦",cuisine:"Moroccan",lat:31.8,lon:-7.1,dishes:["Tagine","Couscous Royal","Pastilla"] },
  { name:"Egypt",flag:"🇪🇬",cuisine:"Egyptian",lat:26.8,lon:30.8,dishes:["Koshari","Molokhia","Ful Medames"] },
  { name:"Ethiopia",flag:"🇪🇹",cuisine:"Ethiopian",lat:9.1,lon:40.5,dishes:["Doro Wat","Injera","Kitfo"] },
  { name:"Nigeria",flag:"🇳🇬",cuisine:"Nigerian",lat:9.1,lon:8.7,dishes:["Jollof Rice","Egusi Soup","Suya"] },
  { name:"South Africa",flag:"🇿🇦",cuisine:"South African",lat:-30.6,lon:22.9,dishes:["Bobotie","Bunny Chow","Boerewors"] },
  { name:"Senegal",flag:"🇸🇳",cuisine:"Senegalese",lat:14.5,lon:-14.5,dishes:["Thieboudienne","Yassa Poulet","Mafé"] },
  { name:"Japan",flag:"🇯🇵",cuisine:"Japanese",lat:36.2,lon:138.2,dishes:["Ramen","Okonomiyaki","Onigiri"] },
  { name:"South Korea",flag:"🇰🇷",cuisine:"Korean",lat:35.9,lon:127.8,dishes:["Bibimbap","Bulgogi","Kimchi Jjigae"] },
  { name:"China",flag:"🇨🇳",cuisine:"Chinese",lat:35.0,lon:105.0,dishes:["Mapo Tofu","Xiao Long Bao","Kung Pao Chicken"] },
  { name:"India",flag:"🇮🇳",cuisine:"Indian",lat:20.6,lon:78.9,dishes:["Butter Chicken","Masala Dosa","Biryani"] },
  { name:"Thailand",flag:"🇹🇭",cuisine:"Thai",lat:15.9,lon:100.9,dishes:["Pad Thai","Green Curry","Som Tum"] },
  { name:"Vietnam",flag:"🇻🇳",cuisine:"Vietnamese",lat:14.1,lon:108.3,dishes:["Pho Bo","Banh Mi","Bun Cha"] },
  { name:"Indonesia",flag:"🇮🇩",cuisine:"Indonesian",lat:-2.5,lon:118.0,dishes:["Nasi Goreng","Rendang","Gado-gado"] },
  { name:"Philippines",flag:"🇵🇭",cuisine:"Filipino",lat:12.9,lon:121.8,dishes:["Adobo","Sinigang","Lechon"] },
  { name:"Malaysia",flag:"🇲🇾",cuisine:"Malaysian",lat:4.2,lon:101.9,dishes:["Nasi Lemak","Char Kway Teow","Laksa"] },
  { name:"Mexico",flag:"🇲🇽",cuisine:"Mexican",lat:23.6,lon:-102.5,dishes:["Tacos al Pastor","Mole Poblano","Chiles Rellenos"] },
  { name:"United States",flag:"🇺🇸",cuisine:"American",lat:39.0,lon:-98.0,dishes:["Gumbo","Buttermilk Biscuits","Smoked Brisket"] },
  { name:"Brazil",flag:"🇧🇷",cuisine:"Brazilian",lat:-14.2,lon:-51.9,dishes:["Feijoada","Moqueca","Pão de Queijo"] },
  { name:"Argentina",flag:"🇦🇷",cuisine:"Argentinian",lat:-38.4,lon:-63.6,dishes:["Asado","Empanadas","Milanesa"] },
  { name:"Peru",flag:"🇵🇪",cuisine:"Peruvian",lat:-9.2,lon:-75.0,dishes:["Ceviche","Lomo Saltado","Aji de Gallina"] },
  { name:"Colombia",flag:"🇨🇴",cuisine:"Colombian",lat:4.6,lon:-74.3,dishes:["Bandeja Paisa","Ajiaco","Arepas"] },
  { name:"Australia",flag:"🇦🇺",cuisine:"Australian",lat:-25.3,lon:133.8,dishes:["Meat Pie","Barramundi","Lamington"] },
  { name:"Russia",flag:"🇷🇺",cuisine:"Russian",lat:61.5,lon:105.3,dishes:["Beef Stroganoff","Borscht","Pelmeni"] },
  { name:"Canada",flag:"🇨🇦",cuisine:"Canadian",lat:56.1,lon:-106.3,dishes:["Poutine","Butter Tarts","Tourtière"] },
  { name:"Singapore",flag:"🇸🇬",cuisine:"Singaporean",lat:1.3,lon:103.8,dishes:["Hainanese Chicken Rice","Laksa","Chilli Crab"] },
  { name:"Taiwan",flag:"🇹🇼",cuisine:"Taiwanese",lat:23.7,lon:121.0,dishes:["Beef Noodle Soup","Oyster Vermicelli","Scallion Pancake"] },
  { name:"Saudi Arabia",flag:"🇸🇦",cuisine:"Saudi",lat:23.9,lon:45.1,dishes:["Kabsa","Mandi","Mutabbaq"] },
  { name:"United Arab Emirates",flag:"🇦🇪",cuisine:"Emirati",lat:24.0,lon:54.4,dishes:["Al Harees","Machboos","Luqaimat"] },
  { name:"Pakistan",flag:"🇵🇰",cuisine:"Pakistani",lat:30.4,lon:69.3,dishes:["Biryani","Nihari","Karahi"] },
  { name:"Jamaica",flag:"🇯🇲",cuisine:"Jamaican",lat:18.1,lon:-77.3,dishes:["Jerk Chicken","Ackee and Saltfish","Curry Goat"] },
  { name:"New Zealand",flag:"🇳🇿",cuisine:"New Zealand",lat:-40.9,lon:174.9,dishes:["Hangi","Pavlova","Whitebait Fritters"] },
  { name:"Ukraine",flag:"🇺🇦",cuisine:"Ukrainian",lat:48.4,lon:31.2,dishes:["Borscht","Varenyky","Chicken Kyiv"] },
  { name:"Belgium",flag:"🇧🇪",cuisine:"Belgian",lat:50.5,lon:4.5,dishes:["Moules-Frites","Carbonnade","Waffles"] },
  { name:"Denmark",flag:"🇩🇰",cuisine:"Danish",lat:56.3,lon:9.5,dishes:["Smørrebrød","Frikadeller","Æbleskiver"] },
];

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

interface LabelData {
  name: string; flag: string; x: number; y: number;
  opacity: number; hovered: boolean; facing: number;
}

interface GlobeProps {
  onCountrySelect: (c: CountryData) => void;
  hideAllLabels?: boolean;
  hideLabelFor?: string;
}

export default function Globe({ onCountrySelect, hideAllLabels, hideLabelFor }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<Record<string, unknown>>({});
  const [hover, setHover] = useState<CountryData | null>(null);
  const [labels, setLabels] = useState<LabelData[]>([]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(3, 2, 4);
    scene.add(dir);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const R = 2;
    const earthMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#ffffff"),
      emissive: new THREE.Color("#0a2517"),
      emissiveIntensity: 0.15,
      shininess: 14,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), earthMat);
    pivot.add(earth);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 2048; texCanvas.height = 1024;
    const tctx = texCanvas.getContext("2d")!;
    tctx.fillStyle = "#0D3D22";
    tctx.fillRect(0, 0, texCanvas.width, texCanvas.height);

    const earthTex = new THREE.CanvasTexture(texCanvas);
    if (THREE.SRGBColorSpace) earthTex.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = earthTex;
    earthMat.needsUpdate = true;

    const project = (lon: number, lat: number) => [
      ((lon + 180) / 360) * texCanvas.width,
      ((90 - lat) / 180) * texCanvas.height,
    ];

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
      .then(r => r.json())
      .then((topo) => {
        const arcs = topo.arcs;
        const t = topo.transform;
        const decodeArc = (i: number) => {
          const reverse = i < 0;
          const idx = reverse ? ~i : i;
          const arc = arcs[idx];
          let x = 0, y = 0;
          const out = arc.map(([dx, dy]: [number, number]) => {
            x += dx; y += dy;
            return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]];
          });
          return reverse ? out.slice().reverse() : out;
        };
        const decodeRing = (ring: number[]) => {
          let coords: number[][] = [];
          ring.forEach((arcIdx: number, i: number) => {
            let arc = decodeArc(arcIdx);
            if (i > 0) arc = arc.slice(1);
            coords = coords.concat(arc);
          });
          return coords;
        };
        const polygons: number[][][][] = [];
        topo.objects.land.geometries.forEach((g: { type: string; arcs: number[][][] }) => {
          if (g.type === "Polygon") polygons.push((g.arcs as unknown as number[][][]).map((ring: number[][]) => decodeRing(ring as unknown as number[])));
          else if (g.type === "MultiPolygon") (g.arcs as unknown as number[][][][]).forEach((p: number[][][]) => polygons.push(p.map((ring: number[][]) => decodeRing(ring as unknown as number[]))));
        });
        tctx.fillStyle = "#1A6B3A";
        polygons.forEach(poly => {
          tctx.beginPath();
          poly.forEach((ring, i) => {
            ring.forEach(([lon, lat], j) => {
              const [x, y] = project(lon, lat);
              if (j === 0) tctx.moveTo(x, y); else tctx.lineTo(x, y);
            });
            if (i > 0) {} // holes via evenodd
            tctx.closePath();
          });
          tctx.fill("evenodd");
        });
        earthTex.needsUpdate = true;
        earthMat.needsUpdate = true;
      })
      .catch(() => {});

    const markersGroup = new THREE.Group();
    pivot.add(markersGroup);

    const markers = COUNTRIES.map(c => {
      const pos = latLonToVec3(c.lat, c.lon, R * 1.02);
      const g = new THREE.Group();
      g.position.copy(pos);

      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(TOKENS.active) }),
      );
      g.add(pin);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.13, 32),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(TOKENS.border),
          side: THREE.DoubleSide, transparent: true, opacity: 0,
        }),
      );
      halo.lookAt(new THREE.Vector3(0, 0, 0));
      halo.rotateY(Math.PI);
      g.add(halo);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0, depthWrite: false }),
      );
      g.add(hit);

      g.userData = { country: c, pin, halo, hit, pulse: 0 };
      markersGroup.add(g);
      return g;
    });

    let zoom = 1;
    const MIN_Z = 1, MAX_Z = 3, baseDist = 7;

    stateRef.current = {
      scene, camera, renderer, pivot, markers,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      getZoom: () => zoom,
      setZoom: (z: number) => { zoom = Math.max(MIN_Z, Math.min(MAX_Z, z)); },
      zoomBy: (delta: number) => { zoom = Math.max(MIN_Z, Math.min(MAX_Z, zoom + delta)); },
    };

    let dragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0;
    let rotY = 0.4, rotX = 0.1;

    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true;
      const p = "touches" in e ? e.touches[0] : e;
      lastX = p.clientX; lastY = p.clientY; velX = 0; velY = 0;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      const p = "touches" in e ? e.touches[0] : e;
      const rect = renderer.domElement.getBoundingClientRect();
      (stateRef.current.mouse as THREE.Vector2).x = ((p.clientX - rect.left) / rect.width) * 2 - 1;
      (stateRef.current.mouse as THREE.Vector2).y = -((p.clientY - rect.top) / rect.height) * 2 + 1;
      if (!dragging) return;
      const dx = p.clientX - lastX, dy = p.clientY - lastY;
      rotY += dx * 0.005; rotX += dy * 0.005;
      rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
      velX = dx * 0.005; velY = dy * 0.005;
      lastX = p.clientX; lastY = p.clientY;
    };
    const onUp = () => { dragging = false; };

    const onClick = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const p = "changedTouches" in e ? e.changedTouches[0] : e;
      (stateRef.current.mouse as THREE.Vector2).x = ((p.clientX - rect.left) / rect.width) * 2 - 1;
      (stateRef.current.mouse as THREE.Vector2).y = -((p.clientY - rect.top) / rect.height) * 2 + 1;
      (stateRef.current.raycaster as THREE.Raycaster).setFromCamera(stateRef.current.mouse as THREE.Vector2, camera);
      const hits = (stateRef.current.raycaster as THREE.Raycaster).intersectObjects(
        markers.map(m => m.userData.hit as THREE.Object3D)
      );
      if (hits.length > 0) {
        const grp = hits[0].object.parent!;
        grp.userData.pulse = 1;
        onCountrySelect(grp.userData.country as CountryData);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom = Math.max(MIN_Z, Math.min(MAX_Z, zoom + (-e.deltaY * 0.0015)));
    };

    let pinchStart: { dist: number; zoom: number } | null = null;
    const onTouchPinchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStart = { dist: Math.hypot(dx, dy), zoom };
      }
    };
    const onTouchPinchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStart) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        zoom = Math.max(MIN_Z, Math.min(MAX_Z, pinchStart.zoom * (Math.hypot(dx, dy) / pinchStart.dist)));
      }
    };

    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("touchstart", onTouchPinchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchPinchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", () => { pinchStart = null; });
    renderer.domElement.addEventListener("mousedown", onDown);
    renderer.domElement.addEventListener("touchstart", onDown as EventListener, { passive: true });
    window.addEventListener("mousemove", onMove as EventListener);
    window.addEventListener("touchmove", onMove as EventListener, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    renderer.domElement.addEventListener("click", onClick as EventListener);

    let raf = 0;
    let labelTick = 0;

    const animate = () => {
      if (!dragging) {
        rotY += velX; rotX += velY;
        rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
        velX *= 0.95; velY *= 0.95;
        rotY += 0.0008;
      }
      pivot.rotation.y = rotY;
      pivot.rotation.x = rotX;

      const targetDist = baseDist / zoom;
      camera.position.z += (targetDist - camera.position.z) * 0.18;

      const raycaster = stateRef.current.raycaster as THREE.Raycaster;
      const mouse = stateRef.current.mouse as THREE.Vector2;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers.map(m => m.userData.hit as THREE.Object3D));
      let hovered: CountryData | null = null;
      if (intersects.length > 0) hovered = intersects[0].object.parent!.userData.country as CountryData;
      setHover(prev => (prev?.name === hovered?.name ? prev : hovered));

      const newLabels: LabelData[] = [];
      const rect = renderer.domElement.getBoundingClientRect();

      markers.forEach(m => {
        const isHover = !!hovered && hovered.name === m.userData.country.name;
        const pin = m.userData.pin as THREE.Mesh & { material: THREE.MeshBasicMaterial };
        const halo = m.userData.halo as THREE.Mesh & { material: THREE.MeshBasicMaterial; scale: THREE.Vector3 };

        const targetScale = isHover ? 1.6 : 1.0;
        pin.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.18);
        halo.material.opacity = THREE.MathUtils.lerp(halo.material.opacity, isHover ? 0.7 : 0, 0.15);

        if ((m.userData.pulse as number) > 0) {
          m.userData.pulse = (m.userData.pulse as number) - 0.02;
          const s = 1 + (1 - (m.userData.pulse as number)) * 0.8;
          halo.scale.set(s, s, s);
          halo.material.opacity = m.userData.pulse as number;
          pin.material.color.lerpColors(new THREE.Color(TOKENS.active), new THREE.Color(TOKENS.brand), 1 - (m.userData.pulse as number));
        } else {
          halo.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
          pin.material.color.lerp(new THREE.Color(TOKENS.active), 0.1);
        }

        const worldPos = new THREE.Vector3();
        m.getWorldPosition(worldPos);
        const toCam = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
        const facing = worldPos.clone().normalize().dot(toCam);
        if (facing > 0.05) {
          const proj = worldPos.clone().project(camera);
          const x = (proj.x * 0.5 + 0.5) * rect.width;
          const y = (-proj.y * 0.5 + 0.5) * rect.height;
          const opacity = isHover ? 1 : Math.min(1, (facing - 0.05) * 2.2) * 0.85;
          newLabels.push({ name: m.userData.country.name, flag: m.userData.country.flag, x, y, opacity, hovered: isHover, facing });
        }
      });

      // Declutter
      newLabels.sort((a, b) => (Number(b.hovered) - Number(a.hovered)) || (b.facing - a.facing));
      const placed: LabelData[] = [];
      const lW = 92, lH = 22;
      const filtered: LabelData[] = [];
      for (const l of newLabels) {
        const ok = placed.every(p => Math.abs(l.x - p.x) >= lW || Math.abs(l.y - p.y) >= lH);
        if (ok || l.hovered) { placed.push(l); filtered.push(l); }
      }

      if (++labelTick % 2 === 0) setLabels(filtered);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("mouseup", onUp);
      renderer.domElement.removeEventListener("click", onClick as EventListener);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoomBy = (delta: number) => {
    const fn = stateRef.current.zoomBy as ((d: number) => void) | undefined;
    fn?.(delta);
  };

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", position: "relative", cursor: hover ? "pointer" : "grab", userSelect: "none", touchAction: "none" }}>

      {/* Country labels */}
      {!hideAllLabels && labels.filter(l => l.name !== hideLabelFor).map(l => (
        <div key={l.name} style={{
          position: "absolute", left: l.x, top: l.y,
          transform: "translate(-50%, calc(-100% - 14px))",
          pointerEvents: "none", opacity: l.opacity,
          transition: "opacity 80ms linear",
          fontSize: l.hovered ? 12 : 11, fontWeight: 500,
          color: l.hovered ? "#fff" : "var(--text-primary)",
          background: l.hovered ? "var(--m4m-brand)" : "var(--card-bg)",
          border: `0.5px solid ${l.hovered ? "var(--m4m-brand)" : "var(--border-tertiary)"}`,
          padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap",
          boxShadow: l.hovered ? "0 4px 12px rgba(26,107,58,0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
          zIndex: l.hovered ? 3 : 2,
        }}>
          <span style={{ marginRight: 4 }}>{l.flag}</span>{l.name}
        </div>
      ))}

      {/* Zoom controls */}
      <div style={{
        position: "absolute", right: 12, bottom: 12,
        display: "flex", flexDirection: "column", gap: 4,
        background: "var(--card-bg)", border: "0.5px solid var(--border-tertiary)",
        borderRadius: 8, padding: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", zIndex: 4,
      }}>
        <button onClick={() => zoomBy(0.4)} aria-label="Zoom in" style={{
          width: 28, height: 28, border: "none", background: "transparent",
          cursor: "pointer", color: "var(--m4m-brand)", borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 500,
        }}>+</button>
        <div style={{ height: 0.5, background: "var(--border-tertiary)" }}/>
        <button onClick={() => zoomBy(-0.4)} aria-label="Zoom out" style={{
          width: 28, height: 28, border: "none", background: "transparent",
          cursor: "pointer", color: "var(--m4m-brand)", borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 500,
        }}>−</button>
      </div>

      {/* Hover tooltip */}
      {hover && (
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "var(--card-bg)", border: `0.5px solid var(--m4m-border)`,
          borderRadius: 8, padding: "6px 10px", fontSize: 12,
          color: "var(--text-primary)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          pointerEvents: "none",
        }}>
          <span style={{ marginRight: 6 }}>{hover.flag}</span>
          <span style={{ fontWeight: 500 }}>{hover.name}</span>
          <span style={{ color: "var(--text-secondary)", marginLeft: 6 }}>· click to select</span>
        </div>
      )}
    </div>
  );
}
