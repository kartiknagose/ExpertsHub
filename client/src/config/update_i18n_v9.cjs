const fs = require('fs');
const targetFile = 'd:/mini_project/ExpertsHub V2/client/src/config/i18n.js';
let content = fs.readFileSync(targetFile, 'utf8');

const enKeys = `      "Start Verification": "Start Verification",
      "Completion Verification": "Completion Verification",
      "Step 1: Visual Proof": "Step 1: Visual Proof",
      "Step 2: Customer OTP": "Step 2: Customer OTP",
      "Please upload a photo of the": "Please upload a photo of the",
      "work area": "work area",
      "finished result": "finished result",
      "Before photo (capture or upload)": "Before photo (capture or upload)",
      "After photo (capture or upload)": "After photo (capture or upload)",
      "Customer OTP": "Customer OTP",
      "Ask customer for the 4-digit code": "Ask customer for the 4-digit code",
      "Verify & Proceed": "Verify & Proceed",
      "Work started successfully!": "Work started successfully!",
      "Job completed successfully!": "Job completed successfully!",
      "Invalid OTP": "Invalid OTP",
      "No booking selected. Please close and try again.": "No booking selected. Please close and try again.",
      "Please upload a": "Please upload a",
      "photo as proof.": "photo as proof.",
      "Please enter a valid 4-digit OTP.": "Please enter a valid 4-digit OTP.",
      "BEFORE": "BEFORE",
      "AFTER": "AFTER"`;

const hiKeys = `      "Start Verification": "प्रारंभ सत्यापन",
      "Completion Verification": "पूर्णता सत्यापन",
      "Step 1: Visual Proof": "चरण 1: दृश्य प्रमाण",
      "Step 2: Customer OTP": "चरण 2: ग्राहक ओटीपी",
      "Please upload a photo of the": "कृपया इसकी एक फोटो अपलोड करें",
      "work area": "कार्य क्षेत्र",
      "finished result": "तैयार परिणाम",
      "Before photo (capture or upload)": "कार्य से पहले की फोटो (कैप्चर या अपलोड)",
      "After photo (capture or upload)": "कार्य के बाद की फोटो (कैप्चर या अपलोड)",
      "Customer OTP": "ग्राहक ओटीपी",
      "Ask customer for the 4-digit code": "ग्राहक से 4-अंकीय कोड मांगें",
      "Verify & Proceed": "सत्यापित करें और आगे बढ़ें",
      "Work started successfully!": "कार्य सफलतापूर्वक शुरू हुआ!",
      "Job completed successfully!": "कार्य सफलतापूर्वक पूरा हुआ!",
      "Invalid OTP": "अमान्य ओटीपी",
      "No booking selected. Please close and try again.": "कोई बुकिंग चयनित नहीं है। कृपया बंद करें और पुनः प्रयास करें।",
      "Please upload a": "कृपया एक",
      "photo as proof.": "प्रमाण के रूप में फोटो अपलोड करें।",
      "Please enter a valid 4-digit OTP.": "कृपया एक वैध 4-अंकीय ओटीपी दर्ज करें।",
      "BEFORE": "पहले",
      "AFTER": "बाद में"`;

let newContent = content.replace('      // Additional Worker Keys', enKeys + ',\n      // Additional Worker Keys');
newContent = newContent.replace('      // Additional Worker Keys', hiKeys + ',\n      // Additional Worker Keys');

fs.writeFileSync(targetFile, newContent);
console.log('Successfully updated i18n.js with OTP Modal keys');
