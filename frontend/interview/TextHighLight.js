/**
 * Escape regex special characters.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * STEP 1:
 * Find all whole-word matching intervals.
 */
function findIntervals(text, sources) {
  const intervals = [];

  // Global frequency of each source phrase.
  const frequency = new Map();

  sources.forEach((source, sourceId) => {
    if (!source) return;

    const escaped = escapeRegex(source);

    // Match complete words, not substrings.
    const regex = new RegExp(
      `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
      "giu"
    );

    let count = 0;

    for (const match of text.matchAll(regex)) {
      intervals.push({
        start: match.index,
        end: match.index + match[0].length,
        sourceId
      });

      count++;
    }

    frequency.set(sourceId, count);
  });

  return { intervals, frequency };
}

/**
 * STEP 2:
 * Merge overlapping intervals using a stack.
 *
 * Track every source contributing to each merged region.
 */
function mergeIntervals(intervals) {
  // Sort by start, then end.
  intervals.sort((a, b) => {
    return a.start - b.start || a.end - b.end;
  });

  const stack = [];

  for (const interval of intervals) {
    const last = stack[stack.length - 1];

    // Strict overlap.
    if (last && interval.start < last.end) {
      last.end = Math.max(last.end, interval.end);

      // Add the contributing source.
      last.sources.add(interval.sourceId);
    } else {
      // New independent interval.
      stack.push({
        start: interval.start,
        end: interval.end,
        sources: new Set([interval.sourceId])
      });
    }
  }

  return stack;
}

/**
 * STEP 3:
 * Sort source indices:
 *
 * 1. Global frequency descending.
 * 2. Source index ascending.
 */
function sortSources(sourceIds, frequency) {
  return [...sourceIds].sort((a, b) => {
    const freqA = frequency.get(a) ?? 0;
    const freqB = frequency.get(b) ?? 0;

    if (freqA !== freqB) {
      return freqB - freqA;
    }

    return a - b;
  });
}

/**
 * STEP 4:
 * Build final highlighted text.
 */
function highlightText(text, sources) {
  const { intervals, frequency } = findIntervals(
    text,
    sources
  );

  if (intervals.length === 0) {
    return text;
  }

  const merged = mergeIntervals(intervals);

  const result = [];
  let cursor = 0;

  for (const interval of merged) {
    const { start, end, sources: sourceIds } = interval;

    // Text before highlight.
    result.push(text.slice(cursor, start));

    // Original highlighted text.
    const highlightedText = text.slice(start, end);

    // Source indices sorted by global frequency.
    const sortedSources = sortSources(
      sourceIds,
      frequency
    );

    result.push(
      `<yellow>${highlightedText}</yellow>` +
      `[${sortedSources.join(",")}]`
    );

    cursor = end;
  }

  // Remaining text.
  result.push(text.slice(cursor));

  return result.join("");
}