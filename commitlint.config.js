// This configuration validates commit messages against the Conventional Commits standard.

const Configuration = {
  // Inherits common rules and standard structure from Conventional Commits.
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, // Enforces this rule as an error (level 2)
      'always',
      [
        'feat', // New feature implementation
        'fix', // Bug correction
        'docs', // Documentation changes only
        'style', // Formatting, white-space, missing semicolons, etc.
        'refactor', // Code restructuring without feature/fix changes
        'test', // Adding or correcting tests
        'chore', // Maintenance tasks (config, dependencies, build process)
        'revert', // Reverting a previous commit
      ],
    ],
    // Forces the commit type (e.g., 'feat') to be in lower-case.
    'type-case': [2, 'always', 'lower-case'],
    // Ensures a type is always provided (e.g., must start with 'feat:').
    'type-empty': [2, 'never'],
    // Ensures the subject line (the commit title) is not empty.
    'subject-empty': [2, 'never'],
    // Limits the subject line length to a maximum of 72 characters.
    'subject-max-length': [2, 'always', 72],

    // Ensures there is a blank line between the subject and the body (best practice for 'git log').
    'body-leading-blank': [1, 'always'],
    // Ensures there is a blank line before the footer (where BREAKING CHANGE or issue references go).
    'footer-leading-blank': [1, 'always'],
    // Limits the body line length to 100 characters for better readability in git tools.
    'body-max-line-length': [1, 'always', 100],
  },
};

export default Configuration;
