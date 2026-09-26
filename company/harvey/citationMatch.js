function findCitationMatches(
  text,
  citations
) {
  const matches = [];

  for (const {
    text: term,
    citationId
  } of citations) {
    if (!term) {
      continue;
    }

    const escaped =
      escapeRegex(term);

    const regex = new RegExp(
      `(^|\\W)(${escaped})(?=$|\\W)`,
      "gi"
    );

    let match;

    while (
      (match = regex.exec(text)) !== null
    ) {
      const start =
        match.index +
        match[1].length;

      const end =
        start +
        match[2].length;

      matches.push({
        start,
        end,
        citationId,
      });
    }
  }

  return matches;
}

function splitCitationRanges(matches) {
  const events = [];

  for (const match of matches) {
    events.push({
      position: match.start,
      type: "start",
      citationId:
        match.citationId,
    });

    events.push({
      position: match.end,
      type: "end",
      citationId:
        match.citationId,
    });
  }

  /*
    At the same position, process ending citations
    before starting citations.

    Since ranges are [start, end), an ending citation
    should not apply after `end`.
  */
  events.sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }

    if (a.type === b.type) {
      return 0;
    }

    return a.type === "end"
      ? -1
      : 1;
  });

  const active = new Set();
  const ranges = [];

  let previousPosition = null;

  for (const event of events) {
    if (
      previousPosition !== null &&
      event.position > previousPosition &&
      active.size > 0
    ) {
      ranges.push({
        start: previousPosition,
        end: event.position,
        citationIds:
          [...active],
      });
    }

    if (event.type === "start") {
      active.add(
        event.citationId
      );
    } else {
      active.delete(
        event.citationId
      );
    }

    previousPosition =
      event.position;
  }

  return ranges;
}

/// Example usage:
// const text = "This is a sample text with citations.";
// const citations = [
//   { text: "sample", citationId: 1 },
//   { text: "citations", citationId: 2 },
// ];
// const matches = findCitationMatches(text, citations);
// const ranges = splitCitationRanges(matches);
// console.log(ranges);