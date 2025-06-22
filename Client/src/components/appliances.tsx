import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, set, onValue } from "firebase/database";
import toast from "react-hot-toast";
import "../css/switch.css";

const labels = ["Office Room", "Meeting Room", "Fan"];

type DeviceKey = "office" | "meeting" | "fan";

const deviceKeys: Record<string, DeviceKey> = {
  "Office Room": "office",
  "Meeting Room": "meeting",
  "Fan": "fan",
};

export default function Appliances() {
  const [states, setStates] = useState<Record<DeviceKey, boolean>>({
    office: false,
    meeting: false,
    fan: false,
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const deviceRefs = {
      office: ref(db, "devices/office"),
      meeting: ref(db, "devices/meeting"),
      fan: ref(db, "devices/fan"),
    };

    let updates = 0;
    const total = Object.keys(deviceRefs).length;

    Object.entries(deviceRefs).forEach(([key, r]) => {
      onValue(r, (snapshot) => {
        const value = snapshot.val();
        if (typeof value === "boolean") {
          setStates((prev) => ({ ...prev, [key as DeviceKey]: value }));
        }
        updates++;
        if (updates === total) setLoaded(true);
      });
    });
  }, []);

  const handleToggle = (key: DeviceKey) => {
    const newState = !states[key];
    set(ref(db, `devices/${key}`), newState)
      .then(() => toast.success(`${key} turned ${newState ? "on" : "off"}`))
      .catch(() => toast.error(`Failed to update ${key}`));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Appliances</h2>

      {!loaded ? (
        <p>Loading device status...</p>
      ) : (
        labels.map((label) => {
          const key = deviceKeys[label];
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                margin: "1rem 0",
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
                <span className="slider round"></span>
              </label>
            </div>
          );
        })
      )}
    </div>
  );
}
