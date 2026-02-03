$(document).ready(function () {
    const config = window.dashboardConfig;

    // --- 1. MQTT CONFIGURATION ---
    // Contoh di dashboard.js
    // Menggunakan IP lokal Anda (192.168.1.6) dengan port WebSocket (biasanya 9001)
    const mqttClient = mqtt.connect("ws://192.168.1.6:1884/mqtt", {
        // Jika Anda pakai username/password di Mosquitto lokal
        username: "galang",
        password: "galang12",
    });

    mqttClient.on("connect", function () {
        console.log("Connected to MQTT Broker");

        // Subscribe topics
        mqttClient.subscribe("kandang/sensor/temp");
        mqttClient.subscribe("kandang/sensor/humidity");
        mqttClient.subscribe("kandang/sensor/fire");
        mqttClient.subscribe("kandang/sensor/pln");

        // Subscribe 8 gas sensors (Format: kandang/sensor/gas/areaX/sensorY)
        mqttClient.subscribe("kandang/sensor/gas/#");

        // Subscribe status devices untuk sync UI jika diubah fisik
        mqttClient.subscribe("kandang/status/device/#");
    });

    mqttClient.on("message", function (topic, message) {
        const payload = message.toString();

        // -- Handle Header Sensors --
        if (topic === "kandang/sensor/temp") {
            $("#val-temp").text(payload);
        } else if (topic === "kandang/sensor/humidity") {
            $("#val-hum").text(payload);
        } else if (topic === "kandang/sensor/pln") {
            updatePlnStatus(payload); // payload: "ON" / "OFF"
        } else if (topic === "kandang/sensor/fire") {
            updateFireStatus(payload);
        }

        // -- Handle Gas Sensors --
        else if (topic.includes("kandang/sensor/gas")) {
            // Topic ex: kandang/sensor/gas/area1/1
            const parts = topic.split("/");
            const area = parts[3]; // area1
            const sensor = parts[4]; // 1
            const ppm = parseInt(payload);

            updateGasMap(area, sensor, ppm);
        }

        // -- Handle Device Status Feedback --
        else if (topic.includes("kandang/status/device")) {
            const parts = topic.split("/");
            const device = parts[3]; // lamp, fan1, fan2
            const status = payload; // ON / OFF
            updateDeviceButtonUI(device, status);
        }
    });

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
        if (ppm < 300) {
            element.addClass("safe");
        } else if (ppm < 600) {
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
                        : "Area 2 (Belakang)"
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
                `BAHAYA! Gas tinggi terdeteksi di ${areaText}`
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
        new bootstrap.Modal(document.getElementById("deviceModal")).show();
    };

    window.sendDeviceCommand = function (action) {
        const deviceId = $("#selected-device-id").val();

        // Kirim ke MQTT (Mode Manual)
        const payload = JSON.stringify({ mode: "manual", action: action });
        mqttClient.publish(`kandang/control/${deviceId}`, payload);

        // Update UI langsung (Optimistic update)
        updateDeviceButtonUI(deviceId, action);

        // Tutup modal
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal")
        ).hide();
    };

    window.saveAutoSettings = function () {
        const deviceId = $("#selected-device-id").val();
        const timeOn = $("#auto-time-on").val();
        const timeOff = $("#auto-time-off").val();

        if (!timeOn || !timeOff) {
            alert("Mohon isi waktu ON dan OFF");
            return;
        }

        // Kirim Config Otomatis ke MQTT
        const payload = JSON.stringify({
            mode: "auto",
            time_on: timeOn,
            time_off: timeOff,
        });

        mqttClient.publish(`kandang/control/${deviceId}`, payload);
        alert(`Jadwal otomatis untuk ${deviceId} berhasil disimpan.`);

        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal")
        ).hide();
    };

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
            "kandang/control/camera",
            JSON.stringify({ action: direction })
        );
    };

    function updateFireStatus(val) {
        const isFire = val === "1" || val === 1;
        if (isFire) {
            $("#status-fire").text("TERDETEKSI!").css("color", "#ff416c");
            $("#fire-overlay").show(); // Tampilkan overlay di CCTV
        } else {
            $("#status-fire").text("AMAN").css("color", "#00b09b");
            $("#fire-overlay").hide();
        }
    }

    const cctv = document.getElementById("cctv-image");

    cctv.onerror = function () {
        cctv.src =
            "https://via.placeholder.com/800x600/000000/3b82f6?text=CCTV+SIGNAL+LOST";
    };

    function updatePlnStatus(val) {
        // Val: "ON" or "OFF"
        $("#status-pln").text(val === "ON" ? "HIDUP" : "MATI");
        $("#status-pln").css("color", val === "ON" ? "#fff" : "#ff416c");
    }

    // --- 5. SIMULATION (Hapus ini jika sudah ada alat real) ---
    // Simulasi data masuk setiap 3 detik
    setInterval(() => {
        const areas = ["area1", "area2"];
        const sensors = [1, 2, 3, 4];

        // Random Gas
        const randArea = areas[Math.floor(Math.random() * areas.length)];
        const randSensor = sensors[Math.floor(Math.random() * sensors.length)];
        const randPpm = Math.floor(Math.random() * 800) + 100; // 100 - 900 ppm

        mqttClient.emit(
            "message",
            `kandang/sensor/gas/${randArea}/${randSensor}`,
            randPpm.toString()
        );

        // Random Temp
        mqttClient.emit(
            "message",
            "kandang/sensor/temp",
            (Math.random() * 5 + 28).toFixed(1)
        );

        // Random Humidity
        mqttClient.emit(
            "message",
            "kandang/sensor/humidity",
            (Math.random() * 20 + 60).toFixed(1)
        );
    }, 2000);
});
