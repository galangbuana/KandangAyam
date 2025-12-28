<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/sensor-data', [DashboardController::class, 'getSensorData'])->name('sensor.data');
Route::post('/control-device', [DashboardController::class, 'controlDevice'])->name('control.device');
Route::post('/control-camera', [DashboardController::class, 'controlCamera'])->name('control.camera');
