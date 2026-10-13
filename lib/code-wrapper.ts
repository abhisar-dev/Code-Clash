import { Language, Problem } from './problems';

function toCppLiteral(val: unknown, rawType: string): string {
  const t = rawType.replace(/&/g, '').trim();
  if (val === null || val === undefined) return '0';
  if (t === 'int' || t === 'uint32_t') return String(val);
  if (t === 'double') return String(val);
  if (t === 'bool') return val ? 'true' : 'false';
  if (t === 'char') {
    const c = String(val)[0] || ' ';
    return c === "'" ? "'\\''" : c === '\\' ? "'\\\\'" : `'${c}'`;
  }
  if (t === 'string') return `string(${JSON.stringify(val)})`;

  if (Array.isArray(val)) {
    if (t === 'vector<int>') {
      return `vector<int>{${val.map((x) => String(x)).join(', ')}}`;
    }
    if (t === 'vector<double>') {
      return `vector<double>{${val.map((x) => String(x)).join(', ')}}`;
    }
    if (t === 'vector<char>') {
      return `vector<char>{${val.map((c) => `'${String(c)[0]}'`).join(', ')}}`;
    }
    if (t === 'vector<string>') {
      return `vector<string>{${val.map((s) => `string(${JSON.stringify(s)})`).join(', ')}}`;
    }
    if (t === 'vector<vector<int>>') {
      return `vector<vector<int>>{${val.map((row: unknown[]) => `{${row.map(String).join(', ')}}`).join(', ')}}`;
    }
    if (t === 'vector<vector<char>>') {
      return `vector<vector<char>>{${val.map((row: unknown[]) => `{${row.map((c) => `'${String(c)[0]}'`).join(', ')}}`).join(', ')}}`;
    }
    if (t === 'vector<vector<string>>') {
      return `vector<vector<string>>{${val.map((row: unknown[]) => `{${row.map((s) => `string(${JSON.stringify(s)})`).join(', ')}}`).join(', ')}}`;
    }
  }

  return JSON.stringify(val);
}

function toJavaLiteral(val: unknown, rawType: string): string {
  const t = rawType.trim();
  if (val === null || val === undefined) return 'null';
  if (t === 'int' || t === 'Integer') return String(val);
  if (t === 'double') return String(val);
  if (t === 'boolean') return val ? 'true' : 'false';
  if (t === 'char') {
    const c = String(val)[0] || ' ';
    return c === "'" ? "'\\''" : c === '\\' ? "'\\\\'" : `'${c}'`;
  }
  if (t === 'String') return JSON.stringify(val);

  if (Array.isArray(val)) {
    if (t === 'int[]') return `new int[]{${val.map(String).join(', ')}}`;
    if (t === 'double[]') return `new double[]{${val.map(String).join(', ')}}`;
    if (t === 'char[]') return `new char[]{${val.map((c) => `'${String(c)[0]}'`).join(', ')}}`;
    if (t === 'String[]') return `new String[]{${val.map((s) => JSON.stringify(s)).join(', ')}}`;
    if (t === 'int[][]') return `new int[][]{${val.map((row: unknown[]) => `{${row.map(String).join(', ')}}`).join(', ')}}`;
    if (t === 'char[][]') return `new char[][]{${val.map((row: unknown[]) => `{${row.map((c) => `'${String(c)[0]}'`).join(', ')}}`).join(', ')}}`;
    if (t === 'List<Integer>') return `Arrays.asList(${val.map(String).join(', ')})`;
    if (t === 'List<String>') return `Arrays.asList(${val.map((s) => JSON.stringify(s)).join(', ')})`;
    if (t === 'List<List<Integer>>') {
      return `Arrays.asList(${val.map((row: unknown[]) => `Arrays.asList(${row.map(String).join(', ')})`).join(', ')})`;
    }
  }

  return JSON.stringify(val);
}

function parseCppSignature(starter: string) {
  const m = starter.match(/public:\s*([\w<>: &*]+?)\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)/);
  if (!m) return null;
  const retType = m[1].trim();
  const fnName = m[2].trim();
  const paramsRaw = m[3].trim();
  const params = paramsRaw
    ? paramsRaw.split(',').map((p) => {
        const parts = p.trim().split(/\s+/);
        const name = parts[parts.length - 1].replace(/^[*&]+/, '');
        const type = parts.slice(0, -1).join(' ').trim();
        return { type, name };
      })
    : [];
  return { retType, fnName, params };
}

