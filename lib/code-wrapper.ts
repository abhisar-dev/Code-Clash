import { Language, Problem } from './problems';

function toCppLiteral(val: unknown, rawType: string): string {
  const t = rawType.replace(/const\s+/g, '').replace(/&/g, '').trim();
  if (val === null || val === undefined) return '0';
  if (t === 'int' || t === 'uint32_t' || t === 'long' || t === 'long long') return String(val);
  if (t === 'double' || t === 'float') return String(val);
  if (t === 'bool') return val ? 'true' : 'false';
  if (t === 'char') {
    const c = String(val)[0] || ' ';
    return c === "'" ? "'\\''" : c === '\\' ? "'\\\\'" : `'${c}'`;
  }
  if (t === 'string') return `string(${JSON.stringify(String(val))})`;

  if (Array.isArray(val)) {
    if (t === 'ListNode*') {
      return `buildList(vector<int>{${val.map((x) => String(x)).join(', ')}})`;
    }
    if (t === 'TreeNode*') {
      const serialized = val.map((x) => (x === null ? 'INT_MIN' : String(x))).join(', ');
      return `buildTree(vector<int>{${serialized}})`;
    }
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
      return `vector<string>{${val.map((s) => `string(${JSON.stringify(String(s))})`).join(', ')}}`;
    }
    if (t === 'vector<vector<int>>') {
      return `vector<vector<int>>{${val
        .map((row: unknown) =>
          Array.isArray(row) ? `vector<int>{${row.map(String).join(', ')}}` : 'vector<int>{}'
        )
        .join(', ')}}`;
    }
    if (t === 'vector<vector<char>>') {
      return `vector<vector<char>>{${val
        .map((row: unknown) =>
          Array.isArray(row)
            ? `vector<char>{${row.map((c) => `'${String(c)[0]}'`).join(', ')}}`
            : 'vector<char>{}'
        )
        .join(', ')}}`;
    }
    if (t === 'vector<vector<string>>') {
      return `vector<vector<string>>{${val
        .map((row: unknown) =>
          Array.isArray(row)
            ? `vector<string>{${row.map((s) => `string(${JSON.stringify(String(s))})`).join(', ')}}`
            : 'vector<string>{}'
        )
        .join(', ')}}`;
    }
  }

  return JSON.stringify(val);
}

function toJavaLiteral(val: unknown, rawType: string): string {
  const t = rawType.trim();
  if (val === null || val === undefined) return 'null';
  if (t === 'int' || t === 'Integer') return String(val);
  if (t === 'long' || t === 'Long') return `${String(val)}L`;
  if (t === 'double' || t === 'Double') return String(val);
  if (t === 'boolean' || t === 'Boolean') return val ? 'true' : 'false';
  if (t === 'char' || t === 'Character') {
    const c = String(val)[0] || ' ';
    return c === "'" ? "'\\''" : c === '\\' ? "'\\\\'" : `'${c}'`;
  }
  if (t === 'String') return JSON.stringify(String(val));

  if (Array.isArray(val)) {
    if (t === 'ListNode') {
      return `buildList(new int[]{${val.map(String).join(', ')}})`;
    }
    if (t === 'TreeNode') {
      return `buildTree(new Integer[]{${val.map((x) => (x === null ? 'null' : String(x))).join(', ')}})`;
    }
    if (t === 'int[]') return `new int[]{${val.map(String).join(', ')}}`;
    if (t === 'double[]') return `new double[]{${val.map(String).join(', ')}}`;
    if (t === 'char[]') return `new char[]{${val.map((c) => `'${String(c)[0]}'`).join(', ')}}`;
    if (t === 'String[]') return `new String[]{${val.map((s) => JSON.stringify(String(s))).join(', ')}}`;
    if (t === 'int[][]') {
      return `new int[][]{${val
        .map((row: unknown) => (Array.isArray(row) ? `{${row.map(String).join(', ')}}` : '{}'))
        .join(', ')}}`;
    }
    if (t === 'char[][]') {
      return `new char[][]{${val
        .map((row: unknown) =>
          Array.isArray(row) ? `{${row.map((c) => `'${String(c)[0]}'`).join(', ')}}` : '{}'
        )
        .join(', ')}}`;
    }
    if (t === 'List<Integer>') {
      return `new ArrayList<>(Arrays.asList(${val.map(String).join(', ')}))`;
    }
    if (t === 'List<String>') {
      return `new ArrayList<>(Arrays.asList(${val.map((s) => JSON.stringify(String(s))).join(', ')}))`;
    }
    if (t === 'List<List<Integer>>') {
      return `new ArrayList<>(Arrays.asList(${val
        .map((row: unknown) =>
          Array.isArray(row)
            ? `new ArrayList<>(Arrays.asList(${row.map(String).join(', ')}))`
            : 'new ArrayList<>()'
        )
        .join(', ')}))`;
    }
  }

  return JSON.stringify(val);
}

