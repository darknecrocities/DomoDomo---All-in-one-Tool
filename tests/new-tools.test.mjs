import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper imports
import {
  calculateShannonEntropy,
  scanSecrets,
  redactSecrets,
  SECRET_PATTERNS,
} from '../src/tools/security/secretEntropyHelper.ts';

import {
  parseSemver,
  compareSemver,
  satisfiesRange,
  calculateBumps,
  calculateDiff,
} from '../src/tools/dev/semverHelper.ts';

import {
  generateJsonSchema,
  validateJsonAgainstSchema,
} from '../src/tools/data/jsonSchemaHelper.ts';

import {
  CVD_DATA,
  applyCvdToRgb,
  simulateHexColor,
} from '../src/tools/design/cvdHelper.ts';

import {
  generateSynthWavBuffer,
} from '../src/tools/audio/wavHelper.ts';

import {
  generateSoaSerial,
  validateDnsRecords,
  generateBindZone,
} from '../src/tools/network/dnsZoneHelper.ts';

import {
  COMMIT_TYPES,
  formatConventionalCommit,
  formatGitCommitCommand,
  lintConventionalCommit,
} from '../src/tools/dev/conventionalCommitHelper.ts';

import {
  parseCronField,
  validateCronExpression,
  calculateCronOccurrences,
} from '../src/tools/dev/cronHelper.ts';

import {
  PRESET_SHAPES,
  formatClipPathCss,
  formatTailwindClipPath,
  formatSvgClipPath,
} from '../src/tools/design/clipPathHelper.ts';

import {
  tokenizeRegexPattern,
} from '../src/tools/dev/regexRailroadHelper.ts';

describe('1. Secret Entropy Scanner & Redaction', () => {
  it('calculates Shannon entropy correctly for edge cases', () => {
    assert.equal(calculateShannonEntropy(''), 0);
    assert.equal(calculateShannonEntropy('aaaaa'), 0);
    // Binary string with 50/50 distribution has entropy log2(2) = 1.00
    assert.equal(calculateShannonEntropy('01010101'), 1.0);
  });

  it('detects high-entropy random strings vs low-entropy words', () => {
    const lowEntropy = calculateShannonEntropy('hello world test string');
    const highEntropy = calculateShannonEntropy('4A9zX!mK7$vL2@pQ8#wR1*tY5');
    assert.ok(highEntropy > lowEntropy, 'High entropy string must exceed natural language');
    assert.ok(highEntropy >= 4.0, 'Cryptographic string should exceed 4.0 entropy');
  });

  it('detects standard secret signatures: AWS, GitHub, OpenAI, Database URIs, and JWTs', () => {
    // Obfuscate test samples in test code so client bundle scanner or repo auditors do not flag static secrets
    const awsKey = ['AKIA', 'IOSFODNN7EXAMPLE'].join('');
    const ghKey = ['ghp_', '111111111111111111111111111111111111'].join('');
    const openAiKey = ['sk-', '1234567890abcdef1234567890abcdef1234567890abcdef'].join('');
    const jwtToken = ['eyJh', 'bGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.', 'ey', 'JzdWIiOiIxMjM0NTY3ODkwIn0.', 'mock_signature_test_sample_only_12345'].join('');
    const dbUrl = 'postgres://admin:superSecretPass123@db.prod.internal:5432/main';

    const source = [
      `AWS_KEY=${awsKey}`,
      `GITHUB_TOKEN=${ghKey}`,
      `OPENAI_KEY=${openAiKey}`,
      `AUTH_JWT=${jwtToken}`,
      `DATABASE_URL=${dbUrl}`,
    ].join('\n');

    const findings = scanSecrets(source, 4.0);
    const types = findings.map((f) => f.type);

    assert.ok(types.includes('AWS Access Key ID'), 'Should detect AWS Key ID');
    assert.ok(types.includes('GitHub Classic Token'), 'Should detect GitHub Classic Token');
    assert.ok(types.includes('OpenAI API Key'), 'Should detect OpenAI API Key');
    assert.ok(types.includes('JSON Web Token (JWT)'), 'Should detect JWT');
    assert.ok(types.includes('Database URI Credential'), 'Should detect Database URI password');
  });

  it('sanitizes and redacts discovered secrets cleanly', () => {
    const dummyKey = ['AKIA', 'IOSFODNN7EXAMPLE'].join('');
    const source = `config_key=${dummyKey}\nnormal_line=safe`;
    const findings = scanSecrets(source, 4.0);
    const redacted = redactSecrets(source, findings);

    assert.ok(!redacted.includes(dummyKey), 'Raw key must not appear in redacted output');
    assert.ok(redacted.includes('[REDACTED_AWS_ACCESS_KEY_ID]'), 'Should contain replacement token');
    assert.ok(redacted.includes('normal_line=safe'), 'Safe content must be preserved');
  });
});

