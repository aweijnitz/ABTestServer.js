var probabilityOfZ = require('./zcalc.js');


// coefficient for 80% confidence interval
var c80 = 1.28;

// coefficient for 90% and 95% confidence interval
var c95 = 1.96; // 95
var c90 = 1.65; // 90

/**
 * Compute standard error.
 * Also see: http://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
 * @param p - conversion rate
 * @param n - number total views (trials). Note: n must be >= 1000 for this formula to hold. (https://developer.amazon.com/sdk/ab-testing/reference/ab-math.html)
 * @returns {number}
 */
var stdErr = function (p, n) {
    return Math.sqrt(p * (1 - p) / n);
};


/**
 * Calculate the conversion rate (p) for a test variant.
 * @param conversions - number of observed conversions
 * @param views - number of observed views
 * @returns {number}
 */
var conversionRate = function (conversions, views) {
    return conversions / views;
}


/**
 * Calculate z score. Significance is achieved if score > 0.95 or < 0.5
 * The larger the value of z, the less probable the experimental result is due to chance (https://www.fourmilab.ch/rpkp/experiments/analysis/zCalc.html)
 *
 * See: https://developer.amazon.com/sdk/ab-testing/reference/ab-math.html
 * See: http://en.wikipedia.org/wiki/Zscore
 * @param conversionsA
 * @param viewsA
 * @param conversionsB
 * @param viewsB
 * @returns {number}
 */
var zScore = function (conversionsA, viewsA, conversionsB, viewsB) {
    var pA = conversionRate(conversionsA, viewsA);
    var pB = conversionRate(conversionsB, viewsB);
    var seA = stdErr(pA, viewsA);
    var seB = stdErr(pB, viewsB);
    return (pB - pA) / Math.sqrt(seA * seA + seB * seB);
}

/**
 * Is test result significant (95%)?
 * @param testResult
 * @returns {boolean}
 */
var isSignificant = function (testResult) {
    var z = zScore(testResult.conversions[0], testResult.variantViews[0],
        testResult.conversions[1], testResult.variantViews[1]);
    var poz = probabilityOfZ(z);

    return poz < 0.05 || poz > 0.95;
}


/**
 * Returns true if test shows with significance that A is better than B.
 * @param testResult
 * @returns {boolean}
 */
var isSignificantForA = function (testResult) {
    var z = zScore(testResult.conversions[0], testResult.variantViews[0],
        testResult.conversions[1], testResult.variantViews[1]);
    var poz = probabilityOfZ(z);

    return poz < 0.05;
}


/**
 * Returns true if test shows with significance that B is better than A.
 * @param testResult
 * @returns {boolean}
 */
var isSignificantForB = function (testResult) {
    var z = zScore(testResult.conversions[0], testResult.variantViews[0],
        testResult.conversions[1], testResult.variantViews[1]);
    var poz = probabilityOfZ(z);

    return poz > 0.95;
}


var isSignificantDebugInfo = function (testResult) {
    var z = zScore(testResult.conversions[0], testResult.variantViews[0],
        testResult.conversions[1], testResult.variantViews[1]);
    var poz = probabilityOfZ(z);
    console.log('TEST: ' + testResult.testID
        + ' change% B: '
        + changePercent(conversionRate(testResult.conversions[0], testResult.variantViews[0]),
                        conversionRate(testResult.conversions[1], testResult.variantViews[1])).toFixed(2)
        + ' zScore: '+ z.toFixed(2)
        + ' probability of z% (the chance that B is better): ' + (100.0*poz).toFixed(2)
        + ' confidence interval 95% +/-: ' + confidence95(conversionRate(testResult.conversions[0], testResult.variantViews[0]), testResult.variantViews[0]).toFixed(2)
        + ' isSignificant: ' + (poz < 0.05 || poz > 0.95)
        + ' isSignificantForA: '+ isSignificantForA(testResult)
        + ' isSignificantForB: '+ isSignificantForB(testResult));

    return poz < 0.05 || poz > 0.95;
}

var confidence80 = function (p, n) {
    return c80 * stdErr(p, n);
}

var confidence95 = function (p, n) {
    return c95 * stdErr(p, n);
}

/**
 * The percentage change of the conversion rate between the Test variation (B) and the Control variation (A)
 * @param pA - conversion rate control
 * @param pB - conversion rate test
 * @returns {number}
 */
var changePercent = function (pA, pB) {
    return (pB - pA) / pA;

}

var change = function(testResult) {
    return changePercent(conversionRate(testResult.conversions[0], testResult.variantViews[0]),
        conversionRate(testResult.conversions[1], testResult.variantViews[1]));
}

/**
 * Return the probability (%) of Variant B being better than A
 * @param testResult
 * @returns {string}
 */
var probabilityOfB = function(testResult) {
    var z = zScore(testResult.conversions[0], testResult.variantViews[0],
        testResult.conversions[1], testResult.variantViews[1]);
    return probabilityOfZ(z);
}

module.exports.isSignificant = isSignificant;
module.exports.isSignificantForA = isSignificantForA;
module.exports.isSignificantForB = isSignificantForB;
module.exports.isSignificantDebugInfo = isSignificantDebugInfo;
module.exports.changePercent = change;
module.exports.probabilityOfB = probabilityOfB;
