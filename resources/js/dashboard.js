$(document).ready(function () {
    // Gunakan window agar variabel bisa diakses secara global oleh fungsi onclick di HTML
    window.isAutoModeActive = false;

    // --- 1. KONEKSI MQTT ---
    const mqttClient = mqtt.connect("ws://10.146.45.75:1884/mqtt", {
        username: "galang",
        password: "galang12",
    });

    mqttClient.on("connect", function () {
        console.log("Terhubung ke MQTT Broker");
        // Berlangganan topik sensor dan status
        mqttClient.subscribe("sensor/suhu");
        mqttClient.subscribe("sensor/kelembaban");
        mqttClient.subscribe("detection/flame");
        mqttClient.subscribe("status/listrik");
        mqttClient.subscribe("sensor/gas/#");
        mqttClient.subscribe("status/lampu"); // Untuk sinkronisasi logo lampu
        mqttClient.subscribe("fan/mode"); // Untuk memantau mode otomatis
    });

    mqttClient.on("message", function (topic, message) {
        const payload = message.toString();

        if (topic === "sensor/suhu") {
            $("#val-temp").text(payload);
        } else if (topic === "sensor/kelembaban") {
            $("#val-hum").text(payload);
        } else if (topic === "status/listrik") {
            updatePlnStatus(payload);
        } else if (topic === "detection/flame") {
            updateFireStatus(payload);
        }
        // Sinkronisasi Logo Lampu (Manual & Otomatis)
        else if (topic === "status/lampu") {
            updateDeviceButtonUI("lampu", payload);
        }
        // Sinkronisasi Mode Otomatis dari ESP32
        else if (topic === "fan/mode") {
            window.isAutoModeActive = payload === "auto";
            updateManualLockUI();
        }
        // Sensor Gas
        else if (topic.includes("sensor/gas")) {
            const sensorNum = topic.replace("sensor/gas", "");
            const ppm = parseFloat(payload);
            const area = parseInt(sensorNum) <= 4 ? "area1" : "area2";
            const sensorId = ((parseInt(sensorNum) - 1) % 4) + 1;
            updateGasMap(area, sensorId, ppm);
        }
    });

    // --- 2. LOGIKA KONTROL PERANGKAT ---

    window.openControlModal = function (deviceId, deviceName) {
        $("#selected-device-id").val(deviceId);
        $("#modalDeviceTitle").text(`Kontrol: ${deviceName}`);

        // Reset input durasi
        $("#auto-time-on").val("");
        $("#auto-time-off").val("");

        updateManualLockUI(); // Pastikan tampilan tombol sesuai mode aktif

        const modal = new bootstrap.Modal(
            document.getElementById("deviceModal"),
        );
        modal.show();
    };

    window.sendDeviceCommand = function (action) {
        if (window.isAutoModeActive) {
            alert("Mode Otomatis Aktif! Hentikan jadwal untuk kontrol manual.");
            return;
        }

        const deviceId = $("#selected-device-id").val();
        let topic = `kontrol/${deviceId}`;
        if (deviceId === "lampu" || deviceId === "lamp")
            topic = "kontrol/lampu";

        mqttClient.publish(topic, action);
        updateDeviceButtonUI(deviceId, action);
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.saveAutoSettings = function () {
        const detikOn = $("#auto-time-on").val();
        const detikOff = $("#auto-time-off").val();

        if (!detikOn || !detikOff || detikOn <= 0) {
            alert("Masukkan durasi detik yang valid!");
            return;
        }

        // Format sesuai ESP32: "ON:detikHidup:detikMati"
        const payload = `ON:${detikOn}:${detikOff}`;
        mqttClient.publish("kontrol/lampu/auto", payload);

        window.isAutoModeActive = true;
        updateManualLockUI();

        alert("Jadwal Otomatis Dimulai");
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.stopAutoSettings = function () {
        mqttClient.publish("kontrol/lampu/auto", "OFF");
        window.isAutoModeActive = false;
        updateManualLockUI();
        alert("Mode Otomatis Dihentikan");
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    function updateManualLockUI() {
        if (window.isAutoModeActive) {
            $("#manual-controls").addClass("d-none");
            $("#manual-locked-msg").removeClass("d-none");
        } else {
            $("#manual-controls").removeClass("d-none");
            $("#manual-locked-msg").addClass("d-none");
        }
    }

    function updateDeviceButtonUI(deviceId, status) {
        const targetId =
            deviceId === "lamp" || deviceId === "lampu" ? "lampu" : deviceId;
        const btn = $(`#btn-${targetId}`);
        const statusText = btn.find(".device-status");

        if (status === "ON") {
            btn.addClass("on active");
            statusText.text("ON");
            btn.find("i").css("color", "#fbbf24"); // Warna kuning menyala
        } else {
            btn.removeClass("on active");
            statusText.text("OFF");
            btn.find("i").css("color", "");
        }
    }

    // --- 2. GAS MAP LOGIC ---
    // Simpan nilai gas untuk pengecekan global
    let gasReadings = {};

    function updateGasMap(areaStr, sensorId, ppm) {
        // Mapping areaStr (area1/area2) ke ID element HTML (a1/a2)
        const areaCode = areaStr === "area1" ? "a1" : "a2";
        const elementId = `#gas-${areaCode}-s${sensorId}`;
        const element = $(elementId);

        // Update Text
        element.html(`${ppm} <small>ppm</small>`);

        // Update Color & Blink Class
        element.removeClass("safe warning danger");

        let status = "safe";
        if (ppm <= 300) {
            element.addClass("safe");
        } else if (ppm <= 600) {
            element.addClass("warning");
            status = "warning";
        } else {
            element.addClass("danger"); // Ini akan memicu animasi blink CSS
            status = "danger";
        }

        // Simpan status untuk cek alert global
        gasReadings[`${areaStr}-${sensorId}`] = {
            area: areaStr,
            status: status,
        };
        checkGlobalGasAlert();
    }

    function checkGlobalGasAlert() {
        let hasDanger = false;
        let dangerAreas = new Set();
        let maxStatus = "AMAN";

        // Loop semua sensor
        for (const key in gasReadings) {
            const data = gasReadings[key];
            if (data.status === "danger") {
                hasDanger = true;
                dangerAreas.add(
                    data.area === "area1"
                        ? "Area 1 (Depan)"
                        : "Area 2 (Belakang)",
                );
            } else if (data.status === "warning" && maxStatus === "AMAN") {
                maxStatus = "WASPADA";
            }
        }

        // Update UI Alert Bawah Peta
        const alertBox = $("#gas-alert-message");
        if (hasDanger) {
            maxStatus = "BAHAYA";
            const areaText = Array.from(dangerAreas).join(" & ");
            $("#gas-alert-text").text(
                `BAHAYA! Gas tinggi terdeteksi di ${areaText}`,
            );
            alertBox.show();
        } else {
            alertBox.hide();
        }

        // Update Status Header
        $("#status-gas-global").text(maxStatus);
        const color =
            maxStatus === "BAHAYA"
                ? "#ff416c"
                : maxStatus === "WASPADA"
                  ? "#f7971e"
                  : "#fff";
        $("#status-gas-global").css("color", color);
    }

    // --- 3. DEVICE CONTROL LOGIC ---

    // Fungsi dipanggil dari HTML onclick
    window.openControlModal = function (deviceId, deviceName) {
        $("#selected-device-id").val(deviceId);
        $("#modalDeviceTitle").text(`Kontrol: ${deviceName}`);

        // Reset inputs
        $("#auto-time-on").val("");
        $("#auto-time-off").val("");

        // Tampilkan modal
        const modalElement = document.getElementById("deviceModal");
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Set focus to first input after modal is shown
        modalElement.addEventListener(
            "shown.bs.modal",
            function () {
                document.getElementById("auto-time-on").focus();
            },
            { once: true },
        );
    };

    window.sendDeviceCommand = function (action) {
        const deviceId = $("#selected-device-id").val();

        // Kirim ke MQTT (Mode Manual) - send plain string (ON/OFF)
        const payload = action; // "ON" or "OFF"
        // use dedicated topic for lampu if device is lamp/lampu
        let topic = `kontrol/${deviceId}`;
        if (
            deviceId === "lamp" ||
            deviceId === "lampu" ||
            deviceId.startsWith("lamp")
        ) {
            topic = "kontrol/lampu";
        }
        console.log(`Publishing to ${topic}: ${payload}`);
        mqttClient.publish(topic, payload);

        // Update UI langsung (Optimistic update)
        updateDeviceButtonUI(deviceId, action);

        // Tutup modal
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    // Fungsi untuk memulai jadwal otomatis (Satuan Detik)
    window.saveAutoSettings = function () {
        const detikOn = $("#auto-time-on").val();
        const detikOff = $("#auto-time-off").val();

        if (!detikOn || !detikOff || detikOn <= 0 || detikOff <= 0) {
            alert("Mohon masukkan durasi detik yang valid!");
            return;
        }

        // Mengirim payload "ON:detikHidup:detikMati" ke Arduino
        const payload = `ON:${detikOn}:${detikOff}`;
        mqttClient.publish("kontrol/lampu/auto", payload);

        isAutoModeActive = true;
        updateManualLockUI(); // Kunci kontrol manual

        alert("Mode Otomatis Berhasil Diaktifkan");
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    // Fungsi untuk menghentikan jadwal otomatis
    window.stopAutoSettings = function () {
        // Mengirim "OFF" untuk mematikan mode otomatis di Arduino
        mqttClient.publish("kontrol/lampu/auto", "OFF");

        isAutoModeActive = false;
        updateManualLockUI(); // Buka kembali kontrol manual

        alert("Mode Otomatis Dihentikan");
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    // Fungsi untuk mengunci atau membuka UI kontrol manual
    function updateManualLockUI() {
        if (isAutoModeActive) {
            $("#manual-controls").addClass("d-none"); // Sembunyikan tombol manual
            $("#manual-locked-msg").removeClass("d-none"); // Tampilkan pesan terkunci
        } else {
            $("#manual-controls").removeClass("d-none");
            $("#manual-locked-msg").addClass("d-none");
        }
    }

    function updateDeviceButtonUI(deviceId, status) {
        const btn = $(`#btn-${deviceId}`);
        const statusText = btn.find(".device-status");

        if (status === "ON") {
            btn.addClass("on");
            statusText.text("ON");
        } else {
            btn.removeClass("on");
            statusText.text("OFF");
        }
    }

    // --- 4. CAMERA & FIRE LOGIC ---

    window.moveCamera = function (direction) {
        console.log("Moving camera:", direction);
        // Kirim command PTZ
        mqttClient.publish(
            "kontrol/kamera",
            JSON.stringify({ action: direction }),
        );
    };

    function updateFireStatus(val) {
        const raw =
            typeof val === "string" ? val.trim().toLowerCase() : String(val);
        console.debug("updateFireStatus received:", raw);

        const isFire =
            raw === "1" ||
            raw === "true" ||
            raw === "on" ||
            raw === "terdeteksi" ||
            raw === "yes";

        const $statusEl = $("#status-fire");
        const $overlayEl = $("#fire-overlay");

        if ($statusEl.length === 0 || $overlayEl.length === 0) {
            console.warn(
                "updateFireStatus: missing #status-fire or #fire-overlay in DOM",
            );
            return;
        }

        if (isFire) {
            $statusEl.text("TERDETEKSI!").css("color", "#ff416c");
            $overlayEl.show(); // Tampilkan overlay di CCTV
        } else {
            $statusEl.text("AMAN").css("color", "#00b09b");
            $overlayEl.hide();
        }
    }

    const cctv = document.getElementById("cctv-image");

    cctv.onerror = function () {
        cctv.src =
            "https://via.placeholder.com/800x600/000000/3b82f6?text=CCTV+SIGNAL+LOST";
        console.warn(
            "CCTV stream failed to load. Check if the stream is running at the configured URL.",
        );
    };

    cctv.onload = function () {
        console.log("CCTV stream loaded successfully");
    };

    function updatePlnStatus(val) {
        // Val: "ON" or "OFF"
        $("#status-pln").text(val === "ON" ? "HIDUP" : "MATI");
        $("#status-pln").css("color", val === "ON" ? "#fff" : "#ff416c");
    }

    // --- 5. SIMULATION (Hapus ini jika sudah ada alat real) ---
    // Simulasi data masuk setiap 3 detik
    // setInterval(() => {
    //     const areas = ["area1", "area2"];
    //     const sensors = [1, 2, 3, 4];

    //     // Random Gas
    //     const randArea = areas[Math.floor(Math.random() * areas.length)];
    //     const randSensor = sensors[Math.floor(Math.random() * sensors.length)];
    //     const randPpm = Math.floor(Math.random() * 800) + 100; // 100 - 900 ppm

    //     mqttClient.emit(
    //         "message",
    //         `sensor/gas/${randArea}/${randSensor}`,
    //         randPpm.toString()
    //     );

    //     // Random Temp
    //     mqttClient.emit(
    //         "message",
    //         "sensor/suhu",
    //         (Math.random() * 5 + 28).toFixed(1)
    //     );

    //     // Random Humidity
    //     mqttClient.emit(
    //         "message",
    //         "sensor/kelembaban",
    //         (Math.random() * 20 + 60).toFixed(1)
    //     );
    // }, 2000);
});
