// هذا هو الكود الذي يجب أن يكون في ملف index.js الجديد (في المجلد الجذري)

const { app } = require('./.next/server/server.js'); // تحديد موقع ملف الخادم الذي أنشأه Next.js

exports.nextApp = app;