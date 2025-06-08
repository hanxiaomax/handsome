/**
 * 64-bit Bitwise Operations Test Suite
 *
 * This file contains comprehensive tests for the bitwise operations.
 * Can be run manually in the browser console or integrated with test frameworks.
 */

import type { BitWidth } from "../types";
import {
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
  setBit,
  clearBit,
  toggleBit,
  testBit,
  toBitString,
  toBitArray,
} from "../lib/bitwise";

// Manual test runner for browser console
export function runManualTests() {
  console.log("🧪 Starting 64-bit Bitwise Operations Tests...");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  function assertEqual(actual: unknown, expected: unknown, message: string) {
    const isEqual = actual === expected;
    if (isEqual) {
      console.log(`✅ PASS: ${message} (got ${actual})`);
      passed++;
    } else {
      console.error(
        `❌ FAIL: ${message} - Expected: ${expected}, Got: ${actual}`
      );
      failed++;
    }
  }

  // Test Basic Bitwise Operations
  console.log("\n--- Basic Bitwise Operations ---");

  // 8-bit tests (170 = 10101010, 85 = 01010101)
  assertEqual(bitwiseAnd(170, 85, 8), 0, "8-bit AND operation");
  assertEqual(bitwiseOr(170, 85, 8), 255, "8-bit OR operation");
  assertEqual(bitwiseXor(170, 85, 8), 255, "8-bit XOR operation");

  // 16-bit tests
  assertEqual(bitwiseAnd(43690, 21845, 16), 0, "16-bit AND operation");
  assertEqual(bitwiseOr(43690, 21845, 16), 65535, "16-bit OR operation");
  assertEqual(bitwiseXor(43690, 21845, 16), 65535, "16-bit XOR operation");

  // 32-bit tests
  assertEqual(
    bitwiseAnd(2863311530, 1431655765, 32),
    0,
    "32-bit AND operation"
  );
  assertEqual(
    bitwiseOr(2863311530, 1431655765, 32),
    4294967295,
    "32-bit OR operation"
  );
  assertEqual(
    bitwiseXor(2863311530, 1431655765, 32),
    4294967295,
    "32-bit XOR operation"
  );

  // 64-bit tests with safe numbers
  const large1 = Math.pow(2, 50); // 2^50
  const large2 = Math.pow(2, 51); // 2^51
  const orResult64 = bitwiseOr(large1, large2, 64);
  const andResult64 = bitwiseAnd(large1, large2, 64);
  const xorResult64 = bitwiseXor(large1, large2, 64);

  assert(orResult64 > large2, "64-bit OR with large numbers");
  assertEqual(andResult64, 0, "64-bit AND with non-overlapping bits");
  assertEqual(xorResult64, orResult64, "64-bit XOR equals OR when no overlap");

  // Test Bitwise NOT
  console.log("\n--- Bitwise NOT Operations ---");
  assertEqual(bitwiseNot(170, 8), 85, "8-bit NOT operation");
  assertEqual(bitwiseNot(43690, 16), 21845, "16-bit NOT operation");
  assertEqual(bitwiseNot(2863311530, 32), 1431655765, "32-bit NOT operation");

  const not64Result = bitwiseNot(0, 64);
  assert(not64Result > 0, "64-bit NOT of 0 should be positive");

  // Test Shift Operations
  console.log("\n--- Shift Operations ---");
  assertEqual(leftShift(1, 3, 8), 8, "8-bit left shift");
  assertEqual(leftShift(1, 7, 8), 128, "8-bit left shift to MSB");
  assertEqual(leftShift(1, 15, 16), 32768, "16-bit left shift to MSB");
  assertEqual(leftShift(1, 31, 32), 2147483648, "32-bit left shift to MSB");

  const shift63Result = leftShift(1, 63, 64);
  assert(shift63Result > Math.pow(2, 62), "64-bit left shift to bit 63");

  assertEqual(rightShift(128, 3, 8), 16, "8-bit right shift");
  assertEqual(rightShift(32768, 7, 16), 256, "16-bit right shift");
  assertEqual(rightShift(2147483648, 15, 32), 65536, "32-bit right shift");

  // Test Individual Bit Operations
  console.log("\n--- Individual Bit Operations ---");

  // Set bit tests
  assertEqual(setBit(0, 0, 8), 1, "Set bit 0 in 8-bit");
  assertEqual(setBit(0, 7, 8), 128, "Set bit 7 in 8-bit");
  assertEqual(setBit(0, 15, 16), 32768, "Set bit 15 in 16-bit");
  assertEqual(setBit(0, 31, 32), 2147483648, "Set bit 31 in 32-bit");

  const setBit63Result = setBit(0, 63, 64);
  assert(setBit63Result > Math.pow(2, 62), "Set bit 63 in 64-bit");

  // Out of range tests
  assertEqual(setBit(0, 8, 8), 0, "Set out-of-range bit should be ignored");
  assertEqual(
    setBit(0, 64, 64),
    0,
    "Set out-of-range bit 64 should be ignored"
  );

  // Clear bit tests
  assertEqual(clearBit(255, 0, 8), 254, "Clear bit 0 in 8-bit");
  assertEqual(clearBit(255, 7, 8), 127, "Clear bit 7 in 8-bit");
  assertEqual(clearBit(65535, 0, 16), 65534, "Clear bit 0 in 16-bit");
  assertEqual(clearBit(4294967295, 0, 32), 4294967294, "Clear bit 0 in 32-bit");

  // Toggle bit tests
  let toggleValue = 0;
  toggleValue = toggleBit(toggleValue, 0, 8);
  assertEqual(toggleValue, 1, "Toggle bit 0 on");
  toggleValue = toggleBit(toggleValue, 0, 8);
  assertEqual(toggleValue, 0, "Toggle bit 0 off");

  // Multiple toggle test
  toggleValue = 0;
  toggleValue = toggleBit(toggleValue, 1, 8); // Set bit 1
  toggleValue = toggleBit(toggleValue, 3, 8); // Set bit 3
  toggleValue = toggleBit(toggleValue, 5, 8); // Set bit 5
  assertEqual(toggleValue, 42, "Multiple toggle bits (00101010 = 42)");

  // Test bit tests
  assert(testBit(170, 1), "Test bit 1 of 170 should be true"); // 10101010
  assert(!testBit(170, 0), "Test bit 0 of 170 should be false");
  assert(testBit(170, 3), "Test bit 3 of 170 should be true");
  assert(!testBit(170, 2), "Test bit 2 of 170 should be false");
  assert(testBit(170, 5), "Test bit 5 of 170 should be true");
  assert(!testBit(170, 4), "Test bit 4 of 170 should be false");
  assert(testBit(170, 7), "Test bit 7 of 170 should be true");
  assert(!testBit(170, 6), "Test bit 6 of 170 should be false");

  // Test Utility Functions
  console.log("\n--- Utility Functions ---");
  assertEqual(toBitString(170, 8), "10101010", "toBitString for 8-bit");
  assertEqual(
    toBitString(43690, 16),
    "1010101010101010",
    "toBitString for 16-bit"
  );
  assertEqual(toBitString(0, 8), "00000000", "toBitString for zero");
  assertEqual(toBitString(255, 8), "11111111", "toBitString for max 8-bit");

  const bitString64 = toBitString(1, 64);
  assertEqual(bitString64.length, 64, "toBitString 64-bit length");
  assert(bitString64.endsWith("1"), "toBitString 64-bit should end with 1");
  assert(
    bitString64.startsWith("000"),
    "toBitString 64-bit should start with zeros"
  );

  const bitArray8 = toBitArray(170, 8); // 10101010
  assertEqual(bitArray8.length, 8, "toBitArray length for 8-bit");
  assert(!bitArray8[0], "toBitArray bit 0 should be false"); // LSB
  assert(bitArray8[1], "toBitArray bit 1 should be true");
  assert(!bitArray8[2], "toBitArray bit 2 should be false");
  assert(bitArray8[3], "toBitArray bit 3 should be true");

  const bitArray64 = toBitArray(1, 64);
  assertEqual(bitArray64.length, 64, "toBitArray length for 64-bit");
  assert(bitArray64[0], "toBitArray bit 0 should be true for value 1");
  assert(!bitArray64[1], "toBitArray bit 1 should be false for value 1");

  // Test 64-bit Specific Cases
  console.log("\n--- 64-bit Specific Tests ---");

  // Test high bit positions (test subset to avoid console spam)
  const testPositions = [32, 33, 34, 40, 50, 60, 63];
  for (const bitPos of testPositions) {
    const result = setBit(0, bitPos, 64);
    assert(result > 0, `Set bit ${bitPos} should produce positive result`);
    assert(
      testBit(result, bitPos),
      `Test bit ${bitPos} should be true after setting`
    );

    const cleared = clearBit(result, bitPos, 64);
    assertEqual(cleared, 0, `Clear bit ${bitPos} should return to 0`);
  }

  // Test combination of high and low bits
  let combinedValue = 0;
  combinedValue = setBit(combinedValue, 0, 64); // Low bit
  combinedValue = setBit(combinedValue, 1, 64); // Low bit
  combinedValue = setBit(combinedValue, 32, 64); // High bit
  combinedValue = setBit(combinedValue, 33, 64); // High bit

  assert(testBit(combinedValue, 0), "Combined: bit 0 should be set");
  assert(testBit(combinedValue, 1), "Combined: bit 1 should be set");
  assert(testBit(combinedValue, 32), "Combined: bit 32 should be set");
  assert(testBit(combinedValue, 33), "Combined: bit 33 should be set");
  assert(!testBit(combinedValue, 2), "Combined: bit 2 should not be set");
  assert(!testBit(combinedValue, 31), "Combined: bit 31 should not be set");
  assert(!testBit(combinedValue, 34), "Combined: bit 34 should not be set");

  // Test independence of bit operations
  console.log("\n--- Bit Independence Tests ---");
  let independenceValue = 0;

  // Set alternating bits
  for (let i = 0; i < 64; i += 2) {
    independenceValue = setBit(independenceValue, i, 64);
  }

  // Check that only even bits are set
  for (let i = 0; i < 64; i++) {
    if (i % 2 === 0) {
      assert(testBit(independenceValue, i), `Even bit ${i} should be set`);
    } else {
      assert(!testBit(independenceValue, i), `Odd bit ${i} should not be set`);
    }
  }

  // Test Edge Cases
  console.log("\n--- Edge Cases ---");
  assertEqual(bitwiseAnd(0, 0, 64), 0, "AND with zeros");
  assertEqual(bitwiseOr(0, 0, 64), 0, "OR with zeros");
  assertEqual(bitwiseXor(0, 0, 64), 0, "XOR with zeros");
  assert(!testBit(0, 32), "Test bit on zero should be false");
  assert(!testBit(0, 63), "Test bit 63 on zero should be false");

  // Test with maximum safe integers
  const maxSafe = Number.MAX_SAFE_INTEGER;
  const nearMax = maxSafe - 1;
  const setBitResult = setBit(nearMax, 0, 64);
  assertEqual(
    setBitResult,
    maxSafe,
    "Set bit 0 on near-max should equal max safe integer"
  );

  // Test negative number handling
  const negativeResult = bitwiseNot(-1, 8);
  assert(negativeResult >= 0, "NOT of negative number should be positive");

  // Summary
  console.log("\n=== Test Summary ===");
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(
    `📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
  );

  if (failed === 0) {
    console.log(
      "🎉 All tests passed! 64-bit bitwise operations are working correctly."
    );
    console.log(
      "   The BitVisualization component should now work properly in 64-bit mode."
    );
  } else {
    console.log("⚠️  Some tests failed. Check the implementation.");
  }

  return { passed, failed, successRate: (passed / (passed + failed)) * 100 };
}

// Export individual test functions for specific testing
export function testBasicOperations(): boolean {
  console.log("Testing basic bitwise operations...");

  // Test AND, OR, XOR for different bit widths
  const tests = [
    {
      a: 170,
      b: 85,
      width: 8 as BitWidth,
      expectedAnd: 0,
      expectedOr: 255,
      expectedXor: 255,
    },
    {
      a: 43690,
      b: 21845,
      width: 16 as BitWidth,
      expectedAnd: 0,
      expectedOr: 65535,
      expectedXor: 65535,
    },
  ];

  for (const test of tests) {
    const andResult = bitwiseAnd(test.a, test.b, test.width);
    const orResult = bitwiseOr(test.a, test.b, test.width);
    const xorResult = bitwiseXor(test.a, test.b, test.width);

    if (
      andResult !== test.expectedAnd ||
      orResult !== test.expectedOr ||
      xorResult !== test.expectedXor
    ) {
      console.error(`Test failed for ${test.width}-bit operations`);
      return false;
    }
  }

  console.log("✅ Basic operations test passed");
  return true;
}

export function test64BitSpecific(): boolean {
  console.log("Testing 64-bit specific operations...");

  // Test setting and clearing high bits
  for (const bitPos of [32, 40, 50, 63]) {
    const setValue = setBit(0, bitPos, 64);
    if (setValue <= 0) {
      console.error(`Failed to set bit ${bitPos}`);
      return false;
    }

    if (!testBit(setValue, bitPos)) {
      console.error(`Bit ${bitPos} not detected as set`);
      return false;
    }

    const clearValue = clearBit(setValue, bitPos, 64);
    if (clearValue !== 0) {
      console.error(`Failed to clear bit ${bitPos}`);
      return false;
    }
  }

  console.log("✅ 64-bit specific test passed");
  return true;
}

// Export for console testing
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).runBitwiseTests =
    runManualTests;
  (window as unknown as Record<string, unknown>).testBasicBitwise =
    testBasicOperations;
  (window as unknown as Record<string, unknown>).test64BitBitwise =
    test64BitSpecific;
  console.log("💡 Available test functions:");
  console.log("   runBitwiseTests() - Run all tests");
  console.log("   testBasicBitwise() - Test basic operations");
  console.log("   test64BitBitwise() - Test 64-bit specific operations");
}
