// Draft management using localStorage
const COMIC_DRAFT_KEY = "comiccrafter_comic_draft";
const SHORT_DRAFT_KEY = "comiccrafter_short_draft";

export function saveComicDraft(data) {
  try {
    localStorage.setItem(COMIC_DRAFT_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch {}
}

export function loadComicDraft() {
  try {
    const raw = localStorage.getItem(COMIC_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearComicDraft() {
  localStorage.removeItem(COMIC_DRAFT_KEY);
}

export function saveShortDraft(data) {
  try {
    localStorage.setItem(SHORT_DRAFT_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch {}
}

export function loadShortDraft() {
  try {
    const raw = localStorage.getItem(SHORT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearShortDraft() {
  localStorage.removeItem(SHORT_DRAFT_KEY);
}