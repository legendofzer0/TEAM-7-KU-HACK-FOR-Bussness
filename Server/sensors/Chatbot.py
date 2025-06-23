from groq import Groq
from json import load, dump
import datetime
import time
import threading
from dotenv import dotenv_values
import os
import serial
# Load environment variables
env_vars = dotenv_values(".env")
Username = env_vars.get("Username", "User")
Assistantname = env_vars.get("Assistantname", "Assistant")
GroqAPIKey = env_vars.get("GroqAPIKey")

# Initialize Groq client
client = Groq(api_key=GroqAPIKey)
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
*** Do not tell time until I ask, do not talk too much, just answer the question.***
*** Reply in only English, even if the question is in Hindi, reply in English.***
*** Do not provide notes in the output, just answer the question and never mention your training data. ***
"""
SystemChatBot = [{"role": "system", "content": System}]

def RealtimeInformation():
    now = datetime.datetime.now()
    return f"Current day: {now.strftime('%A')}\nDate: {now.strftime('%d %B %Y')}, Time: {now.strftime('%H:%M:%S')}"

def AnswerModifier(answer):
    return '\n'.join([line for line in answer.split('\n') if line.strip()])

def load_chat_log():
    os.makedirs("Data", exist_ok=True)
    path = "Data/ChatLog.json"
    try:
        with open(path, "r") as f:
            return load(f)
    except FileNotFoundError:
        with open(path, "w") as f:
            dump([], f)
        return []
def send_command_to_arduino(command):
    if arduino and arduino.is_open:
        arduino.write((command + "\n").encode())
        print(f"[Sent to Arduino]: {command}")
    else:
        print("Arduino is not connected.")
def save_chat_log(messages):
    with open("Data/ChatLog.json", "w") as f:
        dump(messages, f, indent=4)

def ChatBot(query):
    messages = load_chat_log()
    messages.append({"role": "user", "content": query})

    try:
        # Call LLM
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=SystemChatBot + [{"role": "system", "content": RealtimeInformation()}] + messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=1,
            stream=True,
        )

        # Stream response
        answer = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                answer += chunk.choices[0].delta.content

        answer = answer.replace("</s>", "")
        messages.append({"role": "assistant", "content": answer})
        save_chat_log(messages)

        # Hardware control
        command = query.lower()

        # === OFFICE LIGHT CONTROL ===
        if (
            "turn on office" in command or
            "office light on" in command or
            "can you turn on office light" in command or
            "turn on the office light" in command
        ):
            send_command_to_arduino("LED1_ON")

        elif (
            "turn off office" in command or
            "office light off" in command or
            "can you turn off office light" in command or
            "turn off the office light" in command
        ):
            send_command_to_arduino("LED1_OFF")

        # === MEETING LIGHT CONTROL ===
        elif (
            "turn on meeting" in command or
            "meeting light on" in command or
            "can you turn on meeting light" in command or
            "turn on the meeting light" in command
        ):
            send_command_to_arduino("LED2_ON")

        elif (
            "turn off meeting" in command or
            "meeting light off" in command or
            "can you turn off meeting light" in command or
            "turn off the meeting light" in command
        ):
            send_command_to_arduino("LED2_OFF")

        # === FAN CONTROL ===
        elif "turn on fan" in command or "fan on" in command or "can you turn on the fan" in command:
            send_command_to_arduino("FAN_OFF")

        elif "turn off fan" in command or "fan off" in command or "can you turn off the fan" in command:
            send_command_to_arduino("FAN_ON")

        return "Bot: " + AnswerModifier(answer)

    except Exception as e:
        print(f"Error: {e}")
        return "Something went wrong while processing your query."

# Main loop
if __name__ == "__main__":
    while True:
        user_input = input("Enter your Question: ")
        print(ChatBot(user_input))
