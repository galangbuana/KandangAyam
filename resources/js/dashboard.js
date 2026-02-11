$(document).ready(function () {
    // Pisahkan status auto mode untuk lampu dan kipas
    window.isAutoModeLampActive = false; // Mode auto untuk LAMPU saja
    window.isAutoModeFanActive = false; // Mode auto untuk KIPAS saja
    window.currentDevice = null; // Menyimpan device yang sedang dibuka
    window.fanIsOn = false; // Status apakah kipas sedang ON
    window.currentFan1Speed = 0; // Speed terakhir kipas 1
    window.currentFan2Speed = 0; // Speed terakhir kipas 2

    // Add servo position tracking
    window.currentServoH = 90; // Initial horizontal position
    window.currentServoV = 70; // Initial vertical position

    // --- 1. KONEKSI MQTT ---
    const mqttClient = mqtt.connect("ws://103.150.227.84:8080/mqtt", {
        username: "pdk",
        password: "pdk2025",
    });

    mqttClient.on("connect", function () {
        console.log("✓ Terhubung ke MQTT Broker");
        console.log("MQTT Broker:", "ws://10.146.45.75:1884/mqtt");

        mqttClient.subscribe("sensor/suhu");
        mqttClient.subscribe("sensor/kelembaban");
        mqttClient.subscribe("detection/flame");
        mqttClient.subscribe("status/listrik");

        for (let i = 1; i <= 8; i++) {
            mqttClient.subscribe("sensor/gas" + i);
        }

        mqttClient.subscribe("status/lampu");
        mqttClient.subscribe("fan/mode");
        mqttClient.subscribe("fan1/speed");
        mqttClient.subscribe("fan2/speed");
        mqttClient.subscribe("relay/1");

        console.log(
            "✓ Subscribed to all topics including: relay/1, fan1/speed, fan2/speed",
        );
    });

    // Debug: Log semua pesan yang di-publish
    const originalPublish = mqttClient.publish;
    mqttClient.publish = function (topic, message, options, callback) {
        console.log(`📤 Publishing to ${topic}: "${message}"`);
        return originalPublish.call(this, topic, message, options, callback);
    };

    // Error handlers
    mqttClient.on("error", function (error) {
        console.error("❌ MQTT Error:", error);
    });

    mqttClient.on("offline", function () {
        console.warn("⚠️ MQTT Client is offline");
    });

    mqttClient.on("reconnect", function () {
        console.log("🔄 Reconnecting to MQTT...");
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
        } else if (topic === "status/lampu") {
            updateDeviceButtonUI("lampu", payload);
        } else if (topic === "fan/mode") {
            // Update HANYA status auto mode KIPAS
            const isAuto = payload === "auto";
            window.isAutoModeFanActive = isAuto;

            // Update UI logo kipas berdasarkan mode
            if (isAuto) {
                // Mode auto aktif - nyalakan logo
                updateDeviceButtonUI("fan", "ON");
            } else {
                // Mode manual - cek status relay
                if (!window.fanIsOn) {
                    updateDeviceButtonUI("fan", "OFF");
                }
            }

            updateManualLockUI();
        } else if (topic === "relay/1") {
            // Track status relay kipas - accept both uppercase and lowercase
            const isOn =
                payload === "ON" || payload === "on" || payload === "1";
            window.fanIsOn = isOn;

            // Update logo hanya jika TIDAK dalam mode auto
            // Karena mode auto akan menghandle sendiri logo-nya
            if (!window.isAutoModeFanActive) {
                updateDeviceButtonUI("fan", isOn ? "ON" : "OFF");
            }

            console.log("Fan relay status:", isOn ? "ON" : "OFF");
        } else if (topic === "fan1/speed") {
            const speed = parseInt(payload);
            window.currentFan1Speed = speed;
            $("#fan1-speed-slider").val(speed);
            $("#fan1-value-display").text(speed);
        } else if (topic === "fan2/speed") {
            const speed = parseInt(payload);
            window.currentFan2Speed = speed;
            $("#fan2-speed-slider").val(speed);
            $("#fan2-value-display").text(speed);
        } else if (topic.startsWith("sensor/gas")) {
            const sensorNum = parseInt(topic.replace("sensor/gas", ""));
            const ppm = parseFloat(payload);
            const area = sensorNum <= 4 ? "area1" : "area2";
            const sensorId = ((sensorNum - 1) % 4) + 1;
            updateGasMap(area, sensorId, ppm);
        }
    });

    // --- 2. LOGIKA KONTROL PERANGKAT ---

    window.openControlModal = function (deviceId, deviceName) {
        $("#selected-device-id").val(deviceId);
        $("#modalDeviceTitle").text(`Kontrol: ${deviceName}`);
        window.currentDevice = deviceId;

        $("#lamp-controls").hide();
        $("#fan-controls").hide();

        if (deviceId === "lampu") {
            $("#lamp-controls").show();
            $("#auto-time-on").val("");
            $("#auto-time-off").val("");
            updateManualLockUI();
        } else if (deviceId === "fan") {
            $("#fan-controls").show();

            // Cek apakah kipas sedang ON (hanya cek status kipas, bukan lampu)
            if (window.fanIsOn && !window.isAutoModeFanActive) {
                // Langsung tampilkan speed controls dengan nilai terakhir
                $("#fan-power-controls").hide();
                $("#fan-speed-controls").show();

                // Set slider ke nilai terakhir
                $("#fan1-speed-slider").val(window.currentFan1Speed);
                $("#fan2-speed-slider").val(window.currentFan2Speed);
                $("#fan1-value-display").text(window.currentFan1Speed);
                $("#fan2-value-display").text(window.currentFan2Speed);

                console.log(
                    `Kipas sedang ON. Speed: Fan1=${window.currentFan1Speed}, Fan2=${window.currentFan2Speed}`,
                );
            } else {
                // Tampilkan power controls jika kipas OFF
                showFanPowerControls();
            }

            updateManualLockUI();
        }

        const modal = new bootstrap.Modal(
            document.getElementById("deviceModal"),
        );
        modal.show();
    };

    // Fungsi untuk menampilkan ON/OFF controls
    window.showFanPowerControls = function () {
        $("#fan-power-controls").show();
        $("#fan-speed-controls").hide();
    };

    // Fungsi untuk toggle power kipas
    window.toggleFanPower = function (action) {
        // Cek HANYA mode auto KIPAS, bukan lampu
        if (window.isAutoModeFanActive) {
            alert(
                "Mode Otomatis Kipas Aktif! Aktifkan mode manual kipas terlebih dahulu.",
            );
            return;
        }

        console.log(`=== TOGGLE FAN POWER: ${action} ===`);

        if (action === "ON") {
            // Tampilkan speed controls
            $("#fan-power-controls").hide();
            $("#fan-speed-controls").show();

            // Set slider ke nilai terakhir yang tersimpan (atau 0 jika belum ada)
            $("#fan1-speed-slider").val(window.currentFan1Speed);
            $("#fan2-speed-slider").val(window.currentFan2Speed);
            $("#fan1-value-display").text(window.currentFan1Speed);
            $("#fan2-value-display").text(window.currentFan2Speed);

            console.log(
                "Speed controls shown. Set speed untuk menyalakan kipas.",
            );
        } else if (action === "OFF") {
            // Matikan relay kipas dengan payload uppercase
            console.log("Publishing to relay/1: OFF");
            mqttClient.publish(
                "relay/1",
                "OFF",
                { qos: 0, retain: false },
                function (err) {
                    if (err) {
                        console.error("Error publishing relay/1 OFF:", err);
                    } else {
                        console.log("✓ relay/1 OFF published successfully");
                    }
                },
            );

            // Reset speed ke 0
            setTimeout(() => {
                console.log("Publishing to fan1/speed: 0");
                mqttClient.publish(
                    "fan1/speed",
                    "0",
                    { qos: 0, retain: false },
                    function (err) {
                        if (err) {
                            console.error(
                                "Error publishing fan1/speed 0:",
                                err,
                            );
                        } else {
                            console.log(
                                "✓ fan1/speed 0 published successfully",
                            );
                        }
                    },
                );
            }, 100);

            setTimeout(() => {
                console.log("Publishing to fan2/speed: 0");
                mqttClient.publish(
                    "fan2/speed",
                    "0",
                    { qos: 0, retain: false },
                    function (err) {
                        if (err) {
                            console.error(
                                "Error publishing fan2/speed 0:",
                                err,
                            );
                        } else {
                            console.log(
                                "✓ fan2/speed 0 published successfully",
                            );
                        }
                    },
                );
            }, 200);

            // Update status
            window.fanIsOn = false;
            window.currentFan1Speed = 0;
            window.currentFan2Speed = 0;

            // Update UI - pastikan logo mati
            updateDeviceButtonUI("fan", "OFF");

            alert("Kipas dimatikan");

            bootstrap.Modal.getInstance(
                document.getElementById("deviceModal"),
            ).hide();
        }
    };

    $("#fan1-speed-slider").on("input", function () {
        $("#fan1-value-display").text($(this).val());
    });

    $("#fan2-speed-slider").on("input", function () {
        $("#fan2-value-display").text($(this).val());
    });

    window.applyFanSpeeds = function () {
        // Cek HANYA mode auto KIPAS, bukan lampu
        if (window.isAutoModeFanActive) {
            alert(
                "Mode Otomatis Kipas Aktif! Aktifkan mode manual kipas terlebih dahulu.",
            );
            return;
        }

        const fan1Speed = parseInt($("#fan1-speed-slider").val());
        const fan2Speed = parseInt($("#fan2-speed-slider").val());

        console.log("=== APPLY FAN SPEEDS ===");
        console.log(`Fan1 Speed: ${fan1Speed} (type: ${typeof fan1Speed})`);
        console.log(`Fan2 Speed: ${fan2Speed} (type: ${typeof fan2Speed})`);

        // Update status global
        window.fanIsOn = true;
        window.currentFan1Speed = fan1Speed;
        window.currentFan2Speed = fan2Speed;

        // Step 1: Nyalakan relay kipas dengan payload uppercase
        console.log("Publishing to relay/1: ON");
        mqttClient.publish(
            "relay/1",
            "ON",
            { qos: 0, retain: false },
            function (err) {
                if (err) {
                    console.error("Error publishing relay/1:", err);
                } else {
                    console.log("✓ relay/1 published successfully");
                }
            },
        );

        // Step 2: Set kecepatan kipas
        setTimeout(() => {
            console.log(`Publishing to fan1/speed: ${fan1Speed}`);
            mqttClient.publish(
                "fan1/speed",
                fan1Speed.toString(),
                { qos: 0, retain: false },
                function (err) {
                    if (err) {
                        console.error("Error publishing fan1/speed:", err);
                    } else {
                        console.log("✓ fan1/speed published successfully");
                    }
                },
            );
        }, 100);

        setTimeout(() => {
            console.log(`Publishing to fan2/speed: ${fan2Speed}`);
            mqttClient.publish(
                "fan2/speed",
                fan2Speed.toString(),
                { qos: 0, retain: false },
                function (err) {
                    if (err) {
                        console.error("Error publishing fan2/speed:", err);
                    } else {
                        console.log("✓ fan2/speed published successfully");
                    }
                },
            );
        }, 200);

        // Update UI button status
        updateDeviceButtonUI("fan", "ON");

        alert(
            `Kecepatan kipas diterapkan:\nKipas 1: ${fan1Speed}\nKipas 2: ${fan2Speed}`,
        );

        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.setFanMode = function (mode) {
        console.log(`Setting fan mode: ${mode}`);
        mqttClient.publish("fan/mode", mode);

        if (mode === "auto") {
            // Update HANYA status auto mode KIPAS
            window.isAutoModeFanActive = true;

            // Nyalakan logo kipas ketika mode auto aktif
            updateDeviceButtonUI("fan", "ON");

            alert("Mode Otomatis Kipas Diaktifkan");
        } else {
            // Update HANYA status auto mode KIPAS
            window.isAutoModeFanActive = false;

            // Saat kembali ke manual, cek status relay kipas
            // Jika kipas OFF, matikan logo
            if (!window.fanIsOn) {
                updateDeviceButtonUI("fan", "OFF");
            }

            alert("Mode Manual Kipas Diaktifkan");
        }

        updateManualLockUI();
        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.sendDeviceCommand = function (action) {
        // Cek HANYA mode auto LAMPU, bukan kipas
        if (window.isAutoModeLampActive && window.currentDevice === "lampu") {
            alert(
                "Mode Otomatis Lampu Aktif! Hentikan jadwal untuk kontrol manual.",
            );
            return;
        }

        const deviceId = $("#selected-device-id").val();
        let topic = "";
        let payload = action; // Langsung gunakan action (ON/OFF) tanpa lowercase

        if (deviceId === "lampu" || deviceId === "lamp") {
            topic = "kontrol/lampu";
        } else {
            console.warn("Device ID tidak dikenali:", deviceId);
            return;
        }

        console.log(`📤 Publishing to ${topic}: ${payload}`);
        mqttClient.publish(topic, payload);
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

        const payload = `ON:${detikOn}:${detikOff}`;
        mqttClient.publish("kontrol/lampu/auto", payload);

        // Update HANYA status auto mode LAMPU
        window.isAutoModeLampActive = true;
        updateManualLockUI();
        alert("Jadwal Otomatis Lampu Dimulai");

        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    window.stopAutoSettings = function () {
        mqttClient.publish("kontrol/lampu/auto", "OFF");

        // Update HANYA status auto mode LAMPU
        window.isAutoModeLampActive = false;
        updateManualLockUI();
        alert("Mode Otomatis Lampu Dihentikan");

        bootstrap.Modal.getInstance(
            document.getElementById("deviceModal"),
        ).hide();
    };

    function updateManualLockUI() {
        if (window.currentDevice === "lampu") {
            // Cek HANYA status auto LAMPU
            if (window.isAutoModeLampActive) {
                $("#manual-controls-lamp").addClass("d-none");
                $("#manual-locked-msg-lamp").removeClass("d-none");
            } else {
                $("#manual-controls-lamp").removeClass("d-none");
                $("#manual-locked-msg-lamp").addClass("d-none");
            }
        } else if (window.currentDevice === "fan") {
            // Cek HANYA status auto KIPAS
            if (window.isAutoModeFanActive) {
                $("#manual-controls-fan").addClass("d-none");
                $("#manual-locked-msg-fan").removeClass("d-none");
            } else {
                $("#manual-controls-fan").removeClass("d-none");
                $("#manual-locked-msg-fan").addClass("d-none");
            }
        }
    }

    function updateDeviceButtonUI(deviceId, status) {
        let targetId = deviceId;
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
    let gasReadings = {};

    function updateGasMap(areaStr, sensorId, ppm) {
        const sensorMapping = {
            area1: {
                1: 3, // gas1 → posisi 3 area1 (kiri bawah)
                2: 4, // gas2 → posisi 4 area1 (kanan bawah)
                7: 2, // gas7 → posisi 2 area1 (kanan atas)
                8: 1, // gas8 → posisi 1 area1 (kiri atas)
            },
            area2: {
                3: 3, // gas3 → posisi 3 area2 (kiri bawah)
                4: 4, // gas4 → posisi 4 area2 (kanan bawah)
                5: 2, // gas5 → posisi 2 area2 (kanan atas)
                6: 1, // gas6 → posisi 1 area2 (kiri atas)
            },
        };

        const areaCode = areaStr === "area1" ? "a1" : "a2";
        const mappedSensorId = sensorMapping[areaStr][sensorId];
        const elementId = `#gas-${areaCode}-s${mappedSensorId}`;

        const element = $(elementId);
        element.html(`${ppm} <small>ppm</small>`);
        element.removeClass("safe warning danger");

        let status = "safe";
        if (ppm <= 300) {
            element.addClass("safe");
        } else if (ppm <= 600) {
            element.addClass("warning");
            status = "warning";
        } else {
            element.addClass("danger");
            status = "danger";
        }

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

        const STEP = 20; // Movement increment in degrees
        const H_MIN = 30;
        const H_MAX = 180;
        const V_MIN = 50;
        const V_MAX = 110;

        let newH = window.currentServoH;
        let newV = window.currentServoV;

        switch (direction) {
            case "up":
                newV = Math.min(window.currentServoV + STEP, V_MAX);
                if (newV !== window.currentServoV) {
                    window.currentServoV = newV;
                    mqttClient.publish("servo/v", newV.toString());
                    console.log(`Servo V moved to: ${newV}°`);
                } else {
                    console.log(`Servo V at maximum limit: ${V_MAX}°`);
                }
                break;

            case "down":
                newV = Math.max(window.currentServoV - STEP, V_MIN);
                if (newV !== window.currentServoV) {
                    window.currentServoV = newV;
                    mqttClient.publish("servo/v", newV.toString());
                    console.log(`Servo V moved to: ${newV}°`);
                } else {
                    console.log(`Servo V at minimum limit: ${V_MIN}°`);
                }
                break;

            case "left":
                newH = Math.max(window.currentServoH - STEP, H_MIN);
                if (newH !== window.currentServoH) {
                    window.currentServoH = newH;
                    mqttClient.publish("servo/h", newH.toString());
                    console.log(`Servo H moved to: ${newH}°`);
                } else {
                    console.log(`Servo H at minimum limit: ${H_MIN}°`);
                }
                break;

            case "right":
                newH = Math.min(window.currentServoH + STEP, H_MAX);
                if (newH !== window.currentServoH) {
                    window.currentServoH = newH;
                    mqttClient.publish("servo/h", newH.toString());
                    console.log(`Servo H moved to: ${newH}°`);
                } else {
                    console.log(`Servo H at maximum limit: ${H_MAX}°`);
                }
                break;

            case "reset":
                window.currentServoH = 90;
                window.currentServoV = 70;
                mqttClient.publish("servo/h", "90");
                mqttClient.publish("servo/v", "70");
                console.log("Servo reset to H:90°, V:70°");
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
                $overlayEl.show();
            }
        } else {
            $statusEl.text("AMAN").css("color", "#fff");
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
            console.warn("CCTV stream failed to load.");
        };

        cctv.onload = function () {
            console.log("CCTV stream loaded successfully");
        };
    }

    function updatePlnStatus(val) {
        $("#status-pln").text(val === "ON" ? "HIDUP" : "MATI");
        $("#status-pln").css("color", val === "ON" ? "#fff" : "#ff416c");
    }
});
