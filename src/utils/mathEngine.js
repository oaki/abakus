export const generateProblem = (level) => {
  // Returns an object: { num1, num2, answer, text }
  let num1, num2;

  switch (level) {
    case 1:
      // Level 1 (Základy do 4): Direct addition, no 5-carry
      // E.g. 1+1, 2+1, 1+2, 1+3, 3+1, 2+2
      do {
        num1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
        num2 = Math.floor(Math.random() * (4 - num1 + 1)); 
        // if num1=3, num2 can be 0..1, wait we want non-zero
      } while (num2 === 0);
      break;

    case 2: {
      // Level 2 (Sčítanie do 9): No 5-carry, but uses 5
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
      // Level 3 (Doplnky do 5): Result <= 9, but needs 5-complement
      // e.g. 4+1, 3+2, 2+3, 1+4. 
      // e.g. 4+2, 4+3, 4+4
      // the first number's ones + second number's ones >= 5, but not direct
      do {
        num1 = Math.floor(Math.random() * 4) + 1; // 1..4
        num2 = Math.floor(Math.random() * 4) + 1; // 1..4
      } while (num1 + num2 < 5);
      break;

    case 4:
      // Level 4 (Doplnky do 10):
      // sum >= 10, e.g. 9+2, 8+5. 
      do {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
      } while (num1 + num2 < 10);
      break;

    case 5:
      // Level 5 (Dvojciferné):
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

// Helper na konverziu hodnoty 0-9 do stavu stĺpca
const valueToRodState = (val) => {
  if (val >= 5) {
    return { topActive: true, bottomActiveCount: val - 5 };
  } else {
    return { topActive: false, bottomActiveCount: val };
  }
};

// Pomocná funkcia pre vygenerovanie počiatočného stavu
const numberToRods = (num) => {
  const str = num.toString().padStart(3, '0');
  return str.split('').map(char => valueToRodState(parseInt(char, 10)));
};

export const generateSolutionSteps = (num1, num2) => {
  const steps = [];
  
  // Krok 1: Nastavenie 1. čísla
  const currentRods = numberToRods(num1);
  steps.push({
    text: `Najprv si na abakuse nastavíme prvé číslo: ${num1}.`,
    rodsState: JSON.parse(JSON.stringify(currentRods))
  });

  // Teraz ideme pridávať num2. Rozdelíme si ho na cifry (max stovky, desiatky, jednotky)
  const num2Str = num2.toString().padStart(3, '0');
  
  for (let i = 0; i < 3; i++) {
    const digitToAdd = parseInt(num2Str[i], 10);
    if (digitToAdd === 0) continue;

    const unitName = i === 0 ? "stovky" : i === 1 ? "desiatky" : "jednotky";
    const currentValInRod = (currentRods[i].topActive ? 5 : 0) + currentRods[i].bottomActiveCount;
    
    // Scenár 1: Priame sčítanie (máme dosť korálkov)
    // - Ak chceme pridať X, a neprekročíme 5, alebo ak prekročíme 5 ale horný je voľný a spodných je dosť.
    const hasEnoughBottom = currentRods[i].bottomActiveCount + digitToAdd <= 4;
    const isDirectAdd = 
      (digitToAdd < 5 && hasEnoughBottom) || 
      (digitToAdd >= 5 && !currentRods[i].topActive && currentRods[i].bottomActiveCount + (digitToAdd - 5) <= 4);

    if (isDirectAdd) {
      const newVal = currentValInRod + digitToAdd;
      currentRods[i] = valueToRodState(newVal);
      steps.push({
        text: `Teraz ideme pripočítať ${digitToAdd} do stĺpca pre ${unitName}. Máme voľné korálky, takže ich len priamo posunieme.`,
        rodsState: JSON.parse(JSON.stringify(currentRods))
      });
      continue;
    }

    // Scenár 2: Malý priateľ (Doplnok do 5)
    // Chceme pridať digitToAdd (menej ako 5), nemáme spodné, ale máme voľnú 5-ku
    if (digitToAdd < 5 && !currentRods[i].topActive && (currentRods[i].bottomActiveCount + digitToAdd >= 5)) {
      const diff = 5 - digitToAdd;
      const newVal = currentValInRod + digitToAdd;
      currentRods[i] = valueToRodState(newVal);
      steps.push({
        text: `Ideme pridať ${digitToAdd} do stĺpca pre ${unitName}. Nemáme dosť spodných korálkov! Použijeme Malého priateľa: pridáme vrchný korálok (5) a odoberieme ${diff}.`,
        rodsState: JSON.parse(JSON.stringify(currentRods))
      });
      continue;
    }

    // Scenár 3: Veľký priateľ (Doplnok do 10)
    // Prejdeme cez 10
    if (currentValInRod + digitToAdd >= 10) {
      const diff = 10 - digitToAdd;
      // Odstránime diff z aktuálneho stĺpca
      // Ak nemôžeme priamo odstrániť diff (napríklad diff=6 a máme nastavené 9), je to kombinovaný krok, ale to pre naše levely 1-5 obmedzíme alebo zjednodušíme.
      // Zjednodušene rovno nastavíme novú hodnotu modulo 10
      const newVal = (currentValInRod + digitToAdd) % 10;
      currentRods[i] = valueToRodState(newVal);
      
      // A pridáme 1 do stĺpca vľavo (i-1)
      if (i > 0) {
        const leftVal = (currentRods[i-1].topActive ? 5 : 0) + currentRods[i-1].bottomActiveCount;
        currentRods[i-1] = valueToRodState(leftVal + 1);
      }
      
      steps.push({
        text: `Ideme pridať ${digitToAdd} do stĺpca pre ${unitName}. Už tam nemáme miesto (prejdeme cez 10)! Použijeme Veľkého priateľa: posunieme 1 korálok vľavo (+10) a tu odoberieme ${diff}.`,
        rodsState: JSON.parse(JSON.stringify(currentRods))
      });
      continue;
    }
  }

  // Finálny krok - výsledok
  steps.push({
    text: `Hotovo! Výsledok na abakuse je ${num1 + num2}. Teraz si to vyskúšaj ty!`,
    rodsState: JSON.parse(JSON.stringify(currentRods))
  });

  return steps;
};
