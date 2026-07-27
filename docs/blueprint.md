# **App Name**: LabGuard Pro

## Core Features:

- Real-time Monitoring: Display real-time data from ESP32 sensors (vibration, temperature, humidity, voltage, current, earth-line status) using Firebase RTDB.
- Role-Based Dashboards: Provide access to different dashboards based on user roles (Admin, Technician, Teacher) authenticated via Firebase Authentication.
- AI-Powered Fault Detection: Predict faults and maintenance needs based on sensor trends, using an AI tool to identify when the predicted faults should be brought to users' attention.
- Automated Scheduling: Generate weekly/monthly maintenance schedules using AI, displayed on an interactive calendar.
- Image-Based Part Identification: Allow technicians to upload machine photos for AI-driven identification of spare parts and market prices.
- CSV Parsing & Classification: Parse CSV files to classify machines into clusters and suggest optimal threshold settings, leveraging an AI tool that reasons over what the optimal setting might be given all machines' stats.
- Downloadable Reports: Generate and download reports in PDF/CSV format, summarizing machine status, maintenance logs, and AI insights.

## Style Guidelines:

- Primary color: Royal blue (#4169E1), symbolizing trust, stability, and authority for Admin dashboard elements.
- Background color: Light gray (#E0E0E0) to ensure clear visibility of content.
- Accent color: Neon cyan (#00FFFF) to provide vibrant contrast and call attention to important interactive elements on the Admin dashboard.
- Body and headline font: 'Inter', a grotesque sans-serif offering a modern, machined look for clear and efficient information display.
- Use consistent, modern icons for representing sensor data, machine status, and maintenance tasks.  Icons should be simple and easily recognizable to enhance user experience.
- Design a responsive layout optimized for both desktop and mobile, ensuring seamless usability. The admin dashboard has multiple panels.
- Employ subtle animations and transitions to provide feedback during interactions and data updates, creating a smooth, engaging user experience. Graphs will have elegant animations for data visualization.