function parseJavaSignature(starter: string) {
  const m = starter.match(/public\s+([\w<>\[\] ]+?)\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)/);
  if (!m) return null;
  const retType = m[1].trim();
  const fnName = m[2].trim();
  const paramsRaw = m[3].trim();
  const params = paramsRaw
    ? paramsRaw.split(',').map((p) => {
        const parts = p.trim().split(/\s+/);
        const name = parts[parts.length - 1];
        const type = parts.slice(0, -1).join(' ').trim();
        return { type, name };
      })
    : [];
  return { retType, fnName, params };
}

export function wrapCodeWithTestRunner(
  language: Language,
  userCode: string,
  problem: Problem
): { code: string; runFileName?: string } {
  const testCasesJson = JSON.stringify(
    problem.testCases.map((tc) => ({
      id: tc.id,
      input: JSON.parse(tc.input),
      expected: JSON.parse(tc.expectedOutput),
      isHidden: tc.isHidden,
    }))
  );

  switch (language) {
    case 'javascript': {
      const wrapper = `
${userCode}

(function runTestCases() {
  const testCases = ${testCasesJson};
  const results = [];

  const expectedFn = ${JSON.stringify(problem.functionName || '')};
  let targetFn = null;
  if (expectedFn && typeof eval('typeof ' + expectedFn) !== 'undefined' && typeof eval(expectedFn) === 'function') {
    targetFn = eval(expectedFn);
  } else {
    const fnMatch = ${JSON.stringify(userCode)}.match(/function\s+([a-zA-Z0-9_$]+)/);
    if (fnMatch && fnMatch[1] && typeof eval('typeof ' + fnMatch[1]) !== 'undefined' && typeof eval(fnMatch[1]) === 'function') {
      targetFn = eval(fnMatch[1]);
    }
  }

  for (const tc of testCases) {
    const startTime = process.hrtime();
    let actualOutput = null;
    let error = null;
    let passed = false;

    try {
      if (!targetFn) {
        throw new Error('Solution function not found in code');
      }

      actualOutput = targetFn(...tc.input);

      // Deep compare
      const sActual = JSON.stringify(actualOutput);
      const sExpected = JSON.stringify(tc.expected);
      passed = sActual === sExpected;
    } catch (err) {
      error = err.message || String(err);
    }

    const diff = process.hrtime(startTime);
    const runtimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    results.push({
      id: tc.id,
      passed,
      actualOutput: actualOutput !== null ? JSON.stringify(actualOutput) : null,
      expectedOutput: JSON.stringify(tc.expected),
      runtimeMs: Number(runtimeMs),
      error,
      isHidden: tc.isHidden
    });
  }

  console.log('__CODECLASH_OUTPUT_START__');
  console.log(JSON.stringify(results));
  console.log('__CODECLASH_OUTPUT_END__');
})();
`;
      return { code: wrapper };
    }

    case 'python': {
      const wrapper = `
import json
import time
import sys

${userCode}

test_cases = json.loads('''${testCasesJson}''')
results = []
sol = Solution()

expected_fn = '''${problem.functionName || ''}'''
target_method = None
if expected_fn and hasattr(sol, expected_fn):
    target_method = getattr(sol, expected_fn)
else:
    methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
    if methods:
        target_method = getattr(sol, methods[0])

for tc in test_cases:
    start_time = time.perf_counter()
    actual_output = None
    error = None
    passed = False

    try:
        if not target_method:
            raise Exception("Solution method not found on class Solution")

        actual_output = target_method(*tc['input'])
        s_actual = json.dumps(actual_output)
        s_expected = json.dumps(tc['expected'])
        passed = s_actual == s_expected
    except Exception as e:
        error = str(e)

    runtime_ms = round((time.perf_counter() - start_time) * 1000, 2)

    results.append({
        "id": tc['id'],
        "passed": passed,
        "actualOutput": json.dumps(actual_output) if actual_output is not None else None,
        "expectedOutput": json.dumps(tc['expected']),
        "runtimeMs": runtime_ms,
        "error": error,
        "isHidden": tc['isHidden']
    })

print("__CODECLASH_OUTPUT_START__")
print(json.dumps(results))
print("__CODECLASH_OUTPUT_END__")
`;
      return { code: wrapper };
    }

    case 'cpp': {
      const sig = parseCppSignature(problem.starterCode.cpp);
      const fnName = sig?.fnName || problem.functionName || 'solution';
      const params = sig?.params || [];

      const tcBlocks = problem.testCases
        .map((tc, tcIdx) => {
          const args = JSON.parse(tc.input);
          const argDecls = args
            .map((arg: unknown, aIdx: number) => {
              const pType = params[aIdx]?.type || 'auto';
              const cleanType = pType.replace(/&/g, '').trim();
              const lit = toCppLiteral(arg, cleanType);
              return `        ${cleanType} arg_${tcIdx}_${aIdx} = ${lit};`;
            })
            .join('\n');

          const callArgs = args.map((_: unknown, aIdx: number) => `arg_${tcIdx}_${aIdx}`).join(', ');
          const expectedJson = JSON.stringify(JSON.parse(tc.expectedOutput));

          return `
    // Test Case ${tc.id}
    {
${argDecls}
        string expectedStr = ${JSON.stringify(expectedJson)};
        auto t0 = chrono::high_resolution_clock::now();
        string actStr = "null";
        string errStr = "null";
        bool passed = false;
        try {
            auto res = sol.${fnName}(${callArgs});
            actStr = toJson(res);
            passed = (actStr == expectedStr);
        } catch (const exception& e) {
            errStr = string("\\"") + e.what() + "\\"";
        } catch (...) {
            errStr = "\\"Runtime Exception\\"";
        }
        auto t1 = chrono::high_resolution_clock::now();
        double ms = chrono::duration<double, milli>(t1 - t0).count();
        if (${tcIdx} > 0) cout << ",";
        cout << "{\\"id\\":" << ${tc.id} << ",\\"passed\\":" << (passed ? "true" : "false")
             << ",\\"actualOutput\\":" << actStr << ",\\"expectedOutput\\":" << expectedStr
             << ",\\"runtimeMs\\":" << fixed << setprecision(2) << ms << ",\\"error\\":" << errStr
             << ",\\"isHidden\\":" << (${tc.isHidden ? 'true' : 'false'}) << "}";
    }`;
        })
        .join('\n');

      const wrapper = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <deque>
#include <cmath>
#include <climits>
#include <numeric>
#include <sstream>
#include <chrono>
#include <iomanip>

using namespace std;

// Serialization Helpers
inline string toJson(int val) { return to_string(val); }
inline string toJson(long long val) { return to_string(val); }
inline string toJson(uint32_t val) { return to_string(val); }
inline string toJson(double val) { 
    if (val == (long long)val && !isnan(val) && !isinf(val)) return to_string((long long)val);
    ostringstream oss; oss << val; return oss.str(); 
}
inline string toJson(bool val) { return val ? "true" : "false"; }
inline string toJson(char val) { 
    string s = "\\""; 
    if (val == '"' || val == '\\\\') s += '\\\\';
    s += val; 
    s += "\\""; 
    return s; 
}
inline string toJson(const string& val) {
    string res = "\\"";
    for (char c : val) {
        if (c == '"') res += "\\\\\\"";
        else if (c == '\\\\') res += "\\\\\\\\";
        else if (c == '\\n') res += "\\\\n";
        else if (c == '\\r') res += "\\\\r";
        else if (c == '\\t') res += "\\\\t";
        else res += c;
    }
    res += "\\"";
    return res;
}

template<typename T>
string toJson(const vector<T>& vec) {
    string res = "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) res += ",";
        res += toJson(vec[i]);
    }
    res += "]";
    return res;
}

// User Solution
${userCode}

int main() {
    Solution sol;
    cout << "__CODECLASH_OUTPUT_START__\\n[";
${tcBlocks}
    cout << "]\\n__CODECLASH_OUTPUT_END__\\n";
    return 0;
}
`;
      return { code: wrapper };
    }

    case 'java': {
      const sig = parseJavaSignature(problem.starterCode.java);
      const fnName = sig?.fnName || problem.functionName || 'solution';
      const params = sig?.params || [];
      const normalizedUserCode = userCode.replace(/public\s+class\s+Solution/g, 'class Solution');

      const tcBlocks = problem.testCases
        .map((tc, tcIdx) => {
          const args = JSON.parse(tc.input);
          const argDecls = args
            .map((arg: unknown, aIdx: number) => {
              const pType = params[aIdx]?.type || 'Object';
              const lit = toJavaLiteral(arg, pType);
              return `            ${pType} arg_${tcIdx}_${aIdx} = ${lit};`;
            })
            .join('\n');

          const callArgs = args.map((_: unknown, aIdx: number) => `arg_${tcIdx}_${aIdx}`).join(', ');
          const expectedJson = JSON.stringify(JSON.parse(tc.expectedOutput));

          return `
        // Test Case ${tc.id}
        {
${argDecls}
            String expected = ${JSON.stringify(expectedJson)};
            long t0 = System.nanoTime();
            String actStr = "null";
            String errStr = "null";
            boolean passed = false;
            try {
                var res = sol.${fnName}(${callArgs});
                actStr = toJson(res);
                passed = actStr.equals(expected);
            } catch (Throwable t) {
                errStr = cleanError(t);
            }
            long t1 = System.nanoTime();
            double ms = (t1 - t0) / 1e6;
            if (${tcIdx} > 0) System.out.print(",");
            System.out.print("{\\"id\\":" + ${tc.id} + ",\\"passed\\":" + (passed ? "true" : "false")
                + ",\\"actualOutput\\":" + actStr + ",\\"expectedOutput\\":" + expected
                + ",\\"runtimeMs\\":" + String.format(Locale.US, "%.2f", ms) + ",\\"error\\":" + errStr
                + ",\\"isHidden\\":" + (${tc.isHidden ? 'true' : 'false'}) + "}");
        }`;
        })
        .join('\n');

      const wrapper = `
import java.util.*;
import java.io.*;

${normalizedUserCode}

public class SolutionRunner {
    static String cleanError(Throwable t) {
        if (t == null) return "null";
        String msg = t.getMessage();
        if (msg == null) msg = t.getClass().getSimpleName();
        return "\\"" + msg.replace("\\\\", "\\\\\\\\").replace("\\"", "'").replace("\\n", " ").replace("\\r", " ") + "\\"";
    }
    static String toJson(int val) { return String.valueOf(val); }
    static String toJson(long val) { return String.valueOf(val); }
    static String toJson(double val) { 
        if (val == (long)val) return String.valueOf((long)val);
        return String.valueOf(val); 
    }
    static String toJson(boolean val) { return val ? "true" : "false"; }
    static String toJson(char val) { return "\\"" + (val == '"' || val == '\\\\' ? "\\\\" : "") + val + "\\""; }
    static String toJson(String val) { 
        if (val == null) return "null";
        return "\\"" + val.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n").replace("\\r", "\\\\r").replace("\\t", "\\\\t") + "\\""; 
    }
    static String toJson(int[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i]);
        }
        return sb.append("]").toString();
    }
    static String toJson(double[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(arr[i]));
        }
        return sb.append("]").toString();
    }
    static String toJson(char[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(arr[i]));
        }
        return sb.append("]").toString();
    }
    static String toJson(int[][] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(arr[i]));
        }
        return sb.append("]").toString();
    }
    static String toJson(char[][] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(arr[i]));
        }
        return sb.append("]").toString();
    }
    static String toJson(List<?> list) {
        if (list == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            Object item = list.get(i);
            if (item instanceof List) {
                sb.append(toJson((List<?>)item));
            } else if (item instanceof String) {
                sb.append(toJson((String)item));
            } else if (item instanceof Boolean) {
                sb.append(toJson((Boolean)item));
            } else if (item instanceof Character) {
                sb.append(toJson((Character)item));
            } else if (item instanceof Double || item instanceof Float) {
                sb.append(toJson(((Number)item).doubleValue()));
            } else if (item instanceof Number) {
                sb.append(item.toString());
            } else {
                sb.append(String.valueOf(item));
            }
        }
        return sb.append("]").toString();
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println("__CODECLASH_OUTPUT_START__");
        System.out.print("[");
${tcBlocks}
        System.out.println("]");
        System.out.println("__CODECLASH_OUTPUT_END__");
    }
}
`;
      return { code: wrapper };
    }

    default:
      return { code: userCode };
  }
}