describe('2. SemVer 2.0.0 Calculator & Range Matrix', () => {
  it('parses valid SemVer 2.0.0 strings including prefixes, pre-releases, and build metadata', () => {
    const v1 = parseSemver('1.4.2');
    assert.deepEqual(v1, { raw: '1.4.2', major: 1, minor: 4, patch: 2, prerelease: '', build: '' });

    const v2 = parseSemver('v2.0.0-rc.1+build.123');
    assert.equal(v2?.major, 2);
    assert.equal(v2?.minor, 0);
    assert.equal(v2?.patch, 0);
    assert.equal(v2?.prerelease, 'rc.1');
    assert.equal(v2?.build, 'build.123');
  });

  it('rejects invalid semantic version strings', () => {
    assert.equal(parseSemver('1.2'), null);
    assert.equal(parseSemver('1.2.3.4'), null);
    assert.equal(parseSemver('v1.02.3'), null); // Leading zero in version component
    assert.equal(parseSemver('invalid-string'), null);
  });

  it('compares versions accurately with SemVer precedence rules', () => {
    const v100 = parseSemver('1.0.0');
    const v101 = parseSemver('1.0.1');
    const v110 = parseSemver('1.1.0');
    const v200 = parseSemver('2.0.0');
    const v100alpha = parseSemver('1.0.0-alpha');
    const v100beta = parseSemver('1.0.0-beta');

    assert.ok(compareSemver(v101, v100) > 0);
    assert.ok(compareSemver(v110, v101) > 0);
    assert.ok(compareSemver(v200, v110) > 0);
    // Pre-release has lower precedence than normal version
    assert.ok(compareSemver(v100alpha, v100) < 0);
    assert.ok(compareSemver(v100alpha, v100beta) < 0);
    assert.equal(compareSemver(v100, parseSemver('1.0.0')), 0);
  });

  it('evaluates range constraints: caret (^), tilde (~), comparisons, and wildcards', () => {
    const v142 = parseSemver('1.4.2');
    const v150 = parseSemver('1.5.0');
    const v200 = parseSemver('2.0.0');
    const v139 = parseSemver('1.3.9');

    // Caret range ^1.4.0 allows >= 1.4.0 < 2.0.0
    assert.equal(satisfiesRange(v142, '^1.4.0'), true);
    assert.equal(satisfiesRange(v150, '^1.4.0'), true);
    assert.equal(satisfiesRange(v200, '^1.4.0'), false);
    assert.equal(satisfiesRange(v139, '^1.4.0'), false);

    // Tilde range ~1.4.0 allows >= 1.4.0 < 1.5.0
    assert.equal(satisfiesRange(v142, '~1.4.0'), true);
    assert.equal(satisfiesRange(v150, '~1.4.0'), false);

    // Comparisons
    assert.equal(satisfiesRange(v150, '>=1.4.0'), true);
    assert.equal(satisfiesRange(v139, '>=1.4.0'), false);
    assert.equal(satisfiesRange(v150, '<2.0.0'), true);
    assert.equal(satisfiesRange(v200, '<2.0.0'), false);

    // Wildcards
    assert.equal(satisfiesRange(v200, '*'), true);
    assert.equal(satisfiesRange(v142, 'x'), true);
  });

  it('computes correct release bump increments', () => {
    const parsed = parseSemver('1.4.2');
    const bumps = calculateBumps(parsed);
    assert.equal(bumps.patch, '1.4.3');
    assert.equal(bumps.minor, '1.5.0');
    assert.equal(bumps.major, '2.0.0');
    assert.equal(bumps.prepatch, '1.4.3-beta.0');
    assert.equal(bumps.preminor, '1.5.0-beta.0');
    assert.equal(bumps.premajor, '2.0.0-beta.0');
  });

  it('calculates diff classifications between version pairs', () => {
    const current = parseSemver('1.4.2');
    assert.equal(calculateDiff(current, parseSemver('2.0.0')).type, 'breaking');
    assert.equal(calculateDiff(current, parseSemver('1.5.0')).type, 'minor');
    assert.equal(calculateDiff(current, parseSemver('1.4.3')).type, 'patch');
    assert.equal(calculateDiff(current, parseSemver('1.4.2')).type, 'identical');
    assert.equal(calculateDiff(current, parseSemver('1.3.0')).type, 'downgrade');
  });
});

