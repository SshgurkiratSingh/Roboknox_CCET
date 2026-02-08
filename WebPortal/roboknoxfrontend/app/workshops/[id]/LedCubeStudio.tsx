"use client";

import { useMemo, useState } from "react";

type LedCubeStudioProps = {
  initialFrames: number[][][];
};

type FrameData = {
  cube: number[][][]; // 3D array [z][y][x]
  delayMs: number;
};

const makeEmptyCube = () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0)),
  );

const cloneCube = (cube: number[][][]) =>
  cube.map((layer) => layer.map((row) => [...row]));

const sanitizeFrames = (frames: number[][][]): FrameData[] => {
  if (frames.length === 0) {
    return [{ cube: makeEmptyCube(), delayMs: 220 }];
  }
  // Convert old 2D format to 3D if needed
  return frames.map((frame) => ({
    cube:
      frame.length === 3 && frame[0].length === 3
        ? [frame, frame, frame] // duplicate layer for backward compatibility
        : makeEmptyCube(),
    delayMs: 220,
  }));
};

export default function LedCubeStudio({ initialFrames }: LedCubeStudioProps) {
  const [frames, setFrames] = useState<FrameData[]>(() =>
    sanitizeFrames(initialFrames),
  );
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [rotateX, setRotateX] = useState(25);
  const [rotateY, setRotateY] = useState(-25);
  const [viewMode, setViewMode] = useState<"3d" | "layers" | "grid">("grid");
  const [activeLayer, setActiveLayer] = useState(0);
  const [paintMode, setPaintMode] = useState(false);
  const [history, setHistory] = useState<FrameData[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const activeFrame = frames[activeFrameIndex] ?? {
    cube: makeEmptyCube(),
    delayMs: 220,
  };
  const activeCube = activeFrame.cube;

  const cubeLayers = useMemo(() => {
    return [0, 1, 2].map((z) => ({
      z,
      leds: activeCube[z].flatMap((row, y) =>
        row.map((cell, x) => ({
          on: Boolean(cell),
          x,
          y,
          z,
        })),
      ),
    }));
  }, [activeCube]);

  const saveToHistory = (newFrames: FrameData[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newFrames);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const toggleLed = (x: number, y: number, z: number, forceValue?: 0 | 1) => {
    setFrames((prev) => {
      const updated = prev.map((frameData, index) => {
        if (index !== activeFrameIndex) {
          return frameData;
        }
        const newCube = cloneCube(frameData.cube);
        newCube[z][y][x] = forceValue !== undefined ? forceValue : newCube[z][y][x] ? 0 : 1;
        return { ...frameData, cube: newCube };
      });
      saveToHistory(updated);
      return updated;
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFrames(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFrames(history[historyIndex + 1]);
    }
  };

  const applyPattern = (pattern: string) => {
    setFrames((prev) => {
      const updated = prev.map((frameData, index) => {
        if (index !== activeFrameIndex) return frameData;
        const newCube = makeEmptyCube();
        
        switch (pattern) {
          case "all":
            for (let z = 0; z < 3; z++)
              for (let y = 0; y < 3; y++)
                for (let x = 0; x < 3; x++) newCube[z][y][x] = 1;
            break;
          case "edges":
            for (let z = 0; z < 3; z++)
              for (let y = 0; y < 3; y++)
                for (let x = 0; x < 3; x++)
                  if (x === 0 || x === 2 || y === 0 || y === 2 || z === 0 || z === 2)
                    newCube[z][y][x] = 1;
            break;
          case "corners":
            [[0,0],[0,2],[2,0],[2,2]].forEach(([y,x]) => {
              newCube[0][y][x] = 1;
              newCube[2][y][x] = 1;
            });
            break;
          case "cross":
            for (let z = 0; z < 3; z++) {
              newCube[z][1][1] = 1;
              newCube[z][1][0] = 1;
              newCube[z][1][2] = 1;
              newCube[z][0][1] = 1;
              newCube[z][2][1] = 1;
            }
            break;
          case "random":
            for (let z = 0; z < 3; z++)
              for (let y = 0; y < 3; y++)
                for (let x = 0; x < 3; x++)
                  newCube[z][y][x] = Math.random() > 0.5 ? 1 : 0;
            break;
        }
        
        return { ...frameData, cube: newCube };
      });
      saveToHistory(updated);
      return updated;
    });
  };

  const updateFrameDelay = (delay: number) => {
    setFrames((prev) =>
      prev.map((frameData, index) =>
        index === activeFrameIndex ? { ...frameData, delayMs: delay } : frameData,
      ),
    );
  };

  const addFrame = () => {
    setFrames((prev) => [...prev, { cube: makeEmptyCube(), delayMs: 220 }]);
    setActiveFrameIndex(frames.length);
  };

  const duplicateFrame = () => {
    setFrames((prev) => {
      const copy = {
        cube: cloneCube(activeFrame.cube),
        delayMs: activeFrame.delayMs,
      };
      return [...prev, copy];
    });
    setActiveFrameIndex(frames.length);
  };

  const clearFrame = () => {
    setFrames((prev) =>
      prev.map((frameData, index) =>
        index === activeFrameIndex
          ? { cube: makeEmptyCube(), delayMs: frameData.delayMs }
          : frameData,
      ),
    );
  };

  const deleteFrame = () => {
    setFrames((prev) => {
      if (prev.length === 1) {
        return [{ cube: makeEmptyCube(), delayMs: 220 }];
      }
      const next = prev.filter((_, index) => index !== activeFrameIndex);
      return next.length ? next : [{ cube: makeEmptyCube(), delayMs: 220 }];
    });
    setActiveFrameIndex((prev) => Math.max(0, prev - 1));
  };

  const generatedCode = useMemo(() => {
    const structDef = `struct Frame {\n  int leds[3][3][3];\n  int delayMs;\n};`;

    const frameStrings = frames.map((frameData, idx) => {
      const layerStrings = frameData.cube.map((layer) => {
        const rows = layer.map((row) => `      { ${row.join(", ")} }`);
        return `    {\n${rows.join(",\n")}\n    }`;
      });
      return `  {\n    {\n${layerStrings.join(",\n")}\n    },\n    ${frameData.delayMs}\n  }`;
    });

    return `// Roboknox LED Cube (3x3x3)\n// Total frames: ${frames.length}\n\n${structDef}\n\nconst int FRAME_COUNT = ${frames.length};\n\nFrame frames[FRAME_COUNT] = {\n${frameStrings.join(",\n")}\n};\n\nvoid renderFrame(int frameIndex) {\n  // Map frames[frameIndex].leds[z][y][x] to your pins\n  // z = layer (0-2), y = row (0-2), x = column (0-2)\n  for (int z = 0; z < 3; z++) {\n    for (int y = 0; y < 3; y++) {\n      for (int x = 0; x < 3; x++) {\n        // digitalWrite(ledPins[z][y][x], frames[frameIndex].leds[z][y][x]);\n      }\n    }\n  }\n}\n\nvoid playAnimation() {\n  for (int i = 0; i < FRAME_COUNT; i++) {\n    renderFrame(i);\n    delay(frames[i].delayMs);\n  }\n}`;
  }, [frames]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
  };

  return (
    <section
      id="cube-studio"
      className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">LED Cube Code Studio</h3>
          <p className="text-sm text-slate-400">
            Toggle LEDs, set frame delay, and export Arduino-ready C code.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="rounded-full bg-slate-800/60 px-3 py-1">
            Frames: {frames.length}
          </span>
          <span className="rounded-full bg-slate-800/60 px-3 py-1">
            Frame {activeFrameIndex + 1} delay: {activeFrame.delayMs}ms
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {frames.map((_, index) => (
                <button
                  key={`frame-${index}`}
                  type="button"
                  onClick={() => setActiveFrameIndex(index)}
                  className={`h-9 w-9 rounded-xl border text-xs font-semibold transition ${
                    activeFrameIndex === index
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500 disabled:opacity-30"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500 disabled:opacity-30"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
              <button
                type="button"
                onClick={addFrame}
                className="rounded-full border border-emerald-400/40 px-3 py-1 text-emerald-200 transition hover:border-emerald-300"
              >
                + Add frame
              </button>
              <button
                type="button"
                onClick={duplicateFrame}
                className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={clearFrame}
                className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={deleteFrame}
                className="rounded-full border border-red-500/40 px-3 py-1 text-red-200 transition hover:border-red-400"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-full border border-slate-700 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  viewMode === "grid"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  viewMode === "3d"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                3D
              </button>
              <button
                type="button"
                onClick={() => setViewMode("layers")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  viewMode === "layers"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                All Layers
              </button>
            </div>
            
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={paintMode}
                onChange={(e) => setPaintMode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700"
              />
              <span className="text-slate-400">Paint mode (click & drag)</span>
            </label>

            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-slate-500">Patterns:</span>
              {["all", "edges", "corners", "cross", "random"].map((pattern) => (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => applyPattern(pattern)}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-300"
                >
                  {pattern}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            {viewMode === "grid" ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Single layer grid - Select layer and click LEDs to toggle
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Active Layer:</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((z) => (
                        <button
                          key={`layer-select-${z}`}
                          type="button"
                          onClick={() => setActiveLayer(z)}
                          className={`h-8 w-16 rounded-lg border text-xs font-semibold transition ${
                            activeLayer === z
                              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                              : "border-slate-700 text-slate-400 hover:border-slate-500"
                          }`}
                        >
                          Layer {z}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="inline-block rounded-2xl border border-emerald-400/30 bg-slate-900/60 p-6">
                    <div className="mb-3 text-center text-sm font-semibold text-emerald-300">
                      Layer {activeLayer}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {activeCube[activeLayer].map((row, y) =>
                        row.map((cell, x) => (
                          <button
                            key={`grid-${x}-${y}-${activeLayer}`}
                            type="button"
                            onClick={() => toggleLed(x, y, activeLayer)}
                            onMouseEnter={(e) => {
                              if (paintMode && e.buttons === 1) {
                                toggleLed(x, y, activeLayer, 1);
                              }
                            }}
                            className={`h-16 w-16 rounded-xl border-2 transition hover:scale-105 ${
                              cell
                                ? "border-emerald-400 bg-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
                                : "border-slate-600 bg-slate-900/80 hover:border-emerald-400/60"
                            }`}
                            title={`LED [${x}, ${y}, ${activeLayer}]`}
                          >
                            <span className="text-[8px] text-slate-500">
                              {x},{y}
                            </span>
                          </button>
                        )),
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                      <div>Col 0</div>
                      <div>Col 1</div>
                      <div>Col 2</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === "3d" ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Interactive 3D cube - Click LEDs to toggle
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Layer spacing:</span>
                    <span className="text-emerald-300">40px</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <div
                    className="relative mx-auto h-80 w-80"
                    style={{ perspective: "1200px" }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                      }}
                    >
                      {cubeLayers.map((layer) => (
                        <div
                          key={`layer-${layer.z}`}
                          className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-3"
                          style={{
                            transform: `translateZ(${layer.z * 40 - 40}px)`,
                          }}
                        >
                          {layer.leds.map((led) => (
                            <button
                              key={`${led.x}-${led.y}-${led.z}`}
                              type="button"
                              onClick={() => toggleLed(led.x, led.y, led.z)}
                              onMouseEnter={(e) => {
                                if (paintMode && e.buttons === 1) {
                                  toggleLed(led.x, led.y, led.z, 1);
                                }
                              }}
                              className={`h-10 w-10 rounded-lg border transition hover:scale-110 ${
                                led.on
                                  ? "border-emerald-400 bg-emerald-400/90 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                                  : "border-slate-600 bg-slate-900/60 hover:border-emerald-400/60"
                              }`}
                              style={{
                                backfaceVisibility: "visible",
                              }}
                              title={`LED [${led.x}, ${led.y}, ${led.z}]`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 text-xs text-slate-400">
                    <label className="flex items-center justify-between gap-3">
                      Rotate X ({rotateX}°)
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={rotateX}
                        onChange={(event) =>
                          setRotateX(Number(event.target.value))
                        }
                        className="w-40"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      Rotate Y ({rotateY}°)
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={rotateY}
                        onChange={(event) =>
                          setRotateY(Number(event.target.value))
                        }
                        className="w-40"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Layer-by-layer editing - Click LEDs to toggle
                  </p>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((z) => (
                      <button
                        key={`layer-btn-${z}`}
                        type="button"
                        onClick={() => setActiveLayer(z)}
                        className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${
                          activeLayer === z
                            ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                            : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        L{z}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-6">
                  {[0, 1, 2].map((z) => (
                    <div key={`layer-${z}`}>
                      <p className="mb-2 text-center text-xs text-slate-500">
                        Layer {z}
                      </p>
                      <div
                        className={`grid grid-cols-3 gap-2 rounded-xl border p-3 transition ${
                          activeLayer === z
                            ? "border-emerald-400/40 bg-emerald-400/5"
                            : "border-slate-800 bg-slate-900/40"
                        }`}
                      >
                        {activeCube[z].map((row, y) =>
                          row.map((cell, x) => (
                            <button
                              key={`all-${x}-${y}-${z}`}
                              type="button"
                              onClick={() => toggleLed(x, y, z)}
                              onMouseEnter={(e) => {
                                if (paintMode && e.buttons === 1) {
                                  toggleLed(x, y, z, 1);
                                }
                              }}
                              className={`h-10 w-10 rounded-lg border transition hover:scale-105 ${
                                cell
                                  ? "border-emerald-400 bg-emerald-400/90 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                                  : "border-slate-700 bg-slate-900/60 hover:border-emerald-400/60"
                              }`}
                              title={`[${x}, ${y}, ${z}]`}
                            />
                          )),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Frame settings</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <label className="flex items-center gap-2">
                  Frame delay (ms)
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={activeFrame.delayMs}
                    onChange={(event) =>
                      updateFrameDelay(Number(event.target.value))
                    }
                    className="w-24 rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-sm text-white"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Total LEDs on:</span>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-emerald-300">
                    {activeCube.flat(2).filter((v) => v === 1).length} / 27
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Generated C code</h4>
              <p className="text-xs text-slate-400">
                Copy into your Arduino sketch and map pins in renderFrame().
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300"
            >
              Copy code
            </button>
          </div>
          <pre className="mt-4 h-[320px] overflow-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-200">
            {generatedCode}
          </pre>
        </div>
      </div>
    </section>
  );
}
