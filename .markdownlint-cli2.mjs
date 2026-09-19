const markdownlintConfig = {
  config: {
    "line-length": false,
    "no-duplicate-heading": { siblings_only: true },
  },
  globs: ["**/*.md", "!node_modules/**", "!.next/**", "!temp_handoff/**"],
};

export default markdownlintConfig;
