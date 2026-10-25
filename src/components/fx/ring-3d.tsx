'use client';
import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * 「档案之环」实时 3D 版（three.js，按需动态加载，不进入首屏包）：
 *   磨砂玻璃圆环（物理透射材质）+ 碎裂石片 + 香槟金细轨道与金球，左上暖光斜射。
 * 旋转与倾角由外部 MotionValue 驱动（与滚动同步），鼠标在其上叠加 ±6° 的跟随；
 * 离开视口暂停渲染；WebGL 不可用时什么都不画，由调用方保留 SVG 版作为底图。
 */
export function Ring3D({ rotate, tilt, className, onReady }: {
  rotate: MotionValue<number>; tilt: MotionValue<number>; className?: string; onReady?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // 无 WebGL：保留 SVG 底图
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 12.5);

      // 光：左上暖光主光 + 右下冷色轮廓光
      const key = new THREE.DirectionalLight(0xfff1d6, 3.2);
      key.position.set(-5, 6, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fb4ff, 0.6);
      rim.position.set(5, -3, -4);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff, 0.15));

      const group = new THREE.Group();
      scene.add(group);

      // 玻璃环
      const glass = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.42, 96, 220),
        // 玻璃：透射材质只折射 3D 场景本身（场景是空的，会显得发白），所以用低不透明度 + 清漆反射模拟，
        // 让背后的网页内容透出来，边缘靠环境反射发亮
        new THREE.MeshPhysicalMaterial({
          color: 0xf6efe2, metalness: 0.05, roughness: 0.06, transparent: true, opacity: 0.2, depthWrite: false,
          clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2, sheen: 1, sheenColor: new THREE.Color(0xd8b67a),
        }),
      );
      group.add(glass);

      // 碎裂石片：沿环的一段弧，顶点扰动成粗糙断面
      const stoneGeo = new THREE.TorusGeometry(2.1, 0.36, 24, 90, Math.PI * 0.42);
      const pos = stoneGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        pos.setXYZ(i, pos.getX(i) * (1 + n * 0.02), pos.getY(i) * (1 + n * 0.02), pos.getZ(i) * (1 + n * 0.05));
      }
      stoneGeo.computeVertexNormals();
      const stone = new THREE.Mesh(stoneGeo, new THREE.MeshStandardMaterial({ color: 0x6c655a, roughness: 0.9, metalness: 0, flatShading: true }));
      stone.rotation.z = Math.PI * 0.72;
      stone.scale.setScalar(1.03);
      group.add(stone);

      // 香槟金轨道 + 金球
      const gold = new THREE.MeshStandardMaterial({ color: 0xd8b67a, metalness: 1, roughness: 0.28 });
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.012, 8, 260), gold);
      orbit.rotation.set(1.15, 0.35, 0);
      group.add(orbit);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 48, 48), gold);
      group.add(orb);

      // 尺寸
      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // 鼠标跟随（弹性插值）
      let mx = 0, my = 0, sx = 0, sy = 0;
      const onMove = (e: PointerEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      // 只在可见时渲染
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
      io.observe(el);

      const clock = new THREE.Clock();
      let raf = 0;
      let first = true;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;
        const t = clock.getElapsedTime();
        sx += (mx - sx) * 0.06;
        sy += (my - sy) * 0.06;
        const deg = Math.PI / 180;
        group.rotation.x = tilt.get() * deg + sy * 6 * deg;
        group.rotation.y = sx * 6 * deg;
        group.rotation.z = rotate.get() * deg;
        const a = t * 0.5;
        const p = new THREE.Vector3(Math.cos(a) * 3.05, Math.sin(a) * 3.05, 0).applyEuler(orbit.rotation);
        orb.position.copy(p);
        renderer.render(scene, camera);
        if (first) { first = false; onReady?.(); }
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        scene.traverse((o) => {
          const m = o as import('three').Mesh;
          m.geometry?.dispose();
          const mat = m.material as import('three').Material | undefined;
          mat?.dispose();
        });
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, [rotate, tilt, onReady]);

  return <div ref={host} aria-hidden className={cn('pointer-events-none', className)} />;
}
