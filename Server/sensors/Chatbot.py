from groq import Groq
from json import load, dump
import datetime
import time
import serial
import threading
from dotenv import dotenv_values
import os

# Load environment variables
env_vars = dotenv_values(".env")
Username = env_vars.get("Username", "User")
Assistantname = env_vars.get("Assistantname", "Assistant")
GroqAPIKey = env_vars.get("GroqAPIKey")

# Initialize Groq client
client = Groq(api_key=GroqAPIKey)

# Serial setup
try:
    arduino = serial.Serial(port='COM4', baudrate=9600, timeout=1)
    time.sleep(2)
    print("✅ Arduino connected successfully.")
except serial.SerialException as e:
    print("❌ Could not connect to Arduino:", e)
    arduino = None

# System prompt
System = f"""
Hello, I am {Username}, You are a very accurate and advanced AI chatbot named {Assistantname} which also has real-time up-to-date information from the internet.
*** Do not tell time until I ask, do not talk too much, just answer the question. your creator is team 7***
*** Reply in only English, even if the question is in Hindi, reply in English.***
*** Do not provide notes in the output, just answer the question and never mention your training data.
You can control the hardware like LED and fan. 
when user can say turn on and off the led or light then turn on the led or off the led***
"""
SystemChatBot = [{"role": "system", "content": System}]

def RealtimeInformation():
    now = datetime.datetime.now()
    return f"Current day: {now.strftime('%A')}\nDate: {now.strftime('%d %B %Y')}, Time: {now.strftime('%H:%M:%S')}"

def AnswerModifier(answer):
    return '\n'.join([line for line in answer.split('\n') if line.strip()])

def send_command_to_arduino(command):
    if arduino and arduino.is_open:
        arduino.write((command + "\n").encode())
        print(f"[Sent to Arduino]: {command}")
    else:
        print("Arduino is not connected.")

def load_chat_log():
    os.makedirs("Data", exist_ok=True)
    path = "Data/Chatlog.json"
    try:
        with open(path, "r") as f:
            return load(f)
    except FileNotFoundError:
        with open(path, "w") as f:
            dump([], f)
        return []

def save_chat_log(messages):
    with open("Data/ChatLog.json", "w") as f:
        dump(messages, f, indent=4)


def listen_for_arduino_alerts():
    global latest_temperature
    smoke_alert_triggered = False

    while arduino and arduino.is_open:
        try:
            if arduino.in_waiting > 0:
                line = arduino.readline().decode('utf-8').strip()

                if line.startswith("TEMP:"):
                    try:
                        temp_val = float(line.split(":")[1])
                        latest_temperature = temp_val
                    except:
                        pass

                elif "SMOKE_ALERT" in line:
                    if not smoke_alert_triggered:
                        smoke_alert_triggered = True
                        print("\n🔥 Smoke detected! Notifying chatbot...\n")
                        print(ChatBot("Smoke detected"))
                        print("\nEnter your Question: ", end="", flush=True)
                elif "CLEAR" in line:
                    smoke_alert_triggered = False
        except Exception as e:
            print("⚠️ Error in Arduino listener:", e)


# Start listener thread
listener_thread = threading.Thread(target=listen_for_arduino_alerts, daemon=True)
listener_thread.start()

# Simulate state tracking (could be moved to DB or cache)
component_states = {
    "LED1": False,
    "LED2": False,
    "FAN": False
}

def ChatBot(query):
    messages = load_chat_log()
    messages.append({"role": "user", "content": query})

    try:
        # Get response from LLM
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=SystemChatBot + [{"role": "system", "content": RealtimeInformation()}] + messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=1,
            stream=True,
        )

        answer = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                answer += chunk.choices[0].delta.content

        answer = answer.replace("</s>", "")
        messages.append({"role": "assistant", "content": answer})
        save_chat_log(messages)

        # Normalize user query
        command = query.lower()

        response_note = ""

        # TURN ON LED
        if any(kw in command for kw in ["turn on led", "led on", "light on", "switch on light"]):
            user = input("Which LED do you want to turn ON? (1 or 2): ")
            led_key = f"LED{user}"
            if led_key in component_states:
                if component_states[led_key]:
                    response_note += f"\n{led_key} is already ON."
                else:
                    send_command_to_arduino(f"{led_key}_ON")
                    component_states[led_key] = True
                    response_note += f"\n{led_key} turned ON successfully."
            else:
                response_note += "\nInvalid LED selection."

        # TURN OFF LED
        elif any(kw in command for kw in ["turn off led", "led off", "light off", "switch off light"]):
            user = input("Which LED do you want to turn OFF? (1 or 2): ")
            led_key = f"LED{user}"
            if led_key in component_states:
                if not component_states[led_key]:
                    response_note += f"\n{led_key} is already OFF."
                else:
                    send_command_to_arduino(f"{led_key}_OFF")
                    component_states[led_key] = False
                    response_note += f"\n{led_key} turned OFF successfully."
            else:
                response_note += "\nInvalid LED selection."

        # TURN ON FAN
        elif any(kw in command for kw in ["turn on fan", "fan on", "start fan"]):
            if component_states["FAN"]:
                response_note += "\nFan is already ON."
            else:
                send_command_to_arduino("FAN_ON")
                component_states["FAN"] = True
                response_note += "\nFan turned ON successfully."

        # TURN OFF FAN
        elif any(kw in command for kw in ["turn off fan", "fan off", "stop fan"]):
            if not component_states["FAN"]:
                response_note += "\nFan is already OFF."
            else:
                send_command_to_arduino("FAN_OFF")
                component_states["FAN"] = False
                response_note += "\nFan turned OFF successfully."

        return "Bot: " + AnswerModifier(answer + response_note)

    except Exception as e:
        print(f"Error: {e}")
        return "Something went wrong while processing your query."

# Main loop
if __name__ == "__main__":
    
    print("\t\t\t\t\t\t\tWelcome to the ChatBot! Type your question below.\n")
    print("""\t\t\t\t\t\t+------------+           (open connection)            +--------------+
\t\t\t\t\t\t|  Frontend  | <------------------------------------> | FastAPI WS   |
\t\t\t\t\t\t|  (Browser) |     ws://localhost:8000/ws             | Backend      |
\t\t\t\t\t\t+------------+                                        +--------------+
\t\t\t\t\t\t       ↓                                                      ↑
\t\t\t\t\t\tSend Message: user_message("")                         Receives + Processes
\t\t\t\t\t\t       ↓                                                      ↑
 \t\t\t\t\t\tsocket.send(ChatBot_respond())              →         Send back 
""")
    while True:
        user_input = input("Enter your Question: ")
        print(ChatBot(user_input))