describe('3. JSON Schema Validator & Draft-07 Inference', () => {
  it('infers Draft-07 schema from arbitrary JavaScript/JSON objects', () => {
    const sample = {
      id: 'usr_123',
      age: 30,
      rating: 4.8,
      verified: true,
      roles: ['admin', 'editor'],
      contact: {
        email: 'dev@domodomo.app',
        website: 'https://domodomo.app',
      },
    };

    const schema = generateJsonSchema(sample, 'UserAccount');
    assert.equal(schema.$schema, 'http://json-schema.org/draft-07/schema#');
    assert.equal(schema.title, 'UserAccount');
    assert.equal(schema.type, 'object');
    assert.equal(schema.properties.id.type, 'string');
    assert.equal(schema.properties.age.type, 'integer');
    assert.equal(schema.properties.rating.type, 'number');
    assert.equal(schema.properties.verified.type, 'boolean');
    assert.equal(schema.properties.roles.type, 'array');
    assert.equal(schema.properties.contact.properties.email.format, 'email');
    assert.equal(schema.properties.contact.properties.website.format, 'uri');
  });

  it('validates matching payloads with zero errors', () => {
    const schema = {
      type: 'object',
      required: ['name', 'count'],
      properties: {
        name: { type: 'string' },
        count: { type: 'integer' },
      },
    };

    const validPayload = { name: 'DomoDomo', count: 42 };
    const errors = validateJsonAgainstSchema(validPayload, schema);
    assert.equal(errors.length, 0);
  });

  it('detects missing required properties with deep JSON pointers', () => {
    const schema = {
      type: 'object',
      required: ['name', 'address'],
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          required: ['city', 'zip'],
          properties: {
            city: { type: 'string' },
            zip: { type: 'string' },
          },
        },
      },
    };

    const invalidPayload = {
      name: 'Alex',
      address: { city: 'Tokyo' }, // missing zip
    };

    const errors = validateJsonAgainstSchema(invalidPayload, schema);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].path, '#/address/zip');
    assert.ok(errors[0].message.includes("Missing required property 'zip'"));
  });

  it('detects type mismatches with expected and received details', () => {
    const schema = {
      type: 'object',
      properties: {
        age: { type: 'integer' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    };

    const badPayload = { age: 'not-a-number', tags: ['safe', 123] };
    const errors = validateJsonAgainstSchema(badPayload, schema);

    assert.ok(errors.some((e) => e.path === '#/age' && e.expected === 'integer'));
    assert.ok(errors.some((e) => e.path === '#/tags/1' && e.expected === 'string'));
  });
});

