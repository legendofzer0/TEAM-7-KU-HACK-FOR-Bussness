import os
import time
import serial
import firebase_admin
from firebase_admin import credentials, db

# === CONFIGURATION ===
SERIAL_PORT = 'COM4'     # 👈 Replace with your actual port (e.g., COM4 or /dev/ttyUSB0)
BAUD_RATE = 9600
FIREBASE_DB_URL = 'https://team-7-ku-hackathon-default-rtdb.asia-southeast1.firebasedatabase.app/'

# === Load Firebase Credential ===
credential_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'firebaseCredential.json'))

# === Initialize Serial Communication ===
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)  # Give time for Arduino to reset
    print(f"✅ Connected to Arduino on {SERIAL_PORT}")
except Exception as e:
    print("❌ Could not connect to Arduino:", e)
    ser = None

# === Function to Send Command to Arduino ===
def send_command_to_arduino(command):
    if ser and ser.is_open:
        ser.write((command + '\n').encode())
        print(f"✅ Sent to Arduino: {command}")
    else:
        print("❌ Serial connection is not open.")

# === Main Firebase Logic ===
try:
    print("🔍 Looking for Firebase credentials at:", credential_path)

    # Load credentials and initialize Firebase
    cred = credentials.Certificate(credential_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_DB_URL
    })

    print("✅ Firebase connection successful!")

    devices_ref = db.reference('devices')

    # Last known state to avoid redundant commands
    last_states = {
        "office": None,
        "meeting": None,
        "fan": None
    }

    def poll_firebase():
        while True:
            devices_data = devices_ref.get()

            if devices_data:
                # === OFFICE light ===
                office_state = devices_data.get("office")
                if office_state != last_states["office"]:
                    last_states["office"] = office_state
                    send_command_to_arduino("LED1_ON" if office_state else "LED1_OFF")

                # === MEETING light ===
                meeting_state = devices_data.get("meeting")
                if meeting_state != last_states["meeting"]:
                    last_states["meeting"] = meeting_state
                    send_command_to_arduino("LED2_ON" if meeting_state else "LED2_OFF")

                # === FAN ===
                fan_state = devices_data.get("fan")
                if fan_state != last_states["fan"]:
                    last_states["fan"] = fan_state
                    send_command_to_arduino("FAN_OFF" if fan_state else "FAN_ON")

            time.sleep(2)

    # === Start polling loop ===
    if __name__ == "__main__":
        poll_firebase()

except FileNotFoundError as e:
    print("❌ Credential file not found.")
    print("Details:", e)

except Exception as e:
    print("❌ Firebase initialization failed.")
    print("Details:", e)
