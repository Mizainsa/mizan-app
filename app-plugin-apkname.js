// config plugin: يضبط اسم ملفّ مخرجات أندرويد (APK/AAB) إلى "Mizan".
// في Gradle 9 (SDK 56) أُزيلت archivesBaseName من defaultConfig.
// البديل الرسمي: كتلة base { archivesName = "..." } على مستوى المشروع
// (top-level، خارج كتلة android)، مع تطبيق الإضافة 'base'.
const { withAppBuildGradle } = require('@expo/config-plugins');

const ARCHIVE_NAME = 'Mizan';

function setArchivesName(buildGradle) {
  if (buildGradle.includes('archivesName')) {
    return buildGradle; // مضبوط مسبقاً
  }
  // نلحق كتلة base على مستوى المشروع في نهاية الملفّ.
  // إضافة base plugin آمنة (AGP يطبّقها ضمناً، لكن نضمنها صراحةً).
  const block = [
    '',
    '// اسم ملفّ المخرجات (APK/AAB) — بديل archivesBaseName المُزال في Gradle 9.',
    "apply plugin: 'base'",
    'base {',
    `    archivesName = "${ARCHIVE_NAME}"`,
    '}',
    '',
  ].join('\n');
  return buildGradle + block;
}

module.exports = function withApkName(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = setArchivesName(cfg.modResults.contents);
    }
    return cfg;
  });
};
