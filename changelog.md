# Changelog

Notable changes of Reviewer Recommender after version 3.0.4 will be documented in this file.

## [3.0.5]

- Improve the email filling of the "select" function. (queryAPI.js)
  
  If the reviewer to be selected has multiple email addresses, we'll only fill the first email address and display an alert. Note that this improvement only works for addresses divided by "," which is the most common case.
  
  If the email address got from AMiner is illegal, it won't be filled. And an alert will be displayed.

- Fix the bug of failing to analyze keywords. (analyze.js)
- Fix the bug of failing to create author list. (analyze.js)
- Add function to add current reviewers and authors in the manuscript info to the reviewer roster candidate of this extension.(analyze.js)

## [3.0.6]

- Update 5 years token

## [3.0.7]

- New algorithm.

## [3.0.8]

- Update profile url
