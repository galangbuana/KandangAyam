# 🐔 Smart Chicken Coop Monitoring System

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge\&logo=laravel\&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge\&logo=php\&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-IoT-3C5280?style=for-the-badge\&logo=eclipsemosquitto\&logoColor=white)

**Smart Monitoring and Automation System for Broiler Chicken Farms Using Internet of Things (IoT)**

</div>

---

## 📖 Overview

Smart Chicken Coop Monitoring System is an IoT-based platform designed to monitor environmental conditions and automate equipment inside poultry farms. The system integrates sensors, actuators, MQTT communication, and a Laravel-based web dashboard to provide real-time monitoring and control.

This project aims to improve farm productivity, reduce manual intervention, and enhance livestock safety through intelligent monitoring and automation.

---

## ✨ Features

### 🌡 Environmental Monitoring

* Real-time temperature monitoring
* Real-time humidity monitoring
* LPG gas detection
* Smoke detection
* Flame detection

### 🎛 Device Control

* Manual light control
* Automatic light control
* Manual fan control
* Automatic fan control
* Servo camera control

### 📊 Dashboard Monitoring

* Real-time sensor visualization
* Interactive charts using Chart.js
* Device status monitoring
* Responsive web dashboard

### 📡 IoT Communication

* MQTT-based communication
* Real-time data transmission
* Lightweight messaging protocol
* ESP32 integration support

---

## 🏗 System Architecture

```text
+----------------+
|     ESP32      |
+-------+--------+
        |
        | MQTT
        v
+----------------+
| MQTT Broker    |
| (HiveMQ/EMQX)  |
+-------+--------+
        |
        |
+-------v--------+
| Laravel 12     |
| Web Dashboard  |
+----------------+
```

---

## 🛠 Technology Stack

### Backend

* PHP 8.2
* Laravel 12
* Laravel Blade

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* jQuery
* Chart.js

### IoT & Communication

* MQTT Protocol
* HiveMQ Broker
* ESP32
* Paho MQTT Client

---

## 📂 Project Structure

```bash
app/
├── Http/
│   ├── Controllers/
│   └── Middleware/
├── Services/
├── Providers/

resources/
├── views/
│   ├── dashboard.blade.php
│   └── setting.blade.php

public/
routes/
```

---

## ⚙ Requirements

Before running the project, make sure you have installed:

* PHP >= 8.2
* Composer
* Node.js
* NPM
* MQTT Broker (HiveMQ, Mosquitto, EMQX)

---

## 🚀 Installation

### 1. Clone Repository

```bash
https://github.com/galangbuana/KandangAyam.git

cd KandangAyam
```

### 2. Install Dependencies

```bash
composer install
```

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

### 4. Configure MQTT

Edit the `.env` file:

```env
MQTT_HOST=broker.hivemq.com
MQTT_PORT=1884
MQTT_CLIENT_ID=chicken_coop_client
MQTT_USE_WEBSOCKETS=false
MQTT_USERNAME=
MQTT_PASSWORD=
```

### 5. Start Application

Laravel Server:

```bash
php artisan serve
```

Frontend Assets:

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:8000
```

---

## 📷 Dashboard Modules

* Temperature Monitoring
* Humidity Monitoring
* LPG Gas Monitoring
* Smoke Monitoring
* Flame Detection Monitoring
* Camera Monitoring
* Fan Control
* Lighting Control
* System Settings

---

## 📡 MQTT Topics

| Topic              | Description                  |
| ------------------ | ---------------------------- |
| sensor/temperature | Temperature Sensor Data      |
| sensor/humidity    | Humidity Sensor Data         |
| sensor/gas         | LPG Gas Sensor Data          |
| sensor/smoke       | Smoke Sensor Data            |
| sensor/flame       | Flame Sensor Data            |
| control/fan        | Fan Control Command          |
| control/light      | Light Control Command        |
| control/camera     | Camera Servo Control Command |

---

## 🔒 Future Improvements

* AI-based chicken behavior analysis
* YOLOv8 fire detection
* Solar panel backup integration
* Mobile application integration
* Push notification system
* Predictive environmental analytics

---

## 👨‍💻 Author

**I Komang Raditia Galang Buana**

Information Technology Student
ITB STIKOM Bali

---

## 📄 License

This project is developed for academic research, educational purposes, and IoT innovation development.

---

⭐ If you find this project useful, don't forget to give it a star.
