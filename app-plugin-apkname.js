// config plugin: يضبط اسم ملفّ مخرجات أندرويد (APK/AAB) إلى "Mizan"
// بدل الاسم الافتراضي (application-<hash>). يعمل ضمن مشروع Expo المُدار
// بحقن archivesBaseName في android/app/build.gradle أثناء البناء.
const { withAppBuildGradle } = require('@expo/config-plugins');

const ARCHIVE_NAME = 'Mizan';

function setArchivesBaseName(buildGradle) {
  // إن كان مضبوطاً مسبقاً لا نكرّره.
  if (buildGradle.includes('archivesBaseName')) {
    return buildGradle;
  }
  // نحقن archivesBaseName داخل كتلة defaultConfig.
  return buildGradle.replace(
    /defaultConfig\s*{/,
    (match) => `${match}\n        setProperty("archivesBaseName", "${ARCHIVE_NAME}")`
  );
}

module.exports = function withApkName(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = setArchivesBaseName(cfg.modResults.contents);
    }
    return cfg;
  });
};
