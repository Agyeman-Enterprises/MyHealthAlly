# MyHealthAlly Test Runner Guide

## Quick Start

### Option 1: PowerShell Script (Windows)
```powershell
.\run-tests.ps1 -Mode unit
```

### Option 2: Bash Script (Linux/Mac)
```bash
chmod +x run-tests.sh
./run-tests.sh unit
```

### Option 3: Direct Gradle Command
```bash
.\gradlew.bat :app:testDebugUnitTest
```

## Available Test Modes

### `unit` - Run Unit Tests Only
Runs all unit tests in `app/src/test`:
- CG2CIncidentTest.kt - Incident logging tests
- CG2AHealthTest.kt - Health system tests
- BatchDEnforcementTest.kt - Enforcement tests
- KillSwitchesTest.kt - Failsafe tests
- CG2DAlertTest.kt - Alert system tests

### `compile` - Compile Test Classes
Compiles test classes without running them. Useful for checking syntax errors.

### `all` - Run All Tests
Runs both unit tests and Android instrumentation tests.

### `gradle` - Show Available Tasks
Lists all available Gradle test-related tasks.

## Troubleshooting

### Network/TLS Issues
If you encounter TLS/network errors when downloading dependencies:

1. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - Some corporate networks may block Maven Central

2. **Use Gradle Daemon**
   ```bash
   .\gradlew.bat --daemon
   ```

3. **Clear Gradle Cache**
   ```bash
   .\gradlew.bat clean --refresh-dependencies
   ```

4. **Use Offline Mode (if dependencies cached)**
   ```bash
   .\gradlew.bat :app:testDebugUnitTest --offline
   ```

### kapt Issues
If you see kapt-related errors:

1. **Ensure Gradle 8.5+ is used** (already configured)
2. **Check Room Database dependencies** are correct
3. **Clean and rebuild**
   ```bash
   .\gradlew.bat clean :app:testDebugUnitTest
   ```

### Resource Compilation Errors
If launcher icon errors occur:

1. **Skip resource compilation for tests**
   ```bash
   .\gradlew.bat :app:compileDebugUnitTestKotlin
   ```

2. **Fix launcher icons** - Ensure all launcher icon files are valid PNG images

## Running Tests in Android Studio

1. Open project in Android Studio
2. Navigate to `app/src/test`
3. Right-click on test file or package
4. Select "Run 'Tests in...'"

## Test Structure

```
app/src/test/java/com/agyeman/myhealthally/
├── core/
│   ├── alerts/
│   │   └── CG2DAlertTest.kt
│   ├── enforcement/
│   │   └── BatchDEnforcementTest.kt
│   ├── failsafe/
│   │   └── KillSwitchesTest.kt
│   ├── health/
│   │   └── CG2AHealthTest.kt
│   └── incidents/
│       └── CG2CIncidentTest.kt
```

## Dependencies

Tests require:
- JUnit 4.13.2
- Kotlin Coroutines Test 1.7.3
- Mockito 5.1.1
- Android Context (mocked)

## Alternative: Run Tests Without Full Build

If you want to run tests without building the entire app:

```bash
# Compile only test sources
.\gradlew.bat :app:compileDebugUnitTestKotlin

# Then run tests
.\gradlew.bat :app:testDebugUnitTest --rerun-tasks
```

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: ./gradlew :app:testDebugUnitTest --continue
```

## Performance Tips

1. **Use Gradle Daemon** (enabled by default)
2. **Enable Build Cache** (enabled in gradle.properties)
3. **Run specific test class**:
   ```bash
   .\gradlew.bat :app:testDebugUnitTest --tests "com.agyeman.myhealthally.core.incidents.CG2CIncidentTest"
   ```

## Next Steps

After tests pass:
1. Review test coverage
2. Add more test cases as needed
3. Integrate with CI/CD pipeline
4. Set up code coverage reporting

