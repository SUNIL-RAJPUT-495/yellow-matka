import { evaluateBidWin } from '../services/settlementService.js';

const result146 = {
    open_panna: '146',
    open_digit: '1',
    close_panna: '146',
    close_digit: '1',
    jodi: '11'
};

const result140_280 = {
    open_panna: '140',
    open_digit: '5',
    close_panna: '280',
    close_digit: '0',
    jodi: '50'
};

const result112 = {
    open_panna: '112',
    open_digit: '4',
    close_panna: '112',
    close_digit: '4',
    jodi: '44'
};

const result777 = {
    open_panna: '777',
    open_digit: '1',
    close_panna: '777',
    close_digit: '1',
    jodi: '11'
};

const checks = [
    // 1. CyclePana
    { title: 'CyclePana winner 146', game_type: 'CyclePana', bet_number: '146', session: 'Open', resultDoc: result146, expected: true },
    { title: 'CyclePana winner 461', game_type: 'CyclePana', bet_number: '461', session: 'Open', resultDoc: result146, expected: true },
    { title: 'CyclePana winner 614', game_type: 'CyclePana', bet_number: '614', session: 'Open', resultDoc: result146, expected: true },
    { title: 'CyclePana loser 164', game_type: 'CyclePana', bet_number: '164', session: 'Open', resultDoc: result146, expected: false },
    { title: 'CyclePana loser 416', game_type: 'CyclePana', bet_number: '416', session: 'Open', resultDoc: result146, expected: false },

    // 2. FamilyPanel
    { title: 'FamilyPanel winner 641', game_type: 'FamilyPanel', bet_number: '641', session: 'Open', resultDoc: result146, expected: true },
    { title: 'FamilyPanel winner 211 for 112', game_type: 'FamilyPanel', bet_number: '211', session: 'Open', resultDoc: result112, expected: true },
    { title: 'FamilyPanel loser 123 for 112', game_type: 'FamilyPanel', bet_number: '123', session: 'Open', resultDoc: result112, expected: false },

    // 3. MotorWin / 9. SPMotor / 10. DPMotor
    { title: 'SPMotor winner 1468', game_type: 'SPMotor', bet_number: '1468', session: 'Open', resultDoc: result146, expected: true },
    { title: 'SPMotor loser 1234 (missing 6)', game_type: 'SPMotor', bet_number: '1234', session: 'Open', resultDoc: result146, expected: false },
    { title: 'DPMotor winner 1234 for 112', game_type: 'DPMotor', bet_number: '1234', session: 'Open', resultDoc: result112, expected: true },
    { title: 'DPMotor loser for SP result', game_type: 'DPMotor', bet_number: '12346', session: 'Open', resultDoc: result146, expected: false },

    // 4. Single
    { title: 'Single winner 5 on 140', game_type: 'Single', bet_number: '5', session: 'Open', resultDoc: result140_280, expected: true },
    { title: 'Single loser 8 on 140', game_type: 'Single', bet_number: '8', session: 'Open', resultDoc: result140_280, expected: false },

    // 5. Jodi
    { title: 'Jodi winner 50', game_type: 'Jodi', bet_number: '50', session: 'Full', resultDoc: result140_280, expected: true },
    { title: 'Jodi loser 05', game_type: 'Jodi', bet_number: '05', session: 'Full', resultDoc: result140_280, expected: false },

    // 6. SP
    { title: 'Single Panna winner 146', game_type: 'Single Panna', bet_number: '146', session: 'Open', resultDoc: result146, expected: true },
    { title: 'Single Panna safety loser 112', game_type: 'Single Panna', bet_number: '112', session: 'Open', resultDoc: result112, expected: false },

    // 7. DP
    { title: 'Double Panna winner 112', game_type: 'Double Panna', bet_number: '112', session: 'Open', resultDoc: result112, expected: true },
    { title: 'Double Panna safety loser 146', game_type: 'Double Panna', bet_number: '146', session: 'Open', resultDoc: result146, expected: false },

    // 8. TP
    { title: 'Triple Panna winner 777', game_type: 'Triple Panna', bet_number: '777', session: 'Open', resultDoc: result777, expected: true },
    { title: 'Triple Panna safety loser 112', game_type: 'Triple Panna', bet_number: '112', session: 'Open', resultDoc: result112, expected: false },

    // 11. OddEven
    { title: 'OddEven winner even on 4', game_type: 'OddEven', bet_number: 'Even', session: 'Open', resultDoc: result112, expected: true },
    { title: 'OddEven loser odd on 4', game_type: 'OddEven', bet_number: 'Odd', session: 'Open', resultDoc: result112, expected: false },

    // 12. RedJodi
    { title: 'RedJodi winner 44', game_type: 'RedJodi', bet_number: '44', session: 'Full', resultDoc: result112, expected: true },
    { title: 'RedJodi loser non-red 45', game_type: 'RedJodi', bet_number: '45', session: 'Full', resultDoc: result140_280, expected: false },

    // 13. TwoDigitPana
    { title: 'TwoDigitPana winner 14', game_type: 'TwoDigitPana', bet_number: '14', session: 'Open', resultDoc: result146, expected: true },
    { title: 'TwoDigitPana loser 44', game_type: 'TwoDigitPana', bet_number: '44', session: 'Open', resultDoc: result146, expected: false },

    // 14. HalfSangamA
    { title: 'HalfSangamA winner 140-0', game_type: 'HalfSangamA', bet_number: '140-0', session: 'Full', resultDoc: result140_280, expected: true },
    { title: 'HalfSangamA loser 140-5', game_type: 'HalfSangamA', bet_number: '140-5', session: 'Full', resultDoc: result140_280, expected: false },

    // 15. HalfSangamB
    { title: 'HalfSangamB winner 5-280', game_type: 'HalfSangamB', bet_number: '5-280', session: 'Full', resultDoc: result140_280, expected: true },
    { title: 'HalfSangamB loser 0-280', game_type: 'HalfSangamB', bet_number: '0-280', session: 'Full', resultDoc: result140_280, expected: false },

    // 16. FullSangam
    { title: 'FullSangam winner 140-280', game_type: 'FullSangam', bet_number: '140-280', session: 'Full', resultDoc: result140_280, expected: true },
    { title: 'FullSangam loser 280-140', game_type: 'FullSangam', bet_number: '280-140', session: 'Full', resultDoc: result140_280, expected: false }
];

let passCount = 0;
const failed = [];

for (const test of checks) {
    const actual = evaluateBidWin(test);
    if (actual === test.expected) {
        passCount += 1;
        console.log(`PASS: ${test.title}`);
    } else {
        failed.push({ title: test.title, expected: test.expected, actual });
        console.log(`FAIL: ${test.title} (expected ${test.expected}, got ${actual})`);
    }
}

console.log('----------------------------------------');
console.log(`Total: ${checks.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failed.length}`);

if (failed.length > 0) {
    process.exitCode = 1;
}
