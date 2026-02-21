"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Card } from "@/components/ui/Card";

type Widget = {
  id: string;
  name: string;
  type: "text-display" | "gauge" | "graph" | "button" | "toggle" | "slider";
  topic: string;
  value: string | number | boolean;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
};

type MQTTConfig = {
  broker: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
};

type LogEntry = {
  id: string;
  type: "info" | "pub" | "sub" | "error";
  message: string;
  timestamp: string;
};

const buildTimestamp = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

export default function IoTDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<MQTTConfig>({
    broker: "broker.mqtt.cool",
    port: 9001,
    clientId: `roboknox_${Math.random().toString(36).substring(7)}`,
    username: "",
    password: "",
  });

  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "demo1",
      name: "Temperature",
      type: "gauge",
      topic: "sensors/temperature",
      value: 24,
      min: 0,
      max: 50,
      unit: "°C",
      color: "emerald",
    },
    {
      id: "demo2",
      name: "Status LED",
      type: "toggle",
      topic: "lights/led1",
      value: false,
    },
  ]);

  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "Configure broker and connect to begin.",
  );
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [newWidgetConfig, setNewWidgetConfig] = useState({
    name: "",
    type: "text-display" as Widget["type"],
    topic: "",
  });

  useEffect(() => {
    // MQTT.js would be loaded from CDN or npm
  }, []);

  const appendLog = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLogEntries((prev) => {
      const next = [
        ...prev,
        {
          ...entry,
          id: generateId(),
          timestamp: buildTimestamp(),
        },
      ];
      return next.slice(-150);
    });
  }, []);

  const connect = useCallback(async () => {
    try {
      setStatusMessage("Connecting to broker...");
      appendLog({
        type: "info",
        message: `Connecting to ${config.broker}:${config.port}`,
      });

      // MQTT.js connection would be implemented here
      // For now, simulating connection
      setTimeout(() => {
        setIsConnected(true);
        setStatusMessage("Connected to MQTT broker");
        appendLog({ type: "info", message: "Connected successfully" });
      }, 500);
    } catch (error) {
      setStatusMessage("Failed to connect to broker");
      appendLog({
        type: "error",
        message: `Connection error: ${String(error)}`,
      });
    }
  }, [config, appendLog]);

  const disconnect = useCallback(() => {
    try {
      // MQTT disconnect logic
      setIsConnected(false);
      setStatusMessage("Disconnected from broker");
      appendLog({ type: "info", message: "Disconnected" });
    } catch (error) {
      appendLog({
        type: "error",
        message: `Disconnect error: ${String(error)}`,
      });
    }
  }, [appendLog]);

  const publishMessage = useCallback(
    (topic: string, message: string | number | boolean) => {
      if (!isConnected) {
        appendLog({ type: "error", message: "Not connected to broker" });
        return;
      }

      try {
        // MQTT publish logic
        appendLog({
          type: "pub",
          message: `Published to ${topic}: ${message}`,
        });
      } catch (error) {
        appendLog({
          type: "error",
          message: `Publish error: ${String(error)}`,
        });
      }
    },
    [isConnected, appendLog],
  );

  const addWidget = useCallback(() => {
    if (!newWidgetConfig.name || !newWidgetConfig.topic) {
      appendLog({ type: "error", message: "Widget name and topic required" });
      return;
    }

    const widget: Widget = {
      id: generateId(),
      name: newWidgetConfig.name,
      type: newWidgetConfig.type,
      topic: newWidgetConfig.topic,
      value:
        newWidgetConfig.type === "toggle"
          ? false
          : newWidgetConfig.type === "gauge"
            ? 0
            : "",
      min: newWidgetConfig.type === "gauge" ? 0 : undefined,
      max: newWidgetConfig.type === "gauge" ? 100 : undefined,
    };

    setWidgets((prev) => [...prev, widget]);
    setNewWidgetConfig({ name: "", type: "text-display", topic: "" });
    setShowAddWidget(false);
    appendLog({
      type: "info",
      message: `Added widget: ${newWidgetConfig.name}`,
    });
  }, [newWidgetConfig, appendLog]);

  const removeWidget = useCallback(
    (id: string) => {
      const widget = widgets.find((w) => w.id === id);
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      if (widget) {
        appendLog({
          type: "info",
          message: `Removed widget: ${widget.name}`,
        });
      }
    },
    [widgets, appendLog],
  );

  const updateWidgetValue = useCallback(
    (id: string, value: string | number | boolean) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, value } : w)),
      );

      const widget = widgets.find((w) => w.id === id);
      if (widget) {
        publishMessage(widget.topic, value);
      }
    },
    [widgets, publishMessage],
  );

  const clearLog = useCallback(() => {
    setLogEntries([]);
  }, []);

  const statusBadge = useMemo(
    () =>
      isConnected ? (
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
          Connected
        </span>
      ) : (
        <span className="rounded-full bg-slate-700/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          Offline
        </span>
      ),
    [isConnected],
  );

  const TextDisplayWidget = ({ widget }: { widget: Widget }) => (
    <div className="rounded-2xl border border-slate-700 bg-[#111111] p-4">
      <p className="text-xs text-secondary">{widget.name}</p>
      <p className="mt-2 text-2xl font-semibold text-neon">
        {widget.value}
        {widget.unit && <span className="ml-1 text-sm">{widget.unit}</span>}
      </p>
      <p className="mt-1 text-xs text-slate-500">{widget.topic}</p>
    </div>
  );

  const GaugeWidget = ({ widget }: { widget: Widget }) => {
    const percentage =
      ((Number(widget.value) - (widget.min || 0)) /
        ((widget.max || 100) - (widget.min || 0))) *
      100;
    return (
      <div className="rounded-2xl border border-slate-700 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary">{widget.name}</p>
            <p className="mt-2 text-2xl font-semibold text-neon">
              {widget.value}
              {widget.unit && <span className="ml-1 text-sm">{widget.unit}</span>}
            </p>
          </div>
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 282.6} 282.6`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                fontSize="20"
                fill="#10b981"
                fontWeight="bold"
              >
                {Math.round(percentage)}%
              </text>
            </svg>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">{widget.topic}</p>
      </div>
    );
  };

  const ToggleWidget = ({ widget }: { widget: Widget }) => (
    <div className="rounded-2xl border border-slate-700 bg-[#111111] p-4">
      <p className="text-xs text-secondary">{widget.name}</p>
      <button
        onClick={() =>
          updateWidgetValue(widget.id, !widget.value)
        }
        className={`mt-3 h-10 w-16 rounded-full border-2 transition ${widget.value
          ? "border-neon bg-emerald-400/20"
          : "border-slate-600 bg-slate-800/60"
          }`}
      >
        <div
          className={`h-8 w-8 rounded-full bg-white transition ${widget.value ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
      <p className="mt-2 text-xs text-slate-500">{widget.topic}</p>
      <p className="mt-1 text-sm font-semibold text-neon">
        {widget.value ? "ON" : "OFF"}
      </p>
    </div>
  );

  const ButtonWidget = ({ widget }: { widget: Widget }) => (
    <div className="rounded-2xl border border-slate-700 bg-[#111111] p-4">
      <p className="text-xs text-secondary">{widget.name}</p>
      <button
        onClick={() => updateWidgetValue(widget.id, "pressed")}
        className="mt-3 w-full rounded-full border border-neon/40 px-4 py-3 text-sm font-semibold text-neon transition hover:border-emerald-300"
      >
        Press Button
      </button>
      <p className="mt-2 text-xs text-slate-500">{widget.topic}</p>
    </div>
  );

  const SliderWidget = ({ widget }: { widget: Widget }) => (
    <div className="rounded-2xl border border-slate-700 bg-[#111111] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-secondary">{widget.name}</p>
          <p className="mt-2 text-2xl font-semibold text-neon">
            {widget.value}
          </p>
        </div>
      </div>
      <input
        type="range"
        min={widget.min || 0}
        max={widget.max || 100}
        value={widget.value as number}
        onChange={(e) =>
          updateWidgetValue(widget.id, Number(e.target.value))
        }
        className="mt-3 w-full"
      />
      <p className="mt-2 text-xs text-slate-500">{widget.topic}</p>
    </div>
  );

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case "text-display":
        return <TextDisplayWidget key={widget.id} widget={widget} />;
      case "gauge":
        return <GaugeWidget key={widget.id} widget={widget} />;
      case "toggle":
        return <ToggleWidget key={widget.id} widget={widget} />;
      case "button":
        return <ButtonWidget key={widget.id} widget={widget} />;
      case "slider":
        return <SliderWidget key={widget.id} widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <section className="p-8 w-full max-w-[1400px] mx-auto grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Main Content */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[#1a1a1a] pb-4">
          <div>
            <h2 className="font-display font-bold text-white text-xl tracking-wider">{"// IOT_DASHBOARD"}</h2>
            <p className="mt-2 text-sm text-secondary font-mono">{statusMessage}</p>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {/* Broker Configuration */}
          <div className="rounded-2xl border border-slate-800 bg-[#111111] p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              MQTT Broker
            </h3>
            <div className="grid gap-3">
              <div>
                <label className="text-xs text-secondary">Broker Address</label>
                <input
                  type="text"
                  value={config.broker}
                  onChange={(e) =>
                    setConfig({ ...config, broker: e.target.value })
                  }
                  disabled={isConnected}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 disabled:opacity-50"
                  placeholder="broker.example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-secondary">Port</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) =>
                      setConfig({ ...config, port: Number(e.target.value) })
                    }
                    disabled={isConnected}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary">Client ID</label>
                  <input
                    type="text"
                    value={config.clientId}
                    onChange={(e) =>
                      setConfig({ ...config, clientId: e.target.value })
                    }
                    disabled={isConnected}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-secondary">Username</label>
                  <input
                    type="text"
                    value={config.username || ""}
                    onChange={(e) =>
                      setConfig({ ...config, username: e.target.value })
                    }
                    disabled={isConnected}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary">Password</label>
                  <input
                    type="password"
                    value={config.password || ""}
                    onChange={(e) =>
                      setConfig({ ...config, password: e.target.value })
                    }
                    disabled={isConnected}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {!isConnected ? (
                  <button
                    onClick={connect}
                    className="flex-1 rounded-full border border-neon/40 px-4 py-2 text-sm font-semibold text-neon transition hover:border-emerald-300"
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={disconnect}
                    className="flex-1 rounded-full border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:border-red-300"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Widgets Grid */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Widgets</h3>
              <button
                onClick={() => setShowAddWidget(!showAddWidget)}
                disabled={!isConnected}
                className="text-xs rounded px-2 py-1 border border-neon/40 text-neon hover:border-emerald-300 transition disabled:opacity-40"
              >
                + Add Widget
              </button>
            </div>

            {showAddWidget && (
              <div className="mb-4 rounded-2xl border border-slate-700 bg-[#111111] p-4">
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-secondary">Widget Name</label>
                    <input
                      type="text"
                      value={newWidgetConfig.name}
                      onChange={(e) =>
                        setNewWidgetConfig({
                          ...newWidgetConfig,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
                      placeholder="e.g., Temperature Sensor"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary">MQTT Topic</label>
                    <input
                      type="text"
                      value={newWidgetConfig.topic}
                      onChange={(e) =>
                        setNewWidgetConfig({
                          ...newWidgetConfig,
                          topic: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
                      placeholder="e.g., sensors/temperature"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary">Widget Type</label>
                    <select
                      value={newWidgetConfig.type}
                      onChange={(e) =>
                        setNewWidgetConfig({
                          ...newWidgetConfig,
                          type: e.target.value as Widget["type"],
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
                    >
                      <option value="text-display">Text Display</option>
                      <option value="gauge">Gauge</option>
                      <option value="toggle">Toggle</option>
                      <option value="button">Button</option>
                      <option value="slider">Slider</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addWidget}
                      className="flex-1 rounded-full border border-neon/40 px-3 py-2 text-xs font-semibold text-neon transition hover:border-emerald-300"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddWidget(false)}
                      className="flex-1 rounded-full border border-slate-600 px-3 py-2 text-xs font-semibold text-secondary transition hover:border-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {widgets.map((widget) => (
                <div key={widget.id} className="relative group">
                  {renderWidget(widget)}
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded p-1 bg-red-500/20 text-red-300 text-xs transition hover:bg-red-500/40"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {widgets.length === 0 && !showAddWidget && (
              <div className="rounded-2xl border border-slate-700 bg-[#111111] p-8 text-center">
                <p className="text-sm text-secondary">
                  No widgets yet. Connect to a broker and add widgets to display
                  MQTT data.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Sidebar: Serial Monitor & Help */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">MQTT Monitor</h3>
          <span className="text-xs text-slate-500">{logEntries.length} logs</span>
        </div>
        <div className="mt-4 max-h-96 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 space-y-2">
          {logEntries.length === 0 ? (
            <p className="text-slate-500">
              No activity yet. Connect to broker to see logs.
            </p>
          ) : (
            logEntries.map((entry) => (
              <div key={entry.id} className="flex gap-2">
                <span className="text-slate-500 min-w-fit">{entry.timestamp}</span>
                <span
                  className={
                    entry.type === "pub"
                      ? "text-neon"
                      : entry.type === "sub"
                        ? "text-sky-300"
                        : entry.type === "error"
                          ? "text-red-300"
                          : "text-slate-300"
                  }
                >
                  {entry.type.toUpperCase()}
                </span>
                <span className="text-slate-200">{entry.message}</span>
              </div>
            ))
          )}
        </div>
        <button
          onClick={clearLog}
          className="mt-3 w-full rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-secondary transition hover:border-slate-500"
        >
          Clear Logs
        </button>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#111111] p-4">
          <h4 className="text-sm font-semibold text-slate-200">Public Brokers</h4>
          <ul className="mt-3 space-y-2 text-xs text-secondary">
            <li>
              <code className="text-neon">broker.mqtt.cool</code>
            </li>
            <li>
              <code className="text-neon">test.mosquitto.org</code>
            </li>
            <li>
              <code className="text-neon">broker.emqx.io</code>
            </li>
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-[#111111] p-4">
          <h4 className="text-sm font-semibold text-slate-200">Topic Examples</h4>
          <ul className="mt-3 space-y-1 text-xs text-secondary">
            <li>• <code>sensors/temperature</code></li>
            <li>• <code>home/lights/kitchen</code></li>
            <li>• <code>device/status</code></li>
            <li>• <code>iot/humidity/bedroom</code></li>
          </ul>
        </div>

      </Card>
    </section>
  );
}
