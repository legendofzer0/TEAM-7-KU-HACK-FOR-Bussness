import os
import time
import serial
import threading
import firebase_admin
from firebase_admin import credentials, db

# === CONFIGURATION ===
SERIAL_PORT = 'COM4'     # 👈 Replace with your actual port
BAUD_RATE = 9600
FIREBASE_DB_URL = 'https://team-7-ku-hackathon-default-rtdb.asia-southeast1.firebasedatabase.app/'

# === Load Firebase Credential ===
credential_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'firebaseCredential.json'))

# === Initialize Serial Communication ===
try:
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)  # Allow Arduino to reset
    print(f"✅ Connected to Arduino on {SERIAL_PORT}")
except Exception as e:
    print("❌ Could not connect to Arduino:", e)
    arduino = None

# === Send command to Arduino ===
def send_command_to_arduino(command):
    if arduino and arduino.is_open:
        arduino.write((command + '\n').encode())
        print(f"✅ Sent to Arduino: {command}")
    else:
        print("❌ Serial connection is not open.")

# === Listen for Smoke Alerts from Arduino ===
# === Listen for Smoke Alerts from Arduino ===
def listen_for_arduino_alerts():
    smoke_ref = db.reference('Sensors/Smoke')
    smoke_alert_triggered = False

    while arduino and arduino.is_open:
        try:
            if arduino.in_waiting > 0:
                line = arduino.readline().decode('utf-8').strip()
                #print("📩 Arduino says:", line)

                # === If smoke is detected ===
                if "SMOKE_ALERT" in line:
                    if not smoke_alert_triggered:
                        smoke_alert_triggered = True
                        print("🔥 Smoke detected!")
                        smoke_ref.set("smoke detected")  # ✅ update Firebase

                # === If air is clear ===
                elif "CLEAR" in line:
                    if smoke_alert_triggered:
                        smoke_alert_triggered = False
                        print("✅ Smoke cleared.")
                        smoke_ref.set("normal")  # ✅ update Firebase
        except Exception as e:
            print("⚠️ Error reading from Arduino:", e)

# === Main Firebase Logic ===
try:
    print("🔍 Looking for Firebase credentials at:", credential_path)

    # Initialize Firebase
    cred = credentials.Certificate(credential_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_DB_URL
    })

    print("✅ Firebase connected.")

    devices_ref = db.reference('devices')

    # Keep track of device states
    last_states = {
        "office": None,
        "meeting": None,
        "fan": None
    }

    def poll_firebase():
        while True:
            devices_data = devices_ref.get()
            if devices_data:
                # Office Light
                office_state = devices_data.get("office")
                if office_state != last_states["office"]:
                    last_states["office"] = office_state
                    send_command_to_arduino("LED1_ON" if office_state else "LED1_OFF")

                # Meeting Light
                meeting_state = devices_data.get("meeting")
                if meeting_state != last_states["meeting"]:
                    last_states["meeting"] = meeting_state
                    send_command_to_arduino("LED2_ON" if meeting_state else "LED2_OFF")

                # Fan Control
                fan_state = devices_data.get("fan")
                if fan_state != last_states["fan"]:
                    last_states["fan"] = fan_state
                    send_command_to_arduino("FAN_OFF" if fan_state else "FAN_ON")

            time.sleep(2)

    # === Start both Firebase polling and Arduino listener ===
    if __name__ == "__main__":
        threading.Thread(target=poll_firebase, daemon=True).start()
        listen_for_arduino_alerts()

except FileNotFoundError as e:
    print("❌ Credential file not found.")
    print("Details:", e)

except Exception as e:
    print("❌ Firebase initialization failed.")
    print("Details:", e)
