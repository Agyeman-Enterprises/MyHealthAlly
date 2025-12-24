#!/bin/bash
# MyHealthAlly Test Runner Script (Linux/Mac)
# This script provides multiple ways to run tests

MODE=${1:-help}

echo "========================================"
echo "MyHealthAlly Test Runner"
echo "========================================"
echo ""

show_help() {
    echo "Usage: ./run-tests.sh [mode]"
    echo ""
    echo "Modes:"
    echo "  all     - Run all unit tests via Gradle"
    echo "  unit    - Run unit tests only"
    echo "  compile - Compile test classes only (no execution)"
    echo "  gradle  - Use Gradle wrapper directly"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh all"
    echo "  ./run-tests.sh unit"
    echo "  ./run-tests.sh compile"
}

run_unit_tests() {
    echo "Running unit tests..."
    echo ""
    ./gradlew :app:testDebugUnitTest --continue
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Tests completed successfully!"
    else
        echo ""
        echo "✗ Some tests failed. Check output above."
        exit 1
    fi
}

compile_test_classes() {
    echo "Compiling test classes..."
    echo ""
    ./gradlew :app:compileDebugUnitTestKotlin --continue
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Test classes compiled successfully!"
    else
        echo ""
        echo "✗ Compilation failed. Check output above."
        exit 1
    fi
}

run_all_tests() {
    echo "Running all tests..."
    echo ""
    ./gradlew :app:test --continue
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ All tests completed successfully!"
    else
        echo ""
        echo "✗ Some tests failed. Check output above."
        exit 1
    fi
}

show_gradle_tasks() {
    echo "Available Gradle test tasks:"
    echo ""
    ./gradlew :app:tasks --all | grep -i test | head -20
}

case "$MODE" in
    all)
        run_all_tests
        ;;
    unit)
        run_unit_tests
        ;;
    compile)
        compile_test_classes
        ;;
    gradle)
        show_gradle_tasks
        ;;
    help|*)
        show_help
        ;;
esac

