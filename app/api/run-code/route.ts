import { NextRequest, NextResponse } from 'next/server';
import { PROBLEMS, Language } from '@/lib/problems';
import { wrapCodeWithTestRunner } from '@/lib/code-wrapper';
import { checkRateLimit, sanitizeCodeSubmission, getClientIp } from '@/lib/security';
import { db } from '@/lib/database';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vm from 'vm';

function runProcess(
  cmd: string,
  args: string[],
  options?: { cwd?: string; timeout?: number }
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const proc = spawn(cmd, args, {
      ...options,
      timeout: options?.timeout || 7000,
    });

    proc.stdout?.on('data', (d) => {
      stdout += d.toString();
    });
    proc.stderr?.on('data', (d) => {
      stderr += d.toString();
    });
    proc.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });
    proc.on('error', (err) => {
      resolve({ stdout: '', stderr: err.message, code: -1 });
    });
  });
}

function parseRunnerOutput(
  stdout: string,
  stderr: string,
  totalTestCases: number
) {
  const startTag = '__CODECLASH_OUTPUT_START__';
  const endTag = '__CODECLASH_OUTPUT_END__';

  if (stderr && !stdout.includes(startTag)) {
    return {
      success: false,
      compileError: stderr,
      allPassed: false,
      results: [],
      passedCount: 0,
      totalCount: totalTestCases,
    };
  }

  if (stdout.includes(startTag) && stdout.includes(endTag)) {
    const startIndex = stdout.indexOf(startTag) + startTag.length;
    const endIndex = stdout.indexOf(endTag);
    const jsonStr = stdout.substring(startIndex, endIndex).trim();

    try {
      const results = JSON.parse(jsonStr);
      const passedCount = results.filter((r: { passed: boolean }) => r.passed).length;
      const allPassed = passedCount === results.length;
      const totalRuntimeMs = results.reduce(
        (acc: number, r: { runtimeMs: number }) => acc + (r.runtimeMs || 0),
        0
      );

      return {
        success: true,
        results,
        allPassed,
        passedCount,
        totalCount: results.length,
        totalRuntimeMs: Number(totalRuntimeMs.toFixed(2)),
        compileError: null,
      };
    } catch {
      return {
        success: false,
        compileError: 'Failed to parse execution output: ' + stdout,
        allPassed: false,
        results: [],
        passedCount: 0,
        totalCount: totalTestCases,
      };
    }
  }

  return {
    success: false,
    compileError: stderr || stdout || 'Execution timed out or returned no output',
    allPassed: false,
    results: [],
    passedCount: 0,
    totalCount: totalTestCases,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: Max 60 executions per minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { language, code, problemId } = body as {
      language: Language;
      code: string;
      problemId: string;
    };

    if (!code || !language || !problemId) {
      return NextResponse.json(
        { error: 'Missing code, language, or problemId' },
        { status: 400 }
      );
    }

    // Security Scan: Threat detection
    const scan = sanitizeCodeSubmission(code);
    if (!scan.safe) {
      return NextResponse.json(
        { error: scan.reason || 'Code submission failed security scan' },
        { status: 403 }
      );
    }

    // Record lines telemetry
    db.incrementSubmissions(code.split('\n').length);

    const problem = PROBLEMS.find((p) => p.id === problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Wrap user code with test harness
    const { code: wrappedCode } = wrapCodeWithTestRunner(language, code, problem);

    const startTag = '__CODECLASH_OUTPUT_START__';
    const endTag = '__CODECLASH_OUTPUT_END__';

    // 1. JavaScript Execution (In-Process Isolated VM Sandbox)
    if (language === 'javascript') {
      let runOutput = '';
      const sandbox = {
        console: {
          log: (...args: unknown[]) => {
            runOutput += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
          },
          error: (...args: unknown[]) => {
            runOutput += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
          },
        },
        process: {
          hrtime: (time?: [number, number]) => {
            if (!time) {
              const now = performance.now();
              const sec = Math.floor(now / 1000);
              const nsec = Math.floor((now % 1000) * 1e6);
              return [sec, nsec];
            }
            const now = performance.now();
            const startMs = time[0] * 1000 + time[1] / 1e6;
            const diffMs = now - startMs;
            return [Math.floor(diffMs / 1000), Math.floor((diffMs % 1000) * 1e6)];
          },
        },
        JSON,
        Math,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Map,
        Set,
      };

      const context = vm.createContext(sandbox);

      try {
        const script = new vm.Script(wrappedCode);
        script.runInContext(context, { timeout: 3000 }); // 3s timeout
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({
          success: false,
          compileError: msg,
          allPassed: false,
          results: [],
          passedCount: 0,
          totalCount: problem.testCases.length,
        });
      }

      if (runOutput.includes(startTag) && runOutput.includes(endTag)) {
        const startIndex = runOutput.indexOf(startTag) + startTag.length;
        const endIndex = runOutput.indexOf(endTag);
        const jsonStr = runOutput.substring(startIndex, endIndex).trim();
        const results = JSON.parse(jsonStr);

        const passedCount = results.filter((r: { passed: boolean }) => r.passed).length;
        const allPassed = passedCount === results.length;
        const totalRuntimeMs = results.reduce(
          (acc: number, r: { runtimeMs: number }) => acc + (r.runtimeMs || 0),
          0
        );

        return NextResponse.json({
          success: true,
          results,
          allPassed,
          passedCount,
          totalCount: results.length,
          totalRuntimeMs: Number(totalRuntimeMs.toFixed(2)),
          compileError: null,
        });
      }

      return NextResponse.json({
        success: false,
        compileError: runOutput || 'Execution completed without output',
        allPassed: false,
        results: [],
        passedCount: 0,
        totalCount: problem.testCases.length,
      });
    }

    // 2. Python Execution (Isolated Process Runner with 4s Timeout)
    if (language === 'python') {
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, `codeclash_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);

      await fs.promises.writeFile(tmpFile, wrappedCode, 'utf-8');

      return new Promise<NextResponse>((resolve) => {
        const pyProcess = spawn('python', [tmpFile], {
          timeout: 4000,
        });

        let stdout = '';
        let stderr = '';

        pyProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pyProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pyProcess.on('close', async () => {
          try {
            await fs.promises.unlink(tmpFile);
          } catch {
            // Ignore cleanup errors
          }

          const parsed = parseRunnerOutput(stdout, stderr, problem.testCases.length);
          return resolve(NextResponse.json(parsed));
        });

        pyProcess.on('error', (err) => {
          resolve(
            NextResponse.json({
              success: false,
              compileError: 'Failed to spawn Python process: ' + err.message,
              allPassed: false,
              results: [],
              passedCount: 0,
              totalCount: problem.testCases.length,
            })
          );
        });
      });
    }

    // 3. C++ Execution (g++ Compiler with -O2)
    if (language === 'cpp') {
      const gppPath = 'g++';
      const tmpDir = os.tmpdir();
      const rand = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const cppFile = path.join(tmpDir, `codeclash_${rand}.cpp`);
      const exeFile = path.join(tmpDir, `codeclash_${rand}.exe`);

      await fs.promises.writeFile(cppFile, wrappedCode, 'utf-8');

      try {
        // Compile
        const compileRes = await runProcess(
          gppPath,
          ['-std=c++14', '-O2', cppFile, '-o', exeFile],
          { timeout: 7000 }
        );

        if (compileRes.code !== 0) {
          const cleanErr = compileRes.stderr
            .replace(new RegExp(cppFile.replace(/\\/g, '\\\\'), 'g'), 'Solution.cpp')
            .replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), '');
          return NextResponse.json({
            success: false,
            compileError: cleanErr || 'C++ compilation failed',
            allPassed: false,
            results: [],
            passedCount: 0,
            totalCount: problem.testCases.length,
          });
        }

        // Execute binary
        const runRes = await runProcess(exeFile, [], { timeout: 4000 });
        const parsed = parseRunnerOutput(runRes.stdout, runRes.stderr, problem.testCases.length);
        return NextResponse.json(parsed);
      } finally {
        try { await fs.promises.unlink(cppFile); } catch {}
        try { await fs.promises.unlink(exeFile); } catch {}
      }
    }

    // 4. Java Execution (javac + java Runner)
    if (language === 'java') {
      const javacPath = 'javac';
      const javaPath = 'java';

      const runDir = path.join(
        os.tmpdir(),
        `codeclash_java_${Date.now()}_${Math.random().toString(36).substring(7)}`
      );
      await fs.promises.mkdir(runDir, { recursive: true });
      const javaFile = path.join(runDir, 'SolutionRunner.java');

      await fs.promises.writeFile(javaFile, wrappedCode, 'utf-8');

      try {
        // Compile
        const compileRes = await runProcess(
          javacPath,
          ['SolutionRunner.java'],
          { cwd: runDir, timeout: 7000 }
        );

        if (compileRes.code !== 0) {
          const cleanErr = compileRes.stderr
            .replace(/SolutionRunner\.java/g, 'Solution.java')
            .replace(new RegExp(runDir.replace(/\\/g, '\\\\'), 'g'), '');
          return NextResponse.json({
            success: false,
            compileError: cleanErr || 'Java compilation failed',
            allPassed: false,
            results: [],
            passedCount: 0,
            totalCount: problem.testCases.length,
          });
        }

        // Execute JVM class
        const runRes = await runProcess(
          javaPath,
          ['SolutionRunner'],
          { cwd: runDir, timeout: 4000 }
        );
        const parsed = parseRunnerOutput(runRes.stdout, runRes.stderr, problem.testCases.length);
        return NextResponse.json(parsed);
      } finally {
        try { await fs.promises.rm(runDir, { recursive: true, force: true }); } catch {}
      }
    }

    return NextResponse.json({
      success: false,
      compileError: `Language ${language} is not supported. Supported languages: Python, JavaScript, C++, Java.`,
      allPassed: false,
      results: [],
      passedCount: 0,
      totalCount: problem.testCases.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
