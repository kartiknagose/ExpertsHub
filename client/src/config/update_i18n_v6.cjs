const fs = require('fs');
const targetFile = 'd:/mini_project/ExpertsHub V2/client/src/config/i18n.js';
let content = fs.readFileSync(targetFile, 'utf8');

const enKeys = `      // Loyalty/Rewards Keys
      "Loyalty Points": "Loyalty Points",
      "Rewards Program": "Rewards Program",
      "Earn 1 point per ₹10 spent · Redeem for wallet credits": "Earn 1 point per ₹10 spent · Redeem for wallet credits",
      "Available Points": "Available Points",
      "Lifetime Earned": "Lifetime Earned",
      "Current Tier": "Current Tier",
      "points to next tier": "points to next tier",
      "Platinum": "Platinum",
      "Gold": "Gold",
      "Silver": "Silver",
      "Bronze": "Bronze",
      "Redeem Points": "Redeem Points",
      "Convert your points to wallet credit. 100 points = ₹10.": "Convert your points to wallet credit. 100 points = ₹10.",
      "Enter points to redeem": "Enter points to redeem",
      "Redeem": "Redeem",
      "You will receive": "You will receive",
      "in wallet credits": "in wallet credits",
      "Point History": "Point History",
      "No point transactions yet. Complete a booking to start earning!": "No point transactions yet. Complete a booking to start earning!",
      "Enter a valid number of points to redeem.": "Enter a valid number of points to redeem.",
      "Failed to redeem points": "Failed to redeem points",
      "Redeemed": "Redeemed",
      "points for": "points for",
      "wallet credit!": "wallet credit!"`;

const hiKeys = `      // Loyalty/Rewards Keys
      "Loyalty Points": "वफादारी अंक",
      "Rewards Program": "पुरस्कार कार्यक्रम",
      "Earn 1 point per ₹10 spent · Redeem for wallet credits": "खर्च किए गए प्रत्येक ₹10 पर 1 अंक अर्जित करें · वॉलेट क्रेडिट के लिए रिडीम करें",
      "Available Points": "उपलब्ध अंक",
      "Lifetime Earned": "कुल अर्जित",
      "Current Tier": "वर्तमान टियर",
      "points to next tier": "अगले टियर के लिए अंक",
      "Platinum": "प्लैटिनम",
      "Gold": "गोल्ड",
      "Silver": "सिल्वर",
      "Bronze": "ब्रोंज",
      "Redeem Points": "अंक रिडीम करें",
      "Convert your points to wallet credit. 100 points = ₹10.": "अपने अंकों को वॉलेट क्रेडिट में बदलें। 100 अंक = ₹10.",
      "Enter points to redeem": "रिडीम करने के लिए अंक दर्ज करें",
      "Redeem": "रिडीम करें",
      "You will receive": "आपको प्राप्त होंगे",
      "in wallet credits": "वॉलेट क्रेडिट में",
      "Point History": "अंकों का इतिहास",
      "No point transactions yet. Complete a booking to start earning!": "अभी तक कोई अंक लेनदेन नहीं। कमाई शुरू करने के लिए एक बुकिंग पूरी करें!",
      "Enter a valid number of points to redeem.": "रिडीम करने के लिए अंकों की एक मान्य संख्या दर्ज करें।",
      "Failed to redeem points": "अंक रिडीम करने में विफल",
      "Redeemed": "रिडीम किया गया",
      "points for": "अंक बदले",
      "wallet credit!": "वॉलेट क्रेडिट के लिए!"`;

let newContent = content.replace('      // Additional Worker Keys', enKeys + ',\n      // Additional Worker Keys');
newContent = newContent.replace('      // Additional Worker Keys', hiKeys + ',\n      // Additional Worker Keys');

fs.writeFileSync(targetFile, newContent);
console.log('Successfully updated i18n.js with all loyalty keys');
