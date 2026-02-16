export function toHebrewNumeral(n: number): string {
  if (n <= 0) return n.toString();
  
  // Adjust for correct Hebrew char codes if needed, or just use literal strings.
  // Using direct characters above. Correcting typos in array:
  // 200='ר', 30='ל', 7='ז', 2='ב'
  
  const map: [number, string][] = [
    [400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'],
    [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'],
    [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']
  ];

  let result = '';
  let temp = n;

  // Special cases for 15 and 16
  // These should be handled by the post-processing regex now, but keeping direct checks for low numbers doesn't hurt.
  if (temp === 15) return 'טו';
  if (temp === 16) return 'טז';

  // Basic greedy algorithm
  for (const [val, char] of map) {
    while (temp >= val) {
      result += char;
      temp -= val;
    }
  }
  
  // Handling 15/16 inside larger numbers (e.g. 115) is rare in verse numbering (usually handled as 100 + 15 -> קטו)
  // Our simple greedy approach: 
  // 15 -> 10(י) + 5(ה) -> יה (Problematic). 
  // 16 -> 10(י) + 6(ו) -> יו (Problematic).
  
  // Let's refine the logic to catch the suffix.
  // Actually, standard verse ranges:
  // 15 -> טו
  // 16 -> טז
  // 115 -> קטו
  // 116 -> קטז
  
  // Refined algorithm:
  // Build string.
  // Post-process: replace 'יה' with 'טו', 'יו' with 'טז'.
  // Fix for ranges 15, 16, 115, 116 etc.
  // The greedy algo produces:
  // 15 -> י + ה (יה)
  // 16 -> י + ו (יו)
  // 115 -> ק + י + ה (קיה)
  // 116 -> ק + י + ו (קיו)
  
  // The regex /יה$/ will catch 'יה' at the end of the string.
  result = result.replace(/יה$/, 'טו').replace(/יו$/, 'טז');
  
  return result;
}
