// src/services/languageService.ts
import { githubFetch } from '../lib/github';
import type { GitHubRepo, LanguageData } from '../types/github';
import {
  LANGUAGE_COLORS,
  LANG_COLOR_FALLBACK,
  REPOS_PER_PAGE,
  LANG_REPO_LIMIT,
  LANG_TOP_N,
  GITHUB_FETCH_TIMEOUT_MS,
} from '../config/constants';

type LangBytesMap = Record<string, number>;

export async function getTopLanguages(username: string, token?: string): Promise<LanguageData> {
  const signal = AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS);

  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?per_page=${REPOS_PER_PAGE}&sort=updated&type=owner`,
    token,
    { signal }
  );

  const top = repos.slice(0, LANG_REPO_LIMIT);

  const langMaps = await Promise.all(
    top.map((repo) =>
      githubFetch<LangBytesMap>(repo.languages_url, token, {
        signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS),
      }).catch((): LangBytesMap => ({}))
    )
  );

  const aggregated: Record<string, number> = {};
  for (const langMap of langMaps) {
    for (const [lang, bytes] of Object.entries(langMap)) {
      aggregated[lang] = (aggregated[lang] ?? 0) + bytes;
    }
  }

  const topN = Object.entries(aggregated)
    .sort(([, a], [, b]) => b - a)
    .slice(0, LANG_TOP_N);

  const result: LanguageData = {};
  for (const [lang, size] of topN) {
    // LANGUAGE_COLORS is the centralised map; LANG_COLOR_FALLBACK for unknowns
    result[lang] = { size, color: LANGUAGE_COLORS[lang] ?? LANG_COLOR_FALLBACK };
  }

  return result;
}
