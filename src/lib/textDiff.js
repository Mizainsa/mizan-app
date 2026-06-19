// ===== مقارنة نصّين سطراً بسطر (محلي، بلا خادم) =====
// خوارزمية أطول تسلسل مشترك (LCS) على مستوى الأسطر لإظهار:
// المضاف، المحذوف، والثابت بين نسختين من مستند.

function splitLines(t) {
  return String(t || "").split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
}

// تُرجع مصفوفة عناصر: { type: "same"|"added"|"removed", text }
export function diffLines(oldText, newText) {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const n = a.length, m = b.length;

  // جدول LCS
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < n) { result.push({ type: "removed", text: a[i] }); i++; }
  while (j < m) { result.push({ type: "added", text: b[j] }); j++; }

  return result;
}

// إحصاء سريع للفروق
export function diffStats(diff) {
  let added = 0, removed = 0, same = 0;
  diff.forEach((d) => {
    if (d.type === "added") added++;
    else if (d.type === "removed") removed++;
    else same++;
  });
  return { added, removed, same };
}