function parseCppSignature(codeStr: string) {
  // Match method inside class Solution
  const classBodyMatch = codeStr.match(/class\s+Solution\s*\{([\s\S]*)\}/);
  const searchArea = classBodyMatch ? classBodyMatch[1] : codeStr;
  const regex = /(?:public:\s*)?([\w<>: &*]+?)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
  let match: RegExpExecArray | null = null;
  let lastValid: RegExpExecArray | null = null;
  while ((match = regex.exec(searchArea)) !== null) {
    const fn = match[2].trim();
    if (fn !== 'if' && fn !== 'for' && fn !== 'while' && fn !== 'switch' && fn !== 'Solution') {
      lastValid = match;
    }
  }
  if (!lastValid) return null;
  const retType = lastValid[1].replace(/^public:\s*/, '').trim();
  const fnName = lastValid[2].trim();
  const paramsRaw = lastValid[3].trim();
  const params = paramsRaw
    ? paramsRaw.split(',').map((p) => {
        const cleaned = p.trim();
        const lastSpace = cleaned.lastIndexOf(' ');
        const lastAmp = cleaned.lastIndexOf('&');
        const lastStar = cleaned.lastIndexOf('*');
        const splitIdx = Math.max(lastSpace, lastAmp, lastStar);
        const name = cleaned.slice(splitIdx + 1).trim();
        const type = cleaned.slice(0, splitIdx + 1).trim();
        return { type, name };
      })
    : [];
  return { retType, fnName, params };
}

