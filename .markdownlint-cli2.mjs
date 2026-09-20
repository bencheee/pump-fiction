const markdownlintConfig = {
  config: {
    "line-length": false,
    "no-duplicate-heading": { siblings_only: true },
  },
  // The browser suite writes Markdown into its report directories, which are
  // ignored by Git and are not repository documentation.
  globs: [
    "**/*.md",
    "!node_modules/**",
    "!.next/**",
    "!temp_handoff/**",
    "!playwright-report/**",
    "!test-results/**",
  ],
};

export default markdownlintConfig;
