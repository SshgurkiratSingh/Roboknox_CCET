"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LedCubeStudioProps = {
  initialFrames: number[][][];
};

type FrameData = {
  cube: number[][][]; // 3D array [z][y][x]
  delayMs: number;
};

type SceneExport = {
  name: string;
  description: string;
  frames: FrameData[];
  createdAt: string;
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

// Generate sample rain pattern
const generateRainPattern = (): FrameData[] => {
  const frames: FrameData[] = [];
  for (let drop = 0; drop < 5; drop++) {
    const randomCol = Math.floor(Math.random() * 9);
    // Top layer - drop appears
    let cube = makeEmptyCube();
    const row = Math.floor(randomCol / 3);
    const col = randomCol % 3;
    cube[2][row][col] = 1;
    frames.push({ cube: cloneCube(cube), delayMs: 100 });

    // Middle layer
    cube = makeEmptyCube();
    cube[1][row][col] = 1;
    frames.push({ cube: cloneCube(cube), delayMs: 100 });

    // Bottom layer - impact
    cube = makeEmptyCube();
    cube[0][row][col] = 1;
    frames.push({ cube: cloneCube(cube), delayMs: 100 });
  }
  return frames;
};

// Generate sample scan pattern
const generateScanPattern = (): FrameData[] => {
  const frames: FrameData[] = [];

  // Z-axis sweep (layer by layer)
  for (let z = 0; z < 3; z++) {
    let cube = makeEmptyCube();
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        cube[z][y][x] = 1;
      }
    }
    frames.push({ cube: cloneCube(cube), delayMs: 150 });
  }

  // Y-axis sweep (front to back)
  const yOrder = [[0], [1], [2]];
  for (const rowIndices of yOrder) {
    let cube = makeEmptyCube();
    for (let z = 0; z < 3; z++) {
      for (const y of rowIndices) {
        for (let x = 0; x < 3; x++) {
          cube[z][y][x] = 1;
        }
      }
    }
    frames.push({ cube: cloneCube(cube), delayMs: 150 });
  }

  // X-axis sweep (left to right)
  const xOrder = [[0], [1], [2]];
  for (const colIndices of xOrder) {
    let cube = makeEmptyCube();
    for (let z = 0; z < 3; z++) {
      for (let y = 0; y < 3; y++) {
        for (const x of colIndices) {
          cube[z][y][x] = 1;
        }
      }
    }
    frames.push({ cube: cloneCube(cube), delayMs: 150 });
  }

  return frames;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playFrameIndex, setPlayFrameIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sceneName, setSceneName] = useState("My Scene");
  const [sceneDescription, setSceneDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3D LED Box component
  const Led3DBox = ({ isOn, size = 40 }: { isOn: boolean; size?: number }) => {
    const onClasses = isOn
      ? "border-emerald-400 bg-emerald-400/90 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
      : "border-slate-600 bg-slate-900/60";

    const faceStyle = (
      translateZ: number,
      rotateXVal: number = 0,
      rotateYVal: number = 0,
    ) => ({
      position: "absolute" as const,
      width: `${size}px`,
      height: `${size}px`,
      top: 0,
      left: 0,
      transformStyle: "preserve-3d" as const,
      transform: `${rotateXVal !== 0 ? `rotateX(${rotateXVal}deg)` : ""} ${rotateYVal !== 0 ? `rotateY(${rotateYVal}deg)` : ""} translateZ(${translateZ}px)`,
    });

    return (
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front face */}
        <div
          className={`absolute border rounded-lg ${onClasses}`}
          style={{
            ...faceStyle(size / 2),
            zIndex: 10,
          }}
        />
        {/* Back face */}
        <div
          className={`absolute border rounded-lg ${onClasses} opacity-70`}
          style={{
            ...faceStyle(-size / 2),
            zIndex: 1,
          }}
        />
        {/* Top face */}
        <div
          className={`absolute border rounded-lg ${onClasses} opacity-80`}
          style={{
            ...faceStyle(size / 2, 90),
            zIndex: 5,
          }}
        />
        {/* Bottom face */}
        <div
          className={`absolute border rounded-lg ${onClasses} opacity-60`}
          style={{
            ...faceStyle(-size / 2, 90),
            zIndex: 2,
          }}
        />
        {/* Right face */}
        <div
          className={`absolute border rounded-lg ${onClasses} opacity-75`}
          style={{
            ...faceStyle(size / 2, 0, 90),
            zIndex: 8,
          }}
        />
        {/* Left face */}
        <div
          className={`absolute border rounded-lg ${onClasses} opacity-65`}
          style={{
            ...faceStyle(-size / 2, 0, 90),
            zIndex: 3,
          }}
        />
      </div>
    );
  };

  const activeFrame = frames[activeFrameIndex] ?? {
    cube: makeEmptyCube(),
    delayMs: 220,
  };
  const activeCube = activeFrame.cube;

  // Animation playback - ensure playFrameIndex is valid
  const validPlayFrameIndex = Math.min(playFrameIndex, frames.length - 1);
  const playingFrame = isPlaying ? frames[validPlayFrameIndex] : activeFrame;
  const playingCube = playingFrame?.cube ?? activeCube;

  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const currentFrame = frames[validPlayFrameIndex];
    if (!currentFrame) return;

    timeoutRef.current = setTimeout(() => {
      setPlayFrameIndex((prev) => {
        const next = (prev + 1) % frames.length;
        return next;
      });
    }, currentFrame.delayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, validPlayFrameIndex, frames]);

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      setPlayFrameIndex(0);
      setIsPlaying(true);
    }
  };

  const exportScene = () => {
    const scene: SceneExport = {
      name: sceneName || "Untitled Scene",
      description: sceneDescription,
      frames: frames,
      createdAt: new Date().toISOString(),
    };
    const json = JSON.stringify(scene, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sceneName.replace(/\s+/g, "_")}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importScene = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const scene = JSON.parse(content) as SceneExport;
        if (
          scene.frames &&
          Array.isArray(scene.frames) &&
          scene.frames.length > 0
        ) {
          setFrames(scene.frames);
          setActiveFrameIndex(0);
          setSceneName(scene.name || "Imported Scene");
          setSceneDescription(scene.description || "");
          setShowImportModal(false);
        }
      } catch (error) {
        alert("Failed to import scene. Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  const loadSamplePattern = (pattern: "rain" | "scan") => {
    const newFrames =
      pattern === "rain" ? generateRainPattern() : generateScanPattern();
    setFrames(newFrames);
    setActiveFrameIndex(0);
    setSceneName(
      pattern === "rain" ? "Digital Rain Pattern" : "Axis Scan Pattern",
    );
    setSceneDescription(
      pattern === "rain"
        ? "Random drops falling through the cube layers"
        : "Sweeping light across X, Y, and Z axes",
    );
  };

  const cubeLayers = useMemo(() => {
    return [0, 1, 2].map((z) => ({
      z,
      leds: (isPlaying ? playingCube : activeCube)[z].flatMap((row, y) =>
        row.map((cell, x) => ({
          on: Boolean(cell),
          x,
          y,
          z,
        })),
      ),
    }));
  }, [isPlaying, playingCube, activeCube]);

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
        newCube[z][y][x] =
          forceValue !== undefined ? forceValue : newCube[z][y][x] ? 0 : 1;
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
                  if (
                    x === 0 ||
                    x === 2 ||
                    y === 0 ||
                    y === 2 ||
                    z === 0 ||
                    z === 2
                  )
                    newCube[z][y][x] = 1;
            break;
          case "corners":
            [
              [0, 0],
              [0, 2],
              [2, 0],
              [2, 2],
            ].forEach(([y, x]) => {
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
        index === activeFrameIndex
          ? { ...frameData, delayMs: delay }
          : frameData,
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
    const frameStrings = frames.map((frameData) => {
      const layerData = frameData.cube.map((layer) => {
        const rows = layer.map((row) => `        { ${row.join(", ")} }`);
        return `      {\n${rows.join(",\n")}\n      }`;
      });
      return `    { { ${layerData.join(", ")} }, ${frameData.delayMs} }`;
    });

    return `/*
 * 3x3x3 LED Cube - Arduino Code
 * Configuration:
 * 9 Column Pins (Anodes): Connected to digital pins 2 through 10
 * 3 Layer Pins (Cathodes): Connected to digital pins 11, 12, 13
 */
#include <Arduino.h>
// Pin Definitions
const int columnPins[9] = {2, 3, 4, 5, 6, 7, 8, 9, 10};
const int layerPins[3] = {11, 12, 13};

// Frame structure with per-layer delay
struct Frame {
  int leds[3][3][3];
  int delayMs;
};

const int FRAME_COUNT = ${frames.length};

Frame frames[FRAME_COUNT] = {
${frameStrings.join(",\n")}
};

void setup() {
  // Initialize Columns (Anodes) as OUTPUT and set to LOW (OFF)
  for (int i = 0; i < 9; i++) {
    pinMode(columnPins[i], OUTPUT);
    digitalWrite(columnPins[i], LOW);
  }

  // Initialize Layers (Cathodes) as OUTPUT and set to HIGH (OFF)
  // Layers are active LOW, so HIGH means they are disconnected/off.
  for (int i = 0; i < 3; i++) {
    pinMode(layerPins[i], OUTPUT);
    digitalWrite(layerPins[i], HIGH);
  }
}

/**
 * Displays a 3D pattern on the LED cube for a specific duration.
 *
 * @param pattern  A 3x3 array representing the cube state.
 * Dimensions: [Layer][Row][Column]
 * Data Format: 9 LEDs per layer (one per column).
 * Each value (0 or 1) controls whether the LED is on or off.
 *
 * @param duration Duration to display this pattern in milliseconds.
 */
void displayPattern(int pattern[3][3][3], unsigned long duration) {
  unsigned long startTime = millis();

  // Loop until the requested duration has passed
  while (millis() - startTime < duration) {

    // Iterate through each layer (0 to 2)
    for (int layer = 0; layer < 3; layer++) {

      // Step 1: Prepare the Column Data for the current layer
      for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
          if (pattern[layer][row][col] == 1) {
            digitalWrite(columnPins[row * 3 + col], HIGH); // Anode HIGH (Power)
          } else {
            digitalWrite(columnPins[row * 3 + col], LOW);  // Anode LOW (No Power)
          }
        }
      }

      // Step 2: Activate the Layer (Common Cathode)
      // Pull LOW to connect to Ground and complete the circuit
      digitalWrite(layerPins[layer], LOW);

      // Step 3: Persistence of Vision Delay
      // Short delay to allow the eye to register the light.
      // 3ms * 3 layers = 9ms per frame (approx 111Hz refresh rate)
      delay(3);

      // Step 4: Deactivate the Layer (Ghosting Prevention)
      // Turn off layer BEFORE changing columns for the next cycle.
      digitalWrite(layerPins[layer], HIGH);
    }
  }
}

void playAnimation() {
  for (int i = 0; i < FRAME_COUNT; i++) {
    displayPattern(frames[i].leds, frames[i].delayMs);
  }
}

void loop() {
  playAnimation();
}`;
  }, [frames]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(generatedCode);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = generatedCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      // no-op: clipboard not available
    }
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
            {sceneName} {sceneDescription && `- ${sceneDescription}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadSamplePattern("rain")}
            className="rounded-full border border-sky-400/40 px-3 py-1 text-xs font-semibold text-sky-200 transition hover:border-sky-300"
            title="Load Digital Rain pattern example"
          >
            ☔ Rain
          </button>
          <button
            type="button"
            onClick={() => loadSamplePattern("scan")}
            className="rounded-full border border-sky-400/40 px-3 py-1 text-xs font-semibold text-sky-200 transition hover:border-sky-300"
            title="Load Axis Scan pattern example"
          >
            📡 Scan
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="rounded-full border border-blue-400/40 px-3 py-1 text-xs font-semibold text-blue-200 transition hover:border-blue-300"
            title="Import scene from JSON"
          >
            ⬇ Import
          </button>
          <button
            type="button"
            onClick={exportScene}
            className="rounded-full border border-purple-400/40 px-3 py-1 text-xs font-semibold text-purple-200 transition hover:border-purple-300"
            title="Export scene as JSON"
          >
            ⬆ Export
          </button>
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
                  className={`h-9 w-9 rounded-xl border text-xs font-semibold transition ${activeFrameIndex === index
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
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${viewMode === "grid"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-300"
                  }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${viewMode === "3d"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-300"
                  }`}
              >
                3D
              </button>
              <button
                type="button"
                onClick={() => setViewMode("layers")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${viewMode === "layers"
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

            <button
              type="button"
              onClick={togglePlayback}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isPlaying
                  ? "border border-red-500/40 text-red-200 hover:border-red-400"
                  : "border border-emerald-400/40 text-emerald-200 hover:border-emerald-300"
                }`}
            >
              {isPlaying ? "⏹ Stop Animation" : "▶ Play Animation"}
            </button>
          </div>

          <div className="mt-6 grid gap-6">
            {viewMode === "grid" ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Single layer grid - Select layer and click LEDs to toggle
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Active Layer:
                    </span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((z) => (
                        <button
                          key={`layer-select-${z}`}
                          type="button"
                          onClick={() => setActiveLayer(z)}
                          className={`h-8 w-16 rounded-lg border text-xs font-semibold transition ${activeLayer === z
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
                            className={`h-16 w-16 rounded-xl border-2 transition hover:scale-105 ${cell
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
                  <div>
                    <p className="text-xs text-slate-400">
                      Interactive 3D cube - Click LEDs to toggle
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Layers displayed from top to bottom (Layer 0 at back →
                      Layer 2 at front)
                    </p>
                  </div>
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
                            transform: `translateZ(${(2 - layer.z) * 40 - 40}px)`,
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
                              className={`h-10 w-10 rounded-lg border transition hover:scale-110 ${led.on
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
                  <div>
                    <p className="text-xs text-slate-400">
                      Layer-by-layer editing - Click LEDs to toggle
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Layers displayed from top to bottom (Layer 0 at top →
                      Layer 2 at bottom)
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((z) => (
                      <button
                        key={`layer-btn-${z}`}
                        type="button"
                        onClick={() => setActiveLayer(z)}
                        className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${activeLayer === z
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
                        className={`grid grid-cols-3 gap-2 rounded-xl border p-3 transition ${activeLayer === z
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
                              className={`h-10 w-10 rounded-lg border transition hover:scale-105 ${cell
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

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">3D Animation Preview</h3>
              <p className="text-sm text-slate-400">
                Watch your animation play in real-time on the 3D cube.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full bg-slate-800/60 px-3 py-1">
                Frame {isPlaying ? playFrameIndex + 1 : activeFrameIndex + 1} /{" "}
                {frames.length}
              </span>
              {isPlaying && (
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-300">
                  Playing
                </span>
              )}
            </div>
          </div>

          {isFullscreen ? (
            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">
                  3D Animation Fullscreen
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500"
                >
                  ✕ Exit fullscreen
                </button>
              </div>

              <div className="flex-1 flex">
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <div
                    className="relative w-full h-full max-w-2xl max-h-2xl flex items-center justify-center"
                    style={{ perspective: "1500px" }}
                  >
                    <div
                      className="absolute"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                        width: "360px",
                        height: "360px",
                      }}
                    >
                      {cubeLayers.map((layer) => (
                        <div
                          key={`fs-layer-${layer.z}`}
                          className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-6"
                          style={{
                            transform: `translateZ(${(2 - layer.z) * 50 - 40}px)`,
                            width: "400px",
                            height: "400px",
                          }}
                        >
                          {layer.leds.map((led) => (
                            <div
                              key={`fs-${led.x}-${led.y}-${led.z}`}
                              style={{
                                perspective: "1000px",
                                transformStyle: "preserve-3d",
                              }}
                            >
                              <Led3DBox isOn={led.on} size={44} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-80 border-l border-slate-800 bg-slate-950/40 p-6 overflow-y-auto flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-4">
                      Playback
                    </p>
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${isPlaying
                          ? "border border-red-500/40 bg-red-500/10 text-red-200 hover:border-red-400"
                          : "border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:border-emerald-300"
                        }`}
                    >
                      {isPlaying ? "⏹ Stop" : "▶ Play"}
                    </button>
                    {isPlaying && (
                      <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                        <p className="text-xs text-slate-400">Current delay:</p>
                        <p className="text-sm font-semibold text-emerald-300 mt-1">
                          {frames[playFrameIndex].delayMs}ms
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-4">
                      View Controls
                    </p>
                    <div className="grid gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-slate-400">
                            Rotate X
                          </label>
                          <span className="text-sm font-semibold text-emerald-300">
                            {rotateX}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={rotateX}
                          onChange={(event) =>
                            setRotateX(Number(event.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-slate-400">
                            Rotate Y
                          </label>
                          <span className="text-sm font-semibold text-emerald-300">
                            {rotateY}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={rotateY}
                          onChange={(event) =>
                            setRotateY(Number(event.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRotateX(25);
                      setRotateY(-25);
                    }}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
                  >
                    Reset view
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.4fr]">
              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4">
                <p className="text-xs text-slate-400 mb-4">
                  Interactive 3D playback - Rotate to view from different angles
                </p>
                <div className="flex justify-center">
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
                          key={`play-layer-${layer.z}`}
                          className="absolute left-1/2 top-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-2"
                          style={{
                            transform: `translateZ(${(2 - layer.z) * 40 - 40}px)`,
                          }}
                        >
                          {layer.leds.map((led) => (
                            <div
                              key={`play-${led.x}-${led.y}-${led.z}`}
                              style={{
                                perspective: "800px",
                                transformStyle: "preserve-3d",
                              }}
                            >
                              <Led3DBox isOn={led.on} size={28} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/70 p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-slate-300">Controls</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${isPlaying
                        ? "border border-red-500/40 bg-red-500/10 text-red-200 hover:border-red-400"
                        : "border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:border-emerald-300"
                      }`}
                  >
                    {isPlaying ? "⏹ Stop" : "▶ Play"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-300"
                  >
                    ⛶ Fullscreen
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-300">
                    Rotation
                  </p>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span>X Axis</span>
                        <span className="text-emerald-300 font-semibold">
                          {rotateX}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotateX}
                        onChange={(event) =>
                          setRotateX(Number(event.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span>Y Axis</span>
                        <span className="text-emerald-300 font-semibold">
                          {rotateY}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotateY}
                        onChange={(event) =>
                          setRotateY(Number(event.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {isPlaying && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs text-slate-400">
                      Current frame delay:
                    </p>
                    <p className="text-sm font-semibold text-emerald-300 mt-1">
                      {frames[playFrameIndex].delayMs}ms
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
          <pre className="mt-4 h-80 overflow-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-200">
            {generatedCode}
          </pre>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Import Scene
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Load a previously exported scene from a JSON file.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Scene name
              </label>
              <input
                type="text"
                value={sceneName}
                onChange={(e) => setSceneName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
                placeholder="My imported scene"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-700 p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    importScene(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-300"
              >
                📁 Select JSON file
              </button>
              <p className="text-xs text-slate-500 mt-2">
                or drag and drop a scene file
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="flex-1 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
