<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Data awal bisa dipassing dari sini jika menggunakan database
        // Namun untuk real-time murni, kita andalkan MQTT di frontend
        return view('dashboard');
    }
}
