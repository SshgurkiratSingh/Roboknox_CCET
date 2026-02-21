"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";

// Web Serial API types
type SerialPort = {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
};

type LogEntry = {
  id: string;
  type: "info" | "tx" | "rx" | "error";
  message: string;
  timestamp: string;
};

type CubeData = number[][][]; // [z][y][x]

const baudOptions = [9600, 19200, 38400, 57600, 115200, 230400] as const;

const buildTimestamp = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const makeEmptyCube = (): CubeData =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0)),
  );

const cloneCube = (cube: CubeData): CubeData =>
  cube.map((layer) => layer.map((row) => [...row]));

// Convert cube to hex string format for transmission
const cubeToHex = (cube: CubeData): string => {
  const bytes: number[] = [];
  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (cube[z][y][x]) {
          const byteIndex = z * 9 + y * 3 + x;
          const bytePos = Math.floor(byteIndex / 8);
          const bitPos = byteIndex % 8;
          if (!bytes[bytePos]) bytes[bytePos] = 0;
          bytes[bytePos] |= 1 << bitPos;
        }
      }
    }
  }
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Convert hex string to cube
const hexToCube = (hex: string): CubeData => {
  const cube = makeEmptyCube();
  const bytes = hex.match(/.{1,2}/g) || [];
  for (let i = 0; i < bytes.length; i++) {
    const byte = parseInt(bytes[i], 16);
    for (let bit = 0; bit < 8; bit++) {
      if (byte & (1 << bit)) {
        const index = i * 8 + bit;
        const z = Math.floor(index / 9);
        const y = Math.floor((index % 9) / 3);
        const x = index % 3;
        if (z < 3 && y < 3 && x < 3) {
          cube[z][y][x] = 1;
        }
      }
    }
  }
  return cube;
};

