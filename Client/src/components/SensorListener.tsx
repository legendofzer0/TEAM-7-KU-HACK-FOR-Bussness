// SensorListener.tsx
import { useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import axios from "axios";
import toast from "react-hot-toast";

export default function SensorListener() {
  useEffect(() => {
    const db = getDatabase();
    const smokeRef = ref(db, "Sensors/smoke");

    const unsubscribe = onValue(smokeRef, async (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        toast.success(`🔥 Smoke Sensor changed: ${value}`);

        try {
          await axios.post("http://localhost:8000/sensor-event/", {
            sensor_type: "smoke",
            value: value,
          });
        } catch (err) {
          console.error("Failed to notify backend:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
