<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

class MqttService
{
    protected $client;
    protected $host;
    protected $port;
    protected $clientId;
    protected $useWebsockets;

    public function __construct()
    {
        $this->host = env('MQTT_HOST', 'broker.hivemq.com');
        $this->port = env('MQTT_PORT', 1884);
        $this->clientId = env('MQTT_CLIENT_ID', 'kandang_' . uniqid());
        $this->useWebsockets = env('MQTT_USE_WEBSOCKETS', false);
    }

    public function connect()
    {
        $connectionSettings = (new ConnectionSettings)
            ->setUsername(env('MQTT_USERNAME'))
            ->setPassword(env('MQTT_PASSWORD'))
            ->setKeepAliveInterval(60)
            ->setLastWillTopic('kandang/status')
            ->setLastWillMessage('offline')
            ->setLastWillQualityOfService(0);

        $this->client = new MqttClient(
            $this->host,
            $this->port,
            $this->clientId,
            MqttClient::MQTT_3_1_1,
            null
        );

        $this->client->connect($connectionSettings, true);
    }

    public function publish($topic, $message)
    {
        if (!$this->client) {
            $this->connect();
        }
        $this->client->publish($topic, $message, 0);
    }

    public function subscribe($topic, $callback)
    {
        if (!$this->client) {
            $this->connect();
        }
        $this->client->subscribe($topic, $callback, 0);
        $this->client->loop(true);
    }

    public function disconnect()
    {
        if ($this->client) {
            $this->client->disconnect();
        }
    }
}
