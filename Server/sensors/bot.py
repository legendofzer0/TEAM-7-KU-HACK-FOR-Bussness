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
You can control the hardware like LED and fan. ***
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
    smoke_alert_triggered = False

    while arduino and arduino.is_open:
        try:
            if arduino.in_waiting > 0:
                line = arduino.readline().decode('utf-8').strip()

                if "SMOKE_ALERT" in line:
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
def ChatBot(query):
    messages = load_chat_log()
    messages.append({"role": "user", "content": query})

    try:
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

        # Command mapping block
        command = query.lower()

        if ("turn on light" in command or 
            "light on" in command or 
            "turn on led" in command) and "off" not in command:
            
            user = input("Enter which light to turn on (1 or 2): ")
            if user == "1":
                send_command_to_arduino("LED1_ON")
            elif user == "2":
                send_command_to_arduino("LED2_ON")
            else:
                print("Invalid input, please enter 1 or 2.")

        elif ("turn off light" in command or 
              "light off" in command or 
              "turn off led" in command) and "on" not in command:
            
            user = input("Enter which light to turn off (1 or 2): ")
            if user == "1":
                send_command_to_arduino("LED1_OFF")
            elif user == "2":
                send_command_to_arduino("LED2_OFF")
            else:
                print("Invalid input, please enter 1 or 2.")

        elif "turn off fan" in command or "fan off" in command:
            send_command_to_arduino("FAN_ON")

        elif "turn on fan" in command or "fan on" in command:
            send_command_to_arduino("FAN_OFF")

        return "Bot: " + AnswerModifier(answer)

    except Exception as e:
        print(f"Error: {e}")
        return "Something went wrong while processing your query."
# Main loop
if __name__ == "__main__":
    os.system('cls' if os.name == 'nt' else 'clear')
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
