import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, set, onValue, off } from "firebase/database";
import toast from "react-hot-toast";
import "../css/switch.css";

type DeviceKey = "office" | "meeting" | "fan";

const groupedDevices: {
  category: string;
  items: { label: string; key: DeviceKey }[];
}[] = [
  {
    category: "Lights",
    items: [
      { label: "Office Room", key: "office" },
      { label: "Meeting Room", key: "meeting" },
    ],
  },
  {
    category: "Fan",
    items: [{ label: "Fan", key: "fan" }],
  },
];

export default function Appliances() {
  const [states, setStates] = useState<Record<DeviceKey, boolean>>({
    office: false,
    meeting: false,
    fan: false,
  });

  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false); // prevent multiple rapid toggles

  useEffect(() => {
    const deviceRefs = {
      office: ref(db, "devices/office"),
      meeting: ref(db, "devices/meeting"),
      fan: ref(db, "devices/fan"),
    };

    let updates = 0;
    const total = Object.keys(deviceRefs).length;

    const listeners: (() => void)[] = [];

    Object.entries(deviceRefs).forEach(([key, r]) => {
      const unsubscribe = onValue(r, (snapshot) => {
        const value = snapshot.val();
        if (typeof value === "boolean") {
          setStates((prev) => ({ ...prev, [key as DeviceKey]: value }));
        }
        updates++;
        if (updates === total) setLoaded(true);
      });

      // Track unsubscribe manually
      listeners.push(() => off(r));
    });

    return () => {
      listeners.forEach((unsub) => unsub());
    };
  }, []);

  const handleToggle = (key: DeviceKey) => {
    if (busy) return;
    setBusy(true);

    const newState = !states[key];
    set(ref(db, `devices/${key}`), newState)
      .then(() => toast.success(`${key} turned ${newState ? "on" : "off"}`))
      .catch(() => toast.error(`Failed to update ${key}`))
      .finally(() => setTimeout(() => setBusy(false), 500)); // 0.5s throttle
  };

  return (
    <div className="ApplicationBack" style={{ padding: "1rem" }}>
      <h2>Appliances</h2>

      {!loaded ? (
        <p>Loading device status...</p>
      ) : (
        groupedDevices.map((group) => (
          <div key={group.category} style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>{group.category}</h3>
            {group.items.map(({ label, key }) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "0.5rem 0",
                  gap: "1rem",
                }}
              >
                <label style={{ minWidth: 120 }}>{label}</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={states[key]}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
