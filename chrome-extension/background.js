// Service worker — fetches Glassdoor data (bypasses CORS restrictions)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'FETCH_GLASSDOOR') return;
  fetchGlassdoor(msg.company)
    .then(sendResponse)
    .catch(err => sendResponse({ error: err.message }));
  return true; // keep message channel open for async response
});

async function fetchGlassdoor(company) {
  const encoded = encodeURIComponent(company);

  // Glassdoor's internal typeahead endpoint — returns employer ratings
  const url = `https://www.glassdoor.com/searchsuggest/typeahead` +
    `?numSuggestions=5&source=GD_V2&version=NEW&rf=full&fallback=token&input=${encoded}`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.glassdoor.com/',
    },
  });

  if (!res.ok) return { error: `Glassdoor returned HTTP ${res.status}` };

  const results = await res.json();

  // Find the first employer result
  const employer = results.find(r =>
    r.type === 'EMPLOYER' || r.category === 'employer' || r.label === 'employer'
  );

  if (!employer) return { error: 'not_found' };

  // Build a direct review URL from the employer ID if available
  const empId   = employer.employerId ?? employer.id;
  const empSlug = (employer.suggestion ?? employer.name ?? company)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const reviewUrl = empId
    ? `https://www.glassdoor.com/Reviews/${empSlug}-Reviews-E${empId}.htm`
    : `https://www.glassdoor.com/Search/results.htm?keyword=${encoded}`;

  return {
    name:        employer.suggestion ?? employer.name ?? company,
    rating:      employer.overallRating ?? employer.rating ?? null,
    reviews:     employer.numberOfRatings ?? employer.ratingCount ?? employer.reviewCount ?? null,
    recommend:   employer.recommendToFriendRating ?? employer.recommendPct ?? null,
    ceoApproval: employer.ceoApprovalRating ?? employer.ceoRating ?? null,
    url:         reviewUrl,
  };
}
