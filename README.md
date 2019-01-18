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
### Jan. 18th, 2019 (v1.2.1):
* Fixed an issue with the first request for the opened MRs not loading

### Jan. 17th, 2019 (v1.2.0):
* Added a caching mechanism
  * Issue: casual usage from teams has been a positive experience. However, rate limiting has been enabled for our team. We're now consistently hitting rate limits due to how many upfront API requests this plugin makes (10 MRs = 10 API requests. This adds up during a quick session.)
  * Benefits: This will reduce the number of subsequent calls from page refreshes or general navigation.
  * How it works: Instead of immediately calling each MR approval list every time we load the page, we will do a check against `/projects/{projectId}/merge_requests` and view the last update time for each MR. If the cache entry is older than the last update time, refresh that cache entry. If the cache matches the last update time, then don't update.
* Refreshed the styling of the options page
  * Updated the default settings to use compact approval settings by default.
  * Added an indicator that displays "Setting Saved!" whenever a user changes their settings.
* Fix alignment of missing approval circles to match other approval margins

### Jan. 1st, 2019 (v1.1.1):
* Fix compact approvals
  * Using a different element to key off of where to place (originally pipeline status -- wasn't always there).

### Dec. 27th, 2018 (v1.1.0):
* Added Icon for the Extension
* Added simple settings page (Note: You need to _*reload*_ the merge request page after changing the settings)
  * Compact View -- Enable this to bring the approvals to the right hand side of the page.
  * Author View -- Helps display the author more prominantly on the left hand side.
* Updated to version 1.1.0 instead of 1.1, changing the versioning scheme.

### Oct. 11th, 2018 (v1.0.0):
* Initial Release
* Only Works under one domain currently
* Loads approvals into view when viewing the list of Merge Requests
