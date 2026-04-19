-- Create case_studies table
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  summary TEXT NOT NULL,
  metric TEXT NOT NULL,
  metric_label TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  quote_text TEXT,
  quote_author TEXT,
  quote_role TEXT,
  duration TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case studies readable by everyone"
ON public.case_studies FOR SELECT
USING (true);

CREATE POLICY "Admins insert case studies"
ON public.case_studies FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update case studies"
ON public.case_studies FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete case studies"
ON public.case_studies FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON public.case_studies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data
INSERT INTO public.case_studies (slug, company, industry, summary, metric, metric_label, challenge, solution, results, quote_text, quote_author, quote_role, duration, location, image, sort_order) VALUES
('royal-jordanian-airlines', 'شركة الطيران الملكية', 'الطيران', 'تجربة Wi-Fi عالية السرعة على متن أسطول من 30 طائرة، مع رضا ركاب ارتفع 47%.', '+47%', 'رضا الركاب',
  'كانت أنظمة Wi-Fi التقليدية على متن الطائرات تعاني من سرعات منخفضة وانقطاعات متكررة فوق المحيطات والمناطق النائية، مما أدى إلى شكاوى متزايدة من ركاب الدرجة الأولى ورجال الأعمال الذين يعتمدون على الاتصال أثناء الرحلات الطويلة.',
  'تم تركيب أطباق Starlink Aviation على أسطول من 30 طائرة من طراز A320 و787، مع نظام توزيع داخلي يدعم حتى 300 جهاز متزامن لكل طائرة. التركيب تم خلال نوافذ الصيانة الدورية دون تعطيل جدول الرحلات.',
  '[{"value":"350","label":"ميغابت/ث متوسط السرعة"},{"value":"<40ms","label":"زمن الاستجابة"},{"value":"+47%","label":"رضا الركاب"},{"value":"30","label":"طائرة مجهزة"}]'::jsonb,
  'أصبح بإمكان ركابنا عقد اجتماعات فيديو ومشاهدة البث المباشر على ارتفاع 40 ألف قدم. هذه قفزة نوعية في تجربة السفر.', 'المهندس سامر مجلي', 'مدير تجربة الركاب',
  '9 أشهر', 'المجال الجوي العالمي', 'case-aviation', 1),
('aqaba-smart-port', 'ميناء العقبة الذكي', 'المسطحات المائية', 'ربط 120 سفينة بالشبكة المؤسسية مع زمن استجابة أقل من 50ms في المياه الدولية.', '<50ms', 'زمن الاستجابة',
  'اعتمدت سفن الشحن على اتصالات VSAT بطيئة ومكلفة، مما أعاق تتبع البضائع في الوقت الفعلي وتطبيقات السلامة البحرية الحديثة، وأدى إلى تأخير عمليات التخليص الجمركي عند الوصول.',
  'نشر Starlink Maritime على 120 سفينة شحن وحاويات، مع تكامل مباشر مع أنظمة ERP الخاصة بالميناء. وفّر النظام اتصالاً موحداً من رصيف العقبة وحتى الموانئ الأوروبية والآسيوية.',
  '[{"value":"120","label":"سفينة متصلة"},{"value":"<50ms","label":"زمن الاستجابة"},{"value":"-68%","label":"تكلفة الاتصال"},{"value":"99.9%","label":"نسبة الجاهزية"}]'::jsonb,
  'نتتبع كل حاوية لحظة بلحظة من أي نقطة في العالم. هذا غيّر طريقة إدارتنا للسلسلة اللوجستية بالكامل.', 'كابتن خالد العمري', 'مدير العمليات البحرية',
  '6 أشهر', 'البحر الأحمر والمياه الدولية', 'case-maritime', 2),
('major-contractors-group', 'مجموعة المقاولات الكبرى', 'المواقع الميدانية', 'ربط 18 موقع بناء نائي خلال أسبوع واحد بدلاً من أشهر الانتظار للبنية التحتية.', '7 أيام', 'للنشر الكامل',
  'تأخّر مشاريع البنية التحتية بسبب صعوبة توفير اتصال إنترنت في المواقع النائية، حيث يستغرق مدّ الكوابل أو تركيب الأبراج عدة أشهر، مما يعطّل تسليم تقارير المهندسين والتنسيق مع المكاتب الرئيسية.',
  'تم نشر 18 وحدة Starlink Business Mobile في مواقع البناء عبر الأردن ودول الخليج خلال 7 أيام عمل. كل موقع حصل على شبكة Wi-Fi محلية تدعم برامج CAD وكاميرات المراقبة وأنظمة الحضور البيومتري.',
  '[{"value":"18","label":"موقع متصل"},{"value":"7","label":"أيام النشر"},{"value":"200+","label":"ميغابت/ث في كل موقع"},{"value":"-85%","label":"وقت التجهيز"}]'::jsonb,
  'كنا نخسر أسابيع في انتظار الاتصال. الآن نبدأ الموقع ونوصّل الإنترنت في نفس اليوم.', 'م. رنا الحموري', 'مدير المشاريع الإقليمي',
  'أسبوع واحد', '18 موقع في الأردن والخليج', 'case-construction', 3),
