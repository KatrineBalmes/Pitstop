<?php
// ordering/send_verification.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// PHPMailer configuration (for Gmail)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Uncomment these if using Composer
// require 'vendor/autoload.php';

// OR manually include PHPMailer files
// require 'PHPMailer/src/Exception.php';
// require 'PHPMailer/src/PHPMailer.php';
// require 'PHPMailer/src/SMTP.php';

try {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if(!$data || !isset($data['method']) || !isset($data['code'])) {
        throw new Exception('Invalid request data');
    }
    
    $method = $data['method']; // 'email' or 'sms'
    $code = $data['code'];
    $to = $data['to'];
    $fullname = $data['fullname'] ?? 'Customer';
    
    if($method === 'email') {
        sendEmail($to, $code, $fullname);
    } else if($method === 'sms') {
        sendSMS($to, $code, $fullname);
    } else {
        throw new Exception('Invalid method');
    }
    
    echo json_encode([
        'status' => 'ok',
        'message' => 'Verification code sent successfully'
    ]);
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
}

function sendEmail($to, $code, $fullname) {
    // Check if PHPMailer is available
    if(!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        // PHPMailer not installed - return demo mode
        error_log("PHPMailer not installed - Demo mode");
        return;
    }
    
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@gmail.com';   // Gmail mo
        $mail->Password = 'xxxx xxxx xxxx xxxx';     // 16-character App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->setFrom('your-email@gmail.com', 'Pitstop');

        
        // Recipients
        $mail->setFrom('your-email@gmail.com', 'Pitstop');
        $mail->addAddress($to, $fullname);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset - Verification Code';
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;'>
                    <h1 style='color: white; margin: 0;'>🍽️ Pitstop</h1>
                </div>
                <div style='padding: 30px; background: #f8f9fa;'>
                    <h2 style='color: #333;'>Hi {$fullname},</h2>
                    <p style='color: #666; font-size: 16px;'>
                        You requested to reset your password. Use the verification code below:
                    </p>
                    <div style='background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #667eea; letter-spacing: 8px; font-size: 36px; margin: 0;'>{$code}</h1>
                    </div>
                    <p style='color: #999; font-size: 14px;'>
                        This code will expire in 10 minutes. If you didn't request this, please ignore this email.
                    </p>
                </div>
                <div style='padding: 20px; text-align: center; color: #999; font-size: 12px;'>
                    © 2024 Pitstop. All rights reserved.
                </div>
            </div>
        ";
        
        $mail->send();
        error_log("Email sent successfully to {$to}");
        
    } catch(Exception $e) {
        error_log("Email error: " . $mail->ErrorInfo);
        throw new Exception("Email could not be sent: {$mail->ErrorInfo}");
    }
}

function sendSMS($to, $code, $fullname) {
    // Using Semaphore SMS API (Philippines)
    $apiKey = 'YOUR_SEMAPHORE_API_KEY'; // CHANGE THIS
    
    $message = "Hi {$fullname}! Your Pitstop password reset code is: {$code}. Valid for 10 minutes.";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.semaphore.co/api/v4/messages');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'apikey' => $apiKey,
        'number' => $to,
        'message' => $message,
        'sendername' => 'PITSTOP'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $output = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if($httpCode !== 200) {
        error_log("SMS error: " . $output);
        // Don't throw error in demo mode
        error_log("SMS API not configured - Demo mode");
    } else {
        error_log("SMS sent successfully to {$to}");
    }
    
    // Alternative: Twilio SMS (International)
    /*
    $accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
    $authToken = 'YOUR_TWILIO_AUTH_TOKEN';
    $twilioNumber = 'YOUR_TWILIO_NUMBER';
    
    $client = new Twilio\Rest\Client($accountSid, $authToken);
    $message = $client->messages->create(
        $to,
        [
            'from' => $twilioNumber,
            'body' => "Hi {$fullname}! Your Pitstop password reset code is: {$code}. Valid for 10 minutes."
        ]
    );
    */
}
?>