const fs = require('fs');
const path = require('path');

const capacitorPlugins = [
  '@capacitor/camera',
  '@capacitor/geolocation',
  '@capacitor/push-notifications',
  '@capacitor/splash-screen',
  '@capacitor/status-bar',
];

console.log('Fixing Capacitor plugins proguard configuration...');

capacitorPlugins.forEach(plugin => {
  const buildGradlePath = path.join(
    __dirname,
    '..',
    'node_modules',
    plugin,
    'android',
    'build.gradle'
  );

  if (fs.existsSync(buildGradlePath)) {
    let content = fs.readFileSync(buildGradlePath, 'utf8');

    if (content.includes("proguard-android.txt")) {
      content = content.replace(
        /proguard-android\.txt/g,
        'proguard-android-optimize.txt'
      );
      fs.writeFileSync(buildGradlePath, content);
      console.log(`  ✓ Fixed: ${plugin}`);
    } else {
      console.log(`  - Already fixed: ${plugin}`);
    }
  } else {
    console.log(`  - Not found: ${plugin}`);
  }
});

console.log('Done!');
