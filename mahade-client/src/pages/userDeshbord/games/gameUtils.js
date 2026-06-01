export const generateSinglePannas = () => {
  const groups = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
  for (let i = 1; i <= 9; i++) {
    for (let j = i + 1; j <= 9; j++) {
      for (let k = j + 1; k <= 10; k++) {
        const sum = i + j + (k === 10 ? 0 : k);
        const lastDigit = sum % 10;
        const pana = `${i}${j}${k === 10 ? 0 : k}`;
        groups[lastDigit].push(pana);
      }
    }
  }
  return groups;
};

export const getSPMotorCount = (motor) => {
  let digits = Array.from(new Set(motor.split(''))).sort();
  let count = 0;
  for (let i = 0; i < digits.length; i++) {
      for (let j = i + 1; j < digits.length; j++) {
          for (let k = j + 1; k < digits.length; k++) {
              count++;
          }
      }
  }
  return count;
};

export const getDPMotorCount = (motor) => {
  let digits = Array.from(new Set(motor.split(''))).sort();
  let count = 0;
  for (let i = 0; i < digits.length; i++) {
      for (let j = 0; j < digits.length; j++) {
          if (i !== j) count++;
      }
  }
  return count;
};

export const getGameConfig = (type) => {
  switch (type) {
    case 'Single':
    case 'OddEven': return { maxLength: 1, exact: 1, placeholder: 'e.g., 5' };
    case 'Jodi':
    case 'RedJodi':
    case 'TwoDigitPana': return { maxLength: 2, exact: 2, placeholder: 'e.g., 45' };
    case 'Single Panna':
    case 'Double Panna':
    case 'Triple Panna':
    case 'SP': case 'DP': case 'TP': case 'SPCOMMON': case 'DPCOMMON':
      return { maxLength: 3, exact: 3, placeholder: 'e.g., 146' };
    case 'HalfSangamA': return { maxLength: 5, exact: 0, placeholder: 'e.g., 125-9' };
    case 'HalfSangamB': return { maxLength: 5, exact: 0, placeholder: 'e.g., 9-125' };
    case 'FullSangam': return { maxLength: 7, exact: 0, placeholder: 'e.g., 125-340' };
    case 'SPMotor': case 'DPMotor': return { maxLength: 10, exact: 4, placeholder: 'Min 4 Digits' };
    default: return { maxLength: 10, exact: 0, placeholder: 'Enter number' };
  }
};

export const blockInvalidChar = (e, gameType) => { 
  const blocked = ['e', 'E', '+', '.'];
  if (!gameType.includes('Sangam') && e.key === '-') blocked.push('-');
  if (blocked.includes(e.key)) e.preventDefault(); 
};

export const validateMatkaRules = (gameType, betNumber, exact, toast) => {
  // Sangam specific validations
  if (gameType === 'HalfSangamA') {
    if (!/^\d{3}-\d{1}$/.test(betNumber)) { toast.error("Format must be: 3 digits - 1 digit (e.g., 125-9)"); return false; }
    return true;
  }
  if (gameType === 'HalfSangamB') {
    if (!/^\d{1}-\d{3}$/.test(betNumber)) { toast.error("Format must be: 1 digit - 3 digits (e.g., 9-125)"); return false; }
    return true;
  }
  if (gameType === 'FullSangam') {
    if (!/^\d{3}-\d{3}$/.test(betNumber)) { toast.error("Format must be: 3 digits - 3 digits (e.g., 125-340)"); return false; }
    return true;
  }

  // Red Jodi specific validation
  if (gameType === 'RedJodi') {
    if (betNumber.length !== 2) { toast("Enter exactly 2 digits for Red Jodi."); return false; }
    const redList = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99']; 
    if (!redList.includes(betNumber)) { toast.error("Invalid Red Jodi. Must be doubles like 00, 11, 22..."); return false; }
    return true;
  }

  // Motor games specific validation
  if (['SPMotor', 'DPMotor'].includes(gameType)) {
    if (betNumber.length < 4) { toast.error(`Please enter at least 4 digits for ${gameType} combinations.`); return false; }
    return true;
  }

  // Strict Length Validation for standard games
  const isFlexibleLength = gameType.includes('Bulk') || gameType.includes('COMMON');
  if (exact > 0 && !isFlexibleLength && betNumber.length !== exact) {
    toast.error(`Invalid length! Please enter exactly ${exact} digit(s) for ${gameType}.`);
    return false;
  }
  
  // Unique Digits constraints
  if (['Single Panna', 'Double Panna', 'Triple Panna'].includes(gameType)) {
    const uniqueDigits = new Set(betNumber.split(''));
    if (gameType === 'Single Panna' && uniqueDigits.size !== 3) { toast.error("All 3 digits must be different (e.g., 146)."); return false; }
    if (gameType === 'Double Panna' && uniqueDigits.size !== 2) { toast.error("Exactly 2 digits must be same (e.g., 112)."); return false; }
    if (gameType === 'Triple Panna' && uniqueDigits.size !== 1) { toast.error("All 3 digits must be identical (e.g., 777)."); return false; }
  }
  
  return true;
};
