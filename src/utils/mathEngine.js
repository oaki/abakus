export const generateProblem = (level) => {
  // Returns an object: { num1, num2, answer, text }
  let num1, num2;

  switch (level) {
    case 1:
      // Level 1 (Fundamentals to 4): direct addition, no 5-carry.
      // E.g. 1+1, 2+1, 1+2, 1+3, 3+1, 2+2
      do {
        num1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
        num2 = Math.floor(Math.random() * (4 - num1 + 1)); 
        // if num1=3, num2 can be 0..1, wait we want non-zero
      } while (num2 === 0);
      break;

    case 2: {
      // Level 2 (Addition to 9): no 5-carry, but uses 5.
      // valid pairs: (5,1..4), (6,1..3), (7,1..2), (8,1)
      const type2 = Math.random();
      if (type2 > 0.5) {
        // start with 5,6,7,8
        num1 = Math.floor(Math.random() * 4) + 5; 
        num2 = Math.floor(Math.random() * (9 - num1 + 1));
      } else {
        // start with 1,2,3,4, add 5,6..
        num1 = Math.floor(Math.random() * 4) + 1; 
        // sum must be 5..9, but no 5-complement
        // means we just add 5 and whatever
        num2 = 5 + Math.floor(Math.random() * (4 - num1 + 1));
      }
      if (num2 === 0) num2 = 1;
      break;
    }

    case 3:
      // Level 3 (Complements to 5): result <= 9, but needs a 5-complement.
      // e.g. 4+1, 3+2, 2+3, 1+4. 
      // e.g. 4+2, 4+3, 4+4
      // the first number's ones + second number's ones >= 5, but not direct
      do {
        num1 = Math.floor(Math.random() * 4) + 1; // 1..4
        num2 = Math.floor(Math.random() * 4) + 1; // 1..4
      } while (num1 + num2 < 5);
      break;

    case 4:
      // Level 4 (Complements to 10):
      // sum >= 10, e.g. 9+2, 8+5. 
      do {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
      } while (num1 + num2 < 10);
      break;

    case 5:
      // Level 5 (Two-digit numbers):
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * 90) + 10;
      break;

    default:
      num1 = 1; num2 = 1;
  }

  return {
    num1,
    num2,
    answer: num1 + num2,
    text: `${num1} + ${num2} = ?`
  };
};

export const getAbacusValue = (rodsState) => {
  let total = 0;
  const powerStart = rodsState.length - 1;
  rodsState.forEach((rod, i) => {
    let rodValue = 0;
    if (rod.topActive) rodValue += 5;
    rodValue += rod.bottomActiveCount;
    total += rodValue * Math.pow(10, powerStart - i);
  });
  return total;
};

// Convert a value from 0–9 into a rod state.
const valueToRodState = (val) => {
  if (val >= 5) {
    return { topActive: true, bottomActiveCount: val - 5 };
  } else {
    return { topActive: false, bottomActiveCount: val };
  }
};

// Generate the initial rod state.
const numberToRods = (num) => {
  const str = num.toString().padStart(3, '0');
  return str.split('').map(char => valueToRodState(parseInt(char, 10)));
};

export const generateSolutionSteps = (num1, num2) => {
  const steps = [];
  
  // Step 1: set the first number.
  const currentRods = numberToRods(num1);
  steps.push({
    text: `First, set the first number on the abacus: ${num1}.`,
    rodsState: JSON.parse(JSON.stringify(currentRods))
  });

  // Add num2 one digit at a time: hundreds, tens and ones.
  const num2Str = num2.toString().padStart(3, '0');
  
  for (let i = 0; i < 3; i++) {
    const digitToAdd = parseInt(num2Str[i], 10);
    if (digitToAdd === 0) continue;

    const unitName = i === 0 ? "hundreds" : i === 1 ? "tens" : "ones";
    const currentValInRod = (currentRods[i].topActive ? 5 : 0) + currentRods[i].bottomActiveCount;
    
    // Scenario 1: direct addition when enough beads are available.
    const hasEnoughBottom = currentRods[i].bottomActiveCount + digitToAdd <= 4;
    const isDirectAdd = 
      (digitToAdd < 5 && hasEnoughBottom) || 
      (digitToAdd >= 5 && !currentRods[i].topActive && currentRods[i].bottomActiveCount + (digitToAdd - 5) <= 4);

    if (isDirectAdd) {
      const newVal = currentValInRod + digitToAdd;
      currentRods[i] = valueToRodState(newVal);
      steps.push({
        text: `Add ${digitToAdd} in the ${unitName} column. There are enough free beads, so move them directly.`,
        rodsState: JSON.parse(JSON.stringify(currentRods))
      });
      continue;
    }

    // Scenario 2: Small Friend (a complement to 5).
    if (digitToAdd < 5 && !currentRods[i].topActive && (currentRods[i].bottomActiveCount + digitToAdd >= 5)) {
      const diff = 5 - digitToAdd;
      const newVal = currentValInRod + digitToAdd;
      currentRods[i] = valueToRodState(newVal);
      steps.push({
        text: `Add ${digitToAdd} in the ${unitName} column. There are not enough lower beads, so use the Small Friend: move the upper bead (5) in and move ${diff} out.`,
        rodsState: JSON.parse(JSON.stringify(currentRods))
      });
      continue;
    }

    // Scenario 3: Big Friend (a complement to 10).
    if (currentValInRod + digitToAdd >= 10) {
      const diff = 10 - digitToAdd;
      // Set the simplified modulo-10 value for the current rod.
      const newVal = (currentValInRod + digitToAdd) % 10;
      currentRods[i] = valueToRodState(newVal);
      
      // Add 1 to the column on the left.
      if (i > 0) {
        const leftVal = (currentRods[i-1].topActive ? 5 : 0) + currentRods[i-1].bottomActiveCount;
        currentRods[i-1] = valueToRodState(leftVal + 1);
      }
      
      steps.push({
        text: `Add ${digitToAdd} in the ${unitName} column. There is no room left, so use the Big Friend: move one bead in the column to the left (+10) and move ${diff} out here.`,
        rodsState: JSON.parse(JSON.stringify(currentRods))
      });
      continue;
    }
  }

  // Final step: the result.
  steps.push({
    text: `Done! The result on the abacus is ${num1 + num2}. Now try it yourself!`,
    rodsState: JSON.parse(JSON.stringify(currentRods))
  });

  return steps;
};