function parseJavaSignature(codeStr: string) {
  const regex = /(?:public|private|protected)?\s*(?:static\s+)?([\w<>\[\] ?]+?)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
  let match: RegExpExecArray | null = null;
  let lastValid: RegExpExecArray | null = null;
  while ((match = regex.exec(codeStr)) !== null) {
    const fn = match[2].trim();
    if (
      fn !== 'if' &&
      fn !== 'for' &&
      fn !== 'while' &&
      fn !== 'switch' &&
      fn !== 'Solution' &&
      fn !== 'class'
    ) {
      lastValid = match;
    }
  }
  if (!lastValid) return null;
  const retType = lastValid[1].trim();
  const fnName = lastValid[2].trim();
  const paramsRaw = lastValid[3].trim();
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
function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}
function TreeNode(val, left, right) {
  this.val = (val === undefined ? 0 : val);
  this.left = (left === undefined ? null : left);
  this.right = (right === undefined ? null : right);
}
function __toListNode(arr) {
  if (!Array.isArray(arr)) return arr;
  let dummy = new ListNode(0);
  let curr = dummy;
  for (let v of arr) { curr.next = new ListNode(v); curr = curr.next; }
  return dummy.next;
}
function __fromListNode(node) {
  if (!node || typeof node !== 'object' || !('val' in node)) return node;
  let res = [], safety = 0;
  while (node && safety++ < 10000) { res.push(node.val); node = node.next; }
  return res;
}
function __toTreeNode(arr) {
  if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
  let root = new TreeNode(arr[0]);
  let q = [root], i = 1;
  while (q.length > 0 && i < arr.length) {
    let curr = q.shift();
    if (i < arr.length && arr[i] !== null) { curr.left = new TreeNode(arr[i]); q.push(curr.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { curr.right = new TreeNode(arr[i]); q.push(curr.right); }
    i++;
  }
  return root;
}
function __fromTreeNode(root) {
  if (!root) return [];
  if (typeof root !== 'object' || !('val' in root)) return root;
  let res = [], q = [root];
  while (q.length > 0) {
    let node = q.shift();
    if (node) { res.push(node.val); q.push(node.left || null); q.push(node.right || null); }
    else { res.push(null); }
  }
  while (res.length > 0 && res[res.length - 1] === null) res.pop();
  return res;
}
function __deepEqual(a, b) {
  if (JSON.stringify(a) === JSON.stringify(b)) return true;
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-5;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    const sa = [...a].map((x) => (Array.isArray(x) ? [...x].sort() : x)).sort();
    const sb = [...b].map((x) => (Array.isArray(x) ? [...x].sort() : x)).sort();
    if (JSON.stringify(sa) === JSON.stringify(sb)) return true;
  }
  return false;
}

${userCode}

(function runTestCases() {
  const testCases = ${testCasesJson};
  const results = [];
  const expectedFn = ${JSON.stringify(problem.functionName || '')};
  const rawCode = ${JSON.stringify(userCode)};
  let targetFn = null;

  try {
    if (expectedFn && typeof eval(expectedFn) === 'function') {
      targetFn = eval(expectedFn);
    }
  } catch (e) {}

  if (!targetFn) {
    try {
      if (typeof Solution === 'function') {
        const inst = new Solution();
        if (expectedFn && typeof inst[expectedFn] === 'function') {
          targetFn = inst[expectedFn].bind(inst);
        } else {
          const m = Object.getOwnPropertyNames(Solution.prototype).find((k) => k !== 'constructor' && typeof inst[k] === 'function');
          if (m) targetFn = inst[m].bind(inst);
        }
      }
    } catch (e) {}
  }

  if (!targetFn) {
    const fnMatch = rawCode.match(/(?:function\\s+([a-zA-Z0-9_$]+)|(?:var|let|const)\\s+([a-zA-Z0-9_$]+)\\s*=)/);
    const candidate = fnMatch ? (fnMatch[1] || fnMatch[2]) : null;
    if (candidate) {
      try {
        if (typeof eval(candidate) === 'function') targetFn = eval(candidate);
      } catch (e) {}
    }
  }

  const usesListNode = /\\.next\\b|ListNode/.test(rawCode);
  const usesTreeNode = /\\.(?:left|right)\\b|TreeNode/.test(rawCode);

  for (const tc of testCases) {
    const startTime = process.hrtime();
    let actualOutput = null;
    let error = null;
    let passed = false;

    try {
      if (!targetFn) {
        throw new Error('Solution function not found in code');
      }

      const argsCopy = JSON.parse(JSON.stringify(tc.input));
      let callArgs = argsCopy;
      if (usesTreeNode) {
        callArgs = argsCopy.map((a, idx) => (idx === 0 && Array.isArray(a) ? __toTreeNode(a) : a));
      } else if (usesListNode) {
        callArgs = argsCopy.map((a) => (Array.isArray(a) ? __toListNode(a) : a));
      }

      let res = targetFn(...callArgs);
      if (res === undefined && argsCopy.length > 0) {
        res = argsCopy[0];
      }
      if (usesTreeNode && res && typeof res === 'object' && ('left' in res || 'right' in res || 'val' in res)) {
        res = __fromTreeNode(res);
      } else if (usesListNode && (res === null || (typeof res === 'object' && 'val' in res))) {
        res = res === null ? [] : __fromListNode(res);
      }

      actualOutput = res;
      passed = __deepEqual(actualOutput, tc.expected);
    } catch (err) {
      error = err && err.message ? err.message : String(err);
    }

    const diff = process.hrtime(startTime);
    const runtimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    results.push({
      id: tc.id,
      passed,
      actualOutput: actualOutput !== undefined ? JSON.stringify(actualOutput) : null,
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
import math
import collections
import heapq
import bisect
import functools
import itertools
import re
import copy
from typing import *
from collections import defaultdict, Counter, deque
from functools import lru_cache, cache

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def __to_list_node(arr):
    if not isinstance(arr, list):
        return arr
    dummy = ListNode(0)
    curr = dummy
    for v in arr:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next

def __from_list_node(node):
    if node is None:
        return []
    if not hasattr(node, 'val'):
        return node
    res = []
    safety = 0
    while node is not None and safety < 10000:
        res.append(node.val)
        node = node.next
        safety += 1
    return res

def __to_tree_node(arr):
    if not isinstance(arr, list) or len(arr) == 0 or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q = deque([root])
    i = 1
    while q and i < len(arr):
        curr = q.popleft()
        if i < len(arr) and arr[i] is not None:
            curr.left = TreeNode(arr[i])
            q.append(curr.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            curr.right = TreeNode(arr[i])
            q.append(curr.right)
        i += 1
    return root

def __from_tree_node(root):
    if root is None:
        return []
    if not hasattr(root, 'val'):
        return root
    res = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node is not None:
            res.append(node.val)
            q.append(node.left)
            q.append(node.right)
        else:
            res.append(None)
    while res and res[-1] is None:
        res.pop()
    return res

def __compare_results(actual, expected):
    if isinstance(actual, tuple):
        actual = list(actual)
    if json.dumps(actual) == json.dumps(expected):
        return True
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)) and not isinstance(actual, bool) and not isinstance(expected, bool):
        return abs(float(actual) - float(expected)) <= 1e-5
    if isinstance(actual, list) and isinstance(expected, list) and len(actual) == len(expected):
        try:
            sa = sorted([sorted(x) if isinstance(x, list) else x for x in actual], key=lambda v: json.dumps(v))
            sb = sorted([sorted(x) if isinstance(x, list) else x for x in expected], key=lambda v: json.dumps(v))
            if json.dumps(sa) == json.dumps(sb):
                return True
        except Exception:
            pass
    return False

${userCode}

test_cases = json.loads(${JSON.stringify(testCasesJson)})
results = []
raw_code = ${JSON.stringify(userCode)}

expected_fn = ${JSON.stringify(problem.functionName || '')}
target_method = None

if 'Solution' in globals():
    sol = Solution()
    if expected_fn and hasattr(sol, expected_fn):
        target_method = getattr(sol, expected_fn)
    else:
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        if methods:
            target_method = getattr(sol, methods[0])
elif expected_fn and expected_fn in globals() and callable(globals()[expected_fn]):
    target_method = globals()[expected_fn]
else:
    user_fns = [v for k, v in list(globals().items()) if callable(v) and not k.startswith('_') and k not in ('ListNode', 'TreeNode', 'defaultdict', 'Counter', 'deque', 'lru_cache', 'cache')]
    if user_fns:
        target_method = user_fns[-1]

uses_tree = ('.left' in raw_code or '.right' in raw_code or 'TreeNode' in raw_code)
uses_list_node = ('.next' in raw_code or 'ListNode' in raw_code) and not uses_tree

for tc in test_cases:
    start_time = time.perf_counter()
    actual_output = None
    error = None
    passed = False

    try:
        if not target_method:
            raise Exception("Solution method not found")

        args_copy = copy.deepcopy(tc['input'])
        call_args = args_copy
        if uses_tree:
            call_args = [__to_tree_node(a) if idx == 0 and isinstance(a, list) else a for idx, a in enumerate(args_copy)]
        elif uses_list_node:
            call_args = [__to_list_node(a) if isinstance(a, list) else a for a in args_copy]

        try:
            res = target_method(*call_args)
        except AttributeError as ae:
            msg = str(ae)
            if 'left' in msg or 'right' in msg:
                call_args = [__to_tree_node(a) if idx == 0 and isinstance(a, list) else a for idx, a in enumerate(copy.deepcopy(tc['input']))]
                res = target_method(*call_args)
                uses_tree = True
            elif 'next' in msg or 'val' in msg:
                call_args = [__to_list_node(a) if isinstance(a, list) else a for a in copy.deepcopy(tc['input'])]
                res = target_method(*call_args)
                uses_list_node = True
            else:
                raise ae

        if uses_tree and (res is None or hasattr(res, 'val')) and isinstance(tc['expected'], list):
            res = __from_tree_node(res)
        elif uses_list_node and (res is None or hasattr(res, 'val')) and isinstance(tc['expected'], list):
            res = __from_list_node(res)
        elif res is None and len(args_copy) > 0:
            res = args_copy[0]

        if isinstance(res, tuple):
            res = list(res)

        actual_output = res
        passed = __compare_results(actual_output, tc['expected'])
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
      const userSig = parseCppSignature(userCode);
      const starterSig = parseCppSignature(problem.starterCode.cpp);
      const sig = userSig || starterSig;
      const fnName = sig?.fnName || problem.functionName || 'solution';
      const retType = sig?.retType || starterSig?.retType || 'auto';
      const params =
        userSig && userSig.params.length > 0 ? userSig.params : starterSig?.params || [];

      const tcBlocks = problem.testCases
        .map((tc, tcIdx) => {
          const args = JSON.parse(tc.input);
          const argDecls = args
            .map((arg: unknown, aIdx: number) => {
              const pType = params[aIdx]?.type || starterSig?.params[aIdx]?.type || 'auto';
              const cleanType = pType.replace(/const\s+/g, '').replace(/&/g, '').trim();
              const lit = toCppLiteral(arg, cleanType);
              return `        ${cleanType} arg_${tcIdx}_${aIdx} = ${lit};`;
            })
            .join('\n');

          const callArgs = args.map((_: unknown, aIdx: number) => `arg_${tcIdx}_${aIdx}`).join(', ');
          const expectedJson = JSON.stringify(JSON.parse(tc.expectedOutput));
          const isVoid = retType === 'void';
          const firstArgType = (params[0]?.type || starterSig?.params[0]?.type || '')
            .replace(/const\s+/g, '')
            .replace(/&/g, '')
            .trim();
          const cleanRetType = retType.replace(/const\s+/g, '').replace(/&/g, '').trim();
          const canFallbackInPlace = !isVoid && args.length > 0 && firstArgType === cleanRetType;

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
            ${
              isVoid
                ? `sol.${fnName}(${callArgs});\n            actStr = toJson(arg_${tcIdx}_0);`
                : `auto res = sol.${fnName}(${callArgs});\n            actStr = toJson(res);${
                    canFallbackInPlace
                      ? `\n            if (actStr == "[]" && expectedStr != "[]") { actStr = toJson(arg_${tcIdx}_0); }`
                      : ''
                  }`
            }
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
#include <functional>
#include <bitset>
#include <tuple>
#include <utility>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

inline ListNode* buildList(const vector<int>& vals) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for (int v : vals) { curr->next = new ListNode(v); curr = curr->next; }
    return dummy.next;
}

inline TreeNode* buildTree(const vector<int>& vals) {
    if (vals.empty() || vals[0] == INT_MIN) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < vals.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < vals.size() && vals[i] != INT_MIN) {
            curr->left = new TreeNode(vals[i]);
            q.push(curr->left);
        }
        i++;
        if (i < vals.size() && vals[i] != INT_MIN) {
            curr->right = new TreeNode(vals[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

// Serialization Helpers
inline string toJson(int val) { return to_string(val); }
inline string toJson(long val) { return to_string(val); }
inline string toJson(long long val) { return to_string(val); }
inline string toJson(unsigned int val) { return to_string(val); }
inline string toJson(unsigned long val) { return to_string(val); }
inline string toJson(unsigned long long val) { return to_string(val); }
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

inline string toJson(ListNode* head) {
    vector<int> vals;
    int safety = 0;
    while (head && safety++ < 10000) {
        vals.push_back(head->val);
        head = head->next;
    }
    return toJson(vals);
}

inline string toJson(TreeNode* root) {
    if (!root) return "[]";
    vector<string> out;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        if (n) {
            out.push_back(to_string(n->val));
            q.push(n->left);
            q.push(n->right);
        } else {
            out.push_back("null");
        }
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    string res = "[";
    for (size_t i = 0; i < out.size(); ++i) {
        if (i > 0) res += ",";
        res += out[i];
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
      const userSig = parseJavaSignature(userCode);
      const starterSig = parseJavaSignature(problem.starterCode.java);
      const sig = userSig || starterSig;
      const fnName = sig?.fnName || problem.functionName || 'solution';
      const retType = sig?.retType || starterSig?.retType || 'Object';
      const params =
        userSig && userSig.params.length > 0 ? userSig.params : starterSig?.params || [];
      const normalizedUserCode = userCode.replace(/public\s+class\s+Solution/g, 'class Solution');

      const tcBlocks = problem.testCases
        .map((tc, tcIdx) => {
          const args = JSON.parse(tc.input);
          const argDecls = args
            .map((arg: unknown, aIdx: number) => {
              const pType = params[aIdx]?.type || starterSig?.params[aIdx]?.type || 'Object';
              const lit = toJavaLiteral(arg, pType);
              return `            ${pType} arg_${tcIdx}_${aIdx} = ${lit};`;
            })
            .join('\n');

          const callArgs = args.map((_: unknown, aIdx: number) => `arg_${tcIdx}_${aIdx}`).join(', ');
          const expectedJson = JSON.stringify(JSON.parse(tc.expectedOutput));
          const isVoid = retType === 'void';
          const firstArgType = (params[0]?.type || starterSig?.params[0]?.type || '').trim();
          const canFallbackInPlace = !isVoid && args.length > 0 && firstArgType === retType.trim();

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
                ${
                  isVoid
                    ? `sol.${fnName}(${callArgs});\n                actStr = toJson(arg_${tcIdx}_0);`
                    : `${retType} res = sol.${fnName}(${callArgs});\n                actStr = toJson(res);${
                        canFallbackInPlace
                          ? `\n                if (actStr.equals("[]") && !expected.equals("[]")) { actStr = toJson(arg_${tcIdx}_0); }`
                          : ''
                      }`
                }
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

class SolutionRunner {
    static ListNode buildList(int[] vals) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int v : vals) { curr.next = new ListNode(v); curr = curr.next; }
        return dummy.next;
    }
    static TreeNode buildTree(Integer[] vals) {
        if (vals == null || vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode curr = q.poll();
            if (i < vals.length && vals[i] != null) {
                curr.left = new TreeNode(vals[i]);
                q.add(curr.left);
            }
            i++;
            if (i < vals.length && vals[i] != null) {
                curr.right = new TreeNode(vals[i]);
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }
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
    static String toJson(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        int safety = 0;
        while (head != null && safety++ < 10000) {
            if (safety > 1) sb.append(",");
            sb.append(head.val);
            head = head.next;
        }
        return sb.append("]").toString();
    }
    static String toJson(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n != null) {
                out.add(String.valueOf(n.val));
                q.add(n.left);
                q.add(n.right);
            } else {
                out.add("null");
            }
        }
        while (!out.isEmpty() && out.get(out.size() - 1).equals("null")) out.remove(out.size() - 1);
        return "[" + String.join(",", out) + "]";
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
    static String toJson(long[] arr) {
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
    static String toJson(boolean[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i] ? "true" : "false");
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
    static String toJson(String[] arr) {
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
                sb.append(toJson(((Boolean)item).booleanValue()));
            } else if (item instanceof Character) {
                sb.append(toJson(((Character)item).charValue()));
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
    static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof Integer || obj instanceof Long) return obj.toString();
        if (obj instanceof Double || obj instanceof Float) return toJson(((Number)obj).doubleValue());
        if (obj instanceof Boolean) return toJson(((Boolean)obj).booleanValue());
        if (obj instanceof Character) return toJson(((Character)obj).charValue());
        if (obj instanceof String) return toJson((String)obj);
        if (obj instanceof List) return toJson((List<?>)obj);
        if (obj instanceof ListNode) return toJson((ListNode)obj);
        if (obj instanceof TreeNode) return toJson((TreeNode)obj);
        return String.valueOf(obj);
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

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

${normalizedUserCode}
`;
      return { code: wrapper };
    }

    default:
      return { code: userCode };
  }
}