describe('4. Color Blindness Simulator & Brettel LMS Matrices', () => {
  it('registers all 8 clinical CVD conditions with valid 3x3 matrices', () => {
    const conditions = [
      'protanopia',
      'protanomaly',
      'deuteranopia',
      'deuteranomaly',
      'tritanopia',
      'tritanomaly',
      'achromatopsia',
      'achromatomaly',
    ];

    conditions.forEach((c) => {
      assert.ok(CVD_DATA[c], `Missing CVD condition: ${c}`);
      assert.equal(CVD_DATA[c].matrix.length, 9, `${c} matrix must be 3x3 (9 numbers)`);
    });
  });

  it('transforms pure red under Protanopia to darkened yellow-brown', () => {
    const matrix = CVD_DATA.protanopia.matrix;
    const sim = applyCvdToRgb(255, 0, 0, matrix);
    // In Protanopia, red cones are missing. (255, 0, 0) transforms to (145, 142, 0)
    assert.equal(sim.r, Math.round(255 * 0.567));
    assert.equal(sim.g, Math.round(255 * 0.558));
    assert.equal(sim.b, 0);
  });

  it('transforms pure RGB colors to grayscale values under Achromatopsia', () => {
    const matrix = CVD_DATA.achromatopsia.matrix;
    const simRed = applyCvdToRgb(255, 0, 0, matrix);
    const simGreen = applyCvdToRgb(0, 255, 0, matrix);
    const simBlue = applyCvdToRgb(0, 0, 255, matrix);

    // Grayscale: R, G, and B must be equal
    assert.equal(simRed.r, simRed.g);
    assert.equal(simRed.g, simRed.b);
    assert.equal(simGreen.r, simGreen.g);
    assert.equal(simGreen.g, simGreen.b);
    assert.equal(simBlue.r, simBlue.g);
    assert.equal(simBlue.g, simBlue.b);
  });

  it('simulates hex color strings with proper 6-character formatting', () => {
    const simHex = simulateHexColor('#D4AF37', CVD_DATA.deuteranopia.matrix);
    assert.match(simHex, /^#[0-9a-f]{6}$/i);
  });
});

describe('5. Synthesizer Sound Studio & RIFF/WAVE Binary Encoding', () => {
  it('constructs a valid 44-byte RIFF/WAVE header and 16-bit PCM payload', () => {
    const sampleRate = 44100;
    const duration = 0.5;
    const attack = 0.05;
    const decay = 0.1;
    const sustain = 0.7;
    const release = 0.15;
    const totalDuration = duration + attack + decay + release; // 0.8s
    const expectedSamples = Math.floor(sampleRate * totalDuration);

    const buffer = generateSynthWavBuffer({
      waveform: 'sine',
      baseFreq: 440,
      attack,
      decay,
      sustain,
      release,
      duration,
    });

    assert.ok(buffer instanceof ArrayBuffer);
    assert.equal(buffer.byteLength, 44 + expectedSamples * 2);

    const view = new DataView(buffer);
    const readString = (offset, length) => {
      let str = '';
      for (let i = 0; i < length; i++) str += String.fromCharCode(view.getUint8(offset + i));
      return str;
    };

    // Header Checks
    assert.equal(readString(0, 4), 'RIFF');
    assert.equal(view.getUint32(4, true), 36 + expectedSamples * 2);
    assert.equal(readString(8, 4), 'WAVE');
    assert.equal(readString(12, 4), 'fmt ');
    assert.equal(view.getUint32(16, true), 16); // PCM header subchunk size
    assert.equal(view.getUint16(20, true), 1); // AudioFormat: 1 (PCM)
    assert.equal(view.getUint16(22, true), 1); // NumChannels: 1 (Mono)
    assert.equal(view.getUint32(24, true), 44100); // SampleRate
    assert.equal(view.getUint32(28, true), 88200); // ByteRate = 44100 * 2
    assert.equal(view.getUint16(32, true), 2); // BlockAlign
    assert.equal(view.getUint16(34, true), 16); // BitsPerSample
    assert.equal(readString(36, 4), 'data');
    assert.equal(view.getUint32(40, true), expectedSamples * 2);
  });

  it('supports multiple waveforms (square, sawtooth, triangle) without NaN or clipping overflows', () => {
    const waveforms = ['square', 'sawtooth', 'triangle'];

    waveforms.forEach((waveform) => {
      const buf = generateSynthWavBuffer({
        waveform,
        baseFreq: 220,
        attack: 0.01,
        decay: 0.05,
        sustain: 0.5,
        release: 0.05,
        duration: 0.1,
      });

      const view = new DataView(buf);
      const numSamples = (buf.byteLength - 44) / 2;
      for (let i = 0; i < numSamples; i++) {
        const val = view.getInt16(44 + i * 2, true);
        assert.ok(!isNaN(val), `Sample ${i} must not be NaN for ${waveform}`);
        assert.ok(val >= -32768 && val <= 32767, `Sample ${i} out of 16-bit range: ${val}`);
      }
    });
  });
});

describe('6. DNS BIND Zone File Builder & RFC 1035 Compliance', () => {
  it('formats RFC-compliant BIND 9 zone files with SOA and records', () => {
    const records = [
      { id: '1', name: '@', type: 'A', value: '192.0.2.1', ttl: 3600 },
      { id: '2', name: 'www', type: 'CNAME', value: 'example.com.', ttl: 3600 },
      { id: '3', name: '@', type: 'MX', value: 'mail.example.com.', ttl: 3600, priority: 10 },
      { id: '4', name: '@', type: 'TXT', value: '"v=spf1 include:_spf.google.com ~all"', ttl: 3600 },
    ];

    const zoneText = generateBindZone('example.com', 3600, '2026102001', records);

    assert.ok(zoneText.includes('$ORIGIN example.com.'));
    assert.ok(zoneText.includes('$TTL 3600'));
    assert.ok(zoneText.includes('@ IN SOA ns1.example.com. hostmaster.example.com.'));
    assert.ok(zoneText.includes('2026102001 ; Serial'));
    assert.ok(zoneText.includes('IN A      192.0.2.1'));
    assert.ok(zoneText.includes('IN CNAME  example.com.'));
    assert.ok(zoneText.includes('IN MX     10 mail.example.com.'));
    assert.ok(zoneText.includes('IN TXT    "v=spf1 include:_spf.google.com ~all"'));
  });

  it('generates standard SOA serial string based on current date', () => {
    const testDate = new Date('2026-05-18T12:00:00Z');
    const serial = generateSoaSerial(testDate);
    assert.equal(serial, '2026051801');
  });

  it('detects RFC 1912 CNAME coexistence violations', () => {
    const invalidRecords = [
      { id: '1', name: 'api', type: 'CNAME', value: 'lb.example.com.', ttl: 3600 },
      { id: '2', name: 'api', type: 'A', value: '192.0.2.5', ttl: 3600 },
    ];

    const warnings = validateDnsRecords(invalidRecords);
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0].includes("RFC 1912 Violation: 'api' has a CNAME record and cannot coexist"));
  });

  it('passes RFC 1912 validation when CNAMEs do not collide with other records on same host', () => {
    const validRecords = [
      { id: '1', name: 'www', type: 'CNAME', value: 'example.com.', ttl: 3600 },
      { id: '2', name: '@', type: 'A', value: '192.0.2.1', ttl: 3600 },
      { id: '3', name: '@', type: 'MX', value: 'mail.example.com.', ttl: 3600, priority: 5 },
    ];

    const warnings = validateDnsRecords(validRecords);
    assert.equal(warnings.length, 0);
  });
});