('badia-regional-hospital', 'مستشفى البادية الإقليمي', 'الرعاية الصحية', 'تمكين التطبيب عن بُعد والاستشارات الفورية لـ 50,000 مريض في المناطق النائية.', '50K', 'مريض مخدوم',
  'حُرم سكان المناطق النائية من الوصول لاستشارات الأطباء المتخصصين، واضطر المرضى للسفر مئات الكيلومترات إلى عمّان للحصول على رأي طبي ثانٍ، مع تأخير في إرسال صور الأشعة والتحاليل.',
  'ربطنا 12 عيادة في البادية بمركز التطبيب عن بُعد في المستشفى المركزي عبر Starlink، مما أتاح بثاً مباشراً عالي الجودة للاستشارات وإرسال صور الأشعة الرقمية فوراً للأطباء المتخصصين.',
  '[{"value":"50,000","label":"مريض مخدوم"},{"value":"12","label":"عيادة مرتبطة"},{"value":"-72%","label":"تخفيض السفر للمرضى"},{"value":"<2 دقيقة","label":"وقت إرسال الأشعة"}]'::jsonb,
  'أنقذنا حالات حرجة كانت ستحتاج 4 ساعات سفر. الآن الاستشارة تصل خلال دقائق.', 'د. منى الخطيب', 'رئيس قسم التطبيب عن بُعد',
  '4 أشهر', 'البادية الشمالية والشرقية', 'case-healthcare', 4),
('national-petroleum', 'شركة النفط الوطنية', 'الطاقة', 'مراقبة مواقع الحفر في الصحراء بفيديو 4K مباشر وبيانات IoT في الوقت الفعلي.', '24/7', 'مراقبة مستمرة',
  'كانت مراقبة آبار الحفر النائية تعتمد على تقارير يومية يدوية، مما أخّر اكتشاف الأعطال ورفع تكاليف الصيانة الطارئة، وحدّ من قدرة المهندسين في المقر الرئيسي على التدخل الفوري عند الحاجة.',
  'تركيب Starlink Business Fixed في 24 موقع حفر، مع كاميرات 4K وحساسات IoT تنقل بيانات الضغط ودرجة الحرارة وتدفق النفط مباشرة إلى مركز التحكم في عمّان.',
  '[{"value":"24/7","label":"مراقبة مستمرة"},{"value":"24","label":"موقع حفر"},{"value":"-40%","label":"تكلفة الصيانة الطارئة"},{"value":"4K","label":"بث فيديو حي"}]'::jsonb,
  'نشاهد كل بئر نفط مباشرة من المقر الرئيسي. هذا غيّر مفهوم السلامة الصناعية لدينا.', 'م. زيد العزام', 'مدير العمليات الصناعية',
  '8 أشهر', 'حقول الصحراء الشرقية', 'case-energy', 5),
('applied-science-university', 'جامعة العلوم التطبيقية', 'التعليم', 'ربط 12 حرماً جامعياً بشبكة موحدة عالية السرعة لدعم التعلم الهجين.', '12', 'حرم جامعي',
  'تفاوت سرعات الإنترنت بين الفروع الجامعية أعاق تطبيق منصات التعلم الموحّدة، وعجزت بعض الفروع عن استضافة محاضرات الفيديو التفاعلية أو الوصول لمكتبات الأبحاث الدولية بسلاسة.',
  'نشر Starlink Business Fixed في 12 حرماً جامعياً، مع شبكة Wi-Fi متطورة تغطي القاعات والمكتبات والمختبرات. تمّ ربط الجميع بمنصة Moodle موحدة وأنظمة Zoom Premium.',
  '[{"value":"12","label":"حرم جامعي"},{"value":"45,000","label":"طالب مستفيد"},{"value":"1 جيجابت/ث","label":"في كل حرم"},{"value":"100%","label":"تغطية القاعات"}]'::jsonb,
  'أصبح بإمكان طلاب جرش حضور محاضرة من أستاذ في عمّان بنفس جودة الحضور الفعلي.', 'د. عبدالله الصرايرة', 'نائب الرئيس للشؤون الأكاديمية',
  '5 أشهر', '12 محافظة أردنية', 'case-education', 6);