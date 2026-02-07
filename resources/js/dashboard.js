$(document).ready(function () {
    // Gunakan window agar variabel bisa diakses secara global oleh fungsi onclick di HTML
    window.isAutoModeActive = false;

    // --- 1. KONEKSI MQTT ---
    const mqttClient = mqtt.connect("ws://192.168.1.8:1884/mqtt", {
        username: "galang",
        password: "galang12",
    });

    mqttClient.on("connect", function () {
        console.log("Terhubung ke MQTT Broker");
        // Berlangganan topik sensor dan status (sesuai .env)
        mqttClient.subscribe("sensor/suhu");
        mqttClient.subscribe("sensor/kelembaban");
        mqttClient.subscribe("detection/flame"); // MQTT_TOPIC_FIRE
        mqttClient.subscribe("status/listrik");

        // Subscribe ke 8 sensor gas (sensor/gas1 - sensor/gas8)
        for (let i = 1; i <= 8; i++) {
            mqttClient.subscribe("sensor/gas" + i);
        }

        mqttClient.subscribe("status/lampu"); // Untuk sinkronisasi logo lampu
        mqttClient.subscribe("fan/mode"); // MQTT_TOPIC_FAN_MODE
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
            // MQTT_TOPIC_FIRE
            updateFireStatus(payload);
        }
        // Sinkronisasi Logo Lampu (Manual & Otomatis)
        else if (topic === "status/lampu") {
            updateDeviceButtonUI("lampu", payload);
        }
        // Sinkronisasi Mode Otomatis dari ESP32
        else if (topic === "fan/mode") {
            // MQTT_TOPIC_FAN_MODE
            window.isAutoModeActive = payload === "auto";
            updateManualLockUI();
        }
        // Sensor Gas - Format: sensor/gas1, sensor/gas2, ..., sensor/gas8
        else if (topic.startsWith("sensor/gas")) {
            // Extract nomor sensor dari topik (contoh: "sensor/gas1" -> 1)
            const sensorNum = parseInt(topic.replace("sensor/gas", ""));
            const ppm = parseFloat(payload);

            // Mapping sensor ke area:
            // Sensor 1-4 -> Area 1 (Depan)
            // Sensor 5-8 -> Area 2 (Belakang)
            const area = sensorNum <= 4 ? "area1" : "area2";

            // ID sensor di dalam area (1-4)
            const sensorId = ((sensorNum - 1) % 4) + 1;

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
        let topic = "";
        // Mengubah action (ON/OFF) menjadi lowercase (on/off) untuk payload
        let payload = action.toLowerCase();

        if (deviceId === "lampu" || deviceId === "lamp") {
            topic = "kontrol/lampu";
        } else if (deviceId === "fan") {
            // Menggunakan topik relay/1 seperti yang Anda inginkan sebelumnya
            topic = "relay/1";
        } else {
            console.warn("Device ID tidak dikenali:", deviceId);
            return;
        }

        console.log(`Publishing to ${topic}: ${payload}`);
        mqttClient.publish(topic, payload);

        // Update UI (Parameter status tetap 'ON' agar fungsi UI tidak pecah)
        updateDeviceButtonUI(deviceId, action);

        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.saveAutoSettings = function () {
        const detikOn = $("#auto-time-on").val();
        const detikOff = $("#auto-time-off").val();

        if (!detikOn || !detikOff || detikOn <= 0 || detikOff <= 0) {
            alert("Masukkan durasi detik yang valid!");
            return;
        }

        // Format sesuai ESP32: "ON:detikHidup:detikMati"
        const payload = `ON:${detikOn}:${detikOff}`;
        mqttClient.publish("kontrol/lampu/auto", payload); // MQTT_TOPIC_LAMP_AUTO

        window.isAutoModeActive = true;
        updateManualLockUI();

        alert("Jadwal Otomatis Dimulai");
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.stopAutoSettings = function () {
        mqttClient.publish("kontrol/lampu/auto", "OFF"); // MQTT_TOPIC_LAMP_AUTO
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
        let targetId = deviceId;
        // Map status dari MQTT ke ID tombol di dashboard
        if (deviceId === "lampu" || deviceId === "lamp") targetId = "lampu";
        if (
            deviceId === "fan" ||
            deviceId === "fan1" ||
            deviceId === "fan2" ||
            deviceId === "relay/1"
        )
            targetId = "fan";

        const btn = $(`#btn-${targetId}`);
        if (btn.length) {
            const statusText = btn.find(".device-status");
            if (status === "ON" || status === "on" || status === "255") {
                btn.addClass("on active");
                statusText.text("ON");
                btn.find("i").css(
                    "color",
                    targetId === "lampu" ? "#fbbf24" : "#3b82f6",
                );
            } else {
                btn.removeClass("on active");
                statusText.text("OFF");
                btn.find("i").css("color", "");
            }
        }
    }

    // --- 3. GAS MAP LOGIC ---
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

    // --- 4. CAMERA & FIRE LOGIC ---

    window.moveCamera = function (direction) {
        console.log("Moving camera:", direction);

        // Mapping gerakan ke posisi servo
        let horizontal = 90; // posisi default
        let vertical = 90; // posisi default

        switch (direction) {
            case "up":
                vertical = 60;
                mqttClient.publish("servo/v", vertical.toString()); // MQTT_TOPIC_SERVO_V
                break;
            case "down":
                vertical = 120;
                mqttClient.publish("servo/v", vertical.toString()); // MQTT_TOPIC_SERVO_V
                break;
            case "left":
                horizontal = 60;
                mqttClient.publish("servo/h", horizontal.toString()); // MQTT_TOPIC_SERVO_H
                break;
            case "right":
                horizontal = 120;
                mqttClient.publish("servo/h", horizontal.toString()); // MQTT_TOPIC_SERVO_H
                break;
            case "reset":
                mqttClient.publish("servo/h", "90"); // MQTT_TOPIC_SERVO_H
                mqttClient.publish("servo/v", "90"); // MQTT_TOPIC_SERVO_V
                break;
        }
    };

    function updateFireStatus(val) {
        const raw =
            typeof val === "string" ? val.trim().toLowerCase() : String(val);
        console.debug("updateFireStatus received:", raw);

        const isFire =
            raw === "1" ||
            raw === "true" ||
            raw === "on" ||
            raw === "fire" ||
            raw === "terdeteksi" ||
            raw === "yes";

        const $statusEl = $("#status-fire");
        const $overlayEl = $("#fire-overlay");

        if ($statusEl.length === 0) {
            console.warn("updateFireStatus: missing #status-fire in DOM");
            return;
        }

        if (isFire) {
            $statusEl.text("TERDETEKSI!").css("color", "#ff416c");
            if ($overlayEl.length > 0) {
                $overlayEl.show(); // Tampilkan overlay di CCTV (jika ada)
            }
        } else {
            $statusEl.text("AMAN").css("color", "#00b09b");
            if ($overlayEl.length > 0) {
                $overlayEl.hide();
            }
        }
    }

    const cctv = document.getElementById("cctv-image");

    if (cctv) {
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
    }

    function updatePlnStatus(val) {
        // Val: "ON" or "OFF"
        $("#status-pln").text(val === "ON" ? "HIDUP" : "MATI");
        $("#status-pln").css("color", val === "ON" ? "#fff" : "#ff416c");
    }
});