export default function SerialLedPortal() {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [baudRate, setBaudRate] =
    useState<(typeof baudOptions)[number]>(115200);
  const [cube, setCube] = useState<CubeData>(makeEmptyCube());
  const [activeLayer, setActiveLayer] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "Connect your LED controller to begin.",
  );

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<string> | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof navigator !== "undefined" && "serial" in navigator,
    );
  }, []);

  const appendLog = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLogEntries((prev) => {
      const next = [
        ...prev,
        {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: buildTimestamp(),
        },
      ];
      return next.slice(-200);
    });
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      }
      if (writerRef.current) {
        writerRef.current.releaseLock();
      }
      if (portRef.current) {
        await portRef.current.close();
      }
    } catch (error) {
      appendLog({
        type: "error",
        message: `Disconnect error: ${String(error)}`,
      });
    } finally {
      readerRef.current = null;
      writerRef.current = null;
      portRef.current = null;
      setIsConnected(false);
      setStatusMessage("Disconnected. You can reconnect any time.");
    }
  }, [appendLog]);

  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  const startReadLoop = useCallback(
    async (reader: ReadableStreamDefaultReader<string>) => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            appendLog({ type: "rx", message: value.trim() });
          }
        }
      } catch (error) {
        appendLog({
          type: "error",
          message: `Read error: ${String(error)}`,
        });
      }
    },
    [appendLog],
  );

  const connect = useCallback(async () => {
    if (!isSupported) return;

    try {
      setStatusMessage("Requesting serial port...");
      const port = await (navigator as unknown as { serial: { requestPort: () => Promise<SerialPort> } }).serial.requestPort();
      await port.open({ baudRate });

      const encoder = new TextEncoderStream();
      void encoder.readable.pipeTo(
        port.writable as unknown as WritableStream<Uint8Array>,
      );
      const writer = encoder.writable.getWriter();

      const decoder = new TextDecoderStream();
      void port.readable.pipeTo(
        decoder.writable as unknown as WritableStream<Uint8Array>,
      );
      const reader = decoder.readable.getReader();

      portRef.current = port;
      readerRef.current = reader;
      writerRef.current = writer;
      setIsConnected(true);
      setStatusMessage("Connected. Send a command to update the LEDs.");
      appendLog({
        type: "info",
        message: `Connected at ${baudRate} baud`,
      });

      void startReadLoop(reader);
    } catch (error) {
      setStatusMessage("Unable to connect. Check device permissions.");
      appendLog({
        type: "error",
        message: `Connection error: ${String(error)}`,
      });
    }
  }, [appendLog, baudRate, isSupported, startReadLoop]);

  const sendCommand = useCallback(async () => {
    if (!writerRef.current) return;

    const hexPayload = cubeToHex(cube);
    const command = `CUBE:${hexPayload}`;

    try {
      await writerRef.current.write(`${command}\n`);
      appendLog({ type: "tx", message: command });
      setStatusMessage("Frame sent to LED cube.");
    } catch (error) {
      appendLog({
        type: "error",
        message: `Send error: ${String(error)}`,
      });
      setStatusMessage("Failed to send frame.");
    }
  }, [cube, appendLog]);

  const toggleLed = (x: number, y: number, z: number) => {
    setCube((prev) => {
      const updated = cloneCube(prev);
      updated[z][y][x] = updated[z][y][x] ? 0 : 1;
      return updated;
    });
  };

  const clearCube = () => {
    setCube(makeEmptyCube());
  };

  const fillCube = () => {
    setCube(
      Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
          Array.from({ length: 3 }, () => 1),
        ),
      ),
    );
  };

  const importHex = (hex: string) => {
    try {
      const importedCube = hexToCube(hex);
      setCube(importedCube);
      appendLog({ type: "info", message: `Imported cube pattern from hex` });
    } catch (error) {
      appendLog({
        type: "error",
        message: `Failed to import hex: ${String(error)}`,
      });
    }
  };

  const clearLog = useCallback(() => {
    setLogEntries([]);
  }, []);

  const headerBadge = useMemo(
    () =>
      isConnected ? (
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Live Session
        </span>
      ) : (
        <span className="rounded-full bg-slate-700/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          Offline
        </span>
      ),
    [isConnected],
  );

  if (!isSupported) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-slate-200">
        <h2 className="text-2xl font-semibold">Serial portal unavailable</h2>
        <p className="mt-3 text-sm text-slate-400">
          Your browser doesn’t support the Web Serial API. Use Chrome, Edge, or
          another Chromium-based browser on desktop to connect via USB.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">3x3x3 LED Cube Control</h2>
            <p className="mt-2 text-sm text-slate-400">{statusMessage}</p>
          </div>
          {headerBadge}
        </div>

        <div className="mt-6 grid gap-4">
          {/* Connection Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Connect</h3>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-slate-400">Baud rate</label>
              <select
                value={baudRate}
                onChange={(event) =>
                  setBaudRate(Number(event.target.value) as typeof baudRate)
                }
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
                disabled={isConnected}
              >
                {baudOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="rounded-full border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300"
                >
                  Connect
                </button>
              ) : (
                <button
                  onClick={() => void disconnect()}
                  className="rounded-full border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-400"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Cube Editor Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Design Pattern
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Active Layer:</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((z) => (
                    <button
                      key={`layer-${z}`}
                      type="button"
                      onClick={() => setActiveLayer(z)}
                      className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${
                        activeLayer === z
                          ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                          : "border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cube Grid Editor */}
              <div className="flex justify-center">
                <div className="inline-block rounded-2xl border border-emerald-400/30 bg-slate-900/60 p-6">
                  <div className="mb-3 text-center text-sm font-semibold text-emerald-300">
                    Layer {activeLayer}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {cube[activeLayer].map((row, y) =>
                      row.map((cell, x) => (
                        <button
                          key={`${x}-${y}-${activeLayer}`}
                          type="button"
                          onClick={() => toggleLed(x, y, activeLayer)}
                          className={`h-12 w-12 rounded-lg border-2 transition ${
                            cell
                              ? "border-emerald-400 bg-emerald-400/90 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                              : "border-slate-600 bg-slate-900/80 hover:border-emerald-400/60"
                          }`}
                        />
                      )),
                    )}
                  </div>
                </div>
              </div>

              {/* Pattern Actions */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={clearCube}
                  className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={fillCube}
                  className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500"
                >
                  Fill
                </button>
              </div>
            </div>
          </div>

          {/* Send Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Send</h3>
            <button
              type="button"
              onClick={() => void sendCommand()}
              className="w-full rounded-full border border-emerald-400/40 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 disabled:opacity-40"
              disabled={!isConnected}
            >
              📤 Send to LED Cube
            </button>
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-400">Hex payload:</p>
              <p className="text-xs text-emerald-300 font-mono break-all mt-1">
                {cubeToHex(cube)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Serial Monitor</h3>
          <span className="text-xs text-slate-500">
            {logEntries.length} lines
          </span>
        </div>
        <div className="mt-4 max-h-96 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
          {logEntries.length === 0 ? (
            <p className="text-slate-500">
              No data yet. Connect and send a pattern to see responses.
            </p>
          ) : (
            <ul className="space-y-2">
              {logEntries.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span className="text-slate-500">{entry.timestamp}</span>
                  <span
                    className={
                      entry.type === "tx"
                        ? "text-emerald-300"
                        : entry.type === "rx"
                          ? "text-sky-300"
                          : entry.type === "error"
                            ? "text-red-300"
                            : "text-slate-300"
                    }
                  >
                    {entry.type.toUpperCase()}
                  </span>
                  <span className="text-slate-200">{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={clearLog}
            className="flex-1 rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          >
            Clear log
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h4 className="text-sm font-semibold text-slate-200">Firmware Setup</h4>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Your LED cube microcontroller needs firmware that:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-400 ml-2">
            <li>✓ Listens on serial (USB) at the baud rate selected above</li>
            <li>✓ Expects commands in format: <code className="text-emerald-300">CUBE:hexstring</code></li>
            <li>✓ Decodes 27 bits (3×3×3 LEDs) from hex payload</li>
            <li>✓ Updates LED states in real-time</li>
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">
              Complete Firmware Code
            </h4>
            <button
              onClick={() => {
                const code = `// 3x3x3 LED Cube Serial Control
// Arduino / ESP32 Compatible

#define BAUD_RATE 115200

// Define your LED pins here (example for Arduino)
// Pin layout: cube[z][y][x] connected to digital pins
int ledPins[3][3][3] = {
  // Layer 0 (z=0)
  { {2,3,4}, {5,6,7}, {8,9,10} },
  // Layer 1 (z=1)
  { {11,12,13}, {A0,A1,A2}, {A3,A4,A5} },
  // Layer 2 (z=2)
  { {22,23,24}, {25,26,27}, {28,29,30} }
};

void setup() {
  Serial.begin(BAUD_RATE);
  
  // Set all LED pins as output
  for (int z = 0; z < 3; z++) {
    for (int y = 0; y < 3; y++) {
      for (int x = 0; x < 3; x++) {
        pinMode(ledPins[z][y][x], OUTPUT);
        digitalWrite(ledPins[z][y][x], LOW);
      }
    }
  }
  
  Serial.println("LED Cube Ready!");
}

void loop() {
  // Check for serial commands
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\\n');
    command.trim();
    
    // Parse CUBE:hexstring format
    if (command.startsWith("CUBE:")) {
      String hexPayload = command.substring(5);
      updateCubeFromHex(hexPayload);
      Serial.println("OK");
    } else {
      Serial.println("ERR");
    }
  }
}

void updateCubeFromHex(String hex) {
  // Decode hex string to LED states
  // Format: 27 bits (3×3×3), bit-packed
  
  for (int i = 0; i < 27; i++) {
    int byteIndex = i / 8;
    int bitIndex = i % 8;
    
    // Get hex byte
    if (byteIndex * 2 < hex.length()) {
      String hexByte = hex.substring(byteIndex * 2, byteIndex * 2 + 2);
      int byte = strtol(hexByte.c_str(), NULL, 16);
      
      // Extract bit
      int ledState = (byte >> bitIndex) & 1;
      
      // Calculate position
      int z = i / 9;
      int y = (i % 9) / 3;
      int x = i % 3;
      
      // Update LED
      if (z < 3 && y < 3 && x < 3) {
        digitalWrite(ledPins[z][y][x], ledState ? HIGH : LOW);
      }
    }
  }
}

// Optional: Function to test all LEDs
void testAllLeds() {
  for (int z = 0; z < 3; z++) {
    for (int y = 0; y < 3; y++) {
      for (int x = 0; x < 3; x++) {
        digitalWrite(ledPins[z][y][x], HIGH);
        delay(100);
        digitalWrite(ledPins[z][y][x], LOW);
      }
    }
  }
}`;
                navigator.clipboard.writeText(code).then(() => {
                  appendLog({ type: "info", message: "Code copied to clipboard!" });
                }).catch(() => {
                  // Fallback
                  const textarea = document.createElement("textarea");
                  textarea.value = code;
                  document.body.appendChild(textarea);
                  textarea.select();
                  document.execCommand("copy");
                  document.body.removeChild(textarea);
                  appendLog({ type: "info", message: "Code copied to clipboard!" });
                });
              }}
              className="text-xs rounded px-2 py-1 border border-emerald-400/40 text-emerald-300 hover:border-emerald-300 transition"
            >
              Copy Code
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Complete Arduino code ready to upload to your microcontroller:
          </p>
          <pre className="mt-2 bg-slate-950/80 rounded p-3 text-xs text-emerald-300 overflow-x-auto leading-relaxed font-mono max-h-80 text-[9px]">
{`// 3x3x3 LED Cube Serial Control
// Arduino / ESP32 Compatible

#define BAUD_RATE 115200

// Define your LED pins (example)
int ledPins[3][3][3] = {
  { {2,3,4}, {5,6,7}, {8,9,10} },
  { {11,12,13}, {A0,A1,A2}, {A3,A4,A5} },
  { {22,23,24}, {25,26,27}, {28,29,30} }
};

void setup() {
  Serial.begin(BAUD_RATE);
  for (int z = 0; z < 3; z++)
    for (int y = 0; y < 3; y++)
      for (int x = 0; x < 3; x++)
        pinMode(ledPins[z][y][x], OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd.startsWith("CUBE:")) {
      updateCubeFromHex(cmd.substring(5));
      Serial.println("OK");
    }
  }
}

void updateCubeFromHex(String hex) {
  for (int i = 0; i < 27; i++) {
    int byteIdx = i / 8;
    int bitIdx = i % 8;
    if (byteIdx * 2 < hex.length()) {
      String hb = hex.substring(byteIdx*2, byteIdx*2+2);
      int byte = strtol(hb.c_str(), NULL, 16);
      int state = (byte >> bitIdx) & 1;
      int z = i / 9, y = (i % 9) / 3, x = i % 3;
      digitalWrite(ledPins[z][y][x], state ? HIGH : LOW);
    }
  }
}`}
          </pre>
          <p className="mt-2 text-xs text-slate-300">
            ✓ Modify <code className="text-emerald-300">ledPins</code> array to match your wiring
          </p>
          <p className="text-xs text-slate-300">
            ✓ Set <code className="text-emerald-300">BAUD_RATE</code> to match your selection above
          </p>
          <p className="text-xs text-slate-300">
            ✓ Upload to your board and connect via USB
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h4 className="text-sm font-semibold text-slate-200">Upload Steps</h4>
          <ol className="mt-2 space-y-2 text-xs text-slate-400 list-decimal list-inside">
            <li>Copy the code using button above</li>
            <li>Paste into Arduino IDE or PlatformIO</li>
            <li>Modify pin configuration for your hardware</li>
            <li>Set baud rate to 115200 (or your preference)</li>
            <li>Upload firmware to microcontroller</li>
            <li>Connect here with matching baud rate</li>
            <li>Design patterns and send to LED cube</li>
          </ol>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h4 className="text-sm font-semibold text-slate-200">About</h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-400">
            <li>• Design patterns using the 3x3x3 grid editor.</li>
            <li>• Patterns are converted to hex format automatically.</li>
            <li>• Ensure your firmware accepts CUBE: prefix commands.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
