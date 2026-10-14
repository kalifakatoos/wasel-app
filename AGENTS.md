# إرشادات للمساهمين (بشر أو وكلاء ذكاء اصطناعي)

- اللغة الأساسية للواجهة عربية (RTL). كل النصوص في `src/i18n/ar.ts` — لا تكتب نصوصاً مباشرة داخل الشاشات.
- لا تستخدم `textAlign: 'left' | 'right'` على مكوّن `Text` (تُقلب في وضع RTL على الموبايل ولا تُقلب على الويب). استخدم `auto`/`center`، وللحقول `TextInput` يمكن استخدام `right`/`left` لأنها فيزيائية.
- استخدم الخصائص المنطقية (`marginStart`, `paddingEnd`, `insetInlineStart`) بدل `left/right`.
- الحالة العامة في `src/store/*` (Zustand). الـ selectors التي تُرجع مصفوفات جديدة يجب لفّها بـ `useShallow`.
- البيانات تأتي من `src/services/api.ts` فقط. أضف أي endpoint جديد في `WaselApi` بنسختيه (Mock + HTTP).
- قبل أي commit: `npm run typecheck && npm run lint`.
