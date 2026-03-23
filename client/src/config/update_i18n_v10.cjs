const fs = require('fs');
const targetFile = 'd:/mini_project/ExpertsHub V2/client/src/config/i18n.js';
let content = fs.readFileSync(targetFile, 'utf8');

const enKeys = `      "Reason for Cancellation": "Reason for Cancellation",
      "Please provide a reason for cancelling or rejecting this job.": "Please provide a reason for cancelling or rejecting this job.",
      "Cancellation Reason": "Cancellation Reason",
      "e.g., Scheduling conflict, out of specialized tools...": "e.g., Scheduling conflict, out of specialized tools...",
      "Go Back": "Go Back",
      "Confirm Cancellation": "Confirm Cancellation",
      "Job cancelled/rejected successfully": "Job cancelled/rejected successfully",
      "Are you sure you want to cancel? This may affect your service reliability rating.": "Are you sure you want to cancel? This may affect your service reliability rating.",
      "Reason for cancellation": "Reason for cancellation",
      "e.g., Booked by mistake, no longer needed...": "e.g., Booked by mistake, no longer needed...",
      "Wait, Keep it": "Wait, Keep it",
      "Cancel Job": "Cancel Job",
      "Booking cancelled successfully": "Booking cancelled successfully",
      "Failed to cancel": "Failed to cancel"`;

const hiKeys = `      "Reason for Cancellation": "रद्द करने का कारण",
      "Please provide a reason for cancelling or rejecting this job.": "कृपया इस कार्य को रद्द करने या अस्वीकार करने का कारण बताएं।",
      "Cancellation Reason": "रद्द करने का कारण",
      "e.g., Scheduling conflict, out of specialized tools...": "जैसे, शेड्यूलिंग संघर्ष, विशेष उपकरणों की कमी...",
      "Go Back": "वापस जाएं",
      "Confirm Cancellation": "रद्द करने की पुष्टि करें",
      "Job cancelled/rejected successfully": "कार्य सफलतापूर्वक रद्द/अस्वीकार कर दिया गया",
      "Are you sure you want to cancel? This may affect your service reliability rating.": "क्या आप वाकई रद्द करना चाहते हैं? यह आपकी सेवा विश्वसनीयता रेटिंग को प्रभावित कर सकता है।",
      "Reason for cancellation": "रद्द करने का कारण",
      "e.g., Booked by mistake, no longer needed...": "जैसे, गलती से बुक किया गया, अब आवश्यकता नहीं है...",
      "Wait, Keep it": "रुकें, इसे जारी रखें",
      "Cancel Job": "कार्य रद्द करें",
      "Booking cancelled successfully": "बुकिंग सफलतापूर्वक रद्द कर दी गई",
      "Failed to cancel": "रद्द करने में विफल"`;

let newContent = content.replace('      // Additional Worker Keys', enKeys + ',\n      // Additional Worker Keys');
newContent = newContent.replace('      // Additional Worker Keys', hiKeys + ',\n      // Additional Worker Keys');

fs.writeFileSync(targetFile, newContent);
console.log('Successfully updated i18n.js with Cancellation Modal keys');
