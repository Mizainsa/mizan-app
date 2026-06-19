// ===== محرك الحاسبات القانونية (منطق محلي بالكامل، بلا خادم) =====
// كل دالة نقية: تأخذ مدخلات وتُرجع نتيجة قابلة للاختبار.
// الأرقام استرشادية وفق القواعد العامة للأنظمة السعودية، وتُختم في الواجهة بتنويه.

// تقريب لرقمين عشريين مع إبقاء النوع رقمياً
function round2(n) {
  if (!isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// 21) مكافأة نهاية الخدمة (نظام العمل: نصف شهر لكل سنة من أول خمس سنوات،
//     وشهر كامل لكل سنة بعدها، على أساس آخر أجر).
// نوع انتهاء العلاقة يؤثر على الاستحقاق في حالة الاستقالة:
//   - انتهاء/فصل من صاحب العمل: المكافأة كاملة.
//   - استقالة: تدرّج (أقل من سنتين لا شيء، 2 إلى 5 الثلث، 5 إلى 10 الثلثان، 10 فأكثر كاملة).
export function endOfService({ lastWage, years, reason }) {
  const wage = Number(lastWage) || 0;
  const totalYears = Number(years) || 0;
  if (wage <= 0 || totalYears <= 0) {
    return { total: 0, base: 0, factor: 0, breakdown: "يلزم إدخال آخر أجر وعدد سنوات الخدمة." };
  }

  // المكافأة الأساسية الكاملة
  const firstFive = Math.min(totalYears, 5);
  const afterFive = Math.max(totalYears - 5, 0);
  const base = round2(firstFive * (wage / 2) + afterFive * wage);

  let factor = 1;
  let note = "انتهاء العقد من جهة صاحب العمل: تُستحق المكافأة كاملة.";

  if (reason === "resign") {
    if (totalYears < 2) {
      factor = 0;
      note = "استقالة وخدمة أقل من سنتين: لا تُستحق مكافأة.";
    } else if (totalYears < 5) {
      factor = 1 / 3;
      note = "استقالة وخدمة من سنتين إلى أقل من خمس: يُستحق ثلث المكافأة.";
    } else if (totalYears < 10) {
      factor = 2 / 3;
      note = "استقالة وخدمة من خمس إلى أقل من عشر سنوات: يُستحق ثلثا المكافأة.";
    } else {
      factor = 1;
      note = "استقالة وخدمة عشر سنوات فأكثر: تُستحق المكافأة كاملة.";
    }
  }

  const total = round2(base * factor);
  return {
    total,
    base,
    factor,
    breakdown:
      `المكافأة الكاملة على أساس آخر أجر (${wage} ريال) ومدة (${totalYears} سنة) تبلغ ${base} ريال. ` +
      note + ` المبلغ المستحق التقديري: ${total} ريال.`,
  };
}

// 22) الإجازة السنوية المستحقة وبدلها.
// النظام: 21 يوماً سنوياً، وترتفع إلى 30 يوماً بعد إتمام خمس سنوات متصلة.
// بدل الإجازة غير المستخدمة = (الأجر الشهري / 30) × أيام الرصيد.
export function annualLeave({ monthlyWage, serviceYears, usedDays }) {
  const wage = Number(monthlyWage) || 0;
  const years = Number(serviceYears) || 0;
  const used = Number(usedDays) || 0;

  const entitlementPerYear = years >= 5 ? 30 : 21;
  const accrued = round2(entitlementPerYear * years);
  const remaining = round2(Math.max(accrued - used, 0));
  const dayValue = wage > 0 ? round2(wage / 30) : 0;
  const cashValue = round2(remaining * dayValue);

  return {
    entitlementPerYear,
    accrued,
    remaining,
    dayValue,
    cashValue,
    breakdown:
      `الاستحقاق السنوي ${entitlementPerYear} يوماً. ` +
      `إجمالي المستحق عن ${years} سنة هو ${accrued} يوماً، المستخدم منها ${used} يوماً، فيتبقى ${remaining} يوماً. ` +
      (wage > 0 ? `قيمة اليوم الواحد ${dayValue} ريال، فيكون بدل الرصيد المتبقي ${cashValue} ريال.` : "لحساب البدل المالي أدخل الأجر الشهري."),
  };
}

// 23) النفقة التقديرية الشهرية (استرشادية بحتة، إذ يقدّرها القاضي).
// نموذج تقديري شائع: نسبة من دخل المُنفِق موزّعة على عدد المستحقين، مع حدّ أدنى للكفاية.
export function alimony({ payerIncome, dependentsCount, housingIncluded }) {
  const income = Number(payerIncome) || 0;
  const deps = Math.max(Number(dependentsCount) || 0, 0);
  if (income <= 0 || deps <= 0) {
    return { monthly: 0, perDependent: 0, breakdown: "يلزم إدخال دخل المُنفِق وعدد المستحقين." };
  }
  // نسبة تقديرية: تبدأ من نحو ربع الدخل وتزيد مع عدد المستحقين حتى سقف النصف
  let ratio = 0.25 + 0.05 * (deps - 1);
  if (ratio > 0.5) ratio = 0.5;
  if (housingIncluded) ratio = Math.min(ratio + 0.1, 0.6);

  const monthly = round2(income * ratio);
  const perDependent = round2(monthly / deps);
  return {
    monthly,
    perDependent,
    ratio: round2(ratio * 100),
    breakdown:
      `تقدير استرشادي بنسبة نحو ${round2(ratio * 100)} بالمئة من دخل المُنفِق (${income} ريال)` +
      (housingIncluded ? " مع مراعاة السكن" : "") +
      `، فيكون مجمل النفقة الشهرية التقديرية ${monthly} ريال، بواقع ${perDependent} ريال لكل مستحق. ` +
      "التقدير النهائي من اختصاص محكمة الأحوال الشخصية بحسب الحال والكفاية.",
  };
}

// 24) قسمة الميراث المبسّطة (حالات شائعة فقط، مع تنويه شرعي إلزامي).
// تتعامل مع: زوج/زوجة، أبناء وبنات (للذكر مثل حظ الأنثيين بعد الفروض).
// ليست بديلاً عن صك حصر الإرث وقسمته الشرعية المعتمدة.
export function inheritance({ estate, spouse, sons, daughters }) {
  const total = Number(estate) || 0;
  const s = spouse; // "husband" | "wife" | "none"
  const ns = Math.max(Number(sons) || 0, 0);
  const nd = Math.max(Number(daughters) || 0, 0);

  if (total <= 0) {
    return { shares: [], breakdown: "يلزم إدخال قيمة التركة الصافية بعد الديون والوصايا." };
  }

  const hasChildren = ns + nd > 0;
  const shares = [];
  let remaining = total;

  // فرض الزوجية: للزوج النصف بلا فرع وارث والربع مع الفرع؛ وللزوجة الربع بلا فرع والثمن مع الفرع.
  if (s === "husband") {
    const frac = hasChildren ? 1 / 4 : 1 / 2;
    const amount = round2(total * frac);
    shares.push({ heir: "الزوج", fraction: hasChildren ? "الربع" : "النصف", amount });
    remaining = round2(remaining - amount);
  } else if (s === "wife") {
    const frac = hasChildren ? 1 / 8 : 1 / 4;
    const amount = round2(total * frac);
    shares.push({ heir: "الزوجة", fraction: hasChildren ? "الثمن" : "الربع", amount });
    remaining = round2(remaining - amount);
  }

  if (hasChildren) {
    // الباقي تعصيباً: للذكر مثل حظ الأنثيين
    const unitCount = ns * 2 + nd;
    const unitValue = unitCount > 0 ? round2(remaining / unitCount) : 0;
    if (ns > 0) {
      const perSon = round2(unitValue * 2);
      shares.push({ heir: `الأبناء (${ns})`, fraction: "تعصيب", amount: round2(perSon * ns), perHead: perSon });
    }
    if (nd > 0) {
      const perDaughter = round2(unitValue);
      shares.push({ heir: `البنات (${nd})`, fraction: "تعصيب", amount: round2(perDaughter * nd), perHead: perDaughter });
    }
  } else {
    // لا فرع وارث: الباقي في هذا النموذج المبسّط يُعرض كمتبقٍّ يحدده حصر الإرث (آباء/إخوة...)
    if (remaining > 0) {
      shares.push({ heir: "باقي الورثة (يحدده حصر الإرث)", fraction: "متبقٍّ", amount: remaining });
    }
  }

  return {
    shares,
    breakdown:
      "هذا توزيع مبسّط للحالات الشائعة (زوجية وأبناء وبنات) للتوعية فقط. " +
      "القسمة الشرعية الدقيقة تشمل سائر الورثة والحُجُب وتصدر عبر صك حصر إرث ووثيقة قسمة معتمدة من المحكمة.",
  };
}

// 25) غرامة التأخير وفوائده وفق نسبة متفق عليها في العقد (شرط جزائي).
// غرامة بسيطة = أصل المبلغ × النسبة اليومية × عدد أيام التأخير، مع سقف اختياري.
export function latePenalty({ principal, dailyRate, daysLate, capPercent }) {
  const p = Number(principal) || 0;
  const rate = Number(dailyRate) || 0; // نسبة مئوية يومية
  const days = Math.max(Number(daysLate) || 0, 0);
  if (p <= 0 || days <= 0) {
    return { penalty: 0, total: 0, breakdown: "يلزم إدخال أصل المبلغ وعدد أيام التأخير." };
  }
  let penalty = round2(p * (rate / 100) * days);
  let capped = false;
  if (capPercent && Number(capPercent) > 0) {
    const cap = round2(p * (Number(capPercent) / 100));
    if (penalty > cap) { penalty = cap; capped = true; }
  }
  const total = round2(p + penalty);
  return {
    penalty,
    total,
    capped,
    breakdown:
      `غرامة التأخير عن ${days} يوماً بنسبة ${rate} بالمئة يومياً على أصل ${p} ريال تبلغ ${penalty} ريال` +
      (capped ? ` (مُطبّق عليها السقف المتفق عليه)` : "") +
      `، فيصبح إجمالي المستحق ${total} ريال. ` +
      "الشرط الجزائي خاضع لتقدير المحكمة التي قد تخفّضه إن جاوز الضرر الفعلي.",
  };
}

// 26) الرسوم القضائية التقديرية (نظام التكاليف القضائية: نسبة من المطالبة بحد أقصى).
// القاعدة العامة الشائعة: حتى خمسة بالمئة من قيمة المطالبة وبسقف أعلى محدد.
export function courtFees({ claimValue }) {
  const v = Number(claimValue) || 0;
  if (v <= 0) {
    return { fee: 0, breakdown: "يلزم إدخال قيمة المطالبة المالية." };
  }
  const RATE = 0.05;       // حتى خمسة بالمئة
  const MAX_FEE = 1000000; // سقف أعلى تقديري للرسم
  let fee = round2(v * RATE);
  let capped = false;
  if (fee > MAX_FEE) { fee = MAX_FEE; capped = true; }
  return {
    fee,
    breakdown:
      `الرسم القضائي التقديري بنسبة حتى ${RATE * 100} بالمئة من قيمة المطالبة (${v} ريال) يبلغ ${fee} ريال` +
      (capped ? " عند السقف الأعلى" : "") +
      ". تُعفى بعض الدعاوى (كالعمالية للعامل) ويُرد الرسم في حالات الصلح المبكر وفق النظام.",
  };
}

// 27) الزكاة وضريبة القيمة المضافة.
// الزكاة على الوعاء النقدي/التجاري: ربع العشر (2.5 بالمئة) عند بلوغ النصاب.
// الضريبة: نسبة مضافة على قيمة السلعة/الخدمة.
export function zakatVat({ zakatBase, goldGramPrice, vatAmount, vatRate }) {
  const base = Number(zakatBase) || 0;
  const gram = Number(goldGramPrice) || 0;
  // النصاب الشرعي = قيمة 85 جراماً من الذهب
  const nisab = gram > 0 ? round2(gram * 85) : 0;
  const meetsNisab = nisab > 0 ? base >= nisab : null;
  const zakat = base > 0 ? round2(base * 0.025) : 0;

  const amount = Number(vatAmount) || 0;
  const rate = vatRate != null ? Number(vatRate) : 15; // النسبة الحالية افتراضاً
  const vat = amount > 0 ? round2(amount * (rate / 100)) : 0;
  const withVat = amount > 0 ? round2(amount + vat) : 0;

  let zNote;
  if (base <= 0) {
    zNote = "لحساب الزكاة أدخل الوعاء الزكوي (النقد وعروض التجارة).";
  } else if (gram > 0) {
    zNote = meetsNisab
      ? `الوعاء (${base} ريال) بلغ النصاب (${nisab} ريال)، فالزكاة الواجبة ربع العشر = ${zakat} ريال.`
      : `الوعاء (${base} ريال) دون النصاب التقديري (${nisab} ريال)، فلا زكاة ما لم يبلغه.`;
  } else {
    zNote = `الزكاة التقديرية ربع العشر (2.5 بالمئة) من الوعاء (${base} ريال) = ${zakat} ريال. أدخل سعر جرام الذهب لمعرفة النصاب.`;
  }

  const vNote = amount > 0
    ? `ضريبة القيمة المضافة بنسبة ${rate} بالمئة على مبلغ ${amount} ريال = ${vat} ريال، فيصبح الإجمالي ${withVat} ريال.`
    : "لحساب الضريبة أدخل قيمة السلعة أو الخدمة.";

  return { nisab, meetsNisab, zakat, vat, withVat, breakdown: zNote + " " + vNote };
}
