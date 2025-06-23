# TEAM-7-KU-HACK-FOR-Bussness

🔍 Project Overview :

Concept of Smart home / office 
-Makes the life CONVENIENT and easier and provides SECURITY.
( We integrated AI with differnet IOT components to make the 
environment responsive a and accessiable to all)

🎯 Problem Statement


- accessibility issue ( old/ disabled people)
- energy wastage (unattended appliance)
- unawareness
- security issue / safety issue

💡 Solution Description
   -  Idea was to create a INTUATIVE and EASY to operate userinterface (UI) , by using which
     anyone can operate their environment.
Features :
-Personal assistant 
-Voice control 
-send awareness notification 
-Real time News updates 
-answer real time querries 
-easy data train (learns during the conversation )


4. ⚙️ Tech Stack / Tools Used
Frontend: React
Backend: Node.js + python
Voice Interface: 
Hardware: Arduino uno, Led, Fan, Relay, Smoke Sensor, L298 Moduel, IR, Servo  
Database: Firebase

5.🚀 Working Principle
                                                              

                                                +------------+           (open connection)            +--------------+
                                                |  Frontend  | <------------------------------------> | FastAPI WS   |
                                                |  (Browser) |     ws://localhost:8000/ws             | Backend      |
                                                +------------+                                        +--------------+
                                                       ↓                                                      ↑
                                             Send Message: user_message("")                         Receives + Processes
                                                       ↓                                                      ↑
                                             socket.send(AI.RESPOND())              →                 Send back

6. 🌱 Future Scope / Improvements
   - Improve on The ai hardware connection
   - Implementing wireless connection
   - implement more iot components like motion,potentiometer for bulb.
   - Beeterment and simplifying the UI/UX
   - Database (excell sheet) analysis by the Personal assistant for easy abstarction of required data (best for scenerious where laard data is stored i:e business, hospital , medical etc)

9. 👨‍💻 Team Information
  - team name == TEAM-7
  -   members
    = Jnish Maharjan
    = Aayushman Singh Malla
    = Anirudda Rai

  
   
