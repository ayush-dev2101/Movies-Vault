/**
 * MovieVault Local Build Validator
 * Checks for critical environment variables before generating local APKs.
 */
const REQUIRED = [
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_TMDB_API_KEY'
];

console.log('\n🔍 Validating Local Build Environment...\n');

let missing = [];
REQUIRED.forEach(key => {
  if (!process.env[key]) {
    missing.push(key);
  }
});

if (missing.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missing.join(', '));
  console.warn('   The app will use hardcoded production fallbacks in the APK.');
} else {
  console.log('✅ All environment variables present.');
}

console.log('\n🚀 Ready for Local Android Build!\n');
process.exit(0);
