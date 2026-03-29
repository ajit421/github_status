// src/services/languageService.ts
import { githubFetch } from "@/lib/github";
import type { GitHubRepo, LanguageData } from "@/types/github";

/** Bytes-per-language response from /repos/:owner/:repo/languages */
type LangBytesMap = Record<string, number>;

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Java: "#b07219",
  Go: "#00ADD8",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
  C: "#555555",
  "C++": "#f34b7d",
  Dart: "#00B4AB",
  Shell: "#89e051",
};

export async function getTopLanguages(username: string): Promise<LanguageData> {
  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?per_page=100&sort=updated&type=owner`
  );

  const top20 = repos.slice(0, 20);

  const langMaps = await Promise.all(
    top20.map((repo) => githubFetch<LangBytesMap>(repo.languages_url))
  );

  const aggregated: Record<string, number> = {};
  for (const langMap of langMaps) {
    for (const [lang, bytes] of Object.entries(langMap)) {
      aggregated[lang] = (aggregated[lang] ?? 0) + bytes;
    }
  }

  const top5 = Object.entries(aggregated)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const result: LanguageData = {};
  for (const [lang, size] of top5) {
    result[lang] = {
      size,
      color: LANG_COLORS[lang] ?? "#858585",
    };
  }

  return result;
}
