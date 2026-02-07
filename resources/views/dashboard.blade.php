@extends('layouts.app')

@section('title', 'Smart Kandang Dashboard')

@push('styles')
    @vite('resources/css/dashboard.css')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
@endpush

@push('styles')
    <style>
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(59, 130, 246, 0.6);
            border-radius: 50%;
            animation: float linear infinite;
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

        .fire-overlay {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 65, 108, 0.3);
            border-radius: 12px;
            align-items: center;
            justify-content: center;
        }

        .fire-box {
            background: rgba(0, 0, 0, 0.8);
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
        }

        .fire-box i {
            color: #ff416c;
        }

        .fire-box h3 {
            color: #fff;
            margin-bottom: 0.5rem;
        }

        .fire-box p {
            color: #fff;
            margin: 0;
        }

        .camera-feed-container {
            position: relative;
        }
    </style>
@endpush

@php
    $particleStyles = [];
    for ($i = 0; $i < 20; $i++) {
        $left = rand(0, 100);
        $delay = rand(0, 30);
        $duration = rand(15, 40);
        $particleStyles[] = "left: {$left}%; animation-delay: -{$delay}s; animation-duration: {$duration}s";
    }
@endphp

@section('content')
    <div class="particles">
        @foreach ($particleStyles as $style)
            <div class="particle" style="{{ $style }}"></div>
        @endforeach
    </div>

    <div class="main-card">
        <h1 class="header-title">
            <i class="fas fa-chart-line"></i> Dashboard Monitoring Kandang Ayam
        </h1>

        <div class="info-cards-row">
            <div class="info-card">
                <div class="info-header">
                    <div class="info-label">Suhu & Kelembaban</div>
                    <div class="info-icon"><i class="fas fa-temperature-high"></i></div>
                </div>
                <div class="info-value">
                    <span id="val-temp">--</span><small>°C</small>
                    <span class="mx-2 text-white-50">/</span>
                    <span id="val-hum">--</span><small>%</small>
                </div>
            </div>

            <div class="info-card">
                <div class="info-header">
                    <div class="info-label">Status Gas LPG</div>
                    <div class="info-icon"><i class="fas fa-wind"></i></div>
                </div>
                <div class="info-value" id="status-gas-global">AMAN</div>
            </div>

            <div class="info-card">
                <div class="info-header">
                    <div class="info-label">Deteksi Api</div>
                    <div class="info-icon"><i class="fas fa-fire-extinguisher"></i></div>
                </div>
                <div class="info-value" id="status-fire">AMAN</div>
            </div>

            <div class="info-card">
                <div class="info-header">
                    <div class="info-label">Status PLN</div>
                    <div class="info-icon"><i class="fas fa-bolt"></i></div>
                </div>
                <div class="info-value" id="status-pln">HIDUP</div>
            </div>
        </div>

        <div class="content-wrapper">

            <div class="left-section">
                <div class="section-card gas-map-section">
                    <div class="section-header">
                        <i class="fas fa-map-marked-alt text-primary"></i> Peta Sebaran Gas LPG
                    </div>

                    <div class="gas-map-container">
                        <div class="area-block">
                            <h6 class="area-title">AREA 1 (DEPAN)</h6>
                            <div class="sensor-grid">
                                <div class="sensor-box" id="gas-a2-s4"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a2-s3"><span>--</span> <small>ppm</small></div>


                                <div class="sensor-box" id="gas-a1-s2"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a1-s1"><span>--</span> <small>ppm</small></div>

                            </div>
                        </div>
                        <div class="area-block">
                            <h6 class="area-title">AREA 2 (BELAKANG)</h6>
                            <div class="sensor-grid">
                                <div class="sensor-box" id="gas-a2-s2"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a2-s1"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a1-s3"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a1-s4"><span>--</span> <small>ppm</small></div>

                            </div>
                        </div>

                    </div>

                    <div id="gas-alert-message" class="gas-alert-box" style="display: none;">
                        <i class="fas fa-exclamation-triangle fa-lg"></i>
                        <span id="gas-alert-text">Peringatan: Terdeteksi Kadar Gas Berbahaya!</span>
                    </div>
                </div>

                <div class="section-card device-section">
                    <div class="section-header">
                        <i class="fas fa-sliders-h text-primary"></i> Kontrol Perangkat
                    </div>
                    <div class="device-controls">
                        <button class="device-btn" id="btn-lampu" onclick="openControlModal('lampu', 'Lampu Kandang')">
                            <div class="icon-wrapper"><i class="fas fa-lightbulb"></i></div>
                            <span class="device-label">Lampu Utama</span>
                            <span class="device-status">OFF</span>
                        </button>

                        <button class="device-btn" id="btn-fan" onclick="openControlModal('fan', 'Kipas Kandang')">
                            <div class="icon-wrapper"><i class="fas fa-fan"></i></div>
                            <span class="device-label">Kipas Kandang</span>
                            <span class="device-status">OFF</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="right-section">
                <div class="section-card camera-section">
                    <div class="section-header">
                        <i class="fas fa-video text-primary"></i> Live Monitoring
                    </div>

                    <div class="camera-feed-container">
                        <img src="http://10.146.45.8:5050/video_feed" alt="CCTV Feed" id="cctv-image"
                            class="img-fluid rounded mb-4" style="width: 100%; max-width: 480px; border-radius: 12px;" />

                        <div id="fire-overlay" class="fire-overlay">
                            <div class="fire-box">
                                <i class="fas fa-fire fa-3x mb-3"></i>
                                <h3>KEBAKARAN!</h3>
                                <p>Sistem Alarm Aktif</p>
                            </div>
                        </div>
                    </div>

                    <div class="ptz-wrapper">
                        <div class="ptz-grid">
                            <div></div>
                            <button class="ptz-btn" onclick="moveCamera('up')" title="Atas">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <div></div>

                            <button class="ptz-btn" onclick="moveCamera('left')" title="Kiri">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="ptz-btn reset" onclick="moveCamera('reset')" title="Reset">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="ptz-btn" onclick="moveCamera('right')" title="Kanan">
                                <i class="fas fa-chevron-right"></i>
                            </button>

                            <div></div>
                            <button class="ptz-btn" onclick="moveCamera('down')" title="Bawah">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal Kontrol Perangkat --}}
    <div class="modal fade" id="deviceModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-white" style="background: #1e293b; border: 1px solid #334155;">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title" id="modalDeviceTitle">Pengaturan Perangkat</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="selected-device-id">

                    {{-- Tab Navigation --}}
                    <ul class="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="pills-manual-tab" data-bs-toggle="pill"
                                data-bs-target="#pills-manual" type="button" role="tab">
                                <i class="fas fa-hand-pointer me-1"></i> Manual
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="pills-auto-tab" data-bs-toggle="pill"
                                data-bs-target="#pills-auto" type="button" role="tab">
                                <i class="fas fa-clock me-1"></i> Otomatis
                            </button>
                        </li>
                    </ul>

                    {{-- Tab Content --}}
                    <div class="tab-content" id="pills-tabContent">
                        {{-- Manual Control Tab --}}
                        <div class="tab-pane fade show active" id="pills-manual" role="tabpanel">
                            <div id="manual-controls">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-success btn-lg py-3 fw-bold" onclick="sendDeviceCommand('ON')"
                                        style="font-size: 1.1rem;">
                                        <i class="fas fa-power-off me-2"></i>NYALAKAN
                                    </button>
                                    <button class="btn btn-danger btn-lg py-3 fw-bold" onclick="sendDeviceCommand('OFF')"
                                        style="font-size: 1.1rem;">
                                        <i class="fas fa-times-circle me-2"></i>MATIKAN
                                    </button>
                                </div>
                            </div>

                            {{-- Locked Message (shown when auto mode active) --}}
                            <div id="manual-locked-msg" class="text-center py-4 d-none">
                                <i class="fas fa-lock fa-3x mb-3 text-warning"></i>
                                <h5 class="text-warning mb-2">Kontrol Manual Terkunci</h5>
                                <p class="small text-white-50">
                                    Mode Otomatis sedang aktif.<br>
                                    Hentikan mode otomatis untuk menggunakan kontrol manual.
                                </p>
                            </div>
                        </div>

                        {{-- Auto Schedule Tab --}}
                        <div class="tab-pane fade" id="pills-auto" role="tabpanel">
                            <div class="mb-3">
                                <p class="small text-white-50 mb-3">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Atur jadwal otomatis untuk menyalakan dan mematikan perangkat secara berkala.
                                </p>
                            </div>

                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="form-label text-white fw-bold small">
                                        <i class="fas fa-toggle-on text-success me-1"></i>
                                        Durasi Nyala (Detik)
                                    </label>
                                    <input type="number"
                                        class="form-control form-control-lg bg-dark text-white border-secondary"
                                        id="auto-time-on" placeholder="contoh: 10" min="1">
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-white fw-bold small">
                                        <i class="fas fa-toggle-off text-danger me-1"></i>
                                        Durasi Mati (Detik)
                                    </label>
                                    <input type="number"
                                        class="form-control form-control-lg bg-dark text-white border-secondary"
                                        id="auto-time-off" placeholder="contoh: 5" min="1">
                                </div>
                                <div class="col-12 mt-4">
                                    <button class="btn btn-primary btn-lg w-100 fw-bold mb-2 py-3"
                                        onclick="saveAutoSettings()">
                                        <i class="fas fa-play-circle me-2"></i>MULAI JADWAL OTOMATIS
                                    </button>
                                    <button class="btn btn-outline-danger btn-lg w-100 fw-bold py-3"
                                        onclick="stopAutoSettings()">
                                        <i class="fas fa-stop-circle me-2"></i>HENTIKAN JADWAL OTOMATIS
                                    </button>
                                </div>
                            </div>

                            <div class="alert alert-info mt-3 mb-0"
                                style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);">
                                <small>
                                    <i class="fas fa-lightbulb me-1"></i>
                                    <strong>Contoh:</strong> Durasi Nyala 10 detik & Durasi Mati 5 detik = Perangkat akan
                                    menyala selama 10 detik, kemudian mati selama 5 detik, dan berulang.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    {{-- MQTT Library --}}
    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>

    {{-- Dashboard Config --}}
    <script>
        window.dashboardConfig = {
            csrfToken: '{{ csrf_token() }}',
            mqtt: {
                broker: "ws://10.146.45.75:1884/mqtt",
                username: "galang",
                password: "galang12"
            },
            routes: {
                controlDevice: '{{ Route::has('control.device') ? route('control.device') : '/control/device' }}',
                controlCamera: '{{ Route::has('control.camera') ? route('control.camera') : '/control/camera' }}'
            }
        };
    </script>

    {{-- Dashboard JS --}}
    @vite('resources/js/dashboard.js')
@endpush
