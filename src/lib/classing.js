function jenksNaturalBreaks(data, numClasses) {
  if (!data || data.length === 0) return [];
  if (numClasses >= data.length) return [...new Set(data)].sort((a, b) => a - b);
  
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  const lowerClassLimits = Array(n + 1).fill(null).map(() => Array(numClasses + 1).fill(0));
  const variance = Array(n + 1).fill(null).map(() => Array(numClasses + 1).fill(0));
  
  for (let i = 1; i <= numClasses; i++) {
    lowerClassLimits[1][i] = 1;
    variance[1][i] = 0;
    for (let j = 2; j <= n; j++) {
      variance[j][i] = Infinity;
    }
  }
  
  for (let l = 2; l <= n; l++) {
    let sum = 0;
    let sumSquares = 0;
    let w = 0;
    
    for (let m = 1; m <= l; m++) {
      const lm = l - m + 1;
      const val = sortedData[lm - 1];
      
      w++;
      sum += val;
      sumSquares += val * val;
      
      const variance_val = sumSquares - (sum * sum) / w;
      const i4 = lm - 1;
      
      if (i4 !== 0) {
        for (let j = 2; j <= numClasses; j++) {
          if (variance[l][j] >= variance_val + variance[i4][j - 1]) {
            lowerClassLimits[l][j] = lm;
            variance[l][j] = variance_val + variance[i4][j - 1];
          }
        }
      }
    }
    
    lowerClassLimits[l][1] = 1;
    variance[l][1] = sumSquares - (sum * sum) / w;
  }
  
  const breaks = Array(numClasses + 1);
  breaks[numClasses] = sortedData[n - 1];
  breaks[0] = sortedData[0];
  
  let k = n;
  for (let j = numClasses; j >= 2; j--) {
    const id = lowerClassLimits[k][j] - 2;
    breaks[j - 1] = sortedData[id];
    k = lowerClassLimits[k][j] - 1;
  }
  
  return breaks;
}

function quantileBreaks(data, numClasses) {
  if (!data || data.length === 0) return [];
  
  const sortedData = [...data].sort((a, b) => a - b);
  const breaks = [sortedData[0]];
  
  for (let i = 1; i <= numClasses; i++) {
    const quantile = i / numClasses;
    const index = Math.ceil(quantile * (sortedData.length - 1));
    breaks.push(sortedData[Math.min(index, sortedData.length - 1)]);
  }
  
  return [...new Set(breaks)];
}

function equalIntervalBreaks(data, numClasses) {
  if (!data || data.length === 0) return [];
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const interval = range / numClasses;
  
  const breaks = [min];
  for (let i = 1; i <= numClasses; i++) {
    breaks.push(min + (interval * i));
  }
  
  return breaks;
}

function calculateNaturalBreaks(data, numClasses, mergeTopClasses = false) {
  try {
    let jenksBreaks = jenksNaturalBreaks(data, numClasses);

    if (
      jenksBreaks.length === numClasses + 1 &&
      jenksBreaks.every((val, i) => i === 0 || val >= jenksBreaks[i - 1])
    ) {
      console.log("Using Jenks Natural Breaks");

      if (mergeTopClasses && numClasses >= 2) {
        jenksBreaks.splice(jenksBreaks.length - 2, 1);
      }

      return jenksBreaks;
    }
  } catch (error) {
    console.warn("Jenks algorithm failed, falling back to quantiles:", error);
  }

  console.log("Using Quantile Breaks");
  let quantile = quantileBreaks(data, numClasses);
  if (mergeTopClasses && numClasses >= 2) {
    quantile.splice(quantile.length - 2, 1);
  }
  return quantile;
}

function getJenksCategory(value, breaks) {
  if (value == null || isNaN(value)) return 0;
  
  for (let i = 0; i < breaks.length - 1; i++) {
    if (value <= breaks[i + 1]) return i;
  }
  return breaks.length - 2;
}

function getManualClass(value, type) {
  if (type === 'ev') {
    // EV count thresholds
    if (value <= 100) return 0;      // Low
    if (value <= 500) return 1;      // Medium  
    return 2;                        // High
  } else if (type === 'station') {
    // Station count thresholds
    if (value <= 5) return 0;        // Low
    if (value <= 20) return 1;       // Medium
    return 2;                        // High
  }
  return 0;
}

export {
    calculateNaturalBreaks,
    getJenksCategory,
    jenksNaturalBreaks,
    quantileBreaks,
    equalIntervalBreaks,
    getManualClass
};