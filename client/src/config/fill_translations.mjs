import fs from 'fs';

const filePath = 'd:/mini_project/UrbanPro V2/client/src/config/i18n.js';
let content = fs.readFileSync(filePath, 'utf8');

const hiMissing = {
  "Welcome back,": "वापसी पर स्वागत है,",
  "Your personalized service hub is ready.": "आपका व्यक्तिगत सेवा केंद्र तैयार है।",
  "Book New Service": "नई सेवा बुक करें",
  "Active Sessions": "सक्रिय सत्र",
  "Jobs Completed": "कार्य पूरे हुए",
  "Pending Payments": "लंबित भुगतान",
  "Total Invested": "कुल निवेश",
  "Live Activity": "लाइव गतिविधि",
  "Full History": "पूरा इतिहास",
  "No active missions": "कोई सक्रिय मिशन नहीं",
  "Book a professional service to track real-time updates here.": "वास्तविक समय के अपडेट ट्रैक करने के लिए यहां एक पेशेवर सेवा बुक करें।",
  "Handpicked for you": "आपके लिए चुने गए",
  "Share UrbanPro with Friends": "दोस्तों के साथ UrbanPro साझा करें",
  "Know someone who needs quality home services? Spread the word!": "किसी ऐसे व्यक्ति को जानते हैं जिसे गुणवत्तापूर्ण घरेलू सेवाओं की आवश्यकता है? खबर फैलाएं!",
  "Share Now": "अभी साझा करें",
  "Safety Matrix": "सुरक्षा मैट्रिक्स",
  "Zero-Risk Promise": "जीरो-रिस्क प्रॉमिस",
  "Verified professional network": "सत्यापित पेशेवर नेटवर्क",
  "UrbanPro Quality": "UrbanPro गुणवत्ता",
  "Top-rated standard of work": "टॉप-रेटेड कार्य मानक",
  "Secure Escrow": "सुरक्षित एस्क्रो",
  "Pay only when satisfied": "संतुष्ट होने पर ही भुगतान करें",
  "Support Center": "सहायता केंद्र",
  "Available 24/7": "24/7 उपलब्ध",
  "Are you sure you want to cancel this booking? This action cannot be undone.": "क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
  "Yes, Cancel": "हाँ, रद्द करें",
  "Keep Booking": "बुकिंग रखें",
  "Service History": "सेवा इतिहास",
  "Search by service or ID...": "सेवा या आईडी द्वारा खोजें...",
  "Total Bookings": "कुल बुकिंग",
  "Success Rate": "सफलता दर",
  "No matches found": "कोई मिलान नहीं मिला",
  "No bookings yet": "अभी तक कोई बुकिंग नहीं",
  "Try searching for a different service name or ID.": "एक अलग सेवा नाम या आईडी खोजने का प्रयास करें।",
  "Start your first booking to experience our professional services.": "हमारी पेशेवर सेवाओं का अनुभव करने के लिए अपनी पहली बुकिंग शुरू करें।",
  "Book a Service": "सेवा बुक करें",
  "Confirm Cancellation": "रद्दीकरण की पुष्टि करें",
  "Cancellation fees may apply depending on the timing.": "समय के आधार पर रद्दीकरण शुल्क लागू हो सकता है।"
};

const mrMissing = {
  "Welcome back,": "परत स्वागत आहे,",
  "Your personalized service hub is ready.": "तुमचे वैयक्तिकृत सेवा केंद्र तयार आहे.",
  "Book New Service": "नवीन सेवा बुक करा",
  "Active Sessions": "सक्रिय सत्र",
  "Jobs Completed": "पूर्ण झालेली कामे",
  "Pending Payments": "प्रलंबित देयके",
  "Total Invested": "एकूण गुंतवणूक",
  "Live Activity": "थेट क्रियाकलाप",
  "Full History": "पूर्ण इतिहास",
  "No active missions": "कोणतीही सक्रिय मिशन नाहीत",
  "Book a professional service to track real-time updates here.": "रिअल-टाइम अपडेट्स ट्रॅक करण्यासाठी येथे प्रोफेशनल सेवा बुक करा.",
  "Handpicked for you": "तुमच्यासाठी निवडलेले",
  "Share UrbanPro with Friends": "मित्रांसह UrbanPro शेअर करा",
  "Know someone who needs quality home services? Spread the word!": "दर्जेदार घरगुती सेवांची गरज असलेल्या कोणाला ओळखता का? प्रसार करा!",
  "Share Now": "आता शेअर करा",
  "Safety Matrix": "सुरक्षा मॅट्रिक्स",
  "Zero-Risk Promise": "झिरो-रिस्क प्रॉमिस",
  "Verified professional network": "सत्यापित प्रोफेशनल नेटवर्क",
  "UrbanPro Quality": "UrbanPro गुणवत्ता",
  "Top-rated standard of work": "टॉप-रेटेड कामाचा दर्जा",
  "Secure Escrow": "सुरक्षित एस्क्रो",
  "Pay only when satisfied": "समाधानी असल्यावरच पैसे द्या",
  "Support Center": "सहायता केंद्र",
  "Available 24/7": "24/7 उपलब्ध",
  "Are you sure you want to cancel this booking? This action cannot be undone.": "तुम्हाला खात्री आहे की तुम्ही हे बुकिंग रद्द करू इच्छिता? ही क्रिया पूर्ववत केली जाऊ शकत नाही.",
  "Yes, Cancel": "होय, रद्द करा",
  "Keep Booking": "बुकिंग चालू ठेवा",
  "Service History": "सेवा इतिहास",
  "Search by service or ID...": "सेवा किंवा आयडीद्वारे शोधा...",
  "Total Bookings": "एकूण बुकिंग",
  "Success Rate": "यश दर",
  "No matches found": "निकाल सापडला नाही",
  "No bookings yet": "अद्याप कोणतेही बुकिंग नाही",
  "Try searching for a different service name or ID.": "वेगळे सेवा नाव किंवा आयडी शोधण्याचा प्रयत्न करा.",
  "Start your first booking to experience our professional services.": "आमच्या प्रोफेशनल सेवांचा अनुभव घेण्यासाठी तुमचे पहिले बुकिंग सुरू करा.",
  "Book a Service": "सेवा बुक करा",
  "Confirm Cancellation": "रद्दीकरण पुष्टी करा",
  "Cancellation fees may apply depending on the timing.": "वेळेनुसार रद्दीकरण शुल्क लागू होऊ शकते."
};

function addKeys(blockName, keysToAdd) {
  const regex = new RegExp(blockName + ': \\{[\\s\\S]*?translation: \\{([\\s\\S]*?)\\}\\s*\\}', 'g');
  content = content.replace(regex, (match, inner) => {
    let newInner = inner.trim();
    if (!newInner.endsWith(',')) newInner += ',';
    
    for (const [key, value] of Object.entries(keysToAdd)) {
        if (!newInner.includes(`"${key}":`)) {
            newInner += `\n      "${key}": "${value}",`;
        }
    }
    return match.replace(inner, '\n      ' + newInner.trim() + '\n    ');
  });
}

addKeys('hi', hiMissing);
addKeys('mr', mrMissing);

fs.writeFileSync(filePath, content);
console.log("Updated hi and mr blocks with missing keys.");