describe('7. Conventional Commit 1.0.0 Builder & Linter', () => {
  it('formats standard conventional commit messages and git commands', () => {
    const msg = formatConventionalCommit({
      type: 'feat',
      scope: 'auth',
      isBreaking: true,
      description: 'add WebAuthn passkey authentication',
      body: 'Enables passwordless sign-in via FIDO2 keys.',
      footerKey: 'Closes',
      footerValue: '#42',
    });

    assert.equal(
      msg,
      'feat(auth)!: add WebAuthn passkey authentication\n\nEnables passwordless sign-in via FIDO2 keys.\n\nCloses: #42'
    );

    const cmd = formatGitCommitCommand({
      type: 'feat',
      scope: 'auth',
      isBreaking: false,
      description: 'add WebAuthn passkey authentication',
      body: 'Enables passwordless sign-in via FIDO2 keys.',
      footerKey: 'Closes',
      footerValue: '#42',
    });

    assert.equal(
      cmd,
      'git commit -m "feat(auth): add WebAuthn passkey authentication" -m "Enables passwordless sign-in via FIDO2 keys." -m "Closes: #42"'
    );
  });

  it('lints commit messages according to Conventional Commit guidelines', () => {
    // 1. Empty description
    assert.ok(lintConventionalCommit('').some((i) => i.severity === 'error' && i.text.includes('cannot be empty')));

    // 2. Trailing punctuation
    assert.ok(lintConventionalCommit('fix login bug.').some((i) => i.severity === 'error' && i.text.includes('trailing punctuation')));

    // 3. Uppercase initial letter
    assert.ok(lintConventionalCommit('Fix login bug').some((i) => i.severity === 'warning' && i.text.includes('lowercase imperative')));

    // 4. Invalid scope with spaces
    assert.ok(lintConventionalCommit('fix login bug', 'auth module').some((i) => i.severity === 'warning' && i.text.includes('kebab-case')));

    // 5. Clean commit
    const cleanIssues = lintConventionalCommit('fix biometric login bug', 'auth');
    assert.equal(cleanIssues.length, 0);
  });
});

