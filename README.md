# GitLab MR Approval Viewer

## What does this extension solve?

After switching over to GitLab, I noticed that when relying on an approval system for Merge Requests, it was hard to know upfront which ones you've already approved. This extension was made to make it clear to know which Merge Requests you've gone through without having to click into each and every one.

## Usage
1. Download the `gitlab-approval-chrome-ext.crx` from the repo.
2. Open your extensions page in Chrome.
3. Drag and drop the file into the window and install.
4. You're done!

Note: this process may change as I become more familiar with formal release strategies of Chrome Extensions. Check back later!

## Current Limitations

### Settings

Currently, this is tied to my personal workplace domain hosting of GitLab. I wish to fix this with an options page eventually, but as of today it will only work on the following host: `https://gitlab.nordstorm.com`

If you'd like it to work on other domains, feel free to modify the source urls found in the `manifest.json` and `js/gitlab_api.js`.

## Changelog
### Oct. 11th, 2018:
* Initial Release
* Only Works under one domain currently
* Loads approvals into view when viewing the list of Merge Requests
