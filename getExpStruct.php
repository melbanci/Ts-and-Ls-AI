<?php
date_default_timezone_set('America/New_York');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// === CONFIG ===
$assignmentsFile = "pid_assignments.json";
$expStructsDir = "expStructs_random_pilot"; // or whatever folder you're using

// === Get Prolific PID ===
$prolificId = isset($_GET['PROLIFIC_PID']) ? $_GET['PROLIFIC_PID'] : null;
if (!$prolificId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing PROLIFIC_PID"]);
    exit();
}

// === Load or initialize assignment map ===
$assignments = file_exists($assignmentsFile) ? json_decode(file_get_contents($assignmentsFile), true) : [];

// === Assign new file if needed ===
if (!isset($assignments[$prolificId])) {
    $allFiles = array_values(array_filter(scandir($expStructsDir), function($f) {
        return preg_match('/\.json$/', $f);
    }));

    $assignedFiles = array_values($assignments);
    $unassigned = array_values(array_diff($allFiles, $assignedFiles));

    if (count($unassigned) === 0) {
        http_response_code(500);
        echo json_encode(["error" => "No more JSON files available"]);
        exit();
    }

    // Pick random unassigned file
    $chosen = $unassigned[array_rand($unassigned)];
    $assignments[$prolificId] = $chosen;

    // Save updated assignment map
    file_put_contents($assignmentsFile, json_encode($assignments, JSON_PRETTY_PRINT));
}

// === Serve the assigned JSON file ===
$assignedFile = $expStructsDir . "/" . $assignments[$prolificId];
if (!file_exists($assignedFile)) {
    http_response_code(404);
    echo json_encode(["error" => "Assigned file not found"]);
    exit();
}

// echo json_encode(['filename' => $assignedFile]);
echo file_get_contents($assignedFile);

exit();
?>