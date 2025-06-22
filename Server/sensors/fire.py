import firebase_admin
import time
from firebase_admin import credentials, db

# Step 1: Load your Firebase service account key
cred = credentials.Certificate("../firebaseCredential.json")  # Replace with your actual file name

# Step 2: Initialize the Firebase app with your Realtime DB URL
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://team-7-ku-hackathon-default-rtdb.asia-southeast1.firebasedatabase.app/'  # 🔁 Replace with your actual DB URL
})

# Step 3: Create references to 'sensors' and 'devices' nodes
sensors_ref = db.reference('sensors')
devices_ref = db.reference('devices')

# Step 4: Function to repeatedly fetch updated data
def poll_firebase():
    while True:
        sensors_data = sensors_ref.get()
        devices_data = devices_ref.get()

        print("=== Firebase Realtime Data ===")
        print("Sensors:", sensors_data)
        print("Devices:", devices_data)
        print("==============================\n")

        time.sleep(5)  # Fetch updates every 5 seconds
# Step 5: Start polling
if __name__ == "__main__":
    poll_firebase()
