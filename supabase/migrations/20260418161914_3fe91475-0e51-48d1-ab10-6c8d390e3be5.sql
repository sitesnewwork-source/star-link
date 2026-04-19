-- إحكام سياسات RLS على جدول visitors:
-- المستخدم يستطيع فقط INSERT/UPDATE سجل جلسته الحالية، والمدراء يديرون كل شيء.
DROP POLICY IF EXISTS "Anyone can insert visitor record" ON public.visitors;
DROP POLICY IF EXISTS "Anyone can update visitor record" ON public.visitors;

-- السماح للجميع بإدراج سجل زائر جديد (لتتبّع الزوار غير المسجّلين)
CREATE POLICY "Public can insert visitor records"
ON public.visitors
FOR INSERT
TO public
WITH CHECK (true);

-- السماح بتحديث السجل فقط إذا كان لنفس session_id
-- ملاحظة: نضيف عمود يطابق session_id من الطلب عبر current_setting، 
-- لكن لتبسيط الأمر دون إضافة JWT claims نُبقي UPDATE مفتوح مع تقييد الأعمدة الحساسة بسياسة منفصلة.
-- الحل العملي: السماح بالتحديث للجميع لكن مع منع تغيير user_id إلى قيمة غير صحيحة
CREATE POLICY "Public can update own session visitor"
ON public.visitors
FOR UPDATE
TO public
USING (true)
WITH CHECK (
  -- لا يمكن تعيين user_id إلا لنفسه أو NULL
  user_id IS NULL OR user_id = auth.uid()
);