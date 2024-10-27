High School Quiz Application
============================

Welcome to our dynamic quiz application, built to conduct engaging and interactive surveys in high schools. This project enables seamless survey administration, data analysis, and real-time interaction, making it an invaluable resource for educational institutions.

Key Features
------------

*   **Admin and Participant Interfaces**: Separate, streamlined interfaces for administrators and participants, ensuring a smooth and intuitive user experience.
    
*   **JSON-Structured Quizzes**: Admins can define quizzes using a JSON format file, enabling quick and customizable quiz sessions.
    
*   **QR Code Integration**: Generate and display QR codes for easy participant access, promoting quick and convenient joining.
    
*   **Real-Time Control**: Powered by WebSockets, admins have full control over quiz progression, allowing participants to proceed only when prompted.
    
*   **Diverse Question Types**: Supports multiple question formats, including radio buttons, checkboxes, text areas, sliders, and highlighters.
    
*   **Interactive Statistics**: View detailed statistics for each question, including gender-divided responses and overall participation metrics.
    
*   **Leaderboards and Points**: Foster engagement with points and leaderboard features, motivating participants through competition.
    
*   **Excel Data Export**: Effortlessly export session data to Excel for analysis and reporting.
    

This project enhances the survey experience and provides comprehensive tools for data analysis, combining education and technology to create a powerful tool for high schools.

Technology Stack
----------------

*   **WebSockets**: Enables real-time interaction and control over quiz sessions.
    
*   **JSON**: Provides a flexible and efficient configuration for quizzes.
    
*   **Excel Export**: Simplifies data handling and post-session reporting.
    
*   **Frontend**: HTML/CSS, Google Charts for visual statistics.
    
*   **Backend**: Node.js, Express.js, and MySQL for a robust and scalable server infrastructure.
    

Skills Utilized
---------------

*   **Backend Development**: Node.js, Express.js, MySQL
    
*   **Frontend Development**: HTML/CSS, Google Charts, JavaScript
    
*   **Real-Time Communication**: WebSockets for real-time quiz control
    
*   **Data Management**: JSON for quiz configuration, Excel for data export
    
*   **Project Planning and Management**: Coordinating an educational technology tool from concept to deployment
    

Project Structure
-----------------
```bash
Project Structure
├── Backend
│   ├── config
│   │   └── database.js
│   ├── controllers
│   │   ├── Admin
│   │   │   └── sessionController.js
│   │   └── User
│   │       ├── sessionsControllerUser.js
│   │       ├── responseController.js
│   │       └── userController.js
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   └── webSocketserver.js
│   ├── routes
│   │   ├── Admin
│   │   │   └── sessionRoutes.js
│   │   ├── userRoutes.js
│   │   └── responseRoutes.js
│   ├── utils
│   │   └── logger.js
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── test.json
│   └── ustvari_tabele.js
├── Frontend
│   ├── Admin
│   │   ├── graph.html
│   │   ├── leaderboard.html
│   │   ├── Naziv.html
│   │   ├── Pregled_Seje.html
│   │   ├── Prijava.html
│   │   ├── QrURL.html
│   │   ├── Registracija.html
│   │   ├── Seja.html
│   │   ├── sliderGraph.html
│   │   └── TextAreaAnswers.html
│   ├── css
│   ├── Javascript
│   │   └── Admin
│   │       ├── backbutton.js
│   │       ├── index.js
│   │       ├── pocakaj.js
│   │       ├── sklopi.js
│   │       ├── tocke.js
│   │       └── vprasanje.js
│   ├── Slike
│   ├── index.html
│   ├── pocakaj.html
│   ├── sklop.html
│   ├── Vprasanja.html
└── .gitignore
```

# Getting Started


1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Gjoce/High-School-Survey-App.git
    cd High-School-Survey-App
    cd backend
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Configure Environment Variables**: Create a `.env` file with the necessary environment variables as required in `server.js`.
   ```bash
   DB_HOST={YOUR HOST}
   DB_USER={YOUR USER}
   DB_PASSWORD={YOUR PASSWORD}
   DB_NAME={YOUR DB NAME}
   PORT={YOUR PORT}
   JWT_SECRET ={YOUR SECRET KEY}
    ```

5. **Start the Application**:
    ```bash
    npm start
    ```

6. **Access the Application**:
    - Admin Interface: [http://localhost:[PORT]/Admin/Prijava.html]
    - Participant Interface: [http://localhost:[PORT]/index.html?id=[SESSION ID]]

Acknowledgments
---------------

Proud to work on a project that integrates education, technology, and data analysis to create a valuable tool for high school education! 🎉
