<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name') }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0f0f1e;
            position: relative;
            height: 100vh;
            padding: 10px;
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
        }

        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(78, 205, 196, 0.2) 0%, transparent 50%);
            animation: gradientShift 15s ease infinite;
            pointer-events: none;
        }

        @keyframes gradientShift {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0.8;
            }
        }

        .main-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 20px;
            box-shadow:
                0 8px 32px 0 rgba(31, 38, 135, 0.37),
                inset 0 1px 1px rgba(255, 255, 255, 0.1);
            height: calc(100vh - 20px);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .header-title {
            text-align: center;
            font-weight: 700;
            font-size: 1.4rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
            animation: titleGlow 3s ease-in-out infinite;
        }

        @keyframes titleGlow {

            0%,
            100% {
                filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.5));
            }

            50% {
                filter: drop-shadow(0 0 20px rgba(118, 75, 162, 0.8));
            }
        }

        .info-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
            position: relative;
            overflow: hidden;
        }

        .info-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg,
                    transparent,
                    rgba(255, 255, 255, 0.03),
                    transparent);
            transform: rotate(45deg);
            transition: all 0.6s;
        }

        .info-card:hover::before {
            left: 100%;
        }

        .info-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            border-color: rgba(102, 126, 234, 0.5);
        }

        .info-icon {
            font-size: 1.8rem;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
            animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {

            0%,
            100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.1);
            }
        }

        .info-value {
            font-size: 1.3rem;
            font-weight: 700;
            margin: 8px 0;
            color: #fff;
            text-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
        }

        .info-label {
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .gas-map {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 12px;
            margin: 10px 0;
            flex: 1;
            overflow: hidden;
            position: relative;
        }

        .gas-map::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
            animation: mapGlow 4s ease-in-out infinite;
        }

        @keyframes mapGlow {

            0%,
            100% {
                opacity: 0.5;
                transform: scale(1);
            }

            50% {
                opacity: 1;
                transform: scale(1.1);
            }
        }

        .gas-map h5 {
            font-size: 0.9rem;
            margin: 8px 0;
            color: #fff;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .gas-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin: 8px 0;
            position: relative;
            z-index: 1;
        }

        .gas-sensor {
            padding: 10px 5px;
            border-radius: 12px;
            text-align: center;
            font-weight: 700;
            font-size: 0.85rem;
            border: 2px solid transparent;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .gas-sensor::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .gas-sensor:hover::before {
            left: 100%;
        }

        .gas-sensor:hover {
            transform: translateY(-3px) scale(1.05);
        }

        .gas-sensor.safe {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            border-color: rgba(56, 239, 125, 0.5);
            box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
        }

        .gas-sensor.warning {
            background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
            color: #1a1a2e;
            border-color: rgba(242, 201, 76, 0.5);
            box-shadow: 0 4px 15px rgba(242, 201, 76, 0.4);
            animation: warningPulse 2s ease-in-out infinite;
        }

        .gas-sensor.caution {
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
            color: white;
            border-color: rgba(255, 107, 107, 0.5);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
            animation: warningPulse 1.5s ease-in-out infinite;
        }

        .gas-sensor.danger {
            background: linear-gradient(135deg, #eb3b5a 0%, #fc5c65 100%);
            color: white;
            border-color: rgba(252, 92, 101, 0.8);
            box-shadow: 0 4px 15px rgba(252, 92, 101, 0.6);
            animation: dangerPulse 1s ease-in-out infinite;
        }

        @keyframes warningPulse {

            0%,
            100% {
                box-shadow: 0 4px 15px rgba(242, 201, 76, 0.4);
            }

            50% {
                box-shadow: 0 4px 25px rgba(242, 201, 76, 0.8);
            }
        }

        @keyframes dangerPulse {

            0%,
            100% {
                box-shadow: 0 4px 15px rgba(252, 92, 101, 0.6);
                transform: scale(1);
            }

            50% {
                box-shadow: 0 4px 30px rgba(252, 92, 101, 1);
                transform: scale(1.05);
            }
        }

        .compass {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 40px;
            height: 40px;
            animation: compassSpin 20s linear infinite;
        }

        @keyframes compassSpin {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .camera-section {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 12px;
            margin: 10px 0;
            flex: 1;
            overflow: hidden;
        }

        .camera-section h5 {
            font-size: 0.9rem;
            margin-bottom: 8px;
            color: #fff;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .camera-feed {
            width: 100%;
            height: 180px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(102, 126, 234, 0.3);
            box-shadow:
                0 4px 20px rgba(0, 0, 0, 0.5),
                inset 0 0 20px rgba(102, 126, 234, 0.1);
        }

        .camera-feed::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(0deg,
                    transparent,
                    transparent 2px,
                    rgba(102, 126, 234, 0.03) 2px,
                    rgba(102, 126, 234, 0.03) 4px);
            animation: scanline 10s linear infinite;
            pointer-events: none;
        }

        @keyframes scanline {
            from {
                transform: translateY(0);
            }

            to {
                transform: translateY(50%);
            }
        }

        .camera-feed img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.9) contrast(1.1);
        }

        .fire-detection {
            position: absolute;
            top: 8px;
            left: 8px;
            background: linear-gradient(135deg, #eb3b5a 0%, #fc5c65 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.75rem;
            border: 1px solid rgba(252, 92, 101, 0.5);
            box-shadow: 0 4px 15px rgba(252, 92, 101, 0.6);
            animation: fireAlert 1s ease-in-out infinite;
        }

        @keyframes fireAlert {

            0%,
            100% {
                transform: scale(1);
                box-shadow: 0 4px 15px rgba(252, 92, 101, 0.6);
            }

            50% {
                transform: scale(1.05);
                box-shadow: 0 4px 25px rgba(252, 92, 101, 1);
            }
        }

        .camera-controls {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            margin-top: 10px;
            max-width: 200px;
            margin-left: auto;
            margin-right: auto;
        }

        .control-btn {
            padding: 10px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .control-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .control-btn:hover::before {
            width: 300px;
            height: 300px;
        }

        .control-btn:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .control-btn:active {
            transform: translateY(0) scale(0.98);
        }

        .reset-btn {
            grid-column: 2;
            background: linear-gradient(135deg, #eb3b5a 0%, #fc5c65 100%);
            box-shadow: 0 4px 15px rgba(252, 92, 101, 0.4);
        }

        .reset-btn:hover {
            box-shadow: 0 6px 20px rgba(252, 92, 101, 0.6);
        }

        .device-controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 10px 0;
            flex-wrap: wrap;
        }

        .device-btn {
            width: 75px;
            height: 75px;
            border-radius: 50%;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(108, 117, 125, 0.3);
            backdrop-filter: blur(10px);
            color: rgba(255, 255, 255, 0.5);
            box-shadow:
                0 4px 15px rgba(0, 0, 0, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .device-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .device-btn:hover::before {
            width: 200px;
            height: 200px;
        }

        .device-btn.active {
            background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
            color: #1a1a2e;
            border-color: rgba(242, 201, 76, 0.5);
            box-shadow:
                0 6px 25px rgba(242, 201, 76, 0.6),
                inset 0 0 20px rgba(255, 255, 255, 0.2);
            animation: deviceActive 2s ease-in-out infinite;
        }

        @keyframes deviceActive {

            0%,
            100% {
                box-shadow: 0 6px 25px rgba(242, 201, 76, 0.6),
                    inset 0 0 20px rgba(255, 255, 255, 0.2);
            }

            50% {
                box-shadow: 0 8px 35px rgba(242, 201, 76, 0.9),
                    inset 0 0 30px rgba(255, 255, 255, 0.3);
            }
        }

        .device-btn:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
        }

        .device-btn:active {
            transform: translateY(-2px) scale(1.05);
        }

        .device-label {
            font-size: 0.65rem;
            margin-top: 3px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .modal-content {
            border-radius: 20px;
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
        }

        .modal-title {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
        }

        .btn-close {
            filter: invert(1);
            opacity: 0.7;
        }

        .btn-close:hover {
            opacity: 1;
        }

        .mode-btn {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            border-radius: 12px;
            border: 2px solid rgba(102, 126, 234, 0.3);
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .mode-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
            transition: left 0.5s;
        }

        .mode-btn:hover::before {
            left: 100%;
        }

        .mode-btn:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
            border-color: rgba(102, 126, 234, 0.6);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .mode-btn i {
            margin-right: 10px;
        }

        @media (max-width: 768px) {
            .gas-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .info-value {
                font-size: 1rem;
            }

            .device-btn {
                width: 65px;
                height: 65px;
                font-size: 1.6rem;
            }

            .header-title {
                font-size: 1rem;
            }

            .content-wrapper {
                flex-direction: column;
            }

            .left-section,
            .right-section {
                flex: 1;
            }
        }

        .content-wrapper {
            display: flex;
            gap: 15px;
            flex: 1;
            overflow: hidden;
        }

        .left-section {
            flex: 0 0 60%;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .right-section {
            flex: 0 0 40%;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .info-cards-row {
            display: flex;
            gap: 10px;
        }

        .info-cards-row>div {
            flex: 1;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        /* Particle Effect */
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            animation: float 15s infinite;
        }

        @keyframes float {
            0% {
                transform: translateY(100vh) translateX(0);
                opacity: 0;
            }

            10% {
                opacity: 1;
            }

            90% {
                opacity: 1;
            }

            100% {
                transform: translateY(-100vh) translateX(100px);
                opacity: 0;
            }
        }

        .particle:nth-child(1) {
            left: 10%;
            animation-delay: 0s;
        }

        .particle:nth-child(2) {
            left: 20%;
            animation-delay: 2s;
        }

        .particle:nth-child(3) {
            left: 30%;
            animation-delay: 4s;
        }

        .particle:nth-child(4) {
            left: 40%;
            animation-delay: 1s;
        }

        .particle:nth-child(5) {
            left: 50%;
            animation-delay: 3s;
        }

        .particle:nth-child(6) {
            left: 60%;
            animation-delay: 5s;
        }

        .particle:nth-child(7) {
            left: 70%;
            animation-delay: 2.5s;
        }

        .particle:nth-child(8) {
            left: 80%;
            animation-delay: 4.5s;
        }

        .particle:nth-child(9) {
            left: 90%;
            animation-delay: 1.5s;
        }

        .particle:nth-child(10) {
            left: 95%;
            animation-delay: 3.5s;
        }
    </style>
</head>

<body>
    <!-- Particles Background -->
    <div class="particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
    </div>

    <div class="container-fluid h-100">
        <div class="main-card">
            <h1 class="header-title">🐔 Monitoring Kandang Ayam Otomatis</h1>

            <!-- Info Cards -->
            <div class="info-cards-row">
                <div>
                    <div class="info-card">
                        <div class="info-icon"><i class="fas fa-thermometer-half"></i></div>
                        <div class="info-value">
                            <span id="temperature">32</span>°C
                            <span id="humidity">77</span>%
                        </div>
                        <div class="info-label">Suhu & Kelembaban</div>
                    </div>
                </div>
                <div>
                    <div class="info-card">
                        <div class="info-icon"><i class="fas fa-wind"></i></div>
                        <div class="info-value" id="gas-status">AMAN</div>
                        <div class="info-label">Status Gas</div>
                    </div>
                </div>
                <div>
                    <div class="info-card">
                        <div class="info-icon"><i class="fas fa-fire"></i></div>
                        <div class="info-value" id="fire-status">TIDAK TERDETEKSI</div>
                        <div class="info-label">Deteksi Api</div>
                    </div>
                </div>
                <div>
                    <div class="info-card">
                        <div class="info-icon"><i class="fas fa-bolt"></i></div>
                        <div class="info-value" id="pln-status">HIDUP</div>
                        <div class="info-label">Status PLN</div>
                    </div>
                </div>
            </div>

            <div class="content-wrapper">
                <!-- Left Section: Gas Map -->
                <div class="left-section">
                    <div class="gas-map">
                        <div style="position: relative;">
                            <div class="compass">
                                <i class="fas fa-compass"
                                    style="font-size: 2.5rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                            </div>

                            <h5 class="text-center"><i class="fas fa-lightbulb"></i> Area 1</h5>
                            <div class="gas-grid" id="area1-sensors">
                                <div class="gas-sensor safe" data-sensor="1-1">150<small>ppm</small></div>
                                <div class="gas-sensor safe" data-sensor="1-2">200<small>ppm</small></div>
                                <div class="gas-sensor safe" data-sensor="1-3">180<small>ppm</small></div>
                                <div class="gas-sensor safe" data-sensor="1-4">120<small>ppm</small></div>
                            </div>

                            <h5 class="text-center"><i class="fas fa-users"></i> Area 2</h5>
                            <div class="gas-grid" id="area2-sensors">
                                <div class="gas-sensor danger" data-sensor="2-1">1000<small>ppm</small></div>
                                <div class="gas-sensor warning" data-sensor="2-2">500<small>ppm</small></div>
                                <div class="gas-sensor safe" data-sensor="2-3">350<small>ppm</small></div>
                                <div class="gas-sensor safe" data-sensor="2-4">250<small>ppm</small></div>
                            </div>
                        </div>
                    </div>

                    <!-- Device Controls -->
                    <div class="device-controls">
                        <button class="device-btn" id="lamp-btn" data-device="lamp" data-status="off"
                            title="Kontrol Lampu">
                            <i class="fas fa-lightbulb"></i>
                            <span class="device-label">Lampu</span>
                        </button>
                        <button class="device-btn" id="fan1-btn" data-device="fan1" data-status="off"
                            title="Kontrol Kipas 1">
                            <i class="fas fa-fan"></i>
                            <span class="device-label">Kipas 1</span>
                        </button>
                        <button class="device-btn" id="fan2-btn" data-device="fan2" data-status="off"
                            title="Kontrol Kipas 2">
                            <i class="fas fa-fan"></i>
                            <span class="device-label">Kipas 2</span>
                        </button>
                    </div>
                </div>

                <!-- Right Section: Camera -->
                <div class="right-section">
                    <div class="camera-section">
                        <h5 class="text-center">🎥 Deteksi Api & CCTV</h5>
                        <div class="camera-feed" id="camera-feed">
                            <img src="https://via.placeholder.com/400x200/1a1a2e/667eea?text=📹+Live+Camera+Feed"
                                alt="Camera Feed">
                            <div class="fire-detection" id="fire-alert" style="display: none;">
                                <i class="fas fa-fire"></i> API TERDETEKSI!
                            </div>
                        </div>

                        <div class="camera-controls">
                            <div></div>
                            <button class="control-btn" onclick="moveCamera('up')" title="Pan Up">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <div></div>

                            <button class="control-btn" onclick="moveCamera('left')" title="Pan Left">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="control-btn reset-btn" onclick="resetCamera()" title="Reset Position">
                                <i class="fas fa-redo"></i>
                            </button>
                            <button class="control-btn" onclick="moveCamera('right')" title="Pan Right">
                                <i class="fas fa-chevron-right"></i>
                            </button>

                            <div></div>
                            <button class="control-btn" onclick="moveCamera('down')" title="Pan Down">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for Device Control -->
    <div class="modal fade" id="controlModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Kontrol Perangkat</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="current-device">
                    <button class="mode-btn" onclick="setMode('manual')">
                        <i class="fas fa-hand-pointer"></i> Manual
                    </button>
                    <button class="mode-btn" onclick="setMode('auto')">
                        <i class="fas fa-magic"></i> Otomatis
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>

    <script>
        // MQTT Configuration
        const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

        mqttClient.on('connect', function() {
            console.log('Connected to MQTT');

            // Subscribe to topics
            mqttClient.subscribe('kandang/sensor/#');
            mqttClient.subscribe('kandang/control/#');
        });

        mqttClient.on('message', function(topic, message) {
            const data = JSON.parse(message.toString());

            if (topic.includes('temperature')) {
                $('#temperature').text(data.value);
            } else if (topic.includes('humidity')) {
                $('#humidity').text(data.value);
            } else if (topic.includes('gas')) {
                updateGasSensor(data);
            } else if (topic.includes('fire')) {
                updateFireStatus(data.detected);
            } else if (topic.includes('pln')) {
                $('#pln-status').text(data.status);
            }
        });

        // Device Control
        $('.device-btn').click(function() {
            const device = $(this).data('device');
            $('#current-device').val(device);
            $('#modalTitle').text('Kontrol ' + device.charAt(0).toUpperCase() + device.slice(1));
            $('#controlModal').modal('show');
        });

        function setMode(mode) {
            const device = $('#current-device').val();
            const btn = $(`#${device}-btn`);
            const currentStatus = btn.data('status');
            const newStatus = currentStatus === 'off' ? 'on' : 'off';

            $.ajax({
                url: '{{ route('control.device') }}',
                method: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    device: device,
                    action: newStatus,
                    mode: mode
                },
                success: function(response) {
                    if (newStatus === 'on') {
                        btn.addClass('active');
                        btn.data('status', 'on');
                    } else {
                        btn.removeClass('active');
                        btn.data('status', 'off');
                    }

                    // Publish to MQTT
                    mqttClient.publish(`kandang/control/${device}`, JSON.stringify({
                        status: newStatus,
                        mode: mode
                    }));

                    $('#controlModal').modal('hide');
                }
            });
        }

        // Camera Control
        function moveCamera(direction) {
            $.ajax({
                url: '{{ route('control.camera') }}',
                method: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    direction: direction
                },
                success: function(response) {
                    mqttClient.publish('kandang/control/camera', JSON.stringify({
                        action: 'move',
                        direction: direction
                    }));
                }
            });
        }

        function resetCamera() {
            $.ajax({
                url: '{{ route('control.camera') }}',
                method: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    direction: 'reset'
                },
                success: function(response) {
                    mqttClient.publish('kandang/control/camera', JSON.stringify({
                        action: 'reset'
                    }));
                }
            });
        }

        // Update Gas Sensor Display
        function updateGasSensor(data) {
            const sensor = $(`.gas-sensor[data-sensor="${data.area}-${data.sensor}"]`);
            sensor.removeClass('safe warning caution danger');

            if (data.value < 300) {
                sensor.addClass('safe');
            } else if (data.value < 500) {
                sensor.addClass('warning');
            } else if (data.value < 800) {
                sensor.addClass('caution');
            } else {
                sensor.addClass('danger');
            }

            sensor.html(data.value + ' <small>ppm</small>');

            // Update gas status
            const maxValue = Math.max(...$('.gas-sensor').map(function() {
                return parseInt($(this).text());
            }).get());

            if (maxValue < 300) {
                $('#gas-status').text('AMAN');
            } else if (maxValue < 800) {
                $('#gas-status').text('WASPADA');
            } else {
                $('#gas-status').text('BAHAYA');
            }
        }

        // Update Fire Status
        function updateFireStatus(detected) {
            if (detected) {
                $('#fire-status').text('TERDETEKSI');
                $('#fire-alert').show();
            } else {
                $('#fire-status').text('TIDAK TERDETEKSI');
                $('#fire-alert').hide();
            }
        }

        // Simulate real-time updates (for testing without actual sensors)
        setInterval(function() {
            const temp = Math.floor(Math.random() * (35 - 28) + 28);
            const humidity = Math.floor(Math.random() * (80 - 60) + 60);

            $('#temperature').text(temp);
            $('#humidity').text(humidity);
        }, 5000);
    </script>
</body>

</html>