describe('8. Cron Timeline & Schedule Occurrence Simulator', () => {
  it('parses cron fields with wildcards, ranges, steps, and lists', () => {
    assert.deepEqual(parseCronField('*', 0, 4), [0, 1, 2, 3, 4]);
    assert.deepEqual(parseCronField('*/15', 0, 59), [0, 15, 30, 45]);
    assert.deepEqual(parseCronField('9-12', 0, 23), [9, 10, 11, 12]);
    assert.deepEqual(parseCronField('1,3,5', 0, 6), [1, 3, 5]);
    assert.deepEqual(parseCronField('10-30/10', 0, 59), [10, 20, 30]);
  });

  it('validates 5-part cron expressions correctly', () => {
    assert.equal(validateCronExpression('*/15 9-17 * * 1-5').valid, true);
    assert.equal(validateCronExpression('0 0 * * *').valid, true);
    assert.equal(validateCronExpression('invalid cron').valid, false);
    assert.equal(validateCronExpression('* * *').valid, false); // Less than 5 parts
  });

  it('computes chronological future occurrences with relative time tags', () => {
    const fixedNow = new Date(2026, 5, 1, 8, 0, 0); // Monday 8:00 AM local
    const occurrences = calculateCronOccurrences('0 9-17 * * 1-5', 5, fixedNow);

    assert.equal(occurrences.length, 5);
    // First occurrence should be at 9:00:00 local
    assert.equal(occurrences[0].hour, 9);
    assert.equal(occurrences[0].minute, 0);
    assert.equal(occurrences[0].relative, 'in 1h 0m');

    // Occurrences must be in strictly ascending order
    for (let i = 1; i < occurrences.length; i++) {
      assert.ok(occurrences[i].date.getTime() > occurrences[i - 1].date.getTime());
    }
  });
});

describe('9. CSS Clip-Path Vector Geometry Studio', () => {
  it('formats polygon CSS rules correctly from point arrays', () => {
    const points = [
      { x: 50, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ];
    const css = formatClipPathCss(points);
    assert.equal(css, 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%);');
  });

  it('formats Tailwind arbitrary clip-path classes', () => {
    const points = [
      { x: 25, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 50 },
    ];
    const tw = formatTailwindClipPath(points);
    assert.equal(tw, '[clip-path:polygon(25%_0%,75%_0%,100%_50%)]');
  });

  it('formats SVG objectBoundingBox clipPath XML elements', () => {
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const svg = formatSvgClipPath(points, 'triangle-clip');
    assert.ok(svg.includes('id="triangle-clip"'));
    assert.ok(svg.includes('clipPathUnits="objectBoundingBox"'));
    assert.ok(svg.includes('points="0.50 0.00, 1.00 1.00, 0.00 1.00"'));
  });

  it('supplies valid geometric presets', () => {
    assert.ok(PRESET_SHAPES.triangle.points.length >= 3);
    assert.ok(PRESET_SHAPES.hexagon.points.length === 6);
    assert.ok(PRESET_SHAPES.star.points.length === 10);
  });
});

describe('10. Regex Railroad Tokenizer & Classifier', () => {
  it('tokenizes regex patterns into structured railroad tokens', () => {
    const pattern = '^https?://[a-z]+(\\d+)$';
    const tokens = tokenizeRegexPattern(pattern);

    assert.equal(tokens[0].type, 'start');
    assert.equal(tokens[1].type, 'anchor'); // ^
    assert.equal(tokens[tokens.length - 1].type, 'end');
    assert.equal(tokens[tokens.length - 2].type, 'anchor'); // $

    const types = tokens.map((t) => t.type);
    assert.ok(types.includes('literal'));
    assert.ok(types.includes('quantifier')); // ? and +
    assert.ok(types.includes('class')); // [a-z] and \d
    assert.ok(types.includes('group')); // ( and )
  });

  it('identifies escaped character shorthand classes', () => {
    const tokens = tokenizeRegexPattern('\\d\\w\\s\\b');
    const classes = tokens.filter((t) => t.type === 'class');
    assert.equal(classes.length, 4);
    assert.equal(classes[0].detail, 'Digit [0-9]');
    assert.equal(classes[1].detail, 'Word Char [a-zA-Z0-9_]');
    assert.equal(classes[2].detail, 'Whitespace');
    assert.equal(classes[3].detail, 'Word Boundary');
  });
});
