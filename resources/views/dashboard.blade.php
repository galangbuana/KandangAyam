@extends('layouts.app')

@section('title', 'Smart Kandang Dashboard')

@push('styles')
    @vite('resources/css/dashboard.css')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
@endpush

@section('content')
    <div class="particles">
        @for ($i = 0; $i < 20; $i++)
            <div class="particle"
                style="left: {{ rand(0, 100) }}%; animation-delay: -{{ rand(0, 30) }}s; animation-duration: {{ rand(15, 40) }}s">
            </div>
        @endfor
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
                                <div class="sensor-box" id="gas-a1-s1"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a1-s2"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a1-s3"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a1-s4"><span>--</span> <small>ppm</small></div>
                            </div>
                        </div>

                        <div class="area-block">
                            <h6 class="area-title">AREA 2 (BELAKANG)</h6>
                            <div class="sensor-grid">
                                <div class="sensor-box" id="gas-a2-s1"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a2-s2"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a2-s3"><span>--</span> <small>ppm</small></div>
                                <div class="sensor-box" id="gas-a2-s4"><span>--</span> <small>ppm</small></div>
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

                        <button class="device-btn" id="btn-fan1" onclick="openControlModal('fan1', 'Kipas 1')">
                            <div class="icon-wrapper"><i class="fas fa-fan"></i></div>
                            <span class="device-label">Kipas 1</span>
                            <span class="device-status">OFF</span>
                        </button>

                        <button class="device-btn" id="btn-fan2" onclick="openControlModal('fan2', 'Kipas 2')">
                            <div class="icon-wrapper"><i class="fas fa-fan"></i></div>
                            <span class="device-label">Kipas 2</span>
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

                        {{-- <div id="fire-overlay" class="fire-overlay" style="display: none;">
                            <div class="fire-box">
                                <i class="fas fa-fire fa-3x mb-3"></i>
                                <h3>KEBAKARAN!</h3>
                                <p>Sistem Pemadam Otomatis Aktif</p>
                            </div>
                        </div> --}}
                    </div>

                    <div class="ptz-wrapper">
                        <div class="ptz-grid">
                            <div></div>
                            <button class="ptz-btn" onclick="moveCamera('up')" title="Atas"><i
                                    class="fas fa-chevron-up"></i></button>
                            <div></div>

                            <button class="ptz-btn" onclick="moveCamera('left')" title="Kiri"><i
                                    class="fas fa-chevron-left"></i></button>
                            <button class="ptz-btn reset" onclick="moveCamera('reset')" title="Reset"><i
                                    class="fas fa-sync-alt"></i></button>
                            <button class="ptz-btn" onclick="moveCamera('right')" title="Kanan"><i
                                    class="fas fa-chevron-right"></i></button>

                            <div></div>
                            <button class="ptz-btn" onclick="moveCamera('down')" title="Bawah"><i
                                    class="fas fa-chevron-down"></i></button>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="deviceModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-white" style="background: #1e293b; border: 1px solid #334155;">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title" id="modalDeviceTitle">Pengaturan Perangkat</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="selected-device-id">

                    <ul class="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" id="pills-manual-tab" data-bs-toggle="pill"
                                data-bs-target="#pills-manual">Manual</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="pills-auto-tab" data-bs-toggle="pill"
                                data-bs-target="#pills-auto">Otomatis</button>
                        </li>
                    </ul>

                    <div class="tab-content" id="pills-tabContent">
                        <div class="tab-pane fade show active" id="pills-manual">
                            <div id="manual-controls">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-success py-2 fw-bold"
                                        onclick="sendDeviceCommand('ON')">NYALAKAN</button>
                                    <button class="btn btn-danger py-2 fw-bold"
                                        onclick="sendDeviceCommand('OFF')">MATIKAN</button>
                                </div>
                            </div>
                            <div id="manual-locked-msg" class="text-center py-3 d-none">
                                <i class="fas fa-lock mb-2 text-warning"></i>
                                <p class="small text-warning">Mode Otomatis sedang aktif.<br>Matikan mode otomatis untuk
                                    menggunakan kontrol manual.</p>
                            </div>
                        </div>

                        <div class="tab-pane fade" id="pills-auto">
                            <div class="row g-2">
                                <div class="col-6">
                                    <label class="form-label text-white-50 small">Durasi Nyala (Detik)</label>
                                    <input type="number" class="form-control bg-dark text-white border-secondary"
                                        id="auto-time-on" placeholder="Detik">
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-white-50 small">Durasi Mati (Detik)</label>
                                    <input type="number" class="form-control bg-dark text-white border-secondary"
                                        id="auto-time-off" placeholder="Detik">
                                </div>
                                <div class="col-12 mt-3">
                                    <button class="btn btn-primary w-100 fw-bold mb-2" onclick="saveAutoSettings()">MULAI
                                        JADWAL OTOMATIS</button>
                                    <button class="btn btn-outline-danger w-100 fw-bold"
                                        onclick="stopAutoSettings()">HENTIKAN JADWAL OTOMATIS</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        window.dashboardConfig = {
            csrfToken: '{{ csrf_token() }}',
            routes: {
                controlDevice: "{{ Route::has('control.device') ? route('control.device') : '/control/device' }}",
                controlCamera: "{{ Route::has('control.camera') ? route('control.camera') : '/control/camera' }}"
            }
        };
    </script>
    @vite('resources/js/dashboard.js')
@endpush
