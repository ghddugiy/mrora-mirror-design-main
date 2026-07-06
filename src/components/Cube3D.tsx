import { useEffect, useRef } from "react";
import l1 from "@/assets/laptop-1.jpg";
import l2 from "@/assets/laptop-2.jpg";
import l3 from "@/assets/laptop-3.jpg";

const FACES = [l1, l2, l3, l1, l2, l3];
const SIZE = 380; // px cube edge on desktop

export function Cube3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cube = cubeRef.current;
    if (!wrap || !cube) return;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const move = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1..1
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      cube.style.animationPlayState = "paused";
      cube.style.transform = `rotateX(${-y * 25 - 15}deg) rotateY(${x * 45}deg)`;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        cube.style.transform = "";
        cube.style.animationPlayState = "running";
      }, 1500);
    };
    wrap.addEventListener("mousemove", move);
    return () => {
      wrap.removeEventListener("mousemove", move);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const half = SIZE / 2;
  const transforms = [
    `translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div
      ref={wrapRef}
      className="cube-scene relative mx-auto"
      style={{ width: SIZE, height: SIZE }}
      data-cursor="hover"
    >
      {/* Green outline behind */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-2xl border-2 border-[color:var(--lime)]/70"
        style={{ transform: "translateZ(-1px)" }}
      />
      <div
        ref={cubeRef}
        className="cube-3d"
        style={{ width: SIZE, height: SIZE }}
      >
        {FACES.map((src, i) => (
          <div
            key={i}
            className="cube-face rounded-lg"
            style={{ width: SIZE, height: SIZE, transform: transforms[i] }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
      {/* Green tab */}
      <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 flex gap-1">
        <span className="block h-3 w-3 bg-[color:var(--lime)]" />
        <span className="block h-3 w-3 bg-[color:var(--lime)]" />
      </div>
    </div>
  );
